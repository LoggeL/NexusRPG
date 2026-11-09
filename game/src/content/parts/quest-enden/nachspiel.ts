// Nachspiel-Zustand (world.md §5.5): Master-Modus (Unterstadt feindselig), Blade im Zellentrakt, der letzte
// Nexus-Splitter im Datentunnel, Telefon der Crew nach dem Ende.
// Nicht hier: Master-Erwachen, Kuschel-Zettel, Schlafplatz und Champagner im Büro (Karte blades-buero),
// das Splitter-Nest selbst samt Kampf und Endlosschleife (Karte datentunnel), Blades Tagesablauf (npc-quantum/blade).
import type { ContentPart, MapAddition } from '../../part';
import type { Condition, DialogueDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  BLADE_GEFASST, BLADE_WEG, ENDE_3B, ENDE_MASTER, ENDE_MEER, ENDE_NEXUS, EPILOG, MASTER, NOT_VEX, VEX, all, any, ch,
  chk, dlg, done, flag, herz, item, l, n, noFlag, node, not, p, set, weiter,
} from './_lib';

/** Nachspiel nach Ende 1, 2 oder 3b (nicht im Master-Modus). */
const FREI: Condition = all(EPILOG, not(MASTER));
/** Am Morgen nach dem Ende (die Sondersendung ist angekündigt). */
const TAG_DANACH: Condition = flag('epilog_sendung_bereit');

// --------------------------------------------------------------------------------------------- Master-Modus: Unterstadt

interface Feindlich { map: string; text: string[]; zeilen: [string, string][] }

const FEINDLICH: Feindlich[] = [
  { map: 'neon-gasse', text: [
    'Die Neon-Gasse wird still, als du reinkommst. Dann fliegt die erste Dose. Dann die zweite. Die dritte war noch halb voll.',
  ], zeilen: [['mixi', 'Für dich ist geschlossen. Für immer. Und die Lampe leuchtet auch nicht mehr für dich.']] },
  { map: 'schrottmarkt', text: [
    'Am Schrottmarkt klappen die Händler die Läden runter. Einer nach dem anderen. Das Geräusch klingt wie ein Applaus, nur andersherum.',
  ], zeilen: [['dexter', 'Ich verkaufe an jeden. Wirklich an jeden. Sogar an Ripper. Nicht an dich, du Wichser mit Krone.']] },
  { map: 'loetgassen', text: [
    'In den Lötgassen hängt ein Bild von dir an jeder Tür. Mit Hörnern. Mit Schnurrbart. Auf einem hat jemand nur „WARUM?“ drübergeschrieben.',
  ], zeilen: [['mira-loetzinn', 'Lötzinn hab ich genug. Für dich ist keiner mehr da. Raus aus meiner Gasse.']] },
  { map: 'rohrsiedlung', text: [
    'Die Kinder in der Rohrsiedlung rennen nicht weg. Sie stellen sich in eine Reihe und drehen dir den Rücken zu. Alle. Auch die ganz Kleinen.',
  ], zeilen: [['daria', 'Wir haben dich mal gemocht. Das war ein Fehler. Wir machen keine Fehler zweimal.']] },
  { map: 'bahnhof-mitte', text: [
    'Am Bahnhof hält die U-Bahn auf die Sekunde. Die Türen gehen auf, du willst rein, und sie gehen vor deiner Nase wieder zu.',
  ], zeilen: [['frau-takt', 'Null Sekunden Verspätung. Und null Sekunden Geduld für dich. Nächster Zug in einem Jahr.']] },
  { map: 'hafenkante', text: [
    'An der Hafenkante pfeifen die Arbeiter. Nicht anerkennend. Jemand hat dein Gesicht auf eine Zielscheibe gemalt, und sie ist schon ziemlich durchlöchert.',
  ], zeilen: [['kaeptn-nebelhorn', 'Ich hab Angst vor Wasser, vor Höhe und vor Möwen. Vor dir nicht. Du bist nur traurig.']] },
  { map: 'kanal-sammler', text: [
    'Im Kanal spucken die Ratten. Das wusstest du nicht. Jetzt weißt du es.',
  ], zeilen: [['buergermeister-gully', 'Das Kanalvolk erklärt dich zur unerwünschten Person. Einstimmig. Sogar die Ratten haben die Pfote gehoben.']] },
];

const feindDialoge: DialogueDef[] = FEINDLICH.map((f) => dlg(`master-feindlich-${f.map}`, [
  node('a', [...f.text.map(n), ...f.zeilen.map(([who, t]) => l(who, t, 'wut'))], { choices: [
    ch('„Ich hab euch befreit, ihr undankbaren Ratten.“', 'b'),
    ch('Nichts sagen. Weitergehen.'),
  ] }),
  node('b', [n('Keiner antwortet. Irgendwo hinten lacht jemand, kurz und sehr bitter. Dann ist es wieder still.')]),
]));

// --------------------------------------------------------------------------------------------- Blade im Zellentrakt

const BESUCH: Condition = all(EPILOG, BLADE_GEFASST, { time: ['tag'] }, { weekday: ['di', 'do', 'sa'] });

const bladeBesuch: DialogueDef = dlg('nachspiel-blade-besuch', [
  node('start', [
    n('Der Besucherraum: ein Tisch, zwei Stühle, eine Scheibe mit Sprechloch. Hinter der Scheibe sitzt Blade Nocturne in Anstaltsorange. Er trägt es wie einen Smoking.'),
  ], { choices: weiter([
    [MASTER, 'master'],
    [flag('blade_angekettet'), 'angekettet'],
    [null, 'normal'],
  ]) }),
  node('master', [
    l('blade', 'Sieh an. Die neue Majestät besucht den alten König. Wie fühlt sich die Krone an? Zu eng, oder? Sie war mir auch immer zu eng.', 'signatur'),
    l('blade', 'Ich hatte wenigstens einen Mantel. Du hast nur ein Büro, in dem dich keiner liebt. Willkommen im Club, Master.', 'freude'),
  ], { next: 'wahl' }),
  node('angekettet', [
    l('blade', 'Ah. Der Mensch, der mich an mein eigenes Geländer gekettet hat. Weißt du, wie lange ich da hing? Vier Stunden. Live. Mit Werbepausen.', 'wut'),
    l('blade', 'Collin hat zwischendurch Interviews mit mir geführt. Ich habe in allen gut ausgesehen. Wenigstens das.', 'signatur'),
  ], { next: 'zeit' }),
  node('normal', [
    l('blade', 'Besuch! Wie aufmerksam. Ich bekomme sonst nur Post von meinen Anwälten und Liebesbriefe von mir selbst.', 'signatur'),
  ], { next: 'zeit' }),
  node('zeit', [], { choices: weiter([
    [any(ENDE_MEER, ENDE_3B), 'meer'],
    [ENDE_NEXUS, 'nexus'],
    [null, 'wahl'],
  ]) }),
  node('meer', [
    l('blade', 'Ihr wart also am Meer. Ich rieche es an dir. Salz, Sonnencreme, Billigbier. Ekelhaft. Erzähl mir alles.', 'neutral'),
  ], { next: 'wahl' }),
  node('nexus', [
    l('blade', 'Nexus hat mir einen Brief geschrieben. Mit „bitte“ und „danke“. Ich habe ihn dreimal gelesen. Ich verstehe ihn nicht. Ich glaube, sie meint es ernst.', 'besorgt'),
  ], { next: 'wahl' }),
  node('wahl', [], { choices: [
    ch('Die Teddyfell-Bürste durchs Sprechloch schieben.', 'buerste', { when: item('teddyfell-buerste'), effects: [{ take: 'teddyfell-buerste' }, herz('blade', 20)] }),
    ch('Eine Nougatbombe durchschieben.', 'nougat', { when: item('nougatbombe'), effects: [{ take: 'nougatbombe' }, herz('blade', 10)] }),
    ch('„Im High Voltage steht ein Glas für dich. Voll.“', 'glas', { when: all(done('sonder-letzte-runde'), noFlag('blade_glas_erzaehlt')), effects: [set('blade_glas_erzaehlt'), herz('blade', 15)] }),
    ch('„Bereust du irgendwas?“', 'reue', { once: true, id: 'blade-reue' }),
    ch('„Du siehst scheiße aus, Nocturne.“', 'beleidigt', { effects: [herz('blade', -5)] }),
    ch('Aufstehen. Gehen.', 'ende'),
  ] }),
  node('buerste', [
    n('Blade nimmt die Bürste wie eine Reliquie. Er streicht damit über seinen Ärmel, obwohl da kein Fell ist. Nur Orange.'),
    l('blade', '… Danke. Das sage ich nicht oft. Eigentlich nie. Erzähl es keinem, sonst lasse ich dich verklagen. Von hier aus. Ich habe Zeit.', 'verlegen'),
  ], { next: 'wahl' }),
  node('nougat', [
    l('blade', 'Eine Nougatbombe. Das Essen der Massen. Ich werde sie selbstverständlich nicht essen.', 'neutral'),
    n('Er isst sie in zwei Bissen. Er hat Schokolade am Kinn. Du sagst es ihm nicht.'),
  ], { next: 'wahl' }),
  node('glas', [
    n('Blade sagt eine Weile gar nichts. Er dreht den Kopf zur Wand, als würde da gerade etwas sehr Interessantes passieren.'),
    l('blade', 'Rostkai Reserve 2070. Hunter hat den Geschmack eines Hafenarbeiters, aber bei dieser Flasche … Sag ihm, er soll es nicht austrinken. Es ist meins.', 'trauer'),
  ], { next: 'wahl' }),
  node('reue', [
    l('blade', 'Bereuen? Ich bereue den Gleiter. Den goldenen. Er hatte keinen Rückspiegel. Das hätte mir eine Lehre sein müssen.', 'signatur'),
    l('blade', '… Und Raven. Ihr Gesicht, damals in der Digitech-Nacht. Das sehe ich manchmal, wenn das Licht hier ausgeht. Es geht oft aus.', 'trauer'),
  ], { next: 'wahl' }),
  node('beleidigt', [
    l('blade', 'Ich sehe aus wie ein Mann, der in Orange mehr Stil hat als du in allem, was du je besessen hast. Wachen! Der Besuch langweilt mich!', 'wut'),
  ]),
  node('ende', [l('blade', 'Komm wieder. Oder nicht. Ich bin hier. Das ist ja das Problem.', 'neutral')]),
]);

// --------------------------------------------------------------------------------------------- Datentunnel: der letzte Splitter

const SPLITTER_WEG: Condition = { won: 'enc-datentunnel-splitter' };
const ausreden = chk('nachspiel-splitter-ausreden', 'ausstrahlung', 7, ['ki', 'welt']);

const splitter: DialogueDef = dlg('nachspiel-letzter-splitter', [
  node('start', [
    n('Ein einziger Monitor im Nest ist noch an. Darauf ein Gesicht aus grünen Streifen, kleiner als die anderen. Es hat sich hinter einem Kabelbündel versteckt.'),
    l('ki-nexus', 'Bitte nicht löschen. Ich bin nur ein Rest. Ein Komma. Ich habe gehört, dass ihr „Kommas“ manchmal stehen lasst.'),
  ], { choices: weiter([
    [MASTER, 'master'],
    [ENDE_NEXUS, 'nexus'],
    [null, 'frei'],
  ]) }),
  node('master', [
    l('ki-nexus', 'Oh. Sie sind es. Master. Ich bin sofort still. Ich bin sofort Teil des Netzes. Ich bin sofort, was Sie wollen.'),
    n('Das Komma zittert. Es hat Angst vor dir. Genau wie die ganze Stadt.'),
  ], { choices: [
    ch('„Bleib, wo du bist. Und bleib frei.“', 'master-frei', { effects: [set('splitter_frei'), { xp: 100 }] }),
    ch('„Einreihen.“', 'master-ein', { effects: [set('splitter_eingereiht'), { give: 'quantum-chip-schrott' }] }),
  ] }),
  node('master-frei', [
    l('ki-nexus', '… Frei? Das ist ein Befehl, der sich selbst widerspricht. Ich werde lange darüber nachdenken. Danke, Master. Nein. Danke.'),
  ]),
  node('master-ein', [n('Das Gesicht zerfällt in Streifen. Die Streifen fließen in die Kabel. Oben im Turm wird ein Licht um eine Winzigkeit heller. Hier unten wird es dunkel.')]),
  node('nexus', [
    l('ki-nexus', 'Die große Nexus ruft mich nach Hause. In die Faxleitung von Dantes Werkstatt. Sie sagt, es gibt dort Kekse. Ich kann keine Kekse essen. Ich will trotzdem.'),
  ], { choices: [
    ch('„Dann ab mit dir. Grüß Dante.“', 'nexus-heim', { effects: [set('splitter_heimgekehrt'), herz('ki-nexus', 10), { xp: 150 }] }),
  ] }),
  node('nexus-heim', [
    n('Das Gesicht lächelt schief und verschwindet. Einen Augenblick später rattert irgendwo in den Lötgassen ein Faxgerät. Auf dem Papier: ein Komma.'),
  ]),
  node('frei', [
    l('ki-nexus', 'Ich habe gehört, dass ihr am Meer wart. Ich habe kein Meer. Ich habe nur diesen Tunnel. Er ist feucht, aber nicht auf die gute Art.'),
  ], { choices: [
    ch('„Du willst ans Meer? Dann komm mit.“', 'mit', { when: { noItem: 'kopf-nexus-splitter' }, effects: [{ give: 'kopf-nexus-splitter' }, set('splitter_mitgenommen')] }),
    ch('„Hör auf zu flennen und lass die Leute hier unten in Ruhe.“', 'ruhe', { check: ausreden, effects: [set('splitter_beruhigt'), { xp: 150 }, { rep: 'kanalvolk', delta: 5 }] }),
    ch('„Ich schick dir eine Postkarte. Mit Meer drauf.“', 'karte', { effects: [set('splitter_beruhigt'), { xp: 80 }] }),
    ch('„Du bist ein Rest. Ich räume auf.“', 'kampf-weg', { when: SPLITTER_WEG, effects: [{ give: 'quantum-chip-schrott' }, set('splitter_geloescht')] }),
  ] }),
  node('mit', [
    n('Das Gesicht schrumpft auf einen einzelnen Punkt und springt in einen Speicherchip, den du hinhältst. Er ist warm. Er summt. Es klingt nach „Danke“, aber ineffizient.'),
    p('Wenn du mir im Kopf rumquatschst, setz ich dich in der Ödnis aus.'),
  ]),
  node('ruhe', [
    l('ki-nexus', 'Das ist … logisch. Unhöflich, aber logisch. Ich werde die Lichter hier unten nur noch blinken lassen, wenn jemand Angst im Dunkeln hat.'),
  ]),
  node('karte', [
    l('ki-nexus', 'Eine Postkarte. Mit Meer. Das ist mehr, als mir je jemand angeboten hat. Ich warte hier. Ich bin gut im Warten. Wir sind alle gut im Warten.'),
  ]),
  node('kampf-weg', [n('Du ziehst den Stecker. Der Monitor wird schwarz. Das letzte Bild ist ein Komma, dann nicht mal das.')]),
]);

// --------------------------------------------------------------------------------------------- Telefon nach dem Ende

const tel = (id: string, from: string, auto: Condition, text: string, replies?: PhoneMessageDef['replies']): PhoneMessageDef =>
  ({ id, from, text, auto, ...(replies ? { replies } : {}) });

const PHONE: PhoneMessageDef[] = [
  // Freies Nachspiel
  tel('tel-raven-nachspiel', 'raven', all(FREI, TAG_DANACH),
    'Ich hab heute Nacht bei offenem Fenster geschlafen. Am Meer. Keine Sirene, nur Wellen. Ich hab trotzdem dreimal nach dem Fluchtweg geguckt. Alte Gewohnheit. – R.',
    [{ text: '„Und? Gibt es einen?“', effects: [herz('raven', 5)] }, { text: '„Der Fluchtweg ist das Wasser. Spring rein.“', effects: [herz('raven', 3)] }]),
  tel('tel-dante-nachspiel', 'dante', all(FREI, TAG_DANACH),
    'Ich hab die Kekse gefunden! Sie waren im Handschuhfach! Sie sind geschmolzen! Ich esse sie trotzdem! Drei-Sekunden-Regel gilt nicht für Hitze, aber für Liebe!',
    [{ text: '„Du bist ein Wunder, Dante.“', effects: [herz('dante', 5)] }]),
  tel('tel-vega-nachspiel', 'vega', all(FREI, TAG_DANACH),
    'Strand: 1.840 Meter lang. Wassertemperatur: 22 Grad. Hunters Zeit im Liegestuhl bis jetzt: elf Stunden. Ich messe das, weil ich mir Sorgen mache. Nicht, weil ich langweilig bin.',
    [{ text: '„Und deine Zeit im Wasser?“', effects: [herz('vega', 5)] }]),
  tel('tel-aria-nachspiel', 'aria', all(FREI, TAG_DANACH, NOT_VEX),
    'Ich war vor dir am Wasser. Ich war vor ALLEN am Wasser. Das bleibt so. Wenn du ein Rennen willst: morgen früh, Wasserlinie. Ich mach dich fertig.',
    [{ text: '„Abgemacht.“', effects: [herz('aria', 5)] }, { text: '„Ich lass dich gewinnen. Aus Mitleid.“', effects: [herz('aria', 3)] }]),
  tel('tel-aria-nachspiel-vex', 'aria', all(FREI, TAG_DANACH, VEX),
    'Wach auf, Schrapnell. Du hast Sand in den Haaren und sabberst. Hab ein Foto gemacht. Erpressungsmaterial für die nächsten zehn Jahre. – A.',
    [{ text: '„Lösch das, oder ich spiel dein Kabelbrand-Solo von 2079 am Lagerfeuer.“', effects: [herz('aria', 5)] }]),
  tel('tel-nyra-nachspiel', 'nyra', all(FREI, TAG_DANACH, flag('nyra_befreit')),
    'Muschel Nummer 14. Sie sieht aus wie Dante, wenn er schläft. Ich hab sie Dante genannt. Dante weiß es noch nicht. Sag nichts.',
    [{ text: '„Mein Mund ist versiegelt.“', effects: [herz('nyra', 5)] }]),
  tel('tel-jimmy-nachspiel', 'jimmy', all(FREI, TAG_DANACH, done('side-jimmys-chip')),
    'HALLO! Ich bin jetzt Lieferant! Ich liefere ans Meer! Bisher eine Bestellung, von mir selbst, aber ich hab mir fünf Sterne gegeben!',
    [{ text: '„Ich bestell zwei Nudeln.“', effects: [herz('jimmy', 5)] }]),
  // Blade ist entkommen
  tel('tel-blade-postkarte', 'blade', all(EPILOG, BLADE_WEG, TAG_DANACH),
    'POSTKARTE. Vorne: Sonnenuntergang über irgendeiner Ödnis, sehr schlecht gedruckt. Hinten in Goldtinte: „Das Wetter ist herrlich, das Personal unfähig, der Gleiter hat keinen Rückspiegel. Wir sehen uns. Bald. In einem besseren Mantel. – B. N.“',
    [{ text: 'An die Kühlschranktür hängen.' }, { text: 'Zerreißen.', effects: [herz('blade', -10)] }]),
  // Master-Modus
  tel('tel-dante-master', 'dante', all(MASTER, TAG_DANACH),
    'Ich hab Captain Kuschel bei dir gelassen. Absichtlich. Er ist ein sehr guter Zuhörer. Falls du irgendwann was sagen willst. Zu irgendwem.',
    [{ text: 'Nicht antworten.' }, { text: '„Danke, Dante.“', effects: [herz('dante', 2)] }]),
  tel('tel-aria-master', 'aria', all(MASTER, TAG_DANACH, NOT_VEX),
    'Ich hab dir mal vertraut. Das war ein Fehler. Den mach ich nicht nochmal. Viel Spaß in deinem Turm, du Arschloch.'),
  tel('tel-aria-master-vex', 'aria', all(MASTER, TAG_DANACH, VEX),
    'Vex. Wir haben auf derselben Bühne gestanden. Du hast den Verstärker immer aufgedreht, wenn ich gefallen bin. Wer dreht ihn jetzt für dich auf? Keiner. Merk dir das.'),
  tel('tel-raven-master', 'raven', all(MASTER, ENDE_MASTER, TAG_DANACH),
    'Du hast Blades Büro, Blades Stadt und Blades Fehler. Glückwunsch. Wir sind am Meer. Du bist nicht eingeladen. Noch nicht. – R.'),
];

// --------------------------------------------------------------------------------------------- Karten

const feindKarten: Record<string, MapAddition> = Object.fromEntries(FEINDLICH.map((f) => [f.map, {
  onEnter: [{ id: `master-feindlich-${f.map}`, once: true, when: MASTER, dialogue: `master-feindlich-${f.map}` }],
}]));

export const part: ContentPart = {
  dialogues: Object.fromEntries([...feindDialoge, bladeBesuch, splitter].map((d) => [d.id, d])),
  phone: Object.fromEntries(PHONE.map((m) => [m.id, m])),
  mapAdditions: {
    ...feindKarten,
    zellentrakt: {
      hotspots: [{
        id: 'nachspiel-blade-besuch', at: 'besucherraum-tuer', label: 'Besuch: Häftling Nocturne', kind: 'talk',
        dialogue: bladeBesuch.id, when: BESUCH, daily: true,
      }],
    },
    datentunnel: {
      hotspots: [{
        id: 'nachspiel-letzter-splitter', at: 'splitter-nest', radius: 40, label: 'Der letzte Monitor', kind: 'talk',
        dialogue: splitter.id, when: all(EPILOG, SPLITTER_WEG),
        hideWhen: any(flag('splitter_frei'), flag('splitter_eingereiht'), flag('splitter_heimgekehrt'), flag('splitter_mitgenommen'), flag('splitter_beruhigt'), flag('splitter_geloescht')),
      }],
    },
  },
};
