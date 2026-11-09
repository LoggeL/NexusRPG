// Kleinere Figuren der neuen Zonen (world.md §3.5 „Figuren“, §10.7 Umgebungsleben): je eine ansprechbare Stimme für
// die Staubfalken (Bolle am Tor der Wrackburg), die Aussiedler (Juna in den Beeten), den Konvoi (Diesel-Doro, Mo/Do),
// das Kanalvolk im Pumpwerk (Rohrwartin Muffe an der Sperre), die Quantum-Außenstelle (Technikerin Kalibri) und den
// Rostzahn-Chef Funzel an der Hafenkante (bis side-rostzaehne-ende ihn auf die Bühne holt).
// Namen außer Funzel sind eigene Erfindungen (world.md nennt keine). Ohne Herzsystem (maxHearts 1).
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, NpcDef } from '../../../modules/contracts';
import {
  dialog, erz, flag, geschenke, ich, knoten, ort, pruefung, rede, sammle, sprecher, weg, weltfigur,
} from './_oednis';

const EHRE: Condition = { quest: 'side-kraehes-ehre', state: 'done' };
const FRIEDEN: Condition = { quest: 'side-oednis-frieden', state: 'done' };
const EPILOG: Condition = { flag: 'epilog' };

const statist = (def: Omit<NpcDef, 'portrait'> & { portrait?: string }): NpcDef => weltfigur({ maxHearts: 1, ...def });

// ------------------------------------------------------------------------------------------- Bolle (Staubfalke)

const BOLLE = 'staubfalke-bolle';
const B = sprecher(BOLLE);
const bolleZoll = dialog('bolle-zoll', [
  knoten('start', [
    erz('Vor dem Tor der Wrackburg steht ein Kerl wie ein Kühlschrank mit Bart. Lederweste, Schutzbrille, eine Bolzenschleuder, die in seinen Händen wie ein Spielzeug aussieht. Auf seiner Brust ist eine einzelne Krähenfeder festgetackert.'),
    B('Halt. Das ist die Wrackburg. Hier wird gezahlt. Zehn Credits Toreintritt. Oder du erzählst mir einen Witz. Ich mag Witze. Ich versteh sie nicht immer, aber ich mag sie.'),
  ], {
    choices: [
      { text: 'Zehn Credits zahlen.', effects: [{ credits: -10 }, { rep: 'staubfalken', delta: 1 }], next: 'bezahlt' },
      { text: 'Einen Witz erzählen: „Was ist braun und sitzt hinter Gittern? Eine Knastanie.“', tag: '[Ausstrahlung 3]', check: pruefung('bolle-witz', 'ausstrahlung', 3, ['buehne']), next: 'witz', effects: [{ rep: 'staubfalken', delta: 2 }] },
      { text: '„Krähe will mich sehen. Geh mir aus dem Weg, Fleischberg.“', tag: '[Körper 6]', check: pruefung('bolle-weg', 'koerper', 6, ['einschuechtern']), next: 'weg' },
      { text: 'Umdrehen und ein andermal wiederkommen.' },
    ],
  }),
  knoten('bezahlt', [B('Danke. Krähe sagt, Zoll ist Ehre. Ich sag, Zoll ist Abendessen. Wir haben beide recht.')], { effects: [flag('heute_bolle_tor')] }),
  knoten('witz', [
    erz('Bolle starrt dich an. Zehn Sekunden. Zwanzig. Dann prustet er los, so laut, dass oben ein Falke vor Schreck vom Wrack rutscht.'),
    B('KNASTANIE! Hahaha! Weil die … im Knast … ich versteh’s! Ich versteh’s wirklich! Geh rein, geh rein, ich muss das allen erzählen.', 'freude'),
  ], { effects: [flag('heute_bolle_tor')] }),
  knoten('weg', [
    erz('Du trittst einen Schritt auf ihn zu und siehst ihm in die Schutzbrille. Er blinzelt. Dann tritt er zur Seite, sehr langsam, als wäre das seine Idee gewesen.'),
    B('Ich … wollte eh gerade Pause machen. Ja. Pause. Geh durch. Und sag Krähe nicht, dass ich Pause gemacht hab.'),
  ], { effects: [flag('heute_bolle_tor')] }),
]);
const bolleFreund = dialog('bolle-freund', [knoten('start', [
  erz('Bolle sieht dich, hebt beide Fäuste in die Luft und brüllt deinen Namen. Dann den Namen der Krähe. Dann einfach nur „JAAA!“.'),
  B('Du bist die Geschichte! Die vom Duell! Krähe erzählt sie jeden Abend. Jedes Mal wird’s spannender. Gestern hast du einen Skorpion mit bloßen Händen erwürgt. Hast du doch, oder?', 'freude'),
], { choices: [
  { text: '„Natürlich. Zwei sogar.“', next: 'luege' },
  { text: '„Nein, Bolle. Das hat sie erfunden.“', next: 'wahr' },
] }),
knoten('luege', [B('ZWEI! Ich wusste es! Ich erzähl’s weiter!')]),
knoten('wahr', [B('Psst! Nicht so laut. Wenn’s keiner weiß, ist es wahr. So funktioniert das hier draußen.')]),
]);
const bolleFrieden = dialog('bolle-frieden', [knoten('start', [
  B('Seit dem Frieden steh ich hier nur noch zum Winken. Ich winke dem Konvoi. Der Konvoi winkt zurück. Manchmal werfen sie Pfannkuchen. Das ist der beste Job, den ich je hatte.', 'freude'),
])]);
const bolle = statist({
  id: BOLLE, name: 'Bolle', unknownName: 'Staubfalke am Tor', sprite: 'passant-punk-walk', faction: 'staubfalken',
  bio: 'Torwache der Wrackburg, gebaut wie ein Kühlschrank, Herz wie ein Welpe. Liebt Witze, versteht etwa jeden dritten.',
  gifts: geschenke({ loves: ['hofhonig-pfannkuchen', 'comic-heft'], likes: ['bandshirt', 'kartendeck'], dislikes: ['zeitung-papier'], hates: ['handschellen'] }),
  schedule: [ort('T,A', 'staubstrasse', 'staubfalken-wache'), weg('*')],
  talk: [
    rede('bolle-frieden', FRIEDEN),
    rede('bolle-freund', EHRE),
    rede('bolle-zoll'),
  ],
});

// ------------------------------------------------------------------------------------------- Juna (Aussiedlerin)

const JUNA = 'aussiedlerin-juna';
const J = sprecher(JUNA);
const junaTag = dialog('juna-tag', [
  knoten('start', [
    erz('Zwischen den Beeten unter den Schattennetzen kniet eine junge Frau mit Sonnenhut und Gießkanne. Ihre Arme sind braun wie Lehm, ihr Lächeln ist schief.'),
    J('Vorsicht, nicht auf die Bohnen treten! Die sind empfindlich. Wie ich, wenn einer auf meine Bohnen tritt.'),
  ], { choices: [
    { text: 'Wie wächst hier draußen überhaupt was?', next: 'wachsen' },
    { text: 'Was ist mit dem Brunnen?', next: 'brunnen', when: { not: { quest: 'pers-marla-brunnen', state: 'done' } } },
    { text: 'Wer macht euch hier das Leben schwer?', next: 'aerger' },
    {
      text: 'Beim Gießen helfen.', when: { notFlag: 'heute_juna_giessen' }, next: 'giessen',
      effects: [flag('heute_juna_giessen'), { advanceTime: 30 }, { rep: 'aussiedler', delta: 2 }, { give: 'frisches-gemuese' }],
    },
    { text: 'Ich lass dich weitermachen.' },
  ] }),
  knoten('wachsen', [J('Mit Geduld, Netzen und Elsas Bewässerungsroboter, der dabei Espresso kocht. Und mit Fluchen. Fluchen hilft. Die Tomaten wachsen schneller, wenn man sie anschreit.')], { next: 'start' }),
  knoten('brunnen', [J('Der gibt jede Woche weniger. Marla sagt, die Pumpe ist alt. Ich sag, da hat einer am Rohr gedreht. Einer mit Hut. Aber ich sag ja nichts. Ich sag’s nur jedem.', 'besorgt')], { next: 'start' }),
  knoten('aerger', [
    J('Die Falken wollen Zoll für die Straße. Brösel will Geld für Wasser, das eigentlich unseres ist. Die Skorpione wollen an den Zaun. Und Mecker, die Ziege, will meinen Hut.', 'wut'),
    J('Von allen ist Mecker die Schlimmste. Die anderen kann man wenigstens bestechen.'),
  ], { next: 'start' }),
  knoten('giessen', [
    erz('Eine halbe Stunde schleppt ihr Kannen vom Brunnen zu den Beeten. Am Ende hast du Sand in den Ohren, Matsch an den Knien und eine Gurke in der Hand.'),
    J('Für dich. Frisch gepflückt. Die erste Gurke, die du dir hier draußen verdient hast. Die schmeckt anders. Nach Rückenschmerzen.', 'freude'),
  ]),
]);
const junaFrieden = dialog('juna-frieden', [knoten('start', [
  J('Seit dem Vertrag kommen die Falken zum Tauschen statt zum Kassieren. Gestern hat einer mir Kakteen gebracht und gefragt, wie man die gießt. Man gießt sie nicht! Er hat geweint. Ich glaub, er ist ganz nett.', 'freude'),
])]);
const juna = statist({
  id: JUNA, name: 'Juna', unknownName: 'Aussiedlerin mit Gießkanne', sprite: 'passant-arbeiterin-walk', faction: 'aussiedler',
  bio: 'Junge Aussiedlerin, kümmert sich um die Beete unter den Schattennetzen. Schreit Tomaten an, damit sie wachsen.',
  gifts: geschenke({ loves: ['samenbombe', 'blumensamen'], likes: ['wasserfilter', 'kaktusfrucht'], dislikes: ['edelbrause'], hates: ['plastikpflanze'] }),
  schedule: [ort('M,T', 'aussiedlerhof', 'beete'), ort('A', 'aussiedlerhof', 'lagerfeuer-hof'), weg('N')],
  talk: [rede('juna-frieden', { all: [FRIEDEN, { notFlag: 'heute_juna_frieden' }] }), rede('juna-tag')],
});
junaFrieden.nodes[0].effects = [flag('heute_juna_frieden')];

// ------------------------------------------------------------------------------------------- Diesel-Doro (Konvoi)

const DORO = 'konvoi-doro';
const D = sprecher(DORO);
const doroTag = dialog('doro-tag', [
  knoten('start', [
    erz('Neben drei Lastern mit Planen voller Flicken sitzt eine Frau auf einem Reifenstapel, Overall bis zur Hüfte runtergekrempelt, Zigarre im Mundwinkel, die nicht brennt. Hinter ihr stapelt sich Ware: Kisten, Platten, Postkarten.'),
    D('Diesel-Doro. Konvoi-Chefin. Montag und Donnerstag hier, sonst zwischen hier und dem Rest der Welt. Was brauchst du? Ich hab alles. Außer Geduld.'),
  ], { choices: [
    { text: 'Zeig mir deine Ware.', effects: [{ shop: 'konvoi' }] },
    { text: 'Wohin fahrt ihr?', next: 'route' },
    { text: 'Wie kommt ihr an den Falken vorbei?', next: 'falken', when: { not: FRIEDEN } },
    { text: 'Und jetzt, mit dem Frieden?', next: 'frieden', when: FRIEDEN },
    { text: 'Gute Fahrt, Doro.' },
  ] }),
  knoten('route', [
    D('Stadt, Staubstraße, Aussiedlerhof, dann die alte Küstenpiste bis kurz vors Meer. Da drehen wir um. Weiter traut sich keiner. Nicht wegen der Straße. Wegen der Leere.'),
    D('Ich hab das Meer gesehen. Von Weitem. Es sieht aus, als würde die Welt einfach aufhören und blau werden.'),
  ], { next: 'start' }),
  knoten('falken', [
    D('Zoll. Und Geschichten. Krähe nimmt beides. Ich erzähl ihr jedes Mal dieselbe, nur mit anderem Ende. Sie merkt es. Sie lässt mich trotzdem durch. Ich glaub, das ist Liebe.'),
    D('Und Brösel nimmt auch Zoll. Nur ohne Geschichte. Mit dem fahr ich nicht.'),
  ], { next: 'start' }),
  knoten('frieden', [D('Mit Eskorte! Zwei Falken auf Motorrädern vorne, zwei hinten, und alle winken. Ich fühl mich wie eine Königin. Eine Königin mit Ölflecken. Bring mir was Schönes aus der Stadt mit, ich besorg dir dafür, was du willst.', 'freude')], { next: 'start' }),
]);
const doro = statist({
  id: DORO, name: 'Diesel-Doro', unknownName: 'Konvoi-Chefin', sprite: 'passant-strassenhaendler-walk', faction: 'aussiedler',
  bio: 'Führt den Konvoi zwischen Stadt und Ödnis, montags und donnerstags am Konvoi-Halt der Staubstraße. Unangezündete Zigarre, Overall, Händlerherz.',
  gifts: geschenke({ loves: ['postkarte-meer', 'vinyl-platte'], likes: ['synth-kaffee', 'bandshirt'], dislikes: ['chrome-10-gutschein'], hates: ['peilsender'] }),
  schedule: [ort('T', 'staubstrasse', 'konvoi-halt', { days: ['mo', 'do'] }), weg('*')],
  talk: [rede('doro-tag')],
});

// ------------------------------------------------------------------------------------------- Rohrwartin Muffe (Kanalvolk, Pumpwerk)

const MUFFE = 'rohrwartin-muffe';
const R = sprecher(MUFFE);
const KANAL_FERTIG: Condition = { quest: 'main-2-kanal', state: 'done' };
const muffeTag = dialog('muffe-tag', [
  knoten('start', [
    erz('Vor dem Gitterboden steht eine Barrikade aus Rohren, Fässern und einem umgedrehten Einkaufswagen. Dahinter eine Frau in Wathose mit Grubenhelm und einer Rohrzange, so lang wie dein Bein. Auf ihrem Helm klebt ein Kronkorken.'),
    R('Halt! Kanalvolk-Sperre! Bürgermeister Gully hat angeordnet: Keiner geht zu den weißen Kisten. Keiner kommt von den weißen Kisten. Und keiner pinkelt in Pumpe zwei. Pumpe zwei hat Gefühle.'),
  ], { choices: [
    { text: 'Was sind das für weiße Kisten?', next: 'kisten' },
    { text: 'Warum die Sperre?', next: 'sperre' },
    {
      text: '„Kannst du das Handrad am Überlaufrohr aufmachen? Ein Weg zur Hafenkante wäre Gold wert.“',
      when: { all: [KANAL_FERTIG, { notFlag: 'ueberlaufrohr_offen' }] }, next: 'rohr',
    },
    { text: 'Ich geh dann mal wieder.' },
  ] }),
  knoten('kisten', [
    R('Quantum. Hat sich mitten in unser Pumpwerk gesetzt. Weiße Container, weiße Kittel, weiße Zähne. Die zapfen unsere Leitungen an und schicken Kabel nach oben.', 'wut'),
    R('Nachts kommen Leute in Pyjamas und streicheln die Rohre. Und Kabelmolche. Die glitzern. Fass keinen an. Die beißen und dann glitzerst du auch.'),
  ], { next: 'start' }),
  knoten('sperre', [R('Weil das unser Pumpwerk ist. Seit hundert Jahren. Die Stadt hat’s vergessen, wir haben’s geputzt. Wer hier was will, fragt das Kanalvolk. Und das Kanalvolk sagt meistens nein. Aus Prinzip. Und weil’s Spaß macht.')], { next: 'start' }),
  knoten('rohr', [
    R('Das Handrad? Klemmt seit 2070. Ich krieg’s auf. Aber was hab ich davon?'),
  ], { choices: [
    { text: '„Das Kanalvolk und ich, wir kennen uns.“', tag: '[Ruf Kanalvolk 20]', requires: { rep: 'kanalvolk', min: 20 }, next: 'auf', effects: [{ rep: 'kanalvolk', delta: 2 }] },
    { text: '„Gully schuldet mir noch was. Richte ihm aus, damit sind wir quitt.“', tag: '[Straße 5]', check: pruefung('muffe-gully', 'strasse', 5, ['ueberreden']), next: 'auf' },
    { text: 'Ihr fünfzig Credits für die Kanalkasse geben.', effects: [{ credits: -50 }, { rep: 'kanalvolk', delta: 1 }], next: 'auf' },
    { text: 'Ein andermal.', next: 'start' },
  ] }),
  knoten('auf', [
    erz('Muffe setzt die Rohrzange an, stemmt einen Stiefel gegen das Rohr und flucht in einer Sprache, die nur aus Konsonanten besteht. Mit einem Kreischen dreht sich das Handrad. Dahinter: Salzluft. Hafen.'),
    R('So. Jetzt ist es offen. Wer reingeht, kommt an der Hafenkante raus. Wer rauskommt, kommt hier nicht wieder rein. Einbahnstraße. Wie das Leben.', 'freude'),
  ], { effects: [flag('ueberlaufrohr_offen')] }),
]);
const muffe = statist({
  id: MUFFE, name: 'Rohrwartin Muffe', unknownName: 'Kanalvolk-Frau mit Rohrzange', sprite: 'passant-kanalvolk-walk', faction: 'kanalvolk',
  bio: 'Hält für Bürgermeister Gully die Kanalvolk-Sperre im Pumpwerk Sieben gegen die Quantum-Außenstelle. Grubenhelm mit Kronkorken, Rohrzange, sehr viele Konsonanten.',
  gifts: geschenke({ loves: ['pilzsuppe', 'leuchtpilz'], likes: ['rostige-schraube', 'synth-kaffee'], dislikes: ['parfuem-ozon'], hates: ['waschpulver'] }),
  schedule: [ort('*', 'pumpwerk-sieben', 'kanalvolk-sperre', { when: { act: 2 } }), weg('*')],
  talk: [rede('muffe-tag')],
});

// ------------------------------------------------------------------------------------------- Technikerin Kalibri (Quantum-Außenstelle)

const KALIBRI = 'technikerin-kalibri';
const Q = sprecher(KALIBRI);
const kalibriTag = dialog('kalibri-tag', [
  knoten('start', [
    erz('Vor den weißen Containern der Quantum-Außenstelle sitzt eine Technikerin im Laborkittel auf einer Kiste, die Atemmaske unters Kinn geschoben, und isst Synth-Nudeln aus der Dose. Ihr Kittel war mal weiß. Jetzt ist er kanalfarben.'),
    Q('Wenn du von der Sicherheit bist: Ich hab Pause. Wenn du vom Kanalvolk bist: Ich hab Pause. Wenn du von der Presse bist: Ich war nie hier.'),
  ], { choices: [
    { text: 'Was macht Quantum hier unten?', next: 'arbeit' },
    { text: '„Gefällt dir der Job?“', next: 'job' },
    {
      text: '„Wenn du hier unten so unglücklich bist: Was steht auf euren Lieferscheinen?“', tag: '[Ausstrahlung 5]', once: true, id: 'kalibri-liefer',
      check: pruefung('kalibri-lieferscheine', 'ausstrahlung', 5, ['ueberreden']), next: 'liefer',
    },
    { text: 'Guten Appetit.' },
  ] }),
  knoten('arbeit', [Q('Netzknoten warten. Kabel legen. Chips verladen. Fragen nicht stellen. Ich bin sehr gut im Nicht-Fragen-Stellen. Hab ich ein Diplom drin.')], { next: 'start' }),
  knoten('job', [
    Q('Ich hab Informatik studiert. Mit Auszeichnung. Jetzt sitz ich in einem Abwasserkanal und esse Nudeln, die nach Pappe schmecken, neben einer Pumpe, die angeblich Gefühle hat.', 'trauer'),
    Q('Aber hey: Gefahrenzulage. Drei Credits pro Stunde. Für das Risiko, dass mich eine Rohrwartin mit der Zange erschlägt.'),
  ], { next: 'start' }),
  knoten('liefer', [
    erz('Sie sieht sich um. Dann zieht sie einen zerknitterten Zettel aus der Kitteltasche.'),
    Q('„Chrome 10, Beta-Charge, Verteilung Unterstadt, Testgruppe Nacht.“ Testgruppe Nacht. Weißt du, was das heißt? Ich auch nicht. Ich will’s nicht wissen. Aber du siehst aus wie jemand, der’s wissen will.', 'besorgt'),
    ich('Danke.'),
    Q('Wofür? Ich hab Pause. Ich war nie hier.'),
  ], { effects: [flag('kalibri_testgruppe_nacht'), { xp: 30 }] }),
]);
const kalibri = statist({
  id: KALIBRI, name: 'Technikerin Kalibri', unknownName: 'Quantum-Technikerin', sprite: 'passant-anzug-walk', faction: 'quantum',
  bio: 'Quantum-Technikerin in der Außenstelle im Pumpwerk Sieben. Informatik mit Auszeichnung, Synth-Nudeln aus der Dose, keine Fragen.',
  gifts: geschenke({ loves: ['logik-raetsel-modul', 'sahnetorte-stueck'], likes: ['synth-kaffee', 'comic-heft'], dislikes: ['kanalschlamm'], hates: ['synth-nudeln'] }),
  schedule: [ort('T', 'pumpwerk-sieben', 'quantum-aussenstelle', { when: { all: [{ act: 2 }, { not: EPILOG }] } }), weg('*')],
  talk: [rede('kalibri-tag')],
});

// ------------------------------------------------------------------------------------------- Funzel (Rostzahn-Chef)

const FUNZEL = 'funzel';
const FZ = sprecher(FUNZEL);
const funzelTag = dialog('funzel-tag', [
  knoten('start', [
    erz('Zwischen zwei Containern lehnt ein hagerer Kerl mit Neonpeitsche am Gürtel und einem Goldzahn, der im Licht der Kräne blitzt. Zwei Rostzähne flankieren ihn. Er kaut auf einem Zahnstocher, als hätte der ihn beleidigt.'),
    FZ('Na sieh mal an. Die Crew aus dem High Voltage. Du läufst durch meinen Hafen, ohne zu zahlen. Das ist mutig. Oder dumm. Bei euch ist das ja dasselbe.', 'signatur'),
  ], { choices: [
    { text: '„Dein Hafen? Der gehört den Leuten, die hier arbeiten.“', next: 'leute' },
    { text: '„Was willst du, Funzel?“', next: 'will' },
    { text: 'Ihm den Zahnstocher aus dem Mund schnippen.', tag: '[Reflexe 6]', check: pruefung('funzel-zahnstocher', 'reflexe', 6, ['geschick']), once: true, id: 'funzel-schnipp', next: 'schnipp' },
    { text: 'Weitergehen.' },
  ] }),
  knoten('leute', [
    FZ('Die Leute? Die Leute zahlen. Dafür passiert ihnen nix. Das nennt man Schutz. Das nennt man Ordnung. Das nennt man: Halt die Fresse, sonst fliegst du ins Hafenbecken.', 'wut'),
  ]),
  knoten('will', [
    FZ('Alles, was ihr habt. Aber ich bin großzügig. Ich nehm erst mal nur den Respekt. Den Rest hol ich mir, wenn Quantum mit seinen Lastern fertig ist und mir die Hälfte vom Kai gehört.'),
    FZ('Und sag Hannes, er soll aufhören, Leute aufzuwiegeln. Sonst greift sein Greifarm bald nach Fischen. Unten im Becken.'),
  ]),
  knoten('schnipp', [
    erz('Ein Fingerschnippen, und der Zahnstocher fliegt im hohen Bogen ins Hafenbecken. Die beiden Rostzähne zucken. Einer kichert. Funzel dreht sich langsam zu ihm um. Der Rostzahn hört sofort auf zu kichern.'),
    FZ('Das merk ich mir. Ich merk mir alles. Ich hab ein Elefantengedächtnis. Und eine Neonpeitsche.', 'wut'),
  ], { effects: [flag('funzel_blamiert')] }),
]);
const funzel = statist({
  id: FUNZEL, name: 'Funzel', unknownName: 'Rostzahn mit Goldzahn', portrait: FUNZEL, sprite: 'rostzahn-schlaeger-walk', faction: 'rostzaehne',
  bio: 'Chef der Rostzähne an der Hafenkante. Neonpeitsche, Goldzahn, Ego wie ein Containerschiff. Presst den Hafen aus, seit Quantum nachts Laster abfertigt.',
  gifts: geschenke({ loves: ['sonnenbrille-gold'], likes: ['edelbrause'], dislikes: ['postkarte-meer'], hates: ['handschellen'] }),
  // Abends im Container-Labyrinth, bis side-rostzaehne-ende ihn ins Lager holt (dort stellt ihn das Quest-Paket auf).
  schedule: [
    weg('*', { when: { any: [{ quest: 'side-rostzaehne-ende', state: ['active', 'done'] }, EPILOG] } }),
    ort('A', 'hafenkante', 'container-labyrinth', { when: { act: 2 } }),
    weg('*'),
  ],
  talk: [rede('funzel-tag')],
});

// ------------------------------------------------------------------------------------------- Teil

const dialogues: Record<string, DialogueDef> = sammle(
  bolleZoll, bolleFreund, bolleFrieden, junaTag, junaFrieden, doroTag, muffeTag, kalibriTag, funzelTag,
);

export const part: ContentPart = {
  npcs: { [BOLLE]: bolle, [JUNA]: juna, [DORO]: doro, [MUFFE]: muffe, [KALIBRI]: kalibri, [FUNZEL]: funzel },
  dialogues,
};
