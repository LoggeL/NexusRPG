// Feste Begegnungen Akt 1 (world.md §8.7, §5.1, §5.2, §6.2): Arena, Gegner, Ziel, Belohnung, Einstiegszeilen.
// Ausgelöst werden sie von den Quests ({ battle: 'enc-…' } oder Kartengruppen); Fortschritt prüfen die Quests
// über { won: 'enc-…' }. XP und Credits der Gegner kommen automatisch dazu, `reward` ist der Bonus obendrauf.
import type { EncounterDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { byId } from './_foe';

const list: EncounterDef[] = [
  // --- Prolog -------------------------------------------------------------
  {
    id: 'enc-prolog-drohne',
    name: 'Vor sieben Jahren: die Wachdrohne',
    arena: 'arena-labor',
    enemies: [{ enemy: 'spaeherdrohne' }],
    canFlee: false,
    intro: [
      { speaker: 'narrator', text: 'Digitech-Labor, 2079. Eine weiße Drohne schwebt zwischen den Regalen. Ihr rotes Auge findet Raven.' },
      { speaker: 'blade', expr: 'signatur', text: 'Keine Panik, Liebes. Ich halte sie mit meinem Stock beschäftigt, du machst sie kaputt. Arbeitsteilung.' },
      { speaker: 'narrator', text: 'Tipp: Bewegen kostet 1 AP, Angreifen 1 AP. Hinter halber Deckung (h) wirst du schlechter getroffen.' },
    ],
    reward: { xp: 20 },
  },

  // --- Hauptgeschichte Akt 1 ----------------------------------------------
  {
    id: 'enc-bahnhof-abzieher',
    name: 'Willkommen in Noxius',
    arena: 'arena-gleise',
    enemies: [{ enemy: 'abzieher-knut' }, { enemy: 'abzieher-kurt' }],
    canFlee: false,
    intro: [
      { speaker: 'narrator', text: 'Bahnsteig 3. Die U-Bahn ist weg, der Rauch noch da. Zwei Kapuzen schieben sich vor den Ausgang.' },
      { speaker: 'knut', text: 'Neu hier, was? Neue zahlen Bahnsteiggebühr. Fünfzig. Oder alles, was in den Taschen klimpert.' },
      { speaker: 'kurt', text: 'Und keine Zicken, sonst sag ich’s meiner Mama! … Ich mein: Sonst gibt’s auf die Fresse!' },
      { speaker: 'narrator', text: 'Tipp: Jeder Zug hat 2 AP. Wer gegen Moral kämpft, kann „Einschüchtern“ – Abzieher laufen gern nach Hause.' },
    ],
    reward: { xp: 30, credits: 20 },
    onWin: [{ message: 'Knut und Kurt rennen heulend zum Ausgang. „Das sag ich meiner Mama!“' }],
  },
  {
    id: 'enc-hv-ripper-tisch',
    name: 'Rippers Ecktisch',
    arena: 'arena-club',
    enemies: [{ enemy: 'boss-ripper' }, { enemy: 'abzieher' }],
    objective: { kind: 'survive', rounds: 2 },
    canFlee: false,
    intro: [
      { speaker: 'ripper', expr: 'signatur', text: 'Was haben wir denn da? Ein Held mit Kassengestell. Setz dich, Schätzchen. Ach nein, du stehst ja schon im Weg.' },
      { speaker: 'ripper', text: 'Zehn Credits für ein Implantat. Die Gören wollen bezahlt werden. Ich zahle mit Blei. Wechselgeld gibt’s nicht.' },
      { speaker: 'narrator', text: 'Die Musik stoppt. Alle im High Voltage starren rüber. Ripper hält keine zwei Runden durch, wenn’s heiß wird.' },
    ],
    reward: { xp: 40, credits: 30 },
    onWin: [{ message: 'Ripper ist durch die Hintertür verschwunden. Der Barkeeper wischt schon den Tisch ab.' }],
  },
  {
    id: 'enc-schrott-drohnen',
    name: 'Dexters Wachdrohnen',
    arena: 'arena-schrottplatz',
    enemies: [{ enemy: 'schrottdrohne', count: 3 }],
    intro: [
      { speaker: 'narrator', text: 'Drei zusammengeschweißte Drohnen surren über der Halde. Auf einer steht mit Edding „BITTE NICHT TRETEN“.' },
      { speaker: 'vega', expr: 'neutral', text: 'Drei Ziele, keine Deckung, null Hirn. Ich nehm die linke.' },
      { speaker: 'aria', expr: 'signatur', text: 'Ich nehm alle. Hat Dexter selbst gebaut? Dann zählt das als Sperrmüll.' },
    ],
    reward: { xp: 20, items: { 'schrott-ersatzteil': 2 } },
  },
  {
    id: 'enc-schrott-dexter',
    name: 'Dexter zahlt immer',
    arena: 'arena-schrottplatz',
    enemies: [{ enemy: 'dexter-halde' }, { enemy: 'zerleger', count: 2 }],
    intro: [
      { speaker: 'dexter', text: 'Achthundert? Ich hab Gutscheine! Chrome 10! Die sind mehr wert als Geld, das sagt jeder, der welche verkauft!' },
      { speaker: 'aria', expr: 'wut', text: 'Wisch dir mit deinen Gutscheinen den Arsch ab, Dexter. Hunter will Credits. Echte.' },
      { speaker: 'dexter', text: 'Jungs! Kundengespräch! Bringt die Zangen mit!' },
    ],
    reward: { xp: 40 },
    onWin: [{ message: 'Dexter sitzt auf einem Ölfass und zählt mit zitternden Fingern Credits ab.' }],
  },
  {
    id: 'enc-markt-raven',
    name: 'Raven über den Schrottmarkt',
    arena: 'arena-hinterhof',
    enemies: [{ enemy: 'raven-markt' }],
    intro: [
      { speaker: 'raven', expr: 'signatur', text: 'Hunter schickt euch? Süß. Ich hab sieben Jahre gesessen. Ich lass mich nicht nach Hause tragen wie ein Paket.' },
      { speaker: 'aria', expr: 'freude', text: 'Doch, Schätzchen. Notfalls im Schwitzkasten. Ich hab Ringen geübt. An Dexter.' },
    ],
    reward: { xp: 40 },
    onWin: [{ message: 'Raven klopft sich den Staub ab. „Okay. Ein Bier. Dann reden wir.“' }],
  },

  // --- Vorbereitungen (§5.2) ----------------------------------------------
  {
    id: 'enc-gasse-pfeffer',
    name: 'Wachmann Pfeffer',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'wachmann-pfeffer' }, { enemy: 'spaeherdrohne' }],
    intro: [
      { speaker: 'pfeffer', text: 'Hey, hey! Das ist meine Karte! Ich hab Feierabend! Ich hab KARAOKE!' },
      { speaker: 'narrator', text: 'Seine Dienstdrohne summt aus der Jackentasche hoch und schaltet das Rotlicht ein. Ab jetzt sieht Quantum zu.' },
    ],
    reward: { xp: 30 },
    onWin: [{ message: 'Pfeffer sitzt auf dem Bordstein. „Mila darf das nie erfahren.“' }],
  },
  {
    id: 'enc-kanal-ratten',
    name: 'Rattenbrücke im Kanal',
    arena: 'arena-kanal',
    enemies: [{ enemy: 'kanalratte', count: 4 }, { enemy: 'ratten-mutant' }],
    intro: [
      { speaker: 'narrator', text: 'Der Laufsteg wackelt. Vier Ratten so groß wie Dackel – und hinter ihnen etwas, das mal eine Ratte war.' },
      { speaker: 'narrator', text: 'Es riecht nach Kanal, Chemie und alten Socken. Der Mutant hebt den Arm. Es wird schlimmer.' },
    ],
    reward: { xp: 30, items: { kaeseecke: 1 } },
  },

  // --- Nebenquests Akt 1 (§6.2) -------------------------------------------
  {
    id: 'enc-taxistand',
    name: 'Schwebetaxi Blitz',
    arena: 'arena-strasse',
    enemies: [{ enemy: 'spaeherdrohne', count: 2 }, { enemy: 'abzieher' }],
    intro: [
      { speaker: 'herr-blitz', text: 'Störsender? Ich? Ich verkaufe Mobilität! Pünktlichkeit! Gegen Aufpreis! … Bodo, mach sie fertig!' },
      { speaker: 'narrator', text: 'Zwei Störsender-Drohnen steigen vom Taxidach auf. Bodo knackt mit den Knöcheln. Bodo hat keine Lizenz für irgendwas.' },
    ],
    reward: { xp: 30, credits: 40 },
  },
  {
    id: 'enc-hafen-laster',
    name: 'Nougatlaster am Depot',
    arena: 'arena-hafen',
    enemies: [{ enemy: 'quantum-wachmann', count: 2 }, { enemy: 'spaeherdrohne' }],
    intro: [
      { speaker: 'narrator', text: 'Der Laster steht offen. Kistenweise Nougatbomben, beschriftet „Energie-Test, nicht essen“. Zwei Wachleute essen trotzdem.' },
      { speaker: 'narrator', text: 'Einer verschluckt sich vor Schreck und greift nach dem Schockgewehr.' },
    ],
    reward: { xp: 40, items: { nougatbombe: 3 } },
  },
  {
    id: 'enc-hafen-jimmy',
    name: 'Jimmy an den Ölfass-Türmen',
    arena: 'arena-hafen-oelfaesser',
    enemies: [{ enemy: 'boss-jimmy' }],
    canFlee: false,
    intro: [
      { speaker: 'jimmy', text: 'Willkommen, wie kann ich Ihre Zukunft optimieren? Unser Angebot heute: Schmerzen! Jetzt mit dreißig Prozent mehr Schmerzen!' },
      { speaker: 'vega', expr: 'besorgt', text: 'Nicht kaputt machen. Hört ihr? Der Idiot gehört zu uns. Betäuben, hinlegen, fertig.' },
      { speaker: 'narrator', text: 'Bei 0 LP schläft Jimmy ein und schnarcht Werbejingles. Niemand wird hier verschrottet.' },
    ],
    reward: { xp: 60 },
    onWin: [{ message: 'Jimmy schnarcht: „… und jetzt neu: Zufriedenheit …“ Vega legt ihm ihre Jacke unter den Kopf.' }],
  },
  {
    id: 'enc-markt-gerd',
    name: 'Gutschein-Gerd macht Ärger',
    arena: 'arena-hinterhof',
    enemies: [{ enemy: 'abzieher', count: 2 }, { enemy: 'rostzahn-schlaeger' }],
    intro: [
      { speaker: 'gutschein-gerd', text: 'Betrug? Das ist eine WERTANLAGE! Jungs, erklärt den Herrschaften die Rendite!' },
      { speaker: 'narrator', text: 'Hinter dem Drucker im Hinterhof stapeln sich frische Chrome-10-Gutscheine. Die Tinte ist noch feucht.' },
    ],
    reward: { xp: 30, credits: 50 },
  },
  {
    id: 'enc-ruine-waechter',
    name: 'Digitech-Keller: die alten Wächter',
    arena: 'arena-labor-ruine',
    enemies: [{ enemy: 'digitech-waechter', count: 2 }],
    intro: [
      { speaker: 'narrator', text: 'Zwei Wachroboter aus der Zeit, als Digitech noch Digitech war, klappern aus dem Dunkel. Einer trägt noch das Namensschild „Gerhard“.' },
      { speaker: 'narrator', text: '„ZUTRITT NUR FÜR MITARBEITER. BITTE LÄCHELN.“ Wasser legt die alten Platinen sofort lahm.' },
    ],
    reward: { xp: 30, items: { 'schrott-ersatzteil': 2 } },
  },
  {
    id: 'enc-gerichtsplatz-gang',
    name: 'Die Freigang-Gang',
    arena: 'arena-hinterhof',
    enemies: [{ enemy: 'rostzahn-schlaeger', count: 3 }],
    intro: [
      { speaker: 'narrator', text: 'Drei Rostzähne sitzen auf Kessels fehlenden Kisten und spielen Skat mit beschlagnahmten Ausweisen.' },
      { speaker: 'narrator', text: '„Freigang heißt frei, Bulle. Und die Kisten gehen auch frei.“' },
    ],
    reward: { xp: 30 },
  },
  {
    id: 'enc-kanal-nagbert',
    name: 'Der Thronsaal des Rohrkönigs',
    arena: 'arena-kanal',
    // „Königlicher Befehl“ ruft alle 2 Runden Ratten; bis die Engine beschwören kann, sind sie von Anfang an da.
    enemies: [{ enemy: 'boss-nagbert' }, { enemy: 'kanalratte', count: 4 }],
    canFlee: false,
    intro: [
      { speaker: 'narrator', text: 'Ein Thron aus Kronkorken. Darauf eine Ratte, so groß wie ein Kühlschrank, mit Krone. Sie kaut an einem Getriebe.' },
      { speaker: 'narrator', text: 'Nagbert der Rohrkönig quiekt einen Befehl. Aus den Rinnen antworten viele kleine Zähne.' },
      { speaker: 'buergermeister-gully', text: 'Das ist er! Der Tyrann! Haut ihn, aber bitte nicht die Krone, die ist Kulturgut!' },
    ],
    reward: { xp: 60, credits: 50 },
    onWin: [{ message: 'Nagbert rollt vom Thron. Die Kronkorkenkrone klappert über den Steg.' }],
  },
  {
    id: 'enc-ubahn-abzieher',
    name: 'Knut und Kurt im U-Bahn-Wagen',
    arena: 'arena-gleise',
    enemies: [{ enemy: 'knut-ubahn' }, { enemy: 'kurt-ubahn' }, { enemy: 'rostzahn-schlaeger', count: 2 }],
    intro: [
      { speaker: 'knut', text: 'DU schon wieder! Kurt, das ist die vom Bahnsteig! Die, wegen der Mama gelacht hat!' },
      { speaker: 'kurt', text: 'Diesmal haben wir Verstärkung! Echte Rostzähne! Die haben wir mit Nougat bezahlt!' },
    ],
    reward: { xp: 50, credits: 60 },
    onWin: [{ message: 'Knut und Kurt sitzen auf der Wagenbank. „Mama wird so enttäuscht sein.“' }],
  },
  {
    id: 'enc-hafen-rostzaehne',
    name: 'Rostzähne an der Hafenmauer',
    arena: 'arena-hafen',
    enemies: [{ enemy: 'rostzahn-vize-bolle' }, { enemy: 'rostzahn-schlaeger', count: 3 }],
    intro: [
      { speaker: 'narrator', text: 'Bolle, der Rostzahn-Vize, versperrt den Weg zum Kai. Hinter ihm drei Jungs mit Leuchtketten.' },
      { speaker: 'narrator', text: '„Hafen-Hannes kriegt seinen Greifarm, wenn wir sagen. Und wir sagen: Zoll. Für die Aussicht.“' },
    ],
    reward: { xp: 40, credits: 40 },
  },
  {
    id: 'enc-ruine-pluenderer',
    name: 'Plünderer in der Ruine',
    arena: 'arena-labor-ruine',
    enemies: [{ enemy: 'schrottkraehe', count: 2 }, { enemy: 'spaeherdrohne' }],
    intro: [
      { speaker: 'narrator', text: 'Zwei Schrottkrähen reißen Kabel aus der Wand, eine Späherdrohne hält ihnen die Taschenlampe.' },
      { speaker: 'raven', expr: 'wut', text: 'Das hier war mal ein Tatort. Mein Tatort. Finger weg von den Akten, ihr Aasgeier.' },
    ],
    reward: { xp: 30, items: { 'schrott-ersatzteil': 3 } },
  },
  {
    id: 'enc-markt-rostzaehne',
    name: 'Schutzgeld für die Leuchtreklame',
    arena: 'arena-hinterhof',
    enemies: [{ enemy: 'leuchtreklamen-lutz' }, { enemy: 'rostzahn-schlaeger', count: 3 }],
    intro: [
      { speaker: 'narrator', text: 'Abend am Hinterhof-Lager. Leuchtreklamen-Lutz klopft mit der Kette gegen Oma Volts Schild.' },
      { speaker: 'narrator', text: '„Hübsch hell, das Ding. Wär schade, wenn’s dunkel wird. Zwanzig die Woche, Oma.“' },
      { speaker: 'oma-volt', text: 'Ich hab dreimal den Krieg überlebt und zweimal meinen Mann. Dich überleb ich auch, Bürschchen.' },
    ],
    reward: { xp: 40, credits: 30 },
    onWin: [{ message: 'Lutz kriecht davon. Oma Volt schaltet die Leuchtreklame demonstrativ auf „SUPERHELL“.' }],
  },
  {
    id: 'enc-bucht-hunde',
    name: 'Das Rudel der Brackbucht',
    arena: 'arena-hafen',
    enemies: [{ enemy: 'robohund-alpha' }, { enemy: 'robohund', count: 3 }],
    intro: [
      { speaker: 'narrator', text: 'Leuchtende Augen im Schlick. Vier ausgemusterte Quantum-Hunde, einer größer als die anderen, ein Fischernetz im Maul.' },
      { speaker: 'henk-angler', text: 'Das sind meine Netze! … Und das da ist mein Gummistiefel. Den kriegt ihr auch zurück, ja?' },
    ],
    reward: { xp: 50 },
  },
  {
    id: 'enc-kran-falke',
    name: 'Falke auf dem Kran',
    arena: 'arena-hafen-kran',
    enemies: [{ enemy: 'falke' }, { enemy: 'quantum-wachmann', count: 2 }],
    intro: [
      { speaker: 'falke', text: 'Vega! Schönes Fernrohr hattest du. Hab’s poliert. Schießt jetzt fast so gut wie ich.' },
      { speaker: 'vega', expr: 'wut', text: 'Er sitzt oben, wir unten. Höhenvorteil. Ich hasse ihn. Lauf zickzack, ich nehm ihn mir.' },
    ],
    reward: { xp: 50, credits: 60 },
  },
  {
    id: 'enc-hafen-container',
    name: 'Container 77',
    arena: 'arena-hafen',
    enemies: [{ enemy: 'zerleger', count: 2 }, { enemy: 'quantum-wachmann' }],
    intro: [
      { speaker: 'narrator', text: 'Container 77, Dienstagnacht. Zwei Zerleger stapeln Implantate in Kühlboxen, ein Quantum-Wachmann zählt mit.' },
      { speaker: 'narrator', text: '„Ripper zahlt pro Stück, Xion pro Schweigen. Und du zahlst gleich mit Zähnen.“' },
    ],
    reward: { xp: 40 },
  },
  {
    id: 'enc-penthouse-drohnen',
    name: 'Raus aus dem Penthouse',
    arena: 'arena-labor-penthouse',
    enemies: [{ enemy: 'spaeherdrohne', count: 2 }, { enemy: 'quantum-wachmann' }],
    // Ausgang rechts (Dienstbotentür), Felder frei laut Layout von arena-labor-penthouse.
    objective: { kind: 'reach', cells: [[11, 2], [11, 4]] },
    intro: [
      { speaker: 'narrator', text: 'Ein Sofa zu viel, ein Spiegel zu wenig: Der Alarm im Chrome-Penthouse heult. Zwei Drohnen und ein Wachmann zwischen euch und dem Ausgang.' },
      { speaker: 'raven', expr: 'signatur', text: 'Nicht kämpfen. Laufen. Profis rennen elegant.' },
    ],
    reward: { xp: 40 },
  },

  // --- Weitere Akt-1-Kämpfe aus den Quests (eigene IDs, world.md nennt nur den Kampf) ---
  {
    // side-live-dabei: Kameradrohne in der Brackbucht, „Kampf gegen das Robohund-Rudel“.
    id: 'enc-bucht-kameradrohne',
    name: 'Kameradrohne im Schlick',
    arena: 'arena-hafen',
    enemies: [{ enemy: 'robohund', count: 2 }],
    intro: [
      { speaker: 'narrator', text: 'Die NX-1-Kameradrohne blinkt halb im Schlick. Zwei Robohunde haben sie zum Spielzeug erklärt.' },
      { speaker: 'kameramann', text: 'Läuft noch! Die Drohne läuft noch! Bitte nicht in die Linse hauen, das ist geliehen!' },
    ],
    reward: { xp: 30 },
  },
  // side-rattenkoenig: drei umgehbare Rattenbegegnungen vor dem Thronsaal.
  {
    id: 'enc-kanal-rattenwache-1',
    name: 'Rattenwache am Rechen',
    arena: 'arena-kanal',
    enemies: [{ enemy: 'kanalratte', count: 3 }],
    intro: [{ speaker: 'narrator', text: 'Drei Ratten mit Kronkorken auf dem Kopf. Die Leibgarde. Sie salutieren nicht.' }],
    reward: { xp: 15 },
  },
  {
    id: 'enc-kanal-rattenwache-2',
    name: 'Rattenwache am Überlauf',
    arena: 'arena-kanal',
    enemies: [{ enemy: 'rattenschwarm' }, { enemy: 'kanalratte' }],
    intro: [{ speaker: 'narrator', text: 'Das Wasser im Überlauf bewegt sich gegen die Strömung. Es ist kein Wasser.' }],
    reward: { xp: 20 },
  },
  {
    id: 'enc-kanal-rattenwache-3',
    name: 'Die Torwache des Rohrkönigs',
    arena: 'arena-kanal',
    enemies: [{ enemy: 'ratten-mutant' }, { enemy: 'kanalratte', count: 2 }],
    intro: [{ speaker: 'narrator', text: 'Vor dem Thronsaal hockt Nagberts Schwager. Er ist breiter als die Tür und riecht nach Ehrgeiz.' }],
    reward: { xp: 20 },
  },
];

export const ENCOUNTERS_ACT1: Record<string, EncounterDef> = byId(list);

export const part: ContentPart = { encounters: ENCOUNTERS_ACT1 };
