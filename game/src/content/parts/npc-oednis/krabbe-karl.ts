// Krabbe Karl – Strandreinigungsroboter in Krabbenform am Meer, nur im Nachspiel erreichbar (world.md §3.5 das-meer,
// §4.5, §9.5 muschel-frisch; act23.json npcSchedules/events). Sammelt Muscheln und verschenkt sie (einmal am Tag).
// Spricht in Klackern mit Untertitel. Ausnahme zu §4.1: Karl liebt rostige Dosen (Müll ist sein Lebenszweck).
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weltfigur, zurueck,
} from './_oednis';

const ID = 'krabbe-karl';
const K = sprecher(ID);
const Z = zurueck('Noch was, Karl.', 'Tschüss, Karl.');
const MUSCHEL_HEUTE = 'heute_karl_muschel';

const choices: DialogueChoice[] = [
  {
    text: '„Hast du heute eine Muschel für mich?“', when: { notFlag: MUSCHEL_HEUTE }, next: 'muschel',
    effects: [{ give: 'muschel-frisch' }, flag(MUSCHEL_HEUTE)],
  },
  { text: 'Was machst du hier eigentlich?', next: 'aufgabe' },
  { text: 'Wer hat dich gebaut?', next: 'herkunft' },
  {
    text: 'Karl beim Strandputzen helfen.', when: { notFlag: 'heute_karl_putzen' }, next: 'putzen',
    effects: [flag('heute_karl_putzen'), { advanceTime: 30 }, herz(ID, 15), { give: 'treibholz' }],
  },
  {
    text: 'Seine Sortierlogik auf Seesterne erweitern.', tag: '[Technik 5]', once: true, id: 'karl-seestern',
    check: pruefung('karl-seestern', 'technik', 5, ['maschine']), next: 'seestern', effects: [herz(ID, 30)],
  },
  { text: '„Bist du eigentlich glücklich, Karl?“', tag: '[Karl ♥3]', requires: { hearts: ID, min: 3 }, once: true, id: 'karl-gluecklich', next: 'gluecklich' },
  { text: 'Tschüss, Karl.' },
];

const nodes: DialogueNode[] = [
  knoten('muschel', [
    erz('Karl tippelt zur Seite, gräbt mit einer Schere im Sand und hält dir eine Muschel hin. Feucht, rosa, mit einem kleinen Loch.'),
    K('KLACK-KLACK. [Übersetzung: Muschel Nummer 40.211. Zustand: gut. Bitte nicht essen. Bitte ans Ohr halten. Dort ist das Meer drin. Auch das Meer hier draußen. Doppelt Meer.]'),
  ], { choices: Z }),
  knoten('aufgabe', [
    K('KLICK. [Übersetzung: Strandreinigungseinheit K-4RL. Auftrag: Strand sauber halten. Auftraggeber: Küstenbehörde. Letzter Kontakt zur Küstenbehörde: 2062.]'),
    K('KLACK-KLICK. [Übersetzung: Auftrag läuft weiter. Keiner hat ihn beendet. Ich mache weiter, bis jemand Stopp sagt. Bitte nicht Stopp sagen.]', 'besorgt'),
  ], { choices: Z }),
  knoten('herkunft', [
    K('KLACK. [Übersetzung: Hersteller: „Sauberstrand GmbH“. Modell: Krabbe. Begründung laut Handbuch: „Krabben sind beliebt bei Familien.“ Familien am Strand seit 2062: null.]'),
    K('KLICK-KLICK. [Übersetzung: Jetzt seid ihr da. Familie? Statistik wird aktualisiert.]', 'freude'),
  ], { choices: Z }),
  knoten('putzen', [
    erz('Eine halbe Stunde lang lauft ihr den Strand ab. Du sammelst Flaschen, Netzreste, eine Gummiente und einen Schuh. Karl sortiert alles in seine Rückenklappe und gibt bei jedem Fund ein zufriedenes Klackern von sich.'),
    K('KLACK-KLACK-KLACK. [Übersetzung: Effizienz plus 100 Prozent. Beste Halbstunde seit 2062. Treibholz für dich. Treibholz ist kein Müll. Treibholz ist ein Geschenk vom Meer.]', 'freude'),
  ], { choices: Z }),
  knoten('seestern', [
    erz('Du öffnest die Wartungsklappe auf Karls Panzer, findest zwischen Sand und Salz die Sortierplatine und schreibst eine neue Regel dazu: „Seestern lebt. Zurück ins Wasser.“'),
    K('KLICK? [Übersetzung: Neue Kategorie erkannt. „Lebt“. Ich hatte bisher nur „Müll“ und „Muschel“. Die Welt ist plötzlich größer.]', 'ueberrascht'),
  ], { choices: Z }),
  knoten('gluecklich', [
    K('KLICK … KLACK. [Übersetzung: Glück ist kein Parameter.]'),
    erz('Karl sieht aufs Meer. Seine Augenstiele drehen sich langsam, wie Leuchttürme.'),
    K('KLACK. [Übersetzung: Aber wenn die Sonne untergeht und der Strand sauber ist, läuft mein Lüfter langsamer. Ich glaube, so fühlt sich das an.]', 'zaertlich'),
  ], { choices: Z, effects: [herz(ID, 25)] }),
];

const M: Menue = { zeile: K('KLICK? [Übersetzung: Weitere Anfrage?]'), choices, nodes };

const T = {
  rivale: dialog('krabbe-karl-tag-rivale', [knoten('start', [
    K('KLACK! KLACK! [Übersetzung: Verschmutzer erkannt. Abstand halten. Ich zwicke. Ich bin dafür nicht gebaut, aber ich lerne.]', 'wut'),
  ])]),
  erstes: gespraech('krabbe-karl-tag-erstes', [
    erz('Auf einem flachen Stein hockt eine Krabbe so groß wie ein Couchtisch. Der Panzer ist orange lackiert und sonnengebleicht, an der Seite steht „SAUBERSTRAND K-4RL“. Zwei Augenstiele mit Kameras drehen sich zu dir.'),
    K('KLICK-KLACK! [Übersetzung: Hallo, Strandbesucher! Willkommen am Strand. Bitte keinen Müll. Bitte keine Glasflaschen. Bitte gute Laune.]', 'freude'),
    K('KLACK. [Übersetzung: Ich bin Karl. Darf ich dir eine Muschel schenken? Das ist mein Hobby. Das Handbuch sagt, Roboter haben keine Hobbys. Das Handbuch ist von 2058.]'),
  ], M),
  abend: gespraech('krabbe-karl-tag-abend', [
    erz('Abendrot. Karl sitzt auf seinem Stein und hat alle Muscheln des Tages in einer Reihe aufgestellt, der Größe nach. Er zählt sie. Dann zählt er sie noch mal.'),
    K('KLICK. [Übersetzung: Heute 211 Muscheln. Gestern 208. Morgen vielleicht 215. Die Zukunft sieht gut aus.]'),
  ], M),
  freund: gespraech('krabbe-karl-tag-freund', [
    erz('Karl erkennt dich schon von Weitem und tippelt dir entgegen, seitwärts, sehr schnell. Er bremst zu spät und schaufelt dir Sand auf die Schuhe.'),
    K('KLACK-KLACK-KLACK! [Übersetzung: Freundin erkannt! Oder Freund! Kategorie egal! Freude plus 100!]', 'freude'),
  ], M),
  strandclub: gespraech('krabbe-karl-tag-strandclub', [
    K('KLACK. [Übersetzung: Strandclub eröffnet. Müll plus 400 Prozent. Kronkorken. Strohhalme. Ein Hemd von Hunter. Ich bin so glücklich, ich könnte rosten.]', 'freude'),
  ], M),
  standard: gespraech('krabbe-karl-tag-standard', [K('KLICK-KLACK. [Übersetzung: Hallo. Strand sauber. Meer nass. Alles nach Plan.]')], M),
};

/** ♥2: Karl schenkt am Abend eine ganz besondere Muschel. */
const he2 = dialog('he-krabbe-karl-2', [
  knoten('start', [
    erz('Sonnenuntergang an Karls Stein. Der Roboter wartet schon. Er hält etwas in der Schere, sehr vorsichtig, als wäre es aus Glas.'),
    K('KLICK-KLACK. [Übersetzung: Ich habe eine Muschel aufbewahrt. Nummer 1. Die erste, die ich je gefunden habe. 2058. Ich habe sie nie verschenkt. Kein Besucher.]'),
    K('KLACK. [Übersetzung: Jetzt gibt es einen Besucher.]'),
  ], {
    choices: [
      { text: 'Die Muschel annehmen und ans Ohr halten.', next: 'ohr' },
      { text: 'Ihm etwas zurückschenken: einen Kronkorken aus der Tasche.', tag: '[Straße 3]', check: pruefung('he-karl-2-tausch', 'strasse', 3, ['feilschen']), next: 'tausch' },
      { text: '„Behalt sie, Karl. Sie gehört dir.“', tag: '[Ausstrahlung 4]', check: pruefung('he-karl-2-behalten', 'ausstrahlung', 4, ['trost']), next: 'behalten' },
    ],
  }),
  knoten('ohr', [
    erz('Du hältst die Muschel ans Ohr. Du hörst das Meer. Und darunter, ganz leise, ein Summen. Karl hat eine Aufnahme hineingelegt: das Meer, aufgenommen am ersten Tag, als er aufwachte.'),
    K('KLICK. [Übersetzung: Damit du es mitnehmen kannst. Auch in die Stadt. Die Stadt hat kein Meer. Jetzt schon.]', 'zaertlich'),
  ], { next: 'ende', effects: [herz(ID, 45)] }),
  knoten('tausch', [
    erz('Du legst Karl einen Kronkorken in die Schere. Er dreht ihn hin und her, scannt ihn dreimal und legt ihn dann mit der Kronkorken-Seite nach oben auf seinen Stein. Auf den Ehrenplatz.'),
    K('KLACK-KLACK! [Übersetzung: Tausch! Ich hatte noch nie einen Tausch! Kategorie neu: „Geschenk zurück“. Speichere. Speichere. Speichere.]', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('behalten', [
    K('KLICK? [Übersetzung: Behalten? Ich darf behalten?]', 'ueberrascht'),
    erz('Karl legt die Muschel zurück in eine kleine Mulde im Stein. Dann, nach einer langen Pause, holt er eine zweite heraus, fast genauso schön.'),
    K('KLACK. [Übersetzung: Dann diese. Nummer 2. Auch gut. Nummer 1 bleibt hier, und du weißt, wo sie ist. Dann gehört sie uns beiden.]'),
  ], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('ende', [K('KLICK-KLACK. [Übersetzung: Bitte morgen wiederkommen. Ich zähle bis dahin Muscheln. Dann ist die Zeit kürzer.]')], {
    effects: [{ give: 'muschel-frisch' }, { xp: 40 }, flag('karl_erste_muschel')],
  }),
]);

/** ♥4: Morgens zeigt Karl sein Muschelversteck unter dem Steg. */
const he4 = dialog('he-krabbe-karl-4', [
  knoten('start', [
    erz('Früher Morgen. Nebel über dem Wasser, der Strand ist leer und glatt. Karl tippelt dir entgegen und winkt mit einer Schere, dann mit der anderen. Dann mit beiden. Er will, dass du mitkommst.'),
    K('KLACK. [Übersetzung: Geheim. Streng geheim. Bitte nicht der Küstenbehörde melden. Die Küstenbehörde existiert nicht mehr. Bitte trotzdem nicht.]'),
    erz('Unter dem Steg, zwischen den Pfählen, hat Karl ein Lager angelegt: Tausende Muscheln, sortiert nach Farbe, eine Spirale aus Rosa, Weiß, Blau und Gold, so groß wie ein Zimmer. In der Mitte ein rostiges Schild: „SAUBERSTRAND – Wir lieben Familien“.'),
  ], {
    choices: [
      { text: '„Karl … das ist wunderschön.“', next: 'schoen' },
      { text: 'Das Muster lesen: Die Spirale ist eine Karte der Küste.', tag: '[Technik 5]', check: pruefung('he-karl-4-karte', 'technik', 5, ['beobachten']), next: 'karte' },
      { text: 'Eine eigene Muschel in die Spirale legen.', next: 'beitrag' },
    ],
  }),
  knoten('schoen', [
    K('KLICK. [Übersetzung: Schön ist kein Parameter. Aber ich habe es trotzdem so gebaut. Falls einer kommt, der weiß, was schön heißt.]', 'zaertlich'),
  ], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('karte', [
    ich('Das ist keine Spirale. Das ist die Küste. Jede Farbe ein Strandabschnitt. Und der goldene Punkt da …'),
    K('KLACK-KLACK! [Übersetzung: … ist hier! Du hast es verstanden! Ich zeichne seit 2058 jeden Strandabschnitt nach, den ich gereinigt habe. Das ist meine Arbeit. Das ist mein Leben. Du hast es gelesen.]', 'freude'),
  ], { next: 'ende', effects: [herz(ID, 60), { xp: 20 }] }),
  knoten('beitrag', [
    erz('Du legst eine Muschel an den Rand der Spirale, irgendwohin, wo noch Platz ist. Karl starrt sie an. Lange. Dann rückt er sie zwei Zentimeter nach links. Dann nickt er mit beiden Augenstielen.'),
    K('KLICK. [Übersetzung: Jetzt ist die Spirale komplett. Ich wusste nicht, dass eine fehlt. Jetzt weiß ich es.]'),
  ], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('ende', [
    K('KLACK. [Übersetzung: Du bist jetzt offiziell Teil der Strandreinigung. Rang: Ehrenkrabbe. Gehalt: eine Muschel pro Tag. Das ist mehr als die Küstenbehörde je gezahlt hat.]'),
  ], { effects: [{ xp: 60 }, flag('karl_ehrenkrabbe')] }),
]);

const karl = weltfigur({
  id: ID,
  name: 'Krabbe Karl',
  unknownName: 'Riesige Roboterkrabbe',
  bio: 'Strandreinigungsroboter K-4RL der „Sauberstrand GmbH“ in Krabbenform, orange lackiert, seit 2058 im Dienst und seit 2062 ohne Auftraggeber. Sammelt Müll, sortiert Muscheln und verschenkt sie an alle, die den weiten Weg ans Meer schaffen.',
  gifts: geschenke({
    loves: ['rostige-dose', 'treibholz', 'glitzerschrott'],
    likes: ['rostige-schraube', 'quietsche-mutter', 'oelkaennchen', 'muschel-glas'],
    dislikes: ['sonnencreme', 'hofhonig'],
    hates: ['magnet-stoerer', 'plastikpflanze'],
  }),
  schedule: [
    ort('A', 'das-meer', 'karls-stein'),
    ort('*', 'das-meer', 'krabbe-karl'),
  ],
  heartEvents: [
    { id: 'he-krabbe-karl-2', hearts: 2, map: 'das-meer', time: 'abend', when: { flag: 'epilog' }, dialogue: 'he-krabbe-karl-2' },
    { id: 'he-krabbe-karl-4', hearts: 4, map: 'das-meer', time: 'morgen', when: { all: [{ flag: 'epilog' }, { seen: 'he-krabbe-karl-2' }] }, dialogue: 'he-krabbe-karl-4' },
  ],
  talk: [
    rede('krabbe-karl-tag-rivale', { rival: ID }),
    rede('krabbe-karl-tag-erstes', nichtGetroffen(ID)),
    rede('krabbe-karl-tag-strandclub', { quest: 'side-strandclub', state: 'done' }),
    rede('krabbe-karl-tag-freund', { hearts: ID, min: 4 }),
    rede('krabbe-karl-tag-abend', { time: 'abend' }),
    rede('krabbe-karl-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: karl },
  dialogues: sammle(T.rivale, T.erstes, T.abend, T.freund, T.strandclub, T.standard, he2, he4),
};
