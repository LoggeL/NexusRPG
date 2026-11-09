// side-strandclub „Hunters Strandclub“ (world.md §6.4, Nachspiel nach Ende 1, 2 oder 3b).
// Stufen: Pacht (Krähe) → Material → Personal → Shuttle → Eröffnung. Jede Stufe hat einen Weg ohne Check.
// Karte das-meer (maps-23) zeigt Baustelle/fertigen Club über den Queststand; Rückfahrt mit dem Shuttle über
// `strandclub_shuttle`. Hier: Bauplan-Hotspot, Treibholz, Hinfahrt an der Hafenkante, Begegnung am Pflock.
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DailyRuleDef, DialogueDef, Effect, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  MASTER, MEER_OFFEN, VEX, active, all, any, atLeast, bild, ch, chk, dlg, done, flag, hearts, herz, inactive, item,
  l, msg, n, noFlag, node, not, p, set, stepDone, tafel, time, weiter,
} from './_lib';

const Q = 'side-strandclub';
const AKTIV = active(Q);
const FREI: Condition = all(flag('epilog'), MEER_OFFEN, not(MASTER));

const PACHT = flag('strandclub_pacht');
const MATERIAL = flag('strandclub_material');
const SHUTTLE = flag('strandclub_shuttle');
const EROEFFNET = flag('strandclub_eroeffnet');

/** Wer zugesagt hat (Telefon). */
const LEUTE = ['dante', 'vega', 'knut', 'wache', 'frau-takt', 'jimmy', 'lio-funkel', 'opa-blech', 'mixi'] as const;
const zugesagt = (who: string) => flag(`strandclub_personal_${who}`);
const PERSONAL_DREI = atLeast(3, LEUTE.map(zugesagt));
const PERSONAL = any(PERSONAL_DREI, flag('strandclub_aushilfen'));

const KAMPF_FALKEN: Condition = { won: 'enc-strand-staubfalken' };

// --------------------------------------------------------------------------------------------- Quest

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Hunters Strandclub',
  summary: 'Hunter will am Meer einen Club bauen. Aus Treibholz, Schulden und sehr viel Optimismus. Du hast „Ich helf dir“ gesagt.',
  giver: 'hunter',
  act: 3,
  steps: [
    {
      id: 'pacht', text: 'Der Strand gehört angeblich den Staubfalken. Kläre die Pacht mit Krähe in der Wrackburg (Staubstraße).',
      done: any(PACHT, KAMPF_FALKEN), marker: { map: 'staubstrasse', at: 'wrackburg-hof' },
      effects: [set('strandclub_pacht')],
    },
    {
      id: 'material', text: 'Besorge Baumaterial: bei Dexter, im Plündererlager der Digitech-Ruine oder sechs Stück Treibholz vom Strand.',
      done: MATERIAL, when: stepDone(Q, 'pacht'), marker: { map: 'schrottmarkt', at: 'dexter-buero' },
    },
    {
      id: 'personal', text: 'Stell Personal ein: mindestens drei Zusagen per Telefon, oder Aushilfen für 450 Credits (Bauplan am Strand).',
      done: PERSONAL, when: stepDone(Q, 'material'),
    },
    {
      id: 'shuttle', text: 'Wer soll den weiten Weg zum Strand fahren? Organisiere an der Hafenkante ein Shuttle.',
      done: SHUTTLE, when: stepDone(Q, 'personal'), marker: { map: 'hafenkante', at: 'faehre' },
    },
    {
      id: 'eroeffnung', text: 'Eröffnungsparty! Abends an der Strandclub-Bühne.',
      done: EROEFFNET, when: stepDone(Q, 'shuttle'), marker: { map: 'das-meer', at: 'strandclub-buehne' },
    },
  ],
  reward: {
    xp: 600, credits: 300, rep: { 'crew-hunter': 20, unterstadt: 15 },
    relations: { hunter: 30 },
    effects: [set('strandclub_offen'), set('strandclub_baustelle', false)],
  },
};

// --------------------------------------------------------------------------------------------- Bauplan am Strand

const START: Effect[] = [{ startQuest: Q }, set('strandclub_baustelle')];

const bauplan: DialogueDef = dlg('strandclub-bauplan', [
  node('start', [
    n('Auf einem Brett zwischen zwei Fässern liegt eine Serviette. Darauf, mit Kugelschreiber: ein Grundriss. Bar, Bühne, Liegestühle, ein Pfeil zum Meer mit „MEER“ dran.'),
  ], { choices: weiter([
    [inactive(Q), 'angebot'],
    [all(AKTIV, stepDone(Q, 'material'), not(PERSONAL)), 'personal'],
    [AKTIV, 'stand'],
    [null, 'fertig'],
  ]) }),
  node('angebot', [
    l('hunter', 'Das ist der Plan. Also, der Plan für den Plan. Bar aus Treibholz, Bühne aus Bootsplanken, und ein Schild, auf dem „Strandclub“ steht. Mehr Namen fallen mir nicht ein.', 'neutral'),
    l('hunter', 'Ich hab sieben Jahre lang für andere geplant. Jetzt will ich mal was bauen, wo ich selbst drin sitzen will.', 'zaertlich'),
  ], { choices: [
    ch('„Ich helf dir.“', 'ja', { effects: START }),
    ch('„Später. Ich muss erst den Sand aus allen Körperöffnungen kriegen.“'),
  ] }),
  node('ja', [
    l('hunter', 'Gut. Erstens: Die Staubfalken behaupten, der Strand gehört ihnen. Krähe sitzt in der Wrackburg an der Staubstraße. Rede mit ihr, bevor sie mit Bolzen redet.', 'signatur'),
  ]),
  node('stand', [l('hunter', 'Läuft. Langsam, schief und unterfinanziert. Also genau wie das High Voltage am Anfang.', 'freude')], { choices: [
    ch('Treibholz verbauen (6 Stück).', 'holz', { when: all(stepDone(Q, 'pacht'), not(MATERIAL), item('treibholz', 6)), effects: [{ take: 'treibholz', qty: 6 }, set('strandclub_material'), herz('hunter', 10)] }),
    ch('„Wie viel Holz fehlt noch?“', 'holz-frage', { when: all(stepDone(Q, 'pacht'), not(MATERIAL), not(item('treibholz', 6))) }),
    ch('Gehen.'),
  ] }),
  node('holz', [
    n('Hunter stapelt die Bretter, misst mit dem Daumen, sägt mit einer Säge, die eindeutig mal ein Brotmesser war. Am Ende steht ein Tresen. Er wackelt. Er hält.'),
    l('hunter', 'Kein Credit ausgegeben. Dexter würde weinen.', 'freude'),
  ]),
  node('holz-frage', [l('hunter', 'Sechs gute Stücke. Das Meer spült jeden Tag was an, vorne an der Wasserlinie. Wenn du sammelst, säg ich.', 'neutral')]),
  node('personal', [
    l('hunter', 'Material ist da. Jetzt brauchen wir Leute. Ruf rum, wen du kennst. Oder wir holen Aushilfen aus der Stadt. Die kosten, und sie klauen Strohhalme.', 'besorgt'),
  ], { choices: [
    ch('Aushilfen bezahlen (450 Cr).', 'aushilfen', { effects: [{ credits: -450 }, set('strandclub_aushilfen')] }),
    ch('„Ich telefonier rum.“'),
  ] }),
  node('aushilfen', [l('hunter', 'Vier Aushilfen, zwei Wochen Probezeit. Wenn eine davon „Master“ sagt, schmeiß ich sie ins Meer.', 'signatur')]),
  node('fertig', [n('Die Serviette ist eingerahmt. Daneben hängt ein zweiter Zettel in Hunters Schrift: „Wer was kaputt macht, zahlt. Wer was baut, trinkt umsonst.“')]),
]);

// --------------------------------------------------------------------------------------------- Pacht bei Krähe

const kraehe: DialogueDef = dlg('strandclub-kraehe', [
  node('start', [
    n('Krähe sitzt in der Wrackburg auf einem Thron aus Autositzen und rupft an einer Feder. Hinter ihr hängen zwei Dutzend Falkenfedern an einer Schnur. Jede ist eine Geschichte.'),
    l('kraehe', 'Du willst den Strand. Alle wollen den Strand, seit ihr da wart. Der Strand ist alt. Älter als eure Stadt. Er gehört den Falken, weil wir ihn zuerst gesehen haben.', 'neutral'),
  ], { choices: [
    ch('„Werd Teilhaberin. Der Club gehört dann auch den Falken.“', 'teilhaberin', { check: 'gc-99', effects: [set('kraehe_teilhaberin'), set('strandclub_pacht'), { rep: 'staubfalken', delta: 15 }, herz('kraehe', 20)] }),
    ch('„Du kennst mich. Wir haben das schon mal geklärt.“', 'ehre', { tag: '[Ödnis]', when: any(done('side-kraehes-ehre'), done('side-oednis-frieden')), effects: [set('strandclub_pacht'), herz('kraehe', 10)] }),
    ch('Fünfhundert Credits Pacht bezahlen.', 'bezahlt', { effects: [{ credits: -500 }, set('strandclub_pacht'), { rep: 'staubfalken', delta: 5 }] }),
    ch('„Hol ihn dir doch. Wir sind am Pflock.“', 'kampf', { when: noFlag('strandclub_falken_kampf'), effects: [set('strandclub_falken_kampf'), { rep: 'staubfalken', delta: -10 }] }),
    ch('„Ich denk drüber nach.“'),
  ] }),
  node('teilhaberin', [
    l('kraehe', 'Teilhaberin. Ein Wort aus eurer Stadt. Es klingt wie Ehre mit Quittung.', 'neutral'),
    n('Sie zieht eine Feder aus der Schnur und steckt sie dir hinters Ohr.'),
    l('kraehe', 'Abgemacht. Samstags sitze ich am Pflock. Wer meinem Strand Ärger macht, bekommt einen Bolzen. Wer Cocktails bringt, bekommt eine Geschichte.', 'freude'),
  ]),
  node('ehre', [
    l('kraehe', 'Ja. Du hast Wort gehalten, als es schwer war. Das reicht für einen Strand. Sag deinem Hunter, die Falken bekommen Rabatt.', 'freude'),
  ]),
  node('bezahlt', [
    l('kraehe', 'Credits. Langweilig, aber ehrlich. Der Strand gehört euch. Die Geschichten darüber gehören weiter uns.', 'neutral'),
  ]),
  node('kampf', [
    l('kraehe', 'Mutig. Dumm, aber mutig. Kies wartet am Pflock. Wenn ihr gewinnt, ist der Strand eurer. Wenn nicht, schwimmt ihr heim.', 'signatur'),
  ]),
]);

// --------------------------------------------------------------------------------------------- Material

const pluenderer = chk('strandclub-pluenderer-handel', 'strasse', 6, ['verhandeln']);

const dexter: DialogueDef = dlg('strandclub-dexter', [
  node('start', [
    l('dexter', 'Bretter, Wellblech, Lichterketten, ein Surfbrett, das mal ein Bügelbrett war? Hab ich alles. Hab ich immer. Für Freunde zum Freundschaftspreis, für dich zum normalen.', 'signatur'),
  ], { choices: [
    ch('Bezahlen (400 Cr).', 'gekauft', { effects: [{ credits: -400 }, set('strandclub_material')] }),
    ch('„Du bist schuldenfrei. Dank mir. Mach mir einen Preis.“ (150 Cr)', 'rabatt', { when: done('pers-dexter-schuldenfrei'), effects: [{ credits: -150 }, set('strandclub_material'), herz('dexter', 5)] }),
    ch('„Wir sind doch Freunde, Dexter.“', 'freunde', { tag: '[Dexter ♥4]', requires: hearts('dexter', 4), effects: [set('strandclub_material'), herz('dexter', 5)] }),
    ch('„Zu teuer.“'),
  ] }),
  node('gekauft', [l('dexter', 'Lieferung bis zur Hafenkante. Ab da trägst du. Oder Hunter. Hunter hat breite Schultern. Sag ihm das nicht, er wird eitel.', 'freude')]),
  node('rabatt', [l('dexter', 'Hundertfünfzig. Und das ist nur, weil meine Gläubiger alle weg sind und ich mich einsam fühle.', 'trauer')]),
  node('freunde', [l('dexter', 'Freunde. Pah. … Nimm’s mit. Und wenn einer fragt: Ich hab es dir verkauft. Zum Höchstpreis. Mit Zinsen.', 'verlegen')]),
]);

const lager: DialogueDef = dlg('strandclub-pluenderer', [
  node('start', [
    n('Im Plündererlager vor der Digitech-Ruine stapeln sich Glasplatten, Stahlträger und ein komplettes Firmenschild: „DIGITECH – Wir denken an morgen.“ Morgen kam nicht.'),
    n('Ein Plünderer mit Schweißerbrille bewacht den Stapel. Er hat ein Sandwich und einen Bolzer. Er benutzt beide gleichzeitig.'),
  ], { choices: [
    ch('„Die Ruine gehört euch nicht. Mir auch nicht. Aber ich hab einen Deal.“', 'deal', { check: pluenderer, effects: [set('strandclub_material'), { rep: 'digitech', delta: 5 }] }),
    ch('Ersatzteile tauschen (5 Schrott-Ersatzteile).', 'tausch', { when: item('schrott-ersatzteil', 5), effects: [{ take: 'schrott-ersatzteil', qty: 5 }, set('strandclub_material')] }),
    ch('Gehen.'),
  ] }),
  node('deal', [
    l('player', 'Freie Drinks im Strandclub. Ein Leben lang. Oder bis Hunter merkt, wie viel ihr trinkt.'),
    n('Der Plünderer kaut. Überlegt. Schluckt. „Ein Leben lang ist lang.“ Er hilft dir sogar beim Tragen. Das Firmenschild wird der neue Tresen.'),
  ]),
  node('tausch', [n('Er wiegt jedes Teil in der Hand, als wäre es Gold. Für ihn ist es Gold. Für dich ist es endlich Platz in der Tasche.')]),
]);

// --------------------------------------------------------------------------------------------- Personal (Telefon)

const zusage = (who: string, from: string, auto: Condition, text: string, ja: string): PhoneMessageDef => ({
  id: `tel-strandclub-${who}`, from, text,
  auto: all(AKTIV, stepDone(Q, 'material'), not(PERSONAL), auto),
  replies: [
    { text: ja, effects: [set(`strandclub_personal_${who}`), herz(from, 10)] },
    { text: '„Vielleicht ein andermal.“' },
  ],
});

const PERSONAL_TEL: PhoneMessageDef[] = [
  zusage('dante', 'dante', { quest: 'main-3-blade', state: 'done' }, 'Hunter hat gesagt, ihr braucht einen Grill! Ich bin ein Grill! Also, ich kann einen bauen! Aus einem Fass und einer Waschmaschinentrommel! Sag ja!', '„Ja. Aber ohne Kekse auf dem Grill.“'),
  zusage('vega', 'vega', { quest: 'main-3-blade', state: 'done' }, 'Rettungsschwimmerin. Ich sehe auf zwölfhundert Meter, wer untergeht. Ich kann auch schwimmen. Ich sage das nur ungern.', '„Du bist eingestellt.“'),
  zusage('knut', 'knut', done('side-abzieher'), 'Knut hier. Kurt und ich wären Kellner. Ehrlich. Wir geben das Wechselgeld zurück. Fast immer. Kurt sagt, ich soll „immer“ schreiben. Immer.', '„Ehrlich. Ich zähl nach.“'),
  zusage('wache', 'wache', done('side-feierabend-fuer-kessel'), 'Ich hab gehört, ihr sucht eine Türsteherin. Ich hab zwanzig Jahre im Zellentrakt gestanden. Ich kann stehen. Ich kann auch „Nein“ sagen. Freundlich. Mit Atemübung.', '„Willkommen am Strand, Kessel.“'),
  zusage('frau-takt', 'frau-takt', done('side-uebliche-verspaetung'), 'Ihr braucht einen Schichtplan. Jeder Club braucht einen Schichtplan. Ohne Schichtplan ist es nur ein Haufen Holz mit Musik. Ich hab ihn schon gemacht. Er ist pünktlich.', '„Frau Takt, Sie sind ein Geschenk.“'),
  zusage('jimmy', 'jimmy', done('side-jimmys-chip'), 'LIEFERDIENST JIMMY! Ich liefere Eis an den Strand! Es schmilzt! Aber schnell! Ich bin schneller!', '„Jimmy, du bist eingestellt.“'),
  zusage('lio-funkel', 'lio-funkel', any(done('side-zweite-hand'), done('pers-lio-album')), 'Eine Bühne am Meer? Ich spiele. Umsonst, wenn die Wellen den Takt halten. Gegen Bezahlung, wenn sie es nicht tun.', '„Lio, die Bühne gehört dir.“'),
  zusage('opa-blech', 'opa-blech', done('side-oma-volts-lager'), 'SICHERHEIT! Früher hat man Sicherheit noch ernst genommen! Ich nehme sie ernst! Ich bin ein Geschütz! Oma Volt sagt, ich soll mal raus! Ich will raus!', '„Opa Blech, du kriegst die Düne.“'),
  zusage('mixi', 'mixi', any(done('side-neon-limo'), flag('mixi_repariert')), '*bliep* COCKTAILS AM MEER. *bliep* SALZRAND. *bliep* MEINE LAMPE IST GRÜN. Grün heißt ja.', '„Mixi, mix.“'),
];

// --------------------------------------------------------------------------------------------- Shuttle an der Hafenkante

const NEXUS_HILFT: Condition = flag('ende_neue_nexus');
const FX_HILFT: Condition = any(done('side-eingehendes-fax'), flag('fx60_mitgenommen'));

const shuttle: DialogueDef = dlg('strandclub-shuttle', [
  node('start', [
    n('Die Fähre an der Hafenkante. Rostig, breit, mit einem Motor, der mal ein Kühlschrank war. Hunters Strand liegt eine Stunde die Küste runter. Mit Glück.'),
    l('kaeptn-nebelhorn', 'Ans Meer? Mit dem Boot? Übers Wasser? Das … das ist ja, wo das Wasser ist.', 'besorgt'),
  ], { choices: [
    ch('Den Autopiloten selbst programmieren.', 'technik', { check: 'gc-100', effects: [set('strandclub_shuttle'), set('strandclub_shuttle_auto'), { xp: 100 }] }),
    ch('„Nexus, übernimm das Steuer.“', 'nexus', { tag: '[Ende 2]', when: NEXUS_HILFT, effects: [set('strandclub_shuttle'), set('strandclub_shuttle_auto'), herz('ki-nexus', 10)] }),
    ch('„FX-60, du hast doch Freizeit.“', 'fx', { when: FX_HILFT, effects: [set('strandclub_shuttle'), set('strandclub_shuttle_auto'), herz('fx-60', 10)] }),
    ch('„Käpt’n, die Rostlaube fährt ja auch. Das hier ist nur nasser.“', 'nebelhorn', { when: done('side-rostlaube'), effects: [set('strandclub_shuttle'), herz('kaeptn-nebelhorn', 15)] }),
    ch('„Kiki fliegt bis in die Ödnis. Sie fliegt auch bis zum Strand.“', 'kiki', { when: done('pers-kiki-reichweite'), effects: [set('strandclub_shuttle'), herz('kiki-karbon', 10)] }),
    ch('Den Sprit bezahlen und den Käpt’n überreden (300 Cr).', 'sprit', { effects: [{ credits: -300 }, set('strandclub_shuttle'), herz('kaeptn-nebelhorn', 5)] }),
    ch('Später.'),
  ] }),
  node('technik', [
    n('Du kriechst in den Maschinenraum, verbindest den Kompass mit einem alten Navigationschip und bringst dem Motor bei, nach links zu wollen. Nach zwanzig Minuten fährt die Fähre alleine eine Runde ums Hafenbecken.'),
    l('kaeptn-nebelhorn', 'Sie fährt ohne mich! Das ist das Schönste, was ich je gesehen habe!', 'freude'),
  ]),
  node('nexus', [
    l('ki-nexus', 'Sehr gern. Ich werde vorsichtig fahren. Ich habe gelesen, dass Menschen auf Booten gern „Ahoi“ sagen. Ahoi. Habe ich das richtig gemacht? Bitte sagen Sie ehrlich.'),
  ]),
  node('fx', [l('fx-60', 'PROTOKOLL: Fährbetrieb. Zielort: Freude. Abfahrt: pünktlich. Ende.')]),
  node('nebelhorn', [
    l('kaeptn-nebelhorn', '… Nass ist nur ein Gefühl. Nass ist nur ein Gefühl. Gut. Ich mach’s. Mit Schwimmweste. Mit zwei Schwimmwesten.', 'besorgt'),
  ]),
  node('kiki', [l('kiki-karbon', 'Strand-Shuttle per Schwebetaxi, jede Stunde! Fenster auf, Haare weg! Ich nehm zehn Prozent Strandzuschlag!', 'freude')]),
  node('sprit', [l('kaeptn-nebelhorn', 'Dreihundert Credits und ich denke nicht drüber nach, wie tief es da unten ist. Nicht drüber nachdenken. Ich denke nicht. Okay, los.', 'besorgt')]),
]);

// --------------------------------------------------------------------------------------------- Eröffnung

const eroeffnungDlg: DialogueDef = dlg('strandclub-eroeffnung', [
  node('start', [
    n('Lichterketten zwischen den Palmenstümpfen, Fackeln im Sand, die Bar aus Treibholz biegt sich unter Gläsern. Die halbe Unterstadt ist da. Die andere Hälfte kommt mit dem nächsten Shuttle.'),
    l('hunter', 'Ich halte keine Rede.', 'neutral'),
    l('hunter', 'Okay, eine kurze.', 'freude'),
  ], { choices: weiter([
    [flag('kraehe_teilhaberin'), 'kraehe'],
    [null, 'rede'],
  ]) }),
  node('kraehe', [
    l('kraehe', 'Die Falken grüßen den Club. Wer hier Ärger macht, bekommt einen Bolzen. Wer tanzt, bekommt eine Feder.', 'freude'),
  ], { next: 'rede' }),
  node('rede', [], { effects: [{ cutscene: 'strandclub-eroeffnung' }] }),
]);

const eroeffnung: CutsceneDef = {
  id: 'strandclub-eroeffnung',
  title: 'Strandclub: Eröffnung',
  beats: [
    bild('cut-ende-doch-noch-ans-meer', 'Der Strandclub. Treibholz, Lichterketten, ein Schild mit nur einem Wort, weil Hunter nichts Besseres eingefallen ist.', [
      l('hunter', 'Bloß, wer kommt diesen weiten Weg hierher gefahren?', 'signatur'),
      l('dante', 'ALLE!', 'freude'),
      l('raven', 'Er hat das extra für den Satz gebaut. Ein ganzer Club für einen Satz.', 'signatur'),
    ], { pan: 'in', fade: 'cross', hold: 1400 }),
    tafel('Die Musik geht an. Hunter tanzt. Wirklich. Mit Hüfte. Vega misst die Zeit, bis er aufhört. Er hört nicht auf.', [
      l('vega', 'Vier Minuten zwölf. Persönlicher Rekord.', 'freude'),
      l('aria', 'Wenn das jemand filmt, brech ich ihm die Finger. Und dann schick ich mir das Video.', 'freude'),
    ]),
    tafel('Später, am Lagerfeuer. Der Sand ist kalt, das Feuer warm, und irgendwer singt falsch. Es ist Dante. Es ist immer Dante.', [
      l('hunter', 'Danke. Für alles. Für das hier. Schulden muss man immer begleichen, und die hier krieg ich nie beglichen.', 'zaertlich'),
    ], { hold: 1400 }),
  ],
  effects: [
    set('strandclub_eroeffnet'),
    herz('hunter', 50), herz('raven', 50), herz('dante', 50), herz('vega', 50), herz('aria', 50), herz('nyra', 50), herz('jimmy', 50),
    { advanceTime: 180 },
  ],
};

// Vex: kurze Zeilen mit Aria am Abend der Eröffnung (die große Szene hat das Vexaria-Paket).
const vexAria: DialogueDef = dlg('strandclub-eroeffnung-vex', [
  node('start', [
    l('aria', 'Schrapnell. Eine Bühne am Meer, und wir stehen davor. Wie Zuschauer. Das ist doch krank.', 'neutral'),
    p('Willst du rauf?'),
    l('aria', 'Nicht heute. Heute will ich nur sehen, wie Hunter tanzt. Morgen vielleicht. Mit dir. Ganz vielleicht.', 'zaertlich'),
  ]),
]);

// --------------------------------------------------------------------------------------------- Wochenlohn

const lohn = (id: string, when: Condition, credits: number, text: string): DailyRuleDef => ({
  id, when: all(done(Q), { weekday: ['mo'] }, when), effects: [{ credits }, msg(text)],
});
const VIEL = atLeast(5, LEUTE.map(zugesagt));
const daily: DailyRuleDef[] = [
  lohn('strandclub-lohn-gross', all(VIEL, SHUTTLE), 900, 'Strandclub-Abrechnung von Hunter: 900 Credits. Darunter: „Volles Haus. Ich hab sogar Gewinn. Kein Witz.“'),
  lohn('strandclub-lohn-mittel', all(PERSONAL_DREI, not(VIEL)), 600, 'Strandclub-Abrechnung von Hunter: 600 Credits. Darunter: „Läuft. Knut hat das Wechselgeld zurückgegeben. Einmal.“'),
  lohn('strandclub-lohn-klein', not(PERSONAL_DREI), 300, 'Strandclub-Abrechnung von Hunter: 300 Credits. Darunter: „Die Aushilfen klauen Strohhalme. Aber nur Strohhalme.“'),
];

// --------------------------------------------------------------------------------------------- Karten

const PFLOCK_KAMPF: Condition = all(AKTIV, flag('strandclub_falken_kampf'), noFlag('strandclub_pacht'));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([bauplan, kraehe, dexter, lager, shuttle, eroeffnungDlg, vexAria].map((d) => [d.id, d])),
  cutscenes: { [eroeffnung.id]: eroeffnung },
  phone: Object.fromEntries(PERSONAL_TEL.map((m) => [m.id, m])),
  daily: Object.fromEntries(daily.map((d) => [d.id, d])),
  mapAdditions: {
    'das-meer': {
      hotspots: [
        {
          id: 'strandclub-bauplan', at: [540, 500], radius: 46, label: 'Hunters Bauplan', kind: 'use', dialogue: bauplan.id,
          when: FREI,
        },
        {
          id: 'strandclub-treibholz', at: [760, 720], radius: 50, label: 'Treibholz sammeln', kind: 'loot', daily: true,
          when: all(AKTIV, stepDone(Q, 'pacht'), not(MATERIAL)),
          lines: [n('Das Meer hat über Nacht Bretter angespült. Glatt, salzig, mit Muscheln dran. Perfekt für eine Bar, die aussehen soll, als wäre sie schon immer da gewesen.')],
          effects: [{ give: 'treibholz', qty: 2 }],
        },
        {
          id: 'strandclub-buehne-eroeffnung', at: 'strandclub-buehne', radius: 50, label: 'Eröffnung feiern', kind: 'use',
          dialogue: eroeffnungDlg.id,
          when: all(AKTIV, stepDone(Q, 'shuttle'), not(EROEFFNET), time('abend', 'nacht')),
        },
        {
          id: 'strandclub-buehne-tagsueber', at: 'strandclub-buehne', radius: 50, label: 'Eröffnung feiern', kind: 'look',
          when: all(AKTIV, stepDone(Q, 'shuttle'), not(EROEFFNET), time('morgen', 'tag')),
          lines: [l('hunter', 'Eröffnung ist abends. Tagsüber ist das hier nur ein Haufen Holz mit Sonnenbrand.', 'neutral')],
        },
        {
          id: 'strandclub-aria-vex', at: [620, 380], radius: 40, label: 'Aria an der Bühne', kind: 'talk', dialogue: vexAria.id, once: true,
          when: all(VEX, EROEFFNET, time('abend', 'nacht')),
        },
      ],
      encounters: [{
        id: 'strandclub-falken', encounter: 'enc-strand-staubfalken', at: 'grundstueck-pflock', radius: 50, when: PFLOCK_KAMPF,
      }],
    },
    staubstrasse: {
      hotspots: [{
        id: 'strandclub-kraehe', at: 'wrackburg-hof', radius: 50, label: 'Krähe: Strandpacht', kind: 'talk', dialogue: kraehe.id,
        when: all(AKTIV, noFlag('strandclub_pacht'), { time: ['tag', 'abend', 'nacht'] }),
      }],
    },
    schrottmarkt: {
      hotspots: [{
        id: 'strandclub-dexter', at: 'dexter-buero', radius: 46, label: 'Dexter: Baumaterial', kind: 'talk', dialogue: dexter.id,
        when: all(AKTIV, stepDone(Q, 'pacht'), not(MATERIAL)),
      }],
    },
    'digitech-areal': {
      hotspots: [{
        id: 'strandclub-pluenderer', at: 'pluenderer-lager', radius: 50, label: 'Plündererlager: Baumaterial', kind: 'talk', dialogue: lager.id,
        when: all(AKTIV, stepDone(Q, 'pacht'), not(MATERIAL)),
      }],
    },
    hafenkante: {
      hotspots: [
        {
          id: 'strandclub-shuttle-planen', at: 'faehre', radius: 50, label: 'Strand-Shuttle organisieren', kind: 'talk', dialogue: shuttle.id,
          when: all(AKTIV, stepDone(Q, 'personal'), not(SHUTTLE)),
        },
        {
          id: 'strandclub-shuttle-hin', at: 'faehre', radius: 50, label: 'Strand-Shuttle zum Meer', kind: 'use',
          when: all(MEER_OFFEN, any(SHUTTLE, done(Q))),
          lines: [n('Das Shuttle legt ab. Möwen, Gischt, irgendwo hinten singt jemand ein Seemannslied mit falschem Text. Eine Stunde später: Sand.')],
          effects: [{ travel: 'das-meer', entry: 'shuttle', minutes: 60 }],
        },
      ],
    },
  },
};


