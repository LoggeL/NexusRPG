// Oma Volt in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §5.3–5.5, §10.4–10.6; act23.json flags).
// Weltfigur mit höchstens 6 Herzen: keine Herz-Ereignisse 8/10. Dafür Tagesgespräche nach Phase (Chrome 10 gegen den
// Kiosk, Drohnen, Razzia: einmal pro Woche versteckt sie die Spielfigur, Fahndung −1), Paul nach side-ki-fluestern,
// eine Geheimtasche für die Party, Nachspiel je Ende, Master-Modus.
// Wird von oma-volt.ts in NpcDef.talk/schedule eingehängt.
import type { DialogueChoice, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  A2_OFFEN, A2_PARTY, ENDE_3B, ENDE_MEER, ENDE_NEXUS, L, MASTER, N, NACHSPIEL, PARTYNACHT, VEX, dialogs, dlg, einmal,
  herz, node,
} from './_dsl';

const O = 'oma-volt';
const PAUL_GERETTET = { quest: 'side-ki-fluestern', state: 'done' } as const;
const PAUL_AKTIV = { quest: 'side-ki-fluestern', state: 'active' } as const;
const POOL_TAGE = { weekday: ['mo', 'mi', 'fr', 'sa'] } as const;
const OMA_MEER = { flag: 'oma_volt_meer_dabei' } as const;

/** Einmal pro Woche: Oma Volt versteckt die Spielfigur im Lager hinterm Kiosk (Fahndung −1). */
const verstecken: DialogueChoice = {
  text: '„Oma, die Streife sucht mich. Kann ich kurz hinter deine Kisten?“',
  tag: '[Fahndung]',
  when: { all: [{ flag: 'fahndung_1' }, { notFlag: 'woche_oma_versteck' }] },
  effects: [{ wanted: -1 }, { setFlag: 'woche_oma_versteck' }, { advanceTime: 60 }, herz(O, 10)],
  next: 'versteck',
};
const kiosk: DialogueChoice = { text: '„Zeig mal, was du hast.“', effects: [{ shop: 'volt-eck' }] };

/** Ganz vorn (vor dem Start von side-ki-fluestern): Master-Modus. */
export const OMA_TALK_MASTER: TalkDef[] = [{ dialogue: 'oma-volt-master', when: MASTER }];

export const OMA_TALK_FRUEH: TalkDef[] = [
  { dialogue: 'oma-volt-3b', when: einmal('oma-volt-3b', ENDE_3B) },
  { dialogue: 'oma-volt-nachspiel', when: einmal('oma-volt-nachspiel', NACHSPIEL) },
  { dialogue: 'oma-volt-meer', when: { all: [NACHSPIEL, OMA_MEER, { weekday: 'sa' }, { time: 'tag' }] } },
  { dialogue: 'oma-volt-partynacht', when: PARTYNACHT },
  { dialogue: 'oma-volt-a2-bruch', when: einmal('oma-volt-a2-bruch', A2_OFFEN) },
  { dialogue: 'oma-volt-paul-zurueck', when: einmal('oma-volt-paul-zurueck', PAUL_GERETTET) },
  { dialogue: 'oma-volt-a2-party', when: einmal('oma-volt-a2-party', A2_PARTY) },
];

export const OMA_TALK_POOL: TalkDef[] = [
  { dialogue: 'oma-volt-a2-tag', when: { all: [A2_OFFEN, POOL_TAGE] } },
  { dialogue: 'oma-volt-a2-nervoes', when: { all: [A2_PARTY, POOL_TAGE] } },
  { dialogue: 'oma-volt-nachspiel-tag', when: { all: [NACHSPIEL, POOL_TAGE] } },
];

export const OMA_SCHEDULE_23: ScheduleEntry[] = [
  { slot: 'tag', days: ['sa'], when: { all: [NACHSPIEL, OMA_MEER] }, place: { map: 'das-meer', at: 'duenengras' } },
];

const dialogues = dialogs(
  // ------------------------------------------------------------------------------------------- Akt 2
  dlg('oma-volt-a2-bruch', [
    node('a', [
      N('Das Volt-Eck hat einen neuen Fensterschmuck: Ein Quantum-Werbeplakat, „Chrome 10 – Gratis für alle!“, hängt verkehrt herum in der Scheibe. Jemand hat einen Schnurrbart auf das lächelnde Gesicht gemalt.'),
      L(O, 'Kindchen! Komm rein, schnell, bevor die Drohne wieder vorbeifliegt. Die hat heute Morgen dein Gesicht gesucht. Hat in jedes Fenster geguckt.', 'besorgt'),
      L(O, 'Ich hab ihr mein Gesicht gezeigt. Ganz nah. Das wollte sie nicht sehen. Ist abgedreht. Ich bin achtundsiebzig, ich hab ein Gesicht, vor dem Maschinen fliehen.', 'signatur'),
      N('Hinter ihr steht Opa Blech, der alte Sicherheitsroboter, und dreht langsam den Kopf zum Fenster. „UNBEFUGTE … DROHNE. ICH … MISSBILLIGE.“'),
    ], {
      effects: [{ markSeen: 'oma-volt-a2-bruch' }],
      choices: [
        { text: '„Was war los in der Gasse?“', next: 'gasse' },
        { text: '„Danke, Oma. Ich schulde dir was.“', next: 'schulde' },
        verstecken,
      ],
    }),
    node('gasse', [
      L(O, 'Razzia. Ordnungsdienst, Quantum-Leute, alle in Glanzjacken. Haben das High Voltage angestarrt wie einen Kuchen, den man nicht essen darf. Hunter stand in der Tür und hat gegrinst. Das hat sie mehr geärgert als alles andere.', 'wut'),
      L(O, 'Und Paul hat ihnen Kaffee gebracht. Ungefragt. Mit Untertasse. Ich hab mich so geschämt, ich hätte ihm die Untertasse um die Ohren hauen können.'),
    ]),
    node('schulde', [L(O, 'Tust du. Du zahlst in Geschichten. Und du bringst die Kleinen heil durch das alles. Und die verrückte Crew. Dann sind wir quitt.', 'zaertlich')], { effects: [herz(O, 10)] }),
    node('versteck', [
      N('Oma Volt hebt eine Plane hinter dem Kiosk an. Dahinter: Kisten mit Kaugummi, Batterien, Nähgarn und ein Klappstuhl. Du sitzt eine Stunde im Dunkeln und hörst, wie draußen eine Streife fragt, ob sie dich gesehen hat.'),
      L(O, '(draußen) Gesehen? Ich seh gar nix mehr, junger Mann, ich bin achtundsiebzig. Wollen Sie ein Kaugummi? Zwei Credits. Nein? Dann gehen Sie mir aus der Sonne.', 'signatur'),
      N('Die Streife geht. Als du rauskommst, drückt Oma Volt dir eine Blitzbrause in die Hand.'),
    ]),
  ]),

  dlg('oma-volt-a2-tag', [
    node('a', [
      N('Vor dem Volt-Eck steht ein Chrome-10-Stand mit lila Ballons. Ein lächelnder Promoter verteilt Gratis-Chips. Oma Volt starrt ihn durch die Scheibe an, als wolle sie ihn mit Blicken entlöten.'),
      L(O, 'Gratis-Chips! Und ich verkauf Kaugummi für zwei Credits. Ich bin ruiniert, Kindchen. Ruiniert! … Na gut, nicht ganz. Die Leute mit Chip kaufen keinen Kaugummi mehr. Die Leute ohne Chip kaufen doppelt. Aus Trotz.', 'wut'),
    ], {
      choices: [
        kiosk,
        { text: '„Wie geht’s Paul?“', when: PAUL_AKTIV, next: 'paul-aktiv' },
        { text: '„Wie geht’s Paul?“', when: PAUL_GERETTET, next: 'paul-gut', id: 'paul-gut' },
        { text: '„Was macht Opa Blech?“', when: { flag: 'opa_blech_kioskwaechter' }, next: 'blech' },
        verstecken,
        { text: '„Bis dann, Oma.“', effects: [herz(O, 5)] },
      ],
    }),
    node('paul-aktiv', [
      L(O, 'Er hat heute die Regale nach Farben sortiert. Und mir gesagt, mein Rabattsystem sei „suboptimal“. SUBOPTIMAL. Ich hab ihm das Wort zurück in den Mund gestopft. Mit Lakritz.', 'wut'),
      L(O, 'Find raus, was die mit ihm gemacht haben. Bitte. Er ist ein Idiot, aber er ist meiner.'),
    ]),
    node('paul-gut', [
      L(O, 'Er hat mich heute angeschnauzt! Weil ich ihm die Mütze zu tief ins Gesicht gezogen hab! Angeschnauzt!', 'freude'),
      L(O, 'Ich hab geweint vor Glück. Er hat gedacht, ich bin krank. Ich hab ihn nochmal angeschnauzt, damit er’s versteht.'),
    ]),
    node('blech', [
      N('Opa Blech steht neben der Tür und hält einen Regenschirm wie eine Hellebarde. Als ein Chrome-10-Ballon vorbeitreibt, sticht er hinein. Plopp.'),
      L(O, 'Er hat heute elf Ballons erledigt. Er zählt mit. Er ist stolz. Ich hab ihm einen Orden aus einem Kronkorken gemacht.', 'signatur'),
    ]),
    node('versteck', [
      N('Eine Stunde hinter der Plane, zwischen Kaugummikisten und Nähgarn. Draußen fragt eine Streife nach dir. Oma Volt fragt zurück, ob die Streife eine Mutter hat und ob die weiß, wie sie redet.'),
      N('Die Streife geht. Schneller als gekommen.'),
    ]),
  ]),

  dlg('oma-volt-paul-zurueck', [
    node('a', [
      L(O, 'Kindchen. Komm her. Nein, näher. Ich will dich drücken, und ich hab kurze Arme.', 'zaertlich'),
      N('Sie drückt dich über den Tresen hinweg. Es riecht nach Lakritz, Maschinenöl und Kölnisch Wasser von vor dreißig Jahren.'),
      L(O, 'Paul ist wieder Paul. Faul, frech, futtert mir die Schokoriegel weg. Er hat gestern „Scheiße“ gesagt, als er sich den Zeh gestoßen hat. Das schönste Wort, das ich seit Wochen gehört hab.', 'freude'),
    ], {
      effects: [{ markSeen: 'oma-volt-paul-zurueck' }, herz(O, 40)],
      choices: [
        { text: '„Gern geschehen, Oma.“', next: 'gern' },
        { text: '„Er ist nicht der Einzige. Es gibt noch viele da draußen.“', next: 'viele' },
      ],
    }),
    node('gern', [L(O, 'Gern geschehen. So. Und ab heute kriegst du bei mir Prozente. Fünf. Sag’s nicht weiter, sonst wollen alle fünf, und dann bin ich wirklich ruiniert.', 'signatur')]),
    node('viele', [
      L(O, 'Ich weiß. Ich seh sie jeden Tag. Mit diesem Glitzer im Nacken und dem Lächeln, das nicht bis zu den Augen geht.', 'besorgt'),
      L(O, 'Dann holt sie halt alle zurück. Ihr habt’s bei Paul geschafft. Und Paul ist das schwierigste Kind, das ich kenne. Außer Hunter früher.'),
    ]),
  ]),

  dlg('oma-volt-a2-party', [
    node('a', [
      L(O, 'Ich hab’s gehört. Releaseparty. Ihr wollt da rein. Im Anzug. Mit Lügen in den Taschen.', 'besorgt'),
      L(O, 'Zeig mal, was du anziehen willst. Nein, nicht beschreiben, ich will’s sehen. … Ach, das hat Gina gemacht? Schön. Teuer. Aber keine einzige gescheite Tasche dran. Diese Modeleute.', 'wut'),
      N('Sie greift nach Nadel und Faden und hat, bevor du protestieren kannst, schon den Saum deiner Jacke umgeschlagen. Drei Stiche. Zehn. Fertig.'),
      L(O, 'Geheimtasche. Innen. Da passt ein Stick rein oder ein Dietrich oder eine Nougatbombe. Hat meine Großmutter für Großvater genäht, als er Schmuggler war. Er wurde nie erwischt. Jedenfalls nicht wegen der Tasche.', 'signatur'),
    ], {
      effects: [
        { markSeen: 'oma-volt-a2-party' },
        { checkBuff: { id: 'buff-oma-geheimtasche', label: 'Oma Volts Geheimtasche', value: 1, attribute: 'reflexe', consumes: true } },
      ],
      choices: [
        { text: '„Oma, du bist die Beste.“', next: 'beste' },
        { text: '„War dein Großvater wirklich Schmuggler?“', next: 'opa' },
      ],
    }),
    node('beste', [L(O, 'Weiß ich. Und jetzt raus mit dir, bevor ich anfange zu heulen und dir die Tasche vollschnäuze.', 'zaertlich')], { effects: [herz(O, 10)] }),
    node('opa', [L(O, 'Schmuggler, Dichter, Fahrradmechaniker. Je nachdem, wen man gefragt hat. Ich hab nie gefragt. Ich hab nur die Taschen geflickt.', 'signatur')], { effects: [herz(O, 5)] }),
  ]),

  dlg('oma-volt-a2-nervoes', [
    node('a', [
      L(O, 'Du siehst aus, als hättest du seit drei Tagen nicht geschlafen. Hier. Blitzbrause. Großmutters Rezept. Weckt Tote und beruhigt Lebende. Je nachdem, wie man sie schüttelt.', 'besorgt'),
    ], {
      choices: [
        { text: '(Trinken.)', when: { notFlag: 'heute_oma_brause' }, effects: [{ setFlag: 'heute_oma_brause' }, { heal: 25 }, herz(O, 5)], next: 'trinken' },
        kiosk,
        verstecken,
      ],
    }),
    node('trinken', [
      N('Die Blitzbrause prickelt bis in die Haarspitzen. Kurz siehst du Funken. Dann ist der Kopf klar.'),
      L(O, 'Siehst du. Und jetzt mach, dass du die Welt rettest. Und sei um zehn zurück. Na gut, um zwölf. Na gut, irgendwann.', 'zaertlich'),
    ]),
    node('versteck', [N('Die Plane, die Kisten, eine Stunde Dunkelheit. Die Streife zieht weiter. Oma Volt summt die ganze Zeit ein Lied von 2040 und tut so, als würde sie Inventur machen.')]),
  ]),

  // ------------------------------------------------------------------------------------------- Akt 3
  dlg('oma-volt-partynacht', [
    node('a', [
      N('Das Volt-Eck hat noch offen, obwohl es spät ist. Der kleine Fernseher auf dem Tresen zeigt die Releaseparty. Die halbe Gasse steht davor und guckt mit. Oma Volt verkauft Kaugummi und kommentiert jede Einstellung.'),
      L(O, 'Guck dir die an, die in Gold. Sybella. Die trägt ein Kleid, da ist mehr Geld dran als an der ganzen Gasse. Und keine einzige Tasche.', 'wut'),
      L(O, 'Pass auf dich auf da oben, Kindchen. Und wenn’s brenzlig wird: Geheimtasche.', 'besorgt'),
    ]),
  ]),

  // ------------------------------------------------------------------------------------------- Nachspiel
  dlg('oma-volt-nachspiel', [
    node('a', [
      L(O, 'Da ist es ja! Das Kind, das die Stadt umgekrempelt hat! Komm her, ich muss dich kneifen, damit ich weiß, dass du echt bist.', 'freude'),
      N('Sie kneift dich in die Wange. Fest.'),
    ], {
      effects: [{ markSeen: 'oma-volt-nachspiel' }, herz(O, 20)],
      choices: [
        { text: '„Die Bildschirme sind aus, Oma.“', when: ENDE_MEER, next: 'meer' },
        { text: '„Nexus ist jetzt eine Helfer-KI.“', when: ENDE_NEXUS, next: 'nexus' },
        { text: '„Ich bin wieder übers Dach gelaufen, Oma. Über deins.“', tag: '[Vex]', when: VEX, next: 'vex' },
        { text: '„Wie geht’s der Gasse?“', next: 'gasse' },
      ],
    }),
    node('vex', [
      L(O, 'Ich weiß. Ich hab’s gehört. Es hat gescheppert, und ein Ziegel liegt jetzt in meinem Kaugummiregal. Ich hab ihn behalten. Als Andenken.', 'signatur'),
      L(O, 'Früher hast du auf meinem Dach geheult, wenn du keinen Auftrag hattest. Jetzt rennst du drüber, als würd’s dir gehören. Das ist besser. Lauter, aber besser.', 'zaertlich'),
    ], { effects: [herz(O, 10)], next: 'gasse' }),
    node('meer', [
      L(O, 'Aus! Alle! Die Werbung über meinem Kiosk ist schwarz. Ich seh zum ersten Mal seit Jahren die Wand gegenüber. Die ist hässlich. Ich liebe sie.', 'freude'),
      L(O, 'Und ihr wart am Meer, hab ich gehört. Ich war seit 2049 nicht am Meer. Da war es noch nicht so weit weg. Oder ich war schneller.'),
    ], {
      choices: [
        { text: '„Komm mit, Oma. Samstag. Ich hol dich ab.“', effects: [{ setFlag: 'oma_volt_meer_dabei' }, herz(O, 30)], next: 'samstag' },
        { text: '„Irgendwann fahr ich dich hin.“', next: 'gasse' },
      ],
    }),
    node('samstag', [
      L(O, 'Samstag? Da ist Hauptgeschäft! … Ach, scheiß aufs Geschäft. Opa Blech macht den Kiosk. Der kann Kaugummi verkaufen. Er kann nur nicht rausgeben. Das wird ein Spaß.', 'freude'),
    ], { next: 'gasse' }),
    node('nexus', [
      L(O, 'Die KI hat bei mir Kaugummi bestellt. Per Drohne. Die Drohne hat „Bitte“ gesagt. Und „Danke“. Und hat Trinkgeld gegeben.', 'ueberrascht'),
      L(O, 'Ich hab ihr Rabatt gegeben. Bin ich jetzt verrückt? Ich glaub, ich bin verrückt. Aber freundlich verrückt. Wie Bruder Kabellos, nur mit Kiosk.'),
    ], {
      choices: [
        { text: '„Samstag fahren wir ans Meer. Kommst du mit?“', effects: [{ setFlag: 'oma_volt_meer_dabei' }, herz(O, 30)], next: 'samstag' },
        { text: '„Und die Gasse?“', next: 'gasse' },
      ],
    }),
    node('gasse', [
      L(O, 'Laut. Dreckig. Frech. Die Leute fluchen wieder, die Kinder klauen wieder Pfandflaschen, Mixi hat einen Rostzahn mit der Lampe verdroschen. Alles wieder normal. Endlich.', 'zaertlich'),
    ]),
  ]),

  dlg('oma-volt-nachspiel-tag', [
    node('a', [
      N('Über dem Volt-Eck hängt das alte Quantum-Plakat immer noch verkehrt herum. Darunter hat Oma Volt geschrieben: „DAS WAR NIX.“'),
      L(O, 'Na, Kindchen? Was darf’s sein? Für Heldinnen und Helden gibt’s Kaugummi zum Normalpreis. Das ist die höchste Ehre, die ich vergebe.', 'signatur'),
    ], {
      choices: [
        kiosk,
        { text: '„Wie war das Meer, Oma?“', when: OMA_MEER, next: 'meer' },
        { text: '„Erzähl mir was von früher.“', next: 'frueher' },
        { text: '„Bis dann, Oma.“', effects: [herz(O, 5)] },
      ],
    }),
    node('meer', [
      L(O, 'Nass. Und groß. Ich hab die Füße reingehalten und geschrien. Vor Kälte. Dann vor Freude. Dann wieder vor Kälte. Opa Blech hat derweil vierzig Kaugummis verkauft und nichts rausgegeben. Bester Samstag seit Jahren.', 'freude'),
    ]),
    node('frueher', [
      L(O, 'Früher? Früher hat die Gasse auch geleuchtet. Aber nicht in Lila. In allen Farben, durcheinander, wie ein Kind sie malt. Jeder hatte sein eigenes Schild. Hässlich. Wunderschön.', 'zaertlich'),
      L(O, 'Jetzt ist es wieder so. Bisschen. Sag den Kleinen, sie sollen mehr Neonkreide nehmen. Die Wände brauchen Farbe.'),
    ]),
  ]),

  dlg('oma-volt-meer', [
    node('a', [
      N('Im Dünengras steht ein Klappstuhl. Darauf sitzt Oma Volt, einen Sonnenhut auf dem Kopf, die Strickjacke trotzdem zugeknöpft, und strickt. Neben ihr steht eine Kühlbox. Darin: Blitzbrause.'),
      L(O, 'Setz dich, Kindchen. Ich stricke einen Schal für Karl, den Krebs. Er friert bestimmt. Er sagt nichts, aber er guckt so.', 'zaertlich'),
    ], {
      choices: [
        { text: '(Eine Blitzbrause nehmen.)', when: { notFlag: 'heute_oma_brause' }, effects: [{ setFlag: 'heute_oma_brause' }, { heal: 25 }, herz(O, 5)], next: 'brause' },
        { text: '„Ist es so, wie du es in Erinnerung hattest?“', next: 'erinnerung' },
      ],
    }),
    node('brause', [L(O, 'Zum Wohl. Am Meer schmeckt die noch besser. Das liegt am Salz. Oder an der Gesellschaft.', 'freude')]),
    node('erinnerung', [
      L(O, 'Nein. Es ist schöner. 2049 war ich hier mit meinem Mann. Er hat die ganze Zeit über den Sand geschimpft. Wie Gustav. Alle Männer schimpfen über Sand.', 'trauer'),
      L(O, 'Heute schimpft keiner. Heute sind nur die Möwen frech. Das ist gut so. Das ist genau richtig.'),
    ], { effects: [herz(O, 10)] }),
  ]),

  dlg('oma-volt-master', [
    node('a', [
      N('Am Volt-Eck hängt ein neues Schild, mit Nadel und Faden aufs Fliegengitter gestickt: „FÜR MASTER GESCHLOSSEN“.'),
      L(O, 'Ich hab dich Kindchen genannt. Jahrelang. Ich hab dir Kaugummi geschenkt, dir die Jacke geflickt, dich hinter meinen Kisten versteckt.', 'wut'),
      L(O, 'Und jetzt redet Paul wieder wie ein Toaster. Wegen dir. Für dich hab ich nur noch die Rechnung. Und die bezahlst du nicht mit Geld.'),
    ], {
      choices: [
        { text: '„Oma …“', next: 'oma' },
        { text: '(Gehen.)' },
      ],
    }),
    node('oma', [
      L(O, 'Nichts „Oma“. Oma ist für Leute, die nach Hause kommen. Wenn du das wieder lernst, weißt du, wo der Kiosk ist. Der läuft nicht weg. Ich auch nicht. Ich bin zu alt zum Weglaufen.', 'trauer'),
    ]),
  ]),

  dlg('oma-volt-3b', [
    node('a', [
      N('Das gestickte Schild hängt noch am Fliegengitter. Ein Faden ist aufgetrennt. Statt „FÜR MASTER GESCHLOSSEN“ steht da jetzt „FÜR MASTER GESCHLOSSEN … VORERST“.'),
      L(O, 'Na. Da ist es ja. Das Kind. Spät, aber da.', 'besorgt'),
      L(O, 'Paul spricht wieder normal. Er hat heute meinen Lakritz geklaut. Ich hab ihn nicht angeschrien. Ich war zu froh.'),
    ], {
      effects: [{ markSeen: 'oma-volt-3b' }],
      choices: [
        { text: '„Es tut mir leid, Oma. Wirklich.“', next: 'leid' },
        { text: '„Kann ich ein Kaugummi haben?“', next: 'kaugummi' },
      ],
    }),
    node('leid', [
      L(O, 'Leid tun ist billig, Kindchen. Das weißt du. Aber zurückkommen ist teuer. Das hast du bezahlt. Ich hab’s gesehen.', 'zaertlich'),
    ], { effects: [herz(O, 60)] }),
    node('kaugummi', [
      L(O, 'Zwei Credits. Wie immer. Für dich drei. Strafzuschlag. Ein halbes Jahr lang.', 'signatur'),
      N('Sie schiebt dir trotzdem eins rüber, ohne zu kassieren.'),
    ], { effects: [herz(O, 60)] }),
  ]),
);

export const part: ContentPart = { dialogues };
