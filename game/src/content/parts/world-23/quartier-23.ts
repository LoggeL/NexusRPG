// Crew-Quartier-Ausbau Stufen 4–6 (world.md §3.7), ab Akt 2. Stufen 0–3 baut maps/crew-quartier.ts (Flags
// quartier_stufe_1..3, Hotspot „Quartier ausbauen“). Hier als eigene Flag-Kette weiter:
//   quartier_stufe_4 Gästecouch (600 Cr): abends einen Begleiter aus der Party einladen, am Morgen +10 Herzpunkte
//   quartier_stufe_5 Dachgarten (800 Cr + blumensamen): einmal am Tag gärtnern (akt-gaertnern) oder Blumen schneiden
//   quartier_stufe_6 Aussicht (side-strandclub erledigt oder 2000 Cr): Meeresposter am Bullauge, Captain Kuschel
//                    hinterlässt sonntags einen Besuch
// Wege dorthin: Captain Kuschel schreibt, sobald eine Stufe bezahlbar ist; die Crew reagiert im Gruppenchat.
import type { Condition, DailyRuleDef, DialogueChoice, DialogueDef, PhoneMessageDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  EPILOG, MASTER, all, any, byId, ch, day, dlg, done, flag, give, herz, ich, msg, nar, node, not, say, setFlag, sms, xp,
} from './_w23';

const S3 = flag('quartier_stufe_3');
const S4 = flag('quartier_stufe_4');
const S5 = flag('quartier_stufe_5');
const S6 = flag('quartier_stufe_6');
const AB_AKT2: Condition = all({ act: 2 }, not(MASTER));
const STRANDCLUB = done('side-strandclub');

// --------------------------------------------------------------------------------------------- Ausbau-Dialog

const ausbau: DialogueDef = dlg('welt23-cq-ausbau', [
  node('start', [
    nar('Captain Kuschel hat einen zweiten Zettel neben den ersten geklebt. Er ist größer. Die Schrift ist ungeduldiger: „PHASE ZWEI. Couch. Garten. Aussicht. Geld her. – C. K.“'),
  ], {
    choices: [
      ch('Gästecouch reinwuchten (600 Cr) – Begleiter können hier übernachten.', 'couch-fertig', {
        when: not(S4), requires: { credits: 600 },
        effects: [{ credits: -600 }, setFlag('quartier_stufe_4'), xp(50), { sfx: 'coin' }],
      }),
      ch('Dachgarten anlegen (800 Cr + Blumensamen) – Gemüse und Blumen zum Verschenken.', 'garten-fertig', {
        when: all(S4, not(S5)), requires: all({ credits: 800 }, { item: 'blumensamen' }),
        effects: [{ credits: -800 }, { take: 'blumensamen' }, setFlag('quartier_stufe_5'), xp(60), { sfx: 'success' }],
      }),
      ch('Aussicht einrichten: Hunter hat vom Strandclub ein Bullaugen-Panorama übrig.', 'aussicht-strand', {
        when: all(S5, not(S6), STRANDCLUB), tag: '[Strandclub]',
        effects: [setFlag('quartier_stufe_6'), xp(80)],
      }),
      ch('Aussicht einrichten (2000 Cr) – ein neues Fenster mit Blick, der nicht auf eine Wand geht.', 'aussicht-gekauft', {
        when: all(S5, not(S6), not(STRANDCLUB)), requires: { credits: 2000 },
        effects: [{ credits: -2000 }, setFlag('quartier_stufe_6'), xp(80), { sfx: 'success' }],
      }),
      ch('Das ist alles. Mehr Container gibt es nicht.', 'voll', { when: S6 }),
      ch('Später. Mein Konto weint schon.'),
    ],
  }),
  node('couch-fertig', [
    nar('Die Couch kommt vom Flohmarkt, riecht nach Zigarren und Abenteuer und passt nur durch die Luke, weil Captain Kuschel sie „überzeugt“ hat. Mit einem Hammer.'),
    nar('Ein Zettel unter dem Kissen, daneben zwei gezeichnete Hasenohren, stolz aufgestellt: „Gäste ja. Schuhe nein. Krümel NIE. – C. K.“'),
  ], { effects: [msg('Gästecouch: Abends kannst du einen Begleiter aus deiner Party zum Übernachten einladen.')] }),
  node('garten-fertig', [
    nar('Über der Luke geht jetzt eine Leiter aufs Containerdach. Oben: vier Kisten Erde, eine Regentonne, ein Schild „BETRETEN NUR MIT GUTER ABSICHT“. Die Samen sind drin. Die Tauben wissen es schon.'),
    ich('Ich hab einen Garten. Auf einem Container. Über einem Club. In der Unterstadt.'),
    nar('Irgendwo da unten lacht jemand. Du lachst mit.'),
  ], { effects: [msg('Dachgarten: einmal am Tag gärtnern oder Blumen schneiden.')] }),
  node('aussicht-strand', [
    nar('Hunter liefert persönlich: ein Rahmen aus Treibholz, darin ein Foto vom Meer, so groß wie die halbe Wand. Er hängt es vor das Bullauge, tritt zurück und schweigt eine Weile.'),
    say('hunter', 'Damit du nicht vergisst, wofür wir das alles gemacht haben. Und damit du aufhörst, mein Büro zu besetzen, um aufs Plakat zu starren.', 'zaertlich'),
  ], { effects: [herz('hunter', 30), msg('Aussicht: Das Quartier hat jetzt ein Meer. Captain Kuschel kommt sonntags zu Besuch.')] }),
  node('aussicht-gekauft', [
    nar('Zwei Handwerker, drei Flüche, ein neues Bullauge mit Panoramaglas. Davor ein Poster vom Meer, das sich bei Neonlicht anfühlt, als würde es rauschen.'),
    nar('Ein Zettel am Rahmen: „Endlich. Ich komm sonntags gucken. Bring Kekse. – C. K.“'),
  ], { effects: [msg('Aussicht: Das Quartier hat jetzt ein Meer. Captain Kuschel kommt sonntags zu Besuch.')] }),
  node('voll', [
    nar('Couch, Garten, Meer. Der Container ist ausgebaut. Wer jetzt noch etwas will, muss einen zweiten Container stapeln. Captain Kuschel hat schon einen im Auge.'),
  ]),
]);

// --------------------------------------------------------------------------------------------- Gästecouch

interface Gast { npc: string; name: string; morgen: string }
const GAESTE: Gast[] = [
  { npc: 'aria', name: 'Aria', morgen: 'Aria liegt verkehrt herum auf der Couch, die Füße an der Wand, den Schläger im Arm wie ein Kuscheltier. „Sag nix. Die Couch hat angefangen.“' },
  { npc: 'raven', name: 'Raven', morgen: 'Die Couch ist leer und ordentlich gemacht, die Decke auf Kante gefaltet. Auf dem Kissen liegt ein Zettel: „Danke. Joggen. – R.“' },
  { npc: 'dante', name: 'Dante', morgen: 'Dante schläft im Sitzen, ein halber Keks auf der Brust. Er murmelt „Nicht fluchen“ und lächelt dabei.' },
  { npc: 'vega', name: 'Vega', morgen: 'Vega steht schon am Bullauge, Kaffee in der Hand, und zählt die Drohnen draußen. „Sieben. Gestern waren es neun. Wir gewinnen.“' },
  { npc: 'hunter', name: 'Hunter', morgen: 'Hunter schnarcht wie ein Generator mit Kummer. Als er aufwacht, behauptet er, er habe die ganze Nacht Wache gehalten.' },
  { npc: 'nyra', name: 'Nyra', morgen: 'Nyra hat dir über Nacht eine Welle an die Containerwand gemalt. Mit Kuli. Sie ist so groß wie du. Mindestens.' },
  { npc: 'jimmy', name: 'Jimmy', morgen: 'Jimmy ist um fünf aufgestanden und hat Frühstück ausgeliefert. An dich. Durchs Bullauge. Es ist nur ein bisschen zerdrückt.' },
];
const gastFlag = (npc: string) => `couch_gast_${npc}`;

const couch: DialogueDef = dlg('welt23-cq-couch', [
  node('start', [
    nar('Die Gästecouch. Ein bisschen durchgesessen, ein bisschen zu weich, perfekt für jemanden, der heute nicht allein nach Hause will.'),
  ], {
    choices: [
      ...GAESTE.map((g): DialogueChoice => ch(`${g.name} einladen, heute hier zu pennen.`, 'eingeladen', {
        when: all({ companion: g.npc }, { notFlag: 'heute_couch' }, { time: ['abend', 'nacht'] }),
        effects: [setFlag(gastFlag(g.npc)), setFlag('heute_couch'), msg(`${g.name} wirft sich auf die Couch. Morgen früh gibt es Herzpunkte.`)],
      })),
      ch('(Die Couch ist für heute vergeben.)', undefined, { when: flag('heute_couch') }),
      ch('Abends kann hier jemand aus der Party übernachten. Jetzt nur kurz sitzen.', 'sitzen', { when: not(flag('heute_couch')) }),
    ],
  }),
  node('eingeladen', [nar('Eine Decke fliegt durch den Container. Das Licht geht aus. Unten im Club wummert der Bass leiser.')]),
  node('sitzen', [nar('Du lässt dich fallen. Die Couch seufzt. Du auch. Für eine Minute ist die Stadt weit weg.')], { effects: [{ heal: 10 }] }),
]);

const daily: DailyRuleDef[] = GAESTE.map((g) => ({
  id: `welt23-couch-${g.npc}`,
  when: flag(gastFlag(g.npc)),
  effects: [herz(g.npc, 10), setFlag(gastFlag(g.npc), false), msg(g.morgen)],
}));

// --------------------------------------------------------------------------------------------- Dachgarten

const garten: DialogueDef = dlg('welt23-cq-dachgarten', [
  node('start', [
    nar('Vier Kisten Erde auf dem Containerdach. Unten Neon, oben Grün. Eine Taube sitzt auf der Regentonne und tut, als hätte sie nichts gefressen.'),
  ], {
    choices: [
      ch('Gärtnern: gießen, ernten, Käfer verscheuchen.', undefined, {
        when: { notFlag: 'heute_dachgarten' },
        effects: [
          setFlag('heute_dachgarten'), { advanceTime: 30 },
          { minigame: 'akt-gaertnern', level: 2, key: 'welt23-dachgarten', label: 'Dachgarten', win: [xp(15), msg('Die Ernte landet in deinem Rucksack. Es riecht nach Erde. Nach echter.')], lose: [msg('Die Blechkäfer waren schneller. Zwei Möhren bleiben trotzdem übrig. Trotzig.')] },
        ],
      }),
      ch('Blumen schneiden. Für jemanden.', 'blumen', {
        when: { notFlag: 'heute_dachgarten' },
        effects: [setFlag('heute_dachgarten'), give('orchidee')],
      }),
      ch('Dante beim Unkrautjäten zuschauen.', 'dante', {
        when: all({ companion: 'dante' }, { notFlag: 'heute_dachgarten' }),
        effects: [setFlag('heute_dachgarten'), give('frisches-gemuese', 2), herz('dante', 15)],
      }),
      ch('Heute ist schon alles gemacht. Einfach sitzen.', 'sitzen', { when: flag('heute_dachgarten') }),
      ch('Wieder runter.'),
    ],
  }),
  node('blumen', [nar('Eine Orchidee, lila wie Neon, nur leiser. Sie hat auf einem Container über einem Club überlebt. Wer sie bekommt, sollte das wissen.')]),
  node('dante', [
    say('dante', 'Das ist kein Unkraut! Das ist … okay, das ist Unkraut. Aber es hat sich solche Mühe gegeben!', 'freude'),
    nar('Er jätet trotzdem. Danach liegen zwei Hände voll Gemüse in deinem Arm und ein Regenwurm auf Dantes Kopf. Er lässt ihn da. „Er wohnt jetzt da.“'),
  ]),
  node('sitzen', [nar('Die Sonne, oder was der Smog davon übrig lässt, fällt auf die Kisten. Unten ruft jemand nach Oma Volt. Oben wächst etwas. Einfach so.')], { effects: [{ heal: 15 }] }),
]);

// --------------------------------------------------------------------------------------------- Telefon

const phone: PhoneMessageDef[] = [
  sms('tel-w23-kuschel-couch', 'captain-kuschel',
    'Deine Freunde schlafen auf dem Boden vom Club. Ich hab eine Couch gesehen. 600 Credits. Ich hab sie schon reserviert. Mit meinem Körper. Ich lieg drauf. – C. K.',
    all(S3, not(S4), AB_AKT2, { credits: 600 }), [
      { text: 'Bin unterwegs. (Quartier, „Großer Ausbau“)' },
      { text: 'Du bist ein Plüschhase.', effects: [msg('Captain Kuschel: Ich bin ein Plüschhase mit Couch. Du bist ein Mensch ohne. – C. K.')] },
    ]),
  sms('tel-w23-kuschel-garten', 'captain-kuschel',
    'Du hast Samen in der Tasche. Ich hab einen Dachplan. 800 Credits, und auf dem Container wächst was anderes als Rost. – C. K.',
    all(S4, not(S5), AB_AKT2, { item: 'blumensamen' }, { credits: 800 })),
  sms('tel-w23-kuschel-aussicht', 'captain-kuschel',
    'Das Bullauge zeigt auf eine Wand. Ich will Meer. Du willst Meer. Alle wollen Meer. Mach. – C. K.',
    all(S5, not(S6), AB_AKT2, any(STRANDCLUB, { credits: 2000 }))),
  sms('tel-w23-chat-couch', 'crew-chat',
    'Dante: DU HAST EINE COUCH?? – Aria: ich schlaf da. ab heute. – Hunter: Du hast ein eigenes Bett, Aria. – Aria: das ist zu weit weg von der couch – Vega: Es sind vier Meter. – Aria: eben',
    all(S4, AB_AKT2), [
      { text: 'Die Couch steht allen offen.', effects: [herz('aria', 5), herz('dante', 5)] },
      { text: 'Aria hat Vorrang.', effects: [herz('aria', 10), msg('Aria: korrekt. – Dante: :( – Aria: du kriegst dienstags')] },
    ]),
  sms('tel-w23-chat-garten', 'crew-chat',
    'Dante: Ich hab Tomaten auf deinem Dach gepflanzt. – Vega: Das sind keine Tomaten. – Dante: Es sind Tomaten im Herzen. – Raven: Es sind Radieschen. – Dante: Radieschen sind Tomaten, die sich nicht trauen.',
    all(S5, AB_AKT2)),
];

// --------------------------------------------------------------------------------------------- Platzierung

export const part: ContentPart = {
  dialogues: byId([ausbau, couch, garten]),
  phone: byId(phone),
  daily: byId(daily),
  mapAdditions: {
    'crew-quartier': {
      hotspots: [
        {
          id: 'welt23-ausbau', at: [330, 420], radius: 56, label: 'Großer Ausbau (Couch, Dachgarten, Aussicht)', kind: 'use',
          dialogue: ausbau.id, when: all(S3, AB_AKT2),
        },
        {
          id: 'welt23-couch', at: [150, 452], radius: 56, label: 'Gästecouch', kind: 'use', dialogue: couch.id, when: S4,
        },
        {
          id: 'welt23-dachgarten', at: [655, 300], radius: 50, label: 'Leiter zum Dachgarten', kind: 'use', dialogue: garten.id, when: S5,
        },
        {
          id: 'welt23-meerposter', at: [860, 290], radius: 46, label: 'Meer am Bullauge', kind: 'look', when: all(S6, not(EPILOG)),
          lines: [nar('Blau, so weit das Poster reicht. Wenn man lange genug hinsieht, hört man es fast rauschen. Oder das ist die Lüftung. Egal.')],
        },
        {
          id: 'welt23-meerposter-epilog', at: [860, 290], radius: 46, label: 'Meer am Bullauge', kind: 'look', when: all(S6, EPILOG),
          lines: [
            nar('Neben dem Poster klebt jetzt ein echtes Foto: die Crew am Strand, alle nass, alle schief, alle da. Jemand hat mit Kuli darunter geschrieben: „Echt.“'),
            ich('Ja. Echt.'),
          ],
        },
        {
          id: 'welt23-kuschel-besuch', at: [705, 300], radius: 40, label: 'Captain Kuschel war da', kind: 'loot', daily: true,
          when: all(S6, day('so')),
          effects: [
            give('dantes-kekse'), herz('captain-kuschel', 10),
            msg('Auf der Fensterbank: ein Abdruck von zwei großen Ohren, drei Kekse und ein Zettel. „Schöne Aussicht. Ich war hier. Du nicht. – C. K.“'),
          ],
        },
      ],
    },
  },
};
