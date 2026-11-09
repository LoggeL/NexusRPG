// Rivalitäts-Ereignisse re-<npc>-2/-5/-8 für Hunter, Raven und Dante (world.md §4.1, §4.2) und Hunters Folgen der Rivalität.
// Kein eigener Inhaltsteil: hunter.ts, raven.ts und dante.ts holen Dialoge, Ereignisse und Regeln hier ab.
// Versöhnung wie bisher über das Rivalen-Menü (`reconcile`): Hunter pers-hunter-reiner-tisch, Raven Handschellen im
// Hafenbecken versenken, Dante beim Eins!-Abend (Do abends) absichtlich verlieren.
//
// Folgen (Bedingungen, damit andere Pakete sie lesen können):
// - Hunter `{ rival: 'hunter' }`: doppelte Miete montags (Tageswechsel-Regeln unten), an der Auftragstafel nur Kurier
//   (quest-pers-jobs/_auftrag.ts `HUNTER_GIBT_ARBEIT`); `{ rival: 'hunter', min: 8 }` = HUNTER_RAUS: Rauswurf aus dem
//   Crew-Quartier (onEnter schickt zurück in die Neon-Gasse), Schlafplatz Dantes Sofa (maps/dantes-werkstatt.ts).
// - Dante `{ rival: 'dante' }`: doppelte Preise, ab `{ rival: 'dante', min: 5 }` kein Einbau (Wirtschaft), Telefon-Jingles.
// - Vega `{ rival: 'vega' }`: meldet Fehler an Hunter (wöchentlich, Hunter −15).
import type { Condition, DailyRuleDef, DialogueDef, HeartEventDef, PhoneMessageDef, TimeSlot } from '../../../modules/contracts';
import { dialog, erz, flag, herz, ich, knoten, pruefung, sprecher } from './_helfer';

const H = sprecher('hunter');
const R = sprecher('raven');
const D = sprecher('dante');
const B = sprecher('bruno-brecher');
const V = sprecher('vega');

const re = (npc: string, stufe: 2 | 5 | 8, map: string, time: TimeSlot | TimeSlot[] | undefined, when: Condition): HeartEventDef => {
  const id = `re-${npc}-${stufe}`;
  const ev: HeartEventDef = { id, hearts: -stufe, map, when, dialogue: id };
  if (time) ev.time = time;
  return ev;
};

// ---------------------------------------------------------------------------------------------- Hunter

export const HUNTER_RIVALE: Condition = { rival: 'hunter' };
/** Bei −8: Rauswurf aus dem Crew-Quartier, bis zur Versöhnung (world.md §4.2). */
export const HUNTER_RAUS: Condition = { rival: 'hunter', min: 8 };
/** Doppelte Miete: zweimal 40 Credits, montags. */
export const MIETE_DOPPELT = 80;

const reHunter2 = dialog('re-hunter-2', [
  knoten('start', [
    erz('High Voltage, Abend. Hinter dem Tresen hängt eine Kreidetafel, auf der sonst die Cocktails stehen. Heute steht da nur ein Name. Deiner. In Rot. Darunter: „Miete: ×2“.'),
    H('Neue Preise. Für dich. Das Quartier kostet ab jetzt doppelt. Montags. Bar. Pünktlich.', 'wut'),
    H('Und an meiner Tafel kriegst du nur noch Botengänge. Pakete beißen nicht und reden nicht zurück. Das passt zu dir. Gerade.'),
  ], {
    effects: [flag('hunter_miete_doppelt')],
    choices: [
      { text: '„Doppelt? Wofür?“', next: 'wofuer' },
      { text: '„Schulden muss man immer begleichen. Hast du selbst gesagt.“', check: pruefung('re-hunter-2-zitat', 'ausstrahlung', 6, ['ueberreden']), next: 'zitat', effects: [herz('hunter', 30)] },
    ],
  }),
  knoten('wofuer', [H('Für meine Nerven. Die sind teuer. Ich hab sie mir nicht ausgesucht, aber ich zahl sie ab. Du jetzt auch.', 'signatur')]),
  knoten('zitat', [
    H('… Ja. Hab ich. Und du bist mir was schuldig. Merkst du, wie das zusammenpasst?', 'signatur'),
    H('Die Tafel bleibt. Aber ich schreib’s kleiner. Mit Lineal.'),
  ]),
]);

const reHunter5 = dialog('re-hunter-5', [
  knoten('start', [
    erz('Hinterzimmer, Mittag. Hunter steht vor der Auftragstafel und reißt Karten ab. Kopfgeld. Eskorte. Schulden. Datenraub. Eine nach der anderen landet im Papierkorb, sauber gefaltet.'),
    H('Für dich nicht. Für dich nicht. Für dich ganz bestimmt nicht.', 'wut'),
    erz('Übrig bleibt eine einzige Karte. Ein Kurierpaket. „Zerbrechlich“. Er pinnt sie genau in die Mitte.'),
    H('Botengänge. Bis ich dir wieder was zutraue, das schwerer ist als ein Paket.'),
  ], {
    choices: [
      {
        text: '„Ich hab dir mehr Geld gebracht als jeder andere in diesem Laden.“', next: 'geld',
        check: pruefung('re-hunter-5-geld', 'ausstrahlung', 6, ['ueberreden', 'verhandeln']), effects: [herz('hunter', 40)],
      },
      { text: 'Die Kurierkarte nehmen. Wortlos.', next: 'nehmen', effects: [herz('hunter', 10)] },
      { text: '„Steck dir deine Pakete sonst wohin.“', next: 'wohin', effects: [herz('hunter', -20)] },
    ],
  }),
  knoten('geld', [
    H('Stimmt. Und genau deshalb tut’s weh.', 'trauer'),
    H('Geld kann ich zählen. Vertrauen nicht. Das muss man sich wieder verdienen. In kleinen Scheinen.'),
  ]),
  knoten('nehmen', [H('Gut. Wenigstens pünktlich bist du noch. Das rechne ich dir an. Auf einem anderen Zettel.', 'signatur')]),
  knoten('wohin', [H('Pakete. Sonst wohin. Notiert. In Rot. Mit drei Ausrufezeichen.', 'wut')]),
]);

const reHunter8 = dialog('re-hunter-8', [
  knoten('start', [
    erz('Neon-Gasse, Nacht. Am Fuß der Hintertreppe zum Crew-Quartier steht deine Matratze. Daneben deine Truhe, dein Kram in zwei Müllsäcken und ein Stuhl, der dir nicht mal gehört.'),
    B('Nix Persönliches. Chef sagt: raus. Ich trag nur.'),
    erz('Hunter lehnt oben am Geländer, die Sonnenbrille auf, obwohl es dunkel ist. Er kommt nicht runter.'),
    H('Das Schloss ist neu. Der Schlüssel ist meiner. Du nicht mehr.', 'wut'),
    H('Dante hat ein Sofa. Er hat’s mir angeboten. Für dich. Ich hab gesagt, er ist ein Idiot. Er hat gesagt, das weiß er.'),
  ], {
    effects: [flag('hunter_rauswurf'), { message: 'Rauswurf: Das Crew-Quartier ist zu, bis du dich mit Hunter versöhnt hast. Schlafplatz: Dantes Sofa in der Werkstatt.' }],
    choices: [
      { text: '„Hunter. Komm runter. Reden wir.“', next: 'reden' },
      { text: 'Die Matratze nehmen. Gehen.', next: 'gehen' },
    ],
  }),
  knoten('reden', [
    H('Reden. Mit dir. Ich hab mit Blade geredet. Danach saß ich drei Jahre.', 'trauer'),
    H('Wenn du was geradebiegen willst: Du weißt, wo die Bar ist. Und was auf der Rechnung steht.'),
  ]),
  knoten('gehen', [
    erz('Bruno hält dir die Tür auf. Nicht die zum Quartier. Die zur Gasse. Er sagt nichts. Er sieht aus, als täte es ihm leid. Ein bisschen.'),
  ]),
]);

/** Vor der Tür des Crew-Quartiers, solange der Rauswurf gilt. */
const rauswurfTuer = dialog('hunter-rauswurf-tuer', [
  knoten('start', [
    erz('Die Tür klemmt. Nein: Sie ist abgeschlossen. Ein neues Schloss, glänzend, viel zu teuer für diese Tür. Darüber ein Zettel in Hunters Handschrift: „Neues Schloss. Alter Groll. – H.“'),
    ich('Okay. Dantes Sofa.'),
  ]),
]);

/** Vega petzt, solange sie Rivalin ist: einmal pro Woche erfährt Hunter von deinen Fehlern (world.md §4.2). */
const vegaPetzt = dialog('hunter-tag-vega-petzt', [
  knoten('start', [
    H('Vega war hier. Sie hat einen Zettel gebracht. Mit Uhrzeiten. Deine Fehler der Woche, nach Entfernung sortiert.', 'wut'),
    H('Ich weiß, dass ihr Streit habt. Ich weiß auch, dass Vega nie danebenschießt. Also. Erklär mir die Tür hinterm Club.'),
  ], {
    effects: [herz('hunter', -15), flag('woche_vega_gepetzt')],
    choices: [
      { text: '„Die war schon offen.“', next: 'offen' },
      { text: '„Red mit Vega, nicht mit mir.“', next: 'vega' },
    ],
  }),
  knoten('offen', [H('Natürlich war sie das. Türen öffnen sich bei dir von selbst. Wie Geldbörsen.', 'signatur')]),
  knoten('vega', [
    H('Hab ich. Sie hat gesagt: „Frag den Fehler selbst.“ Dann ist sie aufs Dach. Ihr zwei macht mich fertig.', 'besorgt'),
    V('(vom Dach, durch das offene Fenster) Siebzehn Meter, Boss. Ich hör alles.'),
  ]),
]);

/** Hunters Folgen: doppelte Miete montags (vor dem Rauswurf), sonst Mietschulden. Reihenfolge: zahlen, dann Schuld. */
export const HUNTER_MIETE: Record<string, DailyRuleDef> = {
  'hunter-miete-1-doppelt': {
    id: 'hunter-miete-1-doppelt',
    when: { all: [HUNTER_RIVALE, { not: HUNTER_RAUS }, { weekday: 'mo' }, { credits: MIETE_DOPPELT }, { notFlag: 'master_modus' }] },
    effects: [
      { credits: -MIETE_DOPPELT }, { setFlag: 'heute_hunter_miete' },
      { message: `Miete Crew-Quartier: −${MIETE_DOPPELT} Cr. Doppelt. „Für meine Nerven.“ – H.` },
    ],
  },
  'hunter-miete-2-schuld': {
    id: 'hunter-miete-2-schuld',
    when: { all: [HUNTER_RIVALE, { not: HUNTER_RAUS }, { weekday: 'mo' }, { notFlag: 'heute_hunter_miete' }, { notFlag: 'master_modus' }] },
    effects: [
      { setFlag: 'hunter_mietschuld' }, { relation: 'hunter', delta: -10 },
      { message: 'Miete Crew-Quartier: nicht bezahlt. Hunter schreibt es auf. In Rot. Mit Lineal.' },
    ],
  },
};

export function hunterEvents(base: Condition): HeartEventDef[] {
  return [
    re('hunter', 2, 'high-voltage', 'abend', base),
    re('hunter', 5, 'hv-hinterzimmer', 'tag', base),
    re('hunter', 8, 'neon-gasse', 'nacht', base),
  ];
}
export const HUNTER_RE: DialogueDef[] = [reHunter2, reHunter5, reHunter8, rauswurfTuer, vegaPetzt];

// ---------------------------------------------------------------------------------------------- Raven

const reRaven2 = dialog('re-raven-2', [
  knoten('start', [
    erz('High Voltage, Abend. Raven sitzt am Tresen. Du setzt dich neben sie. Sie rutscht einen Hocker weiter. Du rutschst nach. Sie rutscht weiter. Am Ende des Tresens ist die Wand.'),
    R('Billige Nummer.', 'wut'),
    R('Ich hab sieben Jahre mit Leuten verbracht, die neben mir sitzen wollten. Ich kann das aushalten. Du nicht lange.'),
  ], {
    choices: [
      { text: 'Aufstehen. Ihr den Platz lassen.', next: 'platz', effects: [herz('raven', 10)] },
      { text: 'Sitzen bleiben. Schweigen.', next: 'schweigen' },
    ],
  }),
  knoten('platz', [R('… Wenigstens kannst du gehen. Manche lernen das nie.', 'signatur')]),
  knoten('schweigen', [
    erz('Ihr schweigt. Eine Stunde lang. Der Barkeeper stellt euch zwei Gläser hin und sagt nichts. Es ist das unangenehmste Schweigen, das dieser Tresen je gehört hat.'),
    R('Bist du fertig? Gut. Ich auch.'),
  ], { effects: [{ advanceTime: 60 }] }),
]);

const reRaven5 = dialog('re-raven-5', [
  knoten('start', [
    erz('Dachterrasse über der Neon-Gasse, Nacht. Raven wartet am Geländer, die schwarze Jacke offen, die Hände frei. Am Wasserturm gegenüber hängt eine Handschelle. Ihre.'),
    R('Duell. Bis zum Wasserturm und zurück, über die Dächer. Wer zuerst die Handschelle berührt, hat recht. Wer verliert, redet nie wieder mit dem anderen am Tresen.', 'wut'),
    R('Keine Messer. Keine Tricks. Doch, Tricks. Ich mach immer Tricks.'),
  ], {
    choices: [
      {
        text: 'Loslaufen. Springen. Nicht nach unten gucken.', next: 'sieg',
        check: pruefung('re-raven-5-daecher', 'reflexe', 6, ['dach', 'rennen']), effects: [herz('raven', 50), { xp: 30 }],
      },
      {
        text: 'Sie am Wasserturm abfangen, bevor sie die Handschelle kriegt.', next: 'griff',
        check: pruefung('re-raven-5-griff', 'koerper', 6, ['kampf']), effects: [herz('raven', 40), { xp: 30 }],
      },
      { text: 'Laufen. Und verlieren.', next: 'verloren', effects: [herz('raven', 10), flag('raven_tresen_ignoriert')] },
      { text: '„Ich duellier mich nicht mit dir, Raven.“', next: 'nein', effects: [flag('raven_tresen_ignoriert')] },
    ],
  }),
  knoten('sieg', [
    erz('Zwei Dächer, eine Regenrinne, ein Sprung über eine Lücke, die breiter war, als sie von oben aussah. Deine Finger schließen sich um kaltes Metall. Eine Sekunde später ihre um deine.'),
    R('… Scheiße. Du bist schnell.', 'ueberrascht'),
    R('Ich halt mich an die Abmachung. Du hast recht. Diesmal. Das heißt nicht, dass ich dich mag.'),
  ]),
  knoten('griff', [
    erz('Sie ist schneller. Aber du bist schwerer. Am Fuß des Wasserturms erwischst du ihren Ärmel, ihr landet beide in einer Pfütze aus Teer und Taubendreck.'),
    R('Das war kein Rennen mehr. Das war eine Prügelei.', 'wut'),
    R('… Gute Prügelei. Ich hab Teer in den Haaren. Ich hasse dich. Ein bisschen weniger.', 'signatur'),
  ]),
  knoten('verloren', [
    erz('Sie ist am Wasserturm, bevor du die zweite Regenrinne erreichst. Sie berührt die Handschelle nicht. Sie wartet auf dich. Dann nimmt sie sie ab und steckt sie ein.'),
    R('Abmachung ist Abmachung. Am Tresen bist du Luft für mich.', 'wut'),
  ]),
  knoten('nein', [R('Feige. Oder klug. Egal. Am Tresen bist du Luft.', 'wut')]),
]);

const reRaven8 = dialog('re-raven-8', [
  knoten('start', [
    erz('Hafenkante, Nacht. Raven steht am Kai, eine Handschelle in der Hand, und guckt aufs Wasser. Sie hört dich kommen. Sie dreht sich nicht um.'),
    R('Ich hab mir überlegt, die hier zu versenken. Mit jemandem. Der Jemand warst mal du.', 'trauer'),
    R('Jetzt steh ich hier allein. Das kenn ich. Sieben Jahre geübt.'),
  ], {
    choices: [
      { text: '„Ich besorg dir eine zweite. Dann versenken wir beide.“', next: 'zweite', effects: [herz('raven', 20)] },
      { text: 'Gehen.' },
    ],
  }),
  knoten('zweite', [
    R('Handschellen gibt’s im Eisenhof. Oder bei Leuten, die du lieber nicht kennst.', 'signatur'),
    R('Wenn du mit einer kommst, komm ich vielleicht mit. Vielleicht.'),
  ]),
]);

export function ravenEvents(base: Condition): HeartEventDef[] {
  return [
    re('raven', 2, 'high-voltage', 'abend', base),
    re('raven', 5, 'neon-gasse', 'nacht', base),
    re('raven', 8, 'hafenkante', 'nacht', base),
  ];
}
export const RAVEN_RE: DialogueDef[] = [reRaven2, reRaven5, reRaven8];

// ---------------------------------------------------------------------------------------------- Dante

/** Ab −5 baut Dante nichts mehr ein (die Sperre selbst setzt die Wirtschaft um, Bedingung siehe Kopf). */
export const DANTE_EINBAU_GESPERRT: Condition = { rival: 'dante', min: 5 };

const reDante2 = dialog('re-dante-2', [
  knoten('start', [
    erz('Dantes Werkstatt, Mittag. Über der Einbau-Liege hängt ein neues Schild, mit Edding auf Pappe: „PREISE FÜR {name}: ×2. INFFLATION. FRAGT NICHT.“'),
    D('Ja, das ist neu. Ja, das ist wegen dir. Nein, ich red nicht drüber. Doch, ich red drüber.', 'wut'),
    D('Ich hab dir übrigens einen Klingelton gemacht. Er heißt „Verräter“. Er hat ein Saxofon-Solo. Vierzig Sekunden. Du wirst ihn kennenlernen.'),
  ], {
    effects: [flag('dante_preise_doppelt')],
    choices: [
      { text: '„Dante. Ein Keks und wir reden?“', next: 'keks', effects: [herz('dante', 10)] },
      { text: '„Dein Schild hat einen Rechtschreibfehler.“', next: 'schild' },
    ],
  }),
  knoten('keks', [D('Kekse sind für Freunde. Und für Kinder. Und für Captain Kuschel. Du bist gerade nichts davon. … Okay, einer. Ein halber. Drei-Sekunden-Regel, der lag am Boden.', 'besorgt')]),
  knoten('schild', [D('WO?! … Ach so. „Inflation“ mit zwei F. Das ist Absicht. Das ist Kunst. Raus.', 'wut')]),
]);

const reDante5 = dialog('re-dante-5', [
  knoten('start', [
    erz('Dantes Werkstatt, Abend. Die Einbau-Liege ist mit einer Plane abgedeckt. Darauf sitzt Captain Kuschel, die Ohren steil, und neben ihm klebt ein Zettel: „Geschlossen. – C. K.“'),
    D('Kein Einbau. Nicht für dich. Die Liege hat Urlaub. Der Lötkolben auch. Ich auch, für dich.', 'wut'),
    D('Ich hab zehntausend Stunden in diese Hände gesteckt. Die schraub ich nicht an Leute, die mich so hängen lassen.'),
  ], {
    effects: [flag('dante_einbau_gesperrt')],
    choices: [
      { text: '„Und wenn’s ein Notfall ist?“', next: 'notfall' },
      { text: 'Eine Platte aus dem Regal ziehen und auflegen.', next: 'platte', check: pruefung('re-dante-5-platte', 'technik', 5, ['musik']), effects: [herz('dante', 30)] },
    ],
  }),
  knoten('notfall', [D('Dann flick ich dich. Ich bin ja kein Monster. Ich bin nur sauer. Flicken ist kein Einbau. Flicken ist Pflicht.', 'besorgt')]),
  knoten('platte', [
    erz('Du ziehst „Kabelbrand, Live 2079“ heraus, setzt die Nadel auf die richtige Rille, ohne hinzusehen. Dante erstarrt. Dann wippt sein Fuß. Gegen seinen Willen.'),
    D('… Das ist unfair. Das ist SO unfair. Die Liege bleibt zu. Aber du darfst bleiben, bis die Seite durch ist.', 'verlegen'),
  ]),
]);

const reDante8 = dialog('re-dante-8', [
  knoten('start', [
    erz('Schrottmarkt, Plattenkiste. Dante steht vor einem Händler und verkauft eine Platte. Du kennst sie. Er hat sie dir zurückgelegt, vor Wochen. „Für später. Wenn du sie verdienst.“'),
    D('Fünfzig Credits. Nein, vierzig. Egal. Weg damit.', 'trauer'),
    D('Donnerstag ist Eins!-Abend. Mit den Kindern. Ohne dich. Die Kinder fragen nach dir. Ich sag, du hast zu tun. Ich lüge schlecht. Die Kinder wissen das.'),
  ], {
    choices: [
      { text: '„Verkauf sie nicht, Dante.“', next: 'nicht', effects: [herz('dante', 20)] },
      { text: 'Gehen.' },
    ],
  }),
  knoten('nicht', [
    D('Warum nicht? Du hast doch auch …', 'wut'),
    erz('Er bricht ab. Der Händler wartet mit den Credits in der Hand. Dante steckt die Platte zurück unter den Arm.'),
    D('Donnerstag. Abends. Wenn du kommst, spiel ich mit dir. Und wenn du gewinnst, schmeiß ich dich raus. Nur damit du’s weißt.', 'besorgt'),
  ]),
]);

/** Nervige Telefon-Jingles, solange Dante Rivale ist (world.md §4.2). */
export const DANTE_JINGLES: Record<string, PhoneMessageDef> = {
  'tel-dante-jingle-1': {
    id: 'tel-dante-jingle-1', from: 'dante',
    text: '♪ Ver-rä-ter, Ver-rä-ter, du hast mich enttäuscht ♪ (Saxofon-Solo, vierzig Sekunden) – Das war der Klingelton. Er gehört jetzt dir. Gern geschehen. – D.',
    auto: { all: [{ rival: 'dante' }, { seen: 're-dante-2' }] },
  },
  'tel-dante-jingle-2': {
    id: 'tel-dante-jingle-2', from: 'dante',
    text: '♪ Remix! Ver-rä-ter (Faxgerät-Version) ♪ Ich hab’s auf Endlosschleife gestellt. Auf deinem Telefon. Frag nicht, wie. – D.',
    auto: { all: [{ rival: 'dante', min: 5 }, { seen: 're-dante-5' }] },
  },
};

export function danteEvents(base: Condition): HeartEventDef[] {
  return [
    re('dante', 2, 'dantes-werkstatt', 'tag', base),
    re('dante', 5, 'dantes-werkstatt', 'abend', base),
    re('dante', 8, 'schrottmarkt', 'tag', { all: [base, { weekday: ['so', 'mo', 'do'] }] }),
  ];
}
export const DANTE_RE: DialogueDef[] = [reDante2, reDante5, reDante8];
