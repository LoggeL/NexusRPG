// Die drei Kanal-Schlafwandler aus pers-delya-quelle (world.md §4.4 delya-delloraine, §6.5; act23.json npcSchedules):
// Ede (kanal-sammler/floss-anleger), Rosi (pumpwerk-sieben/schlafwandler-pumpe), Bert (datentunnel/schlafwandler-tunnel).
// Beta-Chip-Träger, die nachts im Kanal umherwandern. Nur nachts und nur während der Quest sichtbar; gerettet sitzen sie
// tagsüber bei Dante auf dem Sofa (Kontrolle), bis die Quest erledigt ist.
// Damit die Quest auf jeden Fall spielbar ist, bieten die Gespräche selbst einen Rettungsweg (setzt die geplanten Flags
// schlafwandler_*_gerettet, act23.json flags.act2). Baut das Quest-Paket eigene Rettungsszenen per Platzierung,
// gewinnen dessen Platzierungen (schedule.ts: feste Platzierung vor Tagesablauf); die Flags bleiben dieselben.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, DialogueLine, NpcDef } from '../../../modules/contracts';
import { dialog, erz, flag, ich, knoten, ort, pruefung, rede, sammle, sprecher, weg, weltfigur } from './_oednis';

const QUEST = 'pers-delya-quelle';
const AKTIV: Condition = { quest: QUEST, state: 'active' };
const NICHT_FERTIG: Condition = { not: { quest: QUEST, state: 'done' } };

interface Wandler {
  id: string;
  name: string;
  unknown: string;
  sprite: string;
  flag: string;
  map: string;
  spot: string;
  bio: string;
  /** Erste Begegnung im Kanal. */
  auftritt: DialogueLine[];
  /** Was der Chip durch sie murmelt. */
  murmeln: DialogueLine[];
  /** Persönliche Erinnerung (Weg ohne Check). */
  erinnerung: { frage: string; zeilen: DialogueLine[] };
  /** Auf Dantes Sofa. */
  sofa: DialogueLine[];
}

function figur(w: Wandler): { npc: NpcDef; dialogues: Record<string, DialogueDef> } {
  const S = sprecher(w.id);
  const gerettet = { flag: w.flag };
  const kanal = dialog(`${w.id}-kanal`, [
    knoten('start', [...w.auftritt, ...w.murmeln], {
      choices: [
        {
          text: 'Den Beta-Chip mit einem Störimpuls in den Ruhemodus schicken.', tag: '[Technik 5]',
          check: pruefung(`${w.id}-ruhemodus`, 'technik', 5, ['hacken', 'cyberware']), next: 'ruhe',
        },
        { text: w.erinnerung.frage, next: 'erinnerung' },
        { text: 'An der Hand nehmen und langsam, ganz langsam Richtung Dante führen.', next: 'fuehren' },
        { text: 'Lieber nicht wecken. Weitergehen.' },
      ],
    }),
    knoten('ruhe', [
      erz('Du hältst dein Handgelenk an die Schläfe. Ein Knistern, ein kurzer Geruch nach verbranntem Toast. Die Augen werden klar. Dann sehr, sehr verwirrt.'),
      S('Wo … warum bin ich nass? Warum bin ich im Kanal? Warum riecht es hier wie in meinem Kühlschrank?', 'ueberrascht'),
    ], { next: 'mit' }),
    knoten('erinnerung', [...w.erinnerung.zeilen], { next: 'mit' }),
    knoten('fuehren', [
      erz('Du nimmst die kalte Hand. Kein Widerstand, keine Reaktion. Ihr geht los, Schritt für Schritt, durch Pfützen und über Leitern. Es dauert eine Ewigkeit. Zweimal bleibt ihr stehen, weil der Chip „Reiseziel ändern“ flüstert.'),
    ], { next: 'mit', effects: [{ advanceTime: 60 }] }),
    knoten('mit', [
      ich('Komm. Ich bring dich zu jemandem, der dir das Ding im Kopf leiser dreht.'),
      erz('Eine Stunde später liegt eine Decke über einer schlafenden Gestalt auf Dantes Sofa. Dante legt einen Keks daneben. „Für wenn er aufwacht. Oder sie. Ich hab nicht so genau hingeschaut, ich hab Kekse gezählt.“'),
    ], { effects: [flag(w.flag), { xp: 50 }, { rep: 'nx1-medien', delta: 3 }, { travel: 'dantes-werkstatt' }] }),
  ]);
  const ohneQuest = dialog(`${w.id}-murmeln`, [knoten('start', [...w.auftritt, ...w.murmeln, erz('Die Gestalt dreht sich um und schlurft weiter, als wärst du Luft.')])]);
  const sofa = dialog(`${w.id}-sofa`, [knoten('start', w.sofa)]);
  const npc = weltfigur({
    id: w.id,
    name: w.name,
    unknownName: w.unknown,
    portrait: w.id,
    sprite: w.sprite,
    maxHearts: 1,
    bio: w.bio,
    schedule: [
      ort('N', w.map, w.spot, { when: { all: [AKTIV, { not: gerettet }] } }),
      ort('M,T', 'dantes-werkstatt', 'sofa', { when: { all: [gerettet, NICHT_FERTIG] } }),
      weg('*'),
    ],
    talk: [
      rede(`${w.id}-sofa`, gerettet),
      rede(`${w.id}-kanal`, AKTIV),
      rede(`${w.id}-murmeln`),
    ],
  });
  return { npc, dialogues: sammle(kanal, ohneQuest, sofa) };
}

const ede = figur({
  id: 'schlafwandler-ede', name: 'Ede', unknown: 'Schlafwandler am Floßanleger', sprite: 'passant-arbeiterin-walk',
  flag: 'schlafwandler_ede_gerettet', map: 'kanal-sammler', spot: 'floss-anleger',
  bio: 'Busfahrer aus der Rohrsiedlung mit Beta-Chip. Wandert nachts im Pyjama an den Floßanleger des Kanal-Sammlers und bestellt Fahrkarten bei Ratten.',
  auftritt: [erz('Am Floßanleger steht ein Mann im gestreiften Pyjama, barfuß im knöcheltiefen Wasser. Seine Augen sind offen, aber leer. An seiner Schläfe pulsiert ein winziges blaues Licht.')],
  murmeln: [
    sprecher('schlafwandler-ede')('Nächster Halt … Chrome 10. Bitte zurückbleiben. Bitte lächeln. Bitte kaufen.'),
    sprecher('schlafwandler-ede')('Fahrkarte? Fahrkarte. Die Ratte hat keine Fahrkarte. Ratte, raus.'),
  ],
  erinnerung: {
    frage: '„Ede! Linie 7 hat Verspätung! Die Leute warten!“',
    zeilen: [
      erz('Ein Ruck geht durch den Mann. Das blaue Licht flackert.'),
      sprecher('schlafwandler-ede')('Linie 7 … Verspätung? Nein. Nein! Nicht auf meiner Schicht! Ich war zweiundzwanzig Jahre pünktlich!', 'ueberrascht'),
      sprecher('schlafwandler-ede')('Warum hab ich einen Pyjama an? Warum ist hier eine Ratte? Wo ist mein Bus?'),
    ],
  },
  sofa: [
    erz('Ede liegt unter einer Decke auf Dantes Sofa und starrt an die Decke. Neben ihm ein halber Keks.'),
    sprecher('schlafwandler-ede')('Danke. Ehrlich. Dante sagt, das Ding in meinem Kopf schläft jetzt. Ich träum zum ersten Mal seit Wochen wieder normal. Von Bussen. Pünktlichen Bussen.', 'freude'),
  ],
});

const rosi = figur({
  id: 'schlafwandlerin-rosi', name: 'Rosi', unknown: 'Schlafwandlerin an der Pumpe', sprite: 'passant-oma-walk',
  flag: 'schlafwandlerin_rosi_gerettet', map: 'pumpwerk-sieben', spot: 'schlafwandler-pumpe',
  bio: 'Rentnerin aus der Neon-Gasse mit Beta-Chip. Wandert nachts ins Pumpwerk Sieben und streichelt die Pumpenräder, als wären sie Katzen.',
  auftritt: [erz('Zwischen den riesigen Pumpenrädern steht eine kleine alte Frau im Morgenmantel und streichelt ein Rohr. Ihr Haar ist voller Lockenwickler, an ihrer Schläfe blinkt es blau. Sie summt einen Werbejingle.')],
  murmeln: [
    sprecher('schlafwandlerin-rosi')('Braves Kätzchen. Großes Kätzchen. Chrome 10 macht alle Kätzchen glücklich. Kauf dem Kätzchen ein Update.'),
  ],
  erinnerung: {
    frage: '„Rosi, der Kuchen im Ofen brennt an!“',
    zeilen: [
      sprecher('schlafwandlerin-rosi')('Mein Streuselkuchen! Nicht schon wieder!', 'ueberrascht'),
      erz('Das blaue Licht erlischt. Rosi blinzelt, sieht das Rohr an, sieht dich an, sieht ihren Morgenmantel an.'),
      sprecher('schlafwandlerin-rosi')('Junger Mensch, ich weiß nicht, wo ich bin, aber ich weiß, dass es hier nach Arsch riecht. Bring mich nach Hause. Und sag keinem, dass ich ein Rohr gestreichelt hab.'),
    ],
  },
  sofa: [
    erz('Rosi sitzt kerzengerade auf Dantes Sofa und strickt. Dante sitzt daneben und hält die Wolle. Er wirkt eingeschüchtert.'),
    sprecher('schlafwandlerin-rosi')('Der Junge hier hat mir den Kopf repariert. Netter Junge. Zu dünn. Ich back ihm einen Kuchen, sobald ich wieder weiß, wo mein Ofen ist.', 'freude'),
  ],
});

const bert = figur({
  id: 'schlafwandler-bert', name: 'Bert', unknown: 'Schlafwandler im Datentunnel', sprite: 'passant-anzug-walk',
  flag: 'schlafwandler_bert_gerettet', map: 'datentunnel', spot: 'schlafwandler-tunnel',
  bio: 'Versicherungsvertreter aus den Glasarkaden mit Beta-Chip. Steht nachts im Datentunnel und hält Verkaufsgespräche mit Glasfaserkabeln.',
  auftritt: [erz('Im Licht der pulsierenden Glasfasern steht ein Mann im zerknitterten Anzug, Krawatte über der Schulter, und schüttelt einem Kabelstrang die Hand. Immer wieder. An seiner Schläfe blinkt es blau, im Takt der Kabel.')],
  murmeln: [
    sprecher('schlafwandler-bert')('Haben Sie schon über Ihre Zukunft nachgedacht? Nexus hat. Nexus denkt für Sie. Unterschreiben Sie hier. Und hier. Und hier ist Ihr Gehirn.'),
  ],
  erinnerung: {
    frage: '„Bert, deine Tochter hat angerufen. Sie fragt, ob du zum Geburtstag kommst.“',
    zeilen: [
      erz('Bert lässt das Kabel los. Seine Hand zittert.'),
      sprecher('schlafwandler-bert')('Ronja? Ronja wird sieben. Am Donnerstag. Ich hab ihr ein … ich hab … ich hab nichts gekauft. Ich hab seit Wochen nichts gekauft, außer Chrome-Updates.', 'trauer'),
      sprecher('schlafwandler-bert')('Was mach ich hier? Warum bin ich unter der Erde? Ich hab Klaustrophobie! Ich hab Klaustrophobie!'),
    ],
  },
  sofa: [
    erz('Bert sitzt auf Dantes Sofa, die Krawatte endlich ab, und malt mit Buntstiften eine Geburtstagskarte. Sie ist schief. Sie ist voller Herzen.'),
    sprecher('schlafwandler-bert')('Ich hab Ronja angerufen. Sie hat geweint. Ich hab geweint. Dante hat auch geweint, aber er sagt, das war der Zwiebelkeks.', 'freude'),
  ],
});

export const part: ContentPart = {
  npcs: { [ede.npc.id]: ede.npc, [rosi.npc.id]: rosi.npc, [bert.npc.id]: bert.npc },
  dialogues: { ...ede.dialogues, ...rosi.dialogues, ...bert.dialogues },
};
