// Aufträge am Chrome-Boulevard: Concierge-Tafel (world.md §6.6 „Weitere Tafeln“: act2, Ruf chrome-haus 30, geführt von
// Portier Albert: Bijou ausführen, Tischordnung, verschwundene Ohrringe, [Ausstrahlung 6–8]) und das Kopfgeld
// kopfgeld-blech-schwestern (§6.7, Stufe 3: chrome-boulevard abends; [Ausstrahlung 7] unter die Gäste mischen, in den
// Tresor schleichen, Kampf). Ziel-Hotspots per mapAdditions, Abgabe des Kopfgelds an der Saalwache im Gerichtssaal.
import type { CheckDef, Condition, DialogueDef, JobTemplateDef } from '../../../modules/contracts';
import type { JobBoardDef } from '../../../modules/jobs';
import type { ContentPart } from '../../part';

const CONCIERGE: Condition = { all: [{ act: 2 }, { rep: 'chrome-haus', min: 30 }] };
const check = (id: string, attribute: CheckDef['attribute'], threshold: number, tags: string[]): CheckDef =>
  ({ id, attribute, threshold, tags, faction: 'chrome-haus' });

// ---------------------------------------------------------------------------------------------------------------
// Concierge-Tafel

const concierge: JobBoardDef = { name: 'Concierge am Chrome-Boulevard', faction: 'chrome-haus', slots: 2, failRep: 2 };

const jobs: JobTemplateDef[] = [
  {
    id: 'job-concierge-bijou', kind: 'eskorte', title: 'Concierge: Bijou ausführen',
    text: 'Lady Seraphinas Roboterpudel braucht seine Runde über die Pudelwiese. Bitte darauf achten, dass Bijou nichts frisst, das teurer ist als Sie. {credits} Cr.',
    boards: ['concierge-chrome'], when: CONCIERGE,
    targets: [{ map: 'chrome-boulevard', label: 'Chrome-Boulevard, Pudelwiese' }],
    reward: { credits: [90, 130], xp: 60, rep: { 'chrome-haus': 3 } },
  },
  {
    id: 'job-concierge-tischordnung', kind: 'kurier', title: 'Concierge: Tischordnung',
    text: 'Dinner auf der Terrasse „Le Nuage“. Zwölf Gäste, elf Feindschaften, ein Tisch. Erstellen Sie eine Tischordnung, bei der niemand stirbt. {credits} Cr.',
    boards: ['concierge-chrome'], when: CONCIERGE,
    targets: [{ map: 'chrome-boulevard', label: 'Chrome-Boulevard, Terrasse „Le Nuage“' }],
    reward: { credits: [110, 150], xp: 70, rep: { 'chrome-haus': 3 } },
  },
  {
    id: 'job-concierge-ohrringe', kind: 'datenraub', title: 'Concierge: Verschwundene Ohrringe',
    text: 'Madame Pompadura vermisst ihre Diamantohrringe. Sie verdächtigt den Brunnen, den Pudel und das Personal. In dieser Reihenfolge. {credits} Cr.',
    boards: ['concierge-chrome'], when: CONCIERGE,
    targets: [{ map: 'chrome-boulevard', label: 'Chrome-Boulevard, Marmorbrunnen' }],
    reward: { credits: [130, 170], xp: 80, rep: { 'chrome-haus': 4 } },
  },
];

const D: Record<string, DialogueDef> = {
  'concierge-bijou': {
    id: 'concierge-bijou', start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: 'narrator', text: 'Albert übergibt dir eine Leine aus Seide. Am anderen Ende: Bijou, ein Roboterpudel mit rosa Schleife, der dich ansieht wie eine Steuererklärung.' },
          { speaker: 'narrator', text: 'Drei Schritte auf die Pudelwiese, dann sieht Bijou die goldene Werbedrohne. Sein Schwanz rotiert. Seine Hydraulik zischt. Gleich ist er weg.' },
        ],
        choices: [
          {
            text: '„Bijou. Sitz. Bei Fuß. Haltung, mein Herr!“ – im Tonfall eines Portiers.',
            check: check('concierge-bijou-etikette', 'ausstrahlung', 6, ['etikette', 'tiere']), next: 'gut',
          },
          { text: 'Eine Leckerli-Schraube hinhalten.', requires: { item: 'leckerli-schraube' }, effects: [{ take: 'leckerli-schraube' }], next: 'gut' },
          { text: 'Loslassen und hinterherrennen.', effects: [{ advanceTime: 40 }, { damage: 5 }], next: 'gerannt' },
          { text: 'Später.' },
        ],
      },
      {
        id: 'gut',
        lines: [
          { speaker: 'narrator', text: 'Bijou setzt sich. Er hebt eine Pfote. Er dreht eine perfekte Runde um die Pudelwiese, als hätte er nie etwas anderes gewollt.' },
          { speaker: 'portier-albert', text: 'Bemerkenswert. Er hat Sie nicht gebissen. Das hat er bei Lady Sybella seit Jahren nicht geschafft. Also: nicht zu beißen.' },
        ],
        effects: [{ completeJob: 'job-concierge-bijou' }],
      },
      {
        id: 'gerannt',
        lines: [
          { speaker: 'narrator', text: 'Vierzig Minuten Boulevard rauf, Boulevard runter. Bijou jagt die Drohne, du jagst Bijou, ein Ordnungshüter joggt aus Prinzip mit.' },
          { speaker: 'narrator', text: 'Am Ende sitzt Bijou zufrieden im Brunnen. Du liegst daneben. Albert reicht dir ein Handtuch, ohne hinzusehen.' },
          { speaker: 'player', text: 'Dieser verdammte Toaster mit Locken.' },
        ],
        effects: [{ completeJob: 'job-concierge-bijou' }],
      },
    ],
  },
  'concierge-tischordnung': {
    id: 'concierge-tischordnung', start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: 'narrator', text: 'Ein langer Tisch auf der Terrasse, zwölf Platzkarten, eine Liste mit Notizen von Albert: „Baron Gold hasst Gräfin Silber. Gräfin Silber hasst Rosé. Herr Rosé hasst alle.“' },
        ],
        choices: [
          {
            text: 'Nach Klatsch sortieren: Wer mit wem, wer gegen wen, wer schuldet wem eine Yacht.',
            check: check('concierge-tisch-klatsch', 'ausstrahlung', 7, ['etikette', 'geruecht']), next: 'perfekt',
          },
          { text: 'Nach dem Alphabet setzen. Sollen sie sich doch streiten.', effects: [{ advanceTime: 20 }], next: 'alphabet' },
          { text: 'Später.' },
        ],
      },
      {
        id: 'perfekt',
        lines: [
          { speaker: 'narrator', text: 'Baron Gold sitzt neben seiner Exfrau, die ihn nur noch mit Höflichkeit quält. Gräfin Silber bekommt Wasser und das Gefühl, gewonnen zu haben. Herr Rosé sitzt allein am Kopfende. Er nennt es „Ehrenplatz“.' },
          { speaker: 'portier-albert', text: 'Exquisit. Niemand wird heute Abend mit Besteck werfen. Ich bin fast enttäuscht.' },
        ],
        effects: [{ completeJob: 'job-concierge-tischordnung' }, { rep: 'chrome-haus', delta: 2 }],
      },
      {
        id: 'alphabet',
        lines: [
          { speaker: 'narrator', text: 'Alphabetisch. Baron Gold neben Gräfin … nein, Moment, „Gold“ kommt vor „Gräfin“? Egal. Du klebst die Karten, du gehst.' },
          { speaker: 'narrator', text: 'Später hörst du von der Terrasse Geschirr fliegen. Albert schreibt „erledigt“ auf die Tafel. Darunter, kleiner: „irgendwie“.' },
        ],
        effects: [{ completeJob: 'job-concierge-tischordnung' }],
      },
    ],
  },
  'concierge-ohrringe': {
    id: 'concierge-ohrringe', start: 'start',
    nodes: [
      {
        id: 'start',
        lines: [
          { speaker: 'narrator', text: 'Madame Pompadura steht am Brunnen, die Hand an der Stirn, in der anderen Hand ein Handtäschchen, das mehr kostet als ein Auto. „Meine Ohrringe! Der Brunnen hat sie! Oder der Pudel! Oder SIE!“' },
        ],
        choices: [
          {
            text: '„Madame, rekonstruieren wir Ihren Tag. Ganz ruhig. Wo haben Sie sie zuletzt abgelegt?“',
            check: check('concierge-ohrringe-befragen', 'ausstrahlung', 8, ['ueberreden', 'etikette']), next: 'tasche',
          },
          { text: 'In den Brunnen steigen und den Boden absuchen.', effects: [{ advanceTime: 30 }], next: 'brunnen' },
          { text: 'Später.' },
        ],
      },
      {
        id: 'tasche',
        lines: [
          { speaker: 'narrator', text: 'Frühstück, Friseur, Pediküre, Tee mit dem Botschafter, „und dann habe ich sie in die Tasche gesteckt, weil der Botschafter so neidisch geschaut hat“.' },
          { speaker: 'narrator', text: 'Stille. Madame Pompadura öffnet ihre Tasche. Zwei Diamanten blitzen. Sie schließt die Tasche wieder und sagt mit fester Stimme: „Das Personal muss sie hineingetan haben.“' },
        ],
        effects: [{ completeJob: 'job-concierge-ohrringe' }, { rep: 'chrome-haus', delta: 2 }],
      },
      {
        id: 'brunnen',
        lines: [
          { speaker: 'narrator', text: 'Das Wasser ist kalt und klatscht Applaus bei jeder deiner Bewegungen. Du findest: 400 Credits in Wunschmünzen (die du nicht nehmen darfst), einen Kamm, ein Gebiss. Keine Ohrringe.' },
          { speaker: 'narrator', text: 'Als du tropfnass herauskletterst, hält Madame Pompadura die Ohrringe hoch. „Sie waren in meiner Tasche! Sie haben trotzdem gesucht. Das zählt. Wie heißen Sie noch gleich? Ach, egal.“' },
        ],
        effects: [{ completeJob: 'job-concierge-ohrringe' }],
      },
    ],
  },
};

// ---------------------------------------------------------------------------------------------------------------
// Kopfgeld: Die Blech-Schwestern (Stufe 3)

const KG = 'kopfgeld-blech-schwestern';
const ENC = 'enc-kopfgeld-blech-schwestern';
const GESTELLT_FLAG = 'kg_blech_schwestern_gestellt';
const ERLEDIGT = 'kg_blech_schwestern_erledigt';
const GESTELLT: Condition = { any: [{ flag: GESTELLT_FLAG }, { won: ENC }] };

const kopfgeld: JobTemplateDef = {
  id: KG, kind: 'kopfgeld', title: 'Kopfgeld: Die Blech-Schwestern',
  text: 'Juwelendiebinnen, die sich als „die echten Chrome-Schwestern“ ausgeben. Blaue Perücke, rote Perücke, Kleider aus Alufolie. Abends am Juwelier Glanzstück. Lebend beim Richter abliefern. {credits} Cr.',
  boards: ['auftragstafel'],
  when: { all: [{ act: 2 }, { rep: 'crew-hunter', min: 80 }, { notFlag: ERLEDIGT }] },
  targets: [{ map: 'chrome-boulevard', label: 'Chrome-Boulevard, hinter dem Juwelier (abends)' }],
  reward: { credits: [700, 700], xp: 320, rep: { 'crew-hunter': 5 } },
};

D['kg-blech-schwestern'] = {
  id: 'kg-blech-schwestern', start: 'start',
  nodes: [
    {
      id: 'start',
      lines: [
        { speaker: 'narrator', text: 'In der Gasse hinter dem Juwelier kauern zwei Frauen an der Hintertür. Eine trägt eine blaue Perücke, die andere eine rote. Ihre Kleider sind aus Alufolie. Gebürsteter Alufolie.' },
        { speaker: 'narrator', text: '„Pssst! Wir sind die ECHTEN Chrome-Schwestern. Wir holen nur unseren Schmuck ab. Mit einem Dosenöffner. Wie reiche Leute das eben machen.“' },
      ],
      choices: [
        {
          text: 'Den Abendempfang vor dem Juwelier nutzen: unter die Gäste mischen und die beiden als Hochstaplerinnen vorführen.',
          check: { id: 'kg-blech-gaeste', attribute: 'ausstrahlung', threshold: 7, tags: ['bluff', 'etikette'] }, next: 'gaeste',
        },
        {
          text: 'Durch die Hintertür in den Tresor schleichen und ihnen dort auflauern.',
          effects: [{
            minigame: 'akt-schloss', level: 4, key: 'blech-schwestern-tresor', label: 'Hintertür zum Tresor',
            win: [{ setFlag: GESTELLT_FLAG }, { message: 'Als die Blech-Schwestern den Tresor öffnen, sitzt du schon drin. Mit Handschellen und einem sehr zufriedenen Gesicht. Abliefern: Gerichtssaal, Saalwache.' }],
            lose: [{ message: 'Das Schloss hält. Die Schwestern kichern. „Amateur.“ Versuch es noch einmal – oder mach es auf die laute Art.' }],
          }],
        },
        { text: '„Ich bin die echte Kopfgeldjägerin. Mit echten Fäusten.“', effects: [{ battle: ENC }] },
        { text: '„Erzählt mir was Nützliches, dann hab ich euch nie gesehen.“', next: 'laufen' },
        { text: 'Später.' },
      ],
    },
    {
      id: 'gaeste',
      lines: [
        { speaker: 'narrator', text: 'Du schlenderst mit einem geliehenen Sektglas zum Empfang vor dem Juwelier, nickst Madame Pompadura zu und sagst laut: „Schauen Sie, die Chrome-Schwestern! Aus Alufolie! Ist das die neue Kollektion?“' },
        { speaker: 'narrator', text: 'Dreißig Köpfe drehen sich. Dreißig Kameras. Die Blech-Schwestern erstarren im Blitzlicht wie Rehe aus Aluminium. Die Blaue flüstert: „Wir sind … Performancekunst?“' },
        { speaker: 'narrator', text: 'Der Wachmann vom Diamant-Hologramm hat endlich etwas zu tun. Er weint fast vor Glück, als er ihnen die Handschellen anlegt.' },
      ],
      effects: [{ setFlag: GESTELLT_FLAG }, { message: 'Die Blech-Schwestern sind gestellt. Abliefern: Gerichtssaal, an der Saalwache.' }],
    },
    {
      id: 'laufen',
      lines: [
        { speaker: 'narrator', text: 'Die Rote zieht eine Serviette aus dem Ärmel und zeichnet einen Grundriss. „Der echte Tresor der echten Chrome-Schwestern hat einen Lieferschacht. Für Champagner. Breit genug für eine schlanke Person mit Ambitionen.“' },
        { speaker: 'narrator', text: '„Und Sybella führt doppelte Bücher. Das wissen alle. Keiner sagt es. Tschüssi!“ Sie sind weg, bevor die Alufolie zu Ende geknistert hat.' },
      ],
      effects: [
        { completeJob: KG }, { credits: -350 }, { setFlag: ERLEDIGT }, { setFlag: 'kontakt_blech_schwestern' },
        { message: 'Laufen lassen: halber Lohn. Dafür schulden dir zwei Diebinnen in Alufolie einen Gefallen.' },
      ],
    },
  ],
};

D['kg-blech-schwestern-abgabe'] = {
  id: 'kg-blech-schwestern-abgabe', start: 'start',
  nodes: [{
    id: 'start',
    lines: [
      { speaker: 'narrator', text: 'Die Blech-Schwestern stehen vor der Saalwache, Perücken schief, Alufolie zerknittert. Der Wachtmeister notiert: „Name?“ – „Seraphina.“ – „Sybella.“ – „Echte Namen?“ – „Gertrud.“ – „Helga.“' },
      { speaker: 'narrator', text: 'Stempel, Beleg, Klingel. Der Richter ruft von hinten: „Alufolie im Gerichtssaal? Endlich Glanz in der Hütte!“' },
    ],
    effects: [{ completeJob: KG }, { setFlag: ERLEDIGT }],
  }],
};

const ABEND_ZIEL: Condition = { all: [{ job: KG }, { time: 'abend' }, { not: GESTELLT }, { notFlag: ERLEDIGT }] };

export const part: ContentPart = {
  jobs: Object.fromEntries([...jobs, kopfgeld].map((j) => [j.id, j])),
  jobBoards: { 'concierge-chrome': concierge },
  dialogues: D,
  mapAdditions: {
    'chrome-boulevard': {
      hotspots: [
        { id: 'ziel-concierge-bijou', at: [240, 620], label: 'Concierge: Bijou ausführen', kind: 'use', dialogue: 'concierge-bijou',
          when: { job: 'job-concierge-bijou' } },
        { id: 'ziel-concierge-tischordnung', at: 'cafe-terrasse', label: 'Concierge: Tischordnung', kind: 'use', dialogue: 'concierge-tischordnung',
          when: { job: 'job-concierge-tischordnung' } },
        { id: 'ziel-concierge-ohrringe', at: [600, 690], label: 'Concierge: Madame Pompadura am Brunnen', kind: 'use', dialogue: 'concierge-ohrringe',
          when: { job: 'job-concierge-ohrringe' } },
        { id: 'ziel-blech-schwestern', at: 'blech-schwestern-ecke', label: 'Die Blech-Schwestern', kind: 'use', dialogue: 'kg-blech-schwestern',
          when: ABEND_ZIEL },
        { id: 'blech-schwestern-spur', at: 'blech-schwestern-ecke', label: 'Kratzspuren an der Hintertür', kind: 'look',
          when: { all: [{ job: KG }, { not: { time: 'abend' } }, { not: GESTELLT }, { notFlag: ERLEDIGT }] },
          lines: [{ speaker: 'narrator', text: 'Kratzspuren am Schloss, ein Fetzen Alufolie, ein blaues Haar aus Kunstfaser. Die Blech-Schwestern kommen abends, wenn vorn der Empfang läuft.' }] },
      ],
    },
    gerichtssaal: {
      hotspots: [
        { id: 'kg-blech-schwestern-abgabe', at: [640, 660], label: 'Blech-Schwestern abliefern (Saalwache)', kind: 'use',
          dialogue: 'kg-blech-schwestern-abgabe', when: { all: [{ job: KG }, GESTELLT, { notFlag: ERLEDIGT }] } },
      ],
    },
  },
};
