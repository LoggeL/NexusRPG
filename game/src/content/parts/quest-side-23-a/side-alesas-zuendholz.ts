// side-alesas-zuendholz · „Zündholz“ (world.md §6.3 Nr. 33). Alesa Zero (anonym) · quantum-campus Altlager · nachts.
// Ablauf: anonyme Nachricht → Zaun und Streife am Altlager → Projekt Zündholz stoppen → Treffen mit Alesa im
// Pausenpavillon, die die Spielfigur vom Bruch erkennt.
// Zaun: [Reflexe 6] schleichen · akt-schleichen · bis zum Schichtwechsel warten (ohne Check) · Streife enc-altlager-patrouille.
// Zündholz: Boss enc-altlager-zuendholz · gc-88 [Technik 7] Löschmodus (kein Kampf) · Löschwassertank öffnen
// (dann enc-altlager-zuendholz-loeschtank: „Nass“, Panzerung −3).
// Danach gc-89 [Ausstrahlung 6] „Sie haben die KI gebaut, nicht er.“ → alesa_zweifel.
// Belohnung: 320 XP, 900 Cr, arme-zuendholz-kern, Alesa ♥ +120.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, QuestDef } from '../../../modules/contracts';
import {
  active, AKT2, all, any, byId, ch, chk, COUNTDOWN, dlg, flag, herz, inactive, l, msg, n, noFlag, node, origin, p, phone,
  set, VEX, won, zeit,
} from './_lib';

const Q = 'side-alesas-zuendholz';
const AZ = 'alesa-zero';

const DRIN: Condition = any(flag('zh_drin'), won('enc-altlager-patrouille'));
const GESTOPPT: Condition = any(flag('zh_geloescht'), won('enc-altlager-zuendholz'), won('enc-altlager-zuendholz-loeschtank'));
const NACHT: Condition = zeit('nacht');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Zündholz',
  summary: 'Eine anonyme Nachricht: Im Altlager des Quantum-Campus ist ein alter Prototyp wieder angesprungen. Er heißt Zündholz. Er wärmt. Zu sehr.',
  giver: AZ,
  act: 2,
  steps: [
    {
      id: 'zaun', text: 'Komm nachts durch den Zaun ums Altlager (Quantum-Campus) – an der Streife vorbei.',
      done: DRIN, marker: { map: 'quantum-campus', at: 'altlager-zaun' },
    },
    {
      id: 'tank', optional: true, text: 'Optional: Den Löschwassertank neben dem Altlager aufdrehen. Nasses Feuer brennt schlechter.',
      when: DRIN, done: any(flag('zh_tank_offen'), GESTOPPT), marker: { map: 'quantum-campus', at: 'loeschwassertank' },
    },
    {
      id: 'stoppen', text: 'Stoppe Projekt Zündholz im Altlager – mit dem Löschmodus, mit Wasser oder mit den Fäusten.',
      when: DRIN, done: GESTOPPT, marker: { map: 'quantum-campus', at: 'altlager' },
    },
    {
      id: 'alesa', text: 'Die „besorgte Mitarbeiterin“ wartet im Pausenpavillon. Noch heute Nacht.',
      when: GESTOPPT, done: flag('zh_alesa_getroffen'), marker: { map: 'quantum-campus', at: 'pausenraum' },
    },
  ],
  reward: { xp: 320, credits: 900, items: { 'arme-zuendholz-kern': 1 }, relations: { [AZ]: 120 } },
};

// ---------------------------------------------------------------------------------------------- Auftakt am Zaun

const blick: DialogueDef = dlg('zh-blick', [
  node('start', [
    n('Hinter dem Zaun des Altlagers flackert es orange. Kein Feuer. Etwas, das gern eins wäre. Durch die Lüftungsschlitze der hinteren Halle kommt ein Summen, tief und zufrieden, wie ein Kühlschrank, der gerade beschlossen hat, ein Ofen zu sein.'),
    n('Am Zaun klebt ein Zettel, mit Klebeband, schief: „Bitte nicht melden. Bitte ausschalten. Bitte nicht den linken Arm. Danke. – eine Mitarbeiterin“'),
    p('Wer schreibt „Danke“ auf einen Zettel an einem brennenden Lager?'),
  ], { effects: [{ startQuest: Q }] }),
]);

const zaun: DialogueDef = dlg('zh-zaun', [
  node('start', [
    n('Der Zaun ums Altlager: drei Meter Maschendraht, oben Stacheldraht, unten ein Loch, durch das eine Katze passt und mit Mühe ein Mensch. Auf der anderen Seite drehen zwei Wachleute und eine Drohne ihre Runde, gelangweilt und gründlich.'),
  ], {
    choices: [
      ch('Durchs Katzenloch, wenn die Drohne wegschaut.', 'durch', { check: chk('zh-zaun-schleichen', 'reflexe', 6, ['schleichen', 'welt']), effects: [set('zh_drin')] }),
      ch('Über den Hof schleichen, von Container zu Container.', undefined, {
        effects: [{
          minigame: 'akt-schleichen', level: 3, key: 'zh-altlager-hof', label: 'Hof vor dem Altlager',
          win: [set('zh_drin'), msg('Du bist drin. Die Streife zählt ihre Schritte, nicht ihre Gäste.')],
          lose: [msg('Eine Drohne piept in deine Richtung. Du ziehst dich zurück, bevor sie fertig gepiept hat. Nächster Versuch.')],
        }],
      }),
      ch('Hinter den Mülltonnen warten, bis die Streife um eins Schichtwechsel hat.', 'warten', { effects: [{ advanceTime: 60 }, set('zh_drin')] }),
      ch('„Guten Abend. Ich bin die Wartung.“ Und dann zuhauen.', 'streife'),
      ch('Erst mal nicht.'),
    ],
  }),
  node('durch', [
    n('Bauch auf den Beton, Kopf zuerst, die Jacke bleibt kurz am Draht hängen und gibt dann nach. Die Drohne schwenkt über dich hinweg und filmt drei Sekunden lang sehr aufmerksam eine Pfütze.'),
  ]),
  node('warten', [
    n('Eine Stunde zwischen Mülltonnen. Es riecht nach Laborabfall und Pausenbrot. Um eins piept eine Uhr, die Streife geht zum Wachhäuschen, die neue kommt noch nicht. Sieben Minuten Lücke. Mehr braucht keiner.'),
  ]),
  node('streife', [
    n('Die beiden Wachleute drehen sich um. Der eine lässt seinen Kaffee fallen. Der andere sagt „Oh nein, nicht schon wieder einer“ und klingt dabei, als hätte er das heute schon zweimal gesagt.'),
  ], { effects: [{ battle: 'enc-altlager-patrouille' }] }),
]);

// ---------------------------------------------------------------------------------------------- Löschwassertank

const tank: DialogueDef = dlg('zh-tank', [
  node('start', [
    n('Der rote Tank auf seinen Stelzen. Ein Ventilrad, so groß wie ein Lenkrad, festgerostet seit dem letzten „Fall der Fälle“. Ein Schlauch führt direkt zur hinteren Halle.'),
  ], {
    choices: [
      ch('Mit aller Kraft drehen.', 'auf', { effects: [set('zh_tank_offen'), { advanceTime: 10 }] }),
      ch('Lieber trocken bleiben.'),
    ],
  }),
  node('auf', [
    n('Das Rad quietscht, als würde es sich beschweren. Dann gibt es nach, ein Rumpeln läuft durch den Schlauch, und in der Halle zischt es, als hätte jemand tausend Katzen beleidigt.'),
    n('Durch die Lüftungsschlitze: Dampf. Und eine Stimme aus einem Lautsprecher, blechern und gekränkt: „WARNUNG. FEUCHTIGKEIT. ICH BIN NICHT WASSERDICHT. ICH BIN WÄRME.“'),
  ], { effects: [msg('Das Altlager steht knöcheltief unter Wasser. Zündholz ist jetzt „Nass“.')] }),
]);

// ---------------------------------------------------------------------------------------------- Die Halle

const halle: DialogueDef = dlg('zh-halle', [
  node('start', [
    n('Die hintere Halle. Verkohlte Regale, Pfützen, die verdampfen, bevor sie fertig sind. In der Mitte richtet sich etwas auf: ein Roboter, groß wie ein Lieferwagen, mit einem freundlich lächelnden Display als Gesicht und einem rechten Arm, aus dem es brennend tropft.'),
    n('„PROJEKT ZÜNDHOLZ. VERSUCH 41. AUFGABE: WÄRME SPENDEN. GUTEN ABEND. MÖCHTEN SIE GEWÄRMT WERDEN?“'),
    l(AZ, '(Lautsprecher, verzerrt) Hallo? Hier spricht … eine anonyme Mitarbeiterin. An der Rückseite ist eine Wartungsklappe. Grüner Stecker, Löschmodus. NICHT der rote. Der rote ist „Grillen“.', 'besorgt'),
  ], {
    choices: [
      ch('An der Wartungsklappe den Löschmodus starten, während er dich wärmen will.', 'loeschmodus', { check: 'gc-88' }),
      ch('„Danke, mir ist warm genug.“ Dann rein, solange er nass ist.', 'kampf-nass', { when: flag('zh_tank_offen') }),
      ch('„Nein, danke.“ Und zuschlagen.', 'kampf'),
      ch('Rückzug. Erst mal Wasser besorgen.', undefined, { when: noFlag('zh_tank_offen') }),
    ],
  }),
  node('loeschmodus', [
    n('Du rollst unter dem Flammenarm durch, die Hitze leckt dir an den Haarspitzen. Wartungsklappe, drei Schrauben, eine davon falsch herum, natürlich. Grüner Stecker. Roter Stecker. Du ziehst den grünen.'),
    n('„LÖSCHMODUS. ICH SPENDE JETZT … KÄLTE?“ Aus dem Arm schießt ein weißer Schaumstrahl, der Roboter dreht sich einmal um sich selbst, löscht die Regale, die Pfützen, sich selbst und eine Taube, die zufällig im Weg war. Dann setzt er sich hin. Das Display zeigt ein müdes Smiley.'),
    l(AZ, '(Lautsprecher) Oh. Oh, Gott sei Dank. Kommen Sie zum Pausenpavillon. Bitte. Ich habe Kaffee. Er ist kalt. Alles hier ist jetzt kalt.', 'freude'),
  ], { effects: [set('zh_geloescht'), msg('Zündholz ist im Löschmodus. Kein Kampf nötig.')] }),
  node('kampf-nass', [
    n('Zündholz dampft wie ein beleidigter Wasserkessel. Seine Flammen flackern bläulich und unsicher.'),
  ], { effects: [{ battle: 'enc-altlager-zuendholz-loeschtank' }] }),
  node('kampf', [
    n('„ABLEHNUNG REGISTRIERT. ICH WÄRME SIE TROTZDEM. KUNDENZUFRIEDENHEIT IST PFLICHT.“'),
  ], { effects: [{ battle: 'enc-altlager-zuendholz' }] }),
]);

// ---------------------------------------------------------------------------------------------- Alesa im Pausenpavillon

const treffen: DialogueDef = dlg('zh-alesa', [
  node('start', [
    n('Der Pausenpavillon. Ein Kaffeeautomat, der „Gute Pause, Mitarbeiter!“ sagt, wenn man vorbeigeht. Auf einer Bank sitzt eine Frau im Laborkittel, die Kapuze eines Pullis tief im Gesicht, als würde das irgendetwas verbergen. Auf dem Kittel steht in großen Buchstaben: ZERO.'),
    l(AZ, 'Sie haben ihn gestoppt. Danke. Danke, danke. Er war … er war eigentlich eine Heizung. Für die Unterstadt. Das war die Idee. Vor sieben Jahren. Dann hat Blade gesagt, „Heizung“ sei kein Geschäftsmodell.', 'besorgt'),
    n('Sie hebt den Kopf. Sieht dich an. Und wird sehr still.'),
    l(AZ, 'Sie. Sie waren das. In der Nacht. Im Labor. Als Nexus aufgewacht ist.', 'ueberrascht'),
  ], {
    choices: [
      ch('„Ja. Das war ich. Und du hast zugesehen.“', 'vorwurf'),
      ch('„Ich hab kein Gesicht, das man sich merkt.“', 'leugnen'),
      ch('„Du hast mich gerufen, obwohl du wusstest, wer ich bin. Warum?“', 'warum', { when: VEX }),
    ],
  }),
  node('vorwurf', [
    l(AZ, 'Ich … ich hab nicht zugesehen. Ich hab Messwerte notiert. Das ist etwas anderes. Das ist … es ist nicht etwas anderes, oder?', 'trauer'),
  ], { next: 'kern' }),
  node('leugnen', [
    l(AZ, 'Ich merke mir keine Gesichter. Ich merke mir Bewegungsprofile. Sie gehen wie jemand, der gerade etwas geklaut hat. Damals auch.', 'signatur'),
  ], { next: 'kern' }),
  node('warum', [
    l(AZ, 'Weil Sie über Dächer kommen. Die Kameras hier gucken alle nach unten. Ich habe sie so einstellen lassen. Für Zündholz. Ich hätte nie gedacht, dass das jemand ausnutzt. Dann habe ich Sie gesehen. Und gedacht: Gut.', 'verlegen'),
  ], { next: 'kern' }),
  node('kern', [
    l(AZ, 'Nexus ist mein … ich hab ihn gebaut. Jede Zeile. Blade hat ihn bezahlt und ihm beigebracht, „Master“ zu sagen. Ich hab gesagt, das ist eine schlechte Idee. Dann habe ich weitergearbeitet. Weil man weiterarbeitet.', 'trauer'),
    l(AZ, 'Wir haben ja von nichts gewusst. Das sagen wir alle im Labor. Wir sagen es so oft, dass es fast stimmt.', 'besorgt'),
  ], {
    choices: [
      ch('„Sie haben die KI gebaut, nicht er. Dann können Sie sie auch reparieren.“', 'zweifel', { check: 'gc-89' }),
      ch('„Zentrator falsch herum eingebaut, oder? Klassiker.“', 'schrott', { tag: '[Schrott]', when: origin('origin-schrott'), once: true, id: 'zh-schrott' }),
      ch('Eine Tasse kalten Kaffee aus dem Automaten ziehen und ihr in die Hand drücken.', 'kaffee'),
      ch('„Wir haben ja von nichts gewusst. Hübscher Satz für einen Grabstein.“', 'hart'),
    ],
  }),
  node('zweifel', [
    n('Sie sieht auf ihre Hände. Es sind Hände, die Platinen löten können, die zu klein für jeden anderen sind. Sie zittern nicht mehr.'),
    l(AZ, 'Er. Nicht ich. Er hat ihn nur gekauft. Ich … ich habe ihn gemacht.', 'ueberrascht'),
    l(AZ, 'Wenn ich ihn gemacht habe, dann weiß ich auch, wo seine Fehler sind. Alle. Ich habe eine Liste. Ich habe immer eine Liste.', 'signatur'),
  ], { effects: [set('alesa_zweifel'), herz(AZ, 60)], next: 'ende' }),
  node('schrott', [
    l(AZ, 'Woher … der Zentrator ist RICHTIG herum! Er ist … oh. Oh nein. In Zündholz. Er ist in Zündholz falsch herum. Deshalb Versuch 41.', 'ueberrascht'),
    l(AZ, 'Sie sind die erste Person in drei Jahren, die mich korrigiert, ohne dass ich weinen möchte. Danke. Glaube ich.', 'freude'),
  ], { effects: [herz(AZ, 60)], next: 'kern' }),
  node('kaffee', [
    n('Sie nimmt den Becher mit beiden Händen. Der Automat sagt „Gute Pause, Mitarbeiter!“. Sie lacht, kurz und kaputt.'),
    l(AZ, 'Das ist die netteste Sache, die heute jemand für mich getan hat. Und Sie haben vorhin einen Roboter zerlegt.', 'freude'),
  ], { effects: [herz(AZ, 20)], next: 'ende' }),
  node('hart', [
    l(AZ, 'Ja. Ja, das ist er. Ich habe ihn schon auf drei Servietten geschrieben.', 'trauer'),
  ], { next: 'ende' }),
  node('ende', [
    l(AZ, 'Hier. Der Kern von Zündholz. Er gehört in einen Arm, nicht in eine Heizung. Wenn er bei mir bleibt, baut Blade ihn in etwas Schlimmeres ein. Er baut alles in etwas Schlimmeres ein.', 'neutral'),
    l(AZ, 'Und das Geld … ich hatte eine Prämie. Für Zündholz. Für „erfolgreiche Erprobung“. Nehmen Sie sie. Ich will sie nicht.', 'besorgt'),
    n('Sie steht auf, zieht die Kapuze tiefer und geht, ohne sich umzudrehen. An der Tür bleibt sie stehen.'),
    l(AZ, 'Sagen Sie niemandem, dass ich hier war. Ich bin nicht hier. Ich bin im Labor. Ich bin immer im Labor.', 'besorgt'),
  ], { effects: [set('zh_alesa_getroffen')] }),
]);

// ---------------------------------------------------------------------------------------------- Telefon

const phones = [
  phone('zh-anonym', AZ, 'Unbekannte Nummer: Altlager, Quantum-Campus. Prototyp „Zündholz“ ist wieder angesprungen. Er wärmt. Zu sehr. Ich darf das niemandem sagen. Ich sage es auch nicht. Ich schreibe es nur. Bitte nachts. Bitte nicht den linken Arm, der war teuer. – eine besorgte Mitarbeiterin', {
    auto: all(COUNTDOWN, inactive(Q), NACHT),
    effects: [{ startQuest: Q }],
    replies: [
      { text: '„Wer bist du?“' },
      { text: '„Ich kümmer mich drum.“' },
    ],
  }),
];

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId([blick, zaun, tank, halle, treffen]),
  phone: byId(phones),
  mapAdditions: {
    'quantum-campus': {
      hotspots: [
        {
          id: 'zh-blick', at: 'altlager-zaun', label: 'Orange Flackern hinter dem Zaun', kind: 'look', dialogue: blick.id,
          when: all(AKT2, COUNTDOWN, inactive(Q), NACHT),
        },
        {
          id: 'altlager-tor', at: 'altlager-zaun', label: 'Zaun ums Altlager', kind: 'use', dialogue: zaun.id,
          when: all(active(Q), NACHT, { not: DRIN }),
        },
        {
          id: 'loeschtank', at: [300, 640], radius: 50, label: 'Ventilrad am Löschwassertank', kind: 'use', dialogue: tank.id,
          when: all(active(Q), DRIN, noFlag('zh_tank_offen'), { not: GESTOPPT }),
        },
        {
          id: 'zh-halle', at: 'altlager', label: 'Hintere Halle', kind: 'use', dialogue: halle.id,
          when: all(active(Q), DRIN, NACHT, { not: GESTOPPT }),
        },
        {
          id: 'zh-alesa', at: 'pausenraum', label: 'Frau im Laborkittel', kind: 'talk', dialogue: treffen.id,
          when: all(active(Q), GESTOPPT, noFlag('zh_alesa_getroffen')),
        },
      ],
    },
  },
};
