// pers-pim-kleine-schrift · „Kleine Schrift“ (world.md §6.5, Pim, Akt 2). Auftakt he-pim-pinzette-6 setzt pim_labornotizen
// (npc-unterstadt/pim-pinzette.ts); ab Akt 2 startet die Quest von selbst. Pim erklärt am Imbiss, wo die Originale liegen.
// Nachts über den Campus zum Pausenpavillon (Laborschlüssel hinterm Kaffeeautomaten): Schleich-Minispiel, `[Technik 7]`
// Kameraschleife, Kampf gegen die Streife oder ohne Check bis zum Schichtwechsel warten. Dann Pims Werkbank im Labor,
// zum Schluss NX1-Redaktion (Nachrichtenbeitrag) und zurück zu Pim. Folge: weniger Wachen auf der Party (pim_weniger_wachen).
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  ACT2, L, MASTER, N, VEX, active, all, any, bye, byId, c, cc, chk, dlg, ding, fahndung, fight, flag, give, item, karten,
  msg, node, noFlag, noItem, not, nutze, rede, rel, schritt, set, spiel, take, time, won, zeit,
} from './_lib';

const Q = 'pers-pim-kleine-schrift';
const PIM = 'pim-pinzette';
const D = 'delya-delloraine';
const KARTE = 'p23-pim-laborschluessel';
const NOTIZ = 'p23-pim-notizen';
const AKTIV = active(Q);
const HAT_KARTE = any(item(KARTE), flag('ks_notizen'));
const HAT_NOTIZ = any(item(NOTIZ), flag('ks_gesendet'));

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 2, giver: PIM,
  title: 'Kleine Schrift',
  summary: 'Pim hat ein Jahr lang mitgeschrieben, was im Labor wirklich passiert. In einer Schrift, die man nur mit Lupe lesen kann. Die Originale liegen in ihrer Werkbank, und Quantum scannt jeden, der rausgeht. Nur nachts ist der Campus dünn besetzt.',
  autoStart: all(ACT2, flag('pim_labornotizen'), not(MASTER)),
  steps: [
    schritt('imbiss', 'Triff Pim abends am Imbiss „Lötkolben“ auf dem Schrottmarkt.', 'ks_plan', ['schrottmarkt', 'imbiss-loetkolben']),
    schritt('pausenraum', 'Hol nachts Pims Laborschlüssel aus dem Pausenpavillon (Quantum-Campus).', HAT_KARTE, ['quantum-campus', 'pausenraum'], { when: flag('ks_plan') }),
    schritt('werkbank', 'Nimm die Notizen aus Pims Werkbank (Quantum-Labor).', HAT_NOTIZ, ['quantum-labor', 'pims-werkbank'], { when: HAT_KARTE }),
    schritt('redaktion', 'Bring die Notizen in die NX1-Redaktion.', 'ks_gesendet', ['nx1-studio', 'redaktion'], { when: HAT_NOTIZ }),
    schritt('pim', 'Erzähl Pim, dass ihre Notizen gesendet werden (Imbiss, abends).', 'ks_fertig', ['schrottmarkt', 'imbiss-loetkolben'], { when: flag('ks_gesendet') }),
  ],
  reward: { xp: 380, credits: 100, relations: { [PIM]: 120, [D]: 30 }, rep: { 'nx1-medien': 10, unterstadt: 5 } },
};

const items = {
  [KARTE]: ding(KARTE, 'Pims Laborschlüssel', 'Eine Schlüsselkarte, an der ein Anhänger in Form einer Pinzette baumelt. Auf der Rückseite, winzig: „Wenn gefunden, bitte nicht benutzen. Außer du bist nett.“', 'zugangskarte-quantum'),
  [NOTIZ]: ding(NOTIZ, 'Pims Labornotizen', 'Drei Hefte, Schrift so klein, dass ein Komma eine halbe Seite ist. Dazwischen Zeichnungen von Chips, Protokolle, Uhrzeiten. Und eine Liste mit Namen, die nicht mehr nach Hause gegangen sind.', 'reporter-notizbuch'),
};

// ------------------------------------------------------------------------------------------- Pim am Imbiss
const imbiss = dlg('p23-ks-pim', [
  node('start', [
    N('Pim sitzt am Imbiss, eine Portion Lötkolben-Nudeln vor sich, die sie mit einer Pinzette isst. Nudel für Nudel.'),
    L(PIM, 'Du bist gekommen. Okay. Okay okay okay. Ich hab einen Plan. Er ist klein. Wie alles von mir.', 'besorgt'),
  ], {
    choices: [
      c('„Erzähl.“', 'plan', { when: noFlag('ks_plan') }),
      c('„Deine Notizen laufen heute Abend auf NX1.“', 'ende', { when: all(flag('ks_gesendet'), noFlag('ks_fertig')) }),
      bye('„Später.“'),
    ],
  }),
  node('plan', [
    L(PIM, 'Die Originale liegen in der Schublade unter meiner Werkbank. Doppelter Boden. Ich kann sie nicht rausbringen, der Scanner am Ausgang kennt meinen Puls. Bei Panik piept er. Ich hab immer Panik.'),
    L(PIM, 'Mein Laborschlüssel liegt nachts im Pausenpavillon, hinter dem Kaffeeautomaten. Da legen alle ihre Karten hin, wenn sie Schicht haben. Keiner zählt nach.'),
    L(PIM, 'Nachts patrouillieren zwei Wachen und eine Drohne. Um 03:12 ist Schichtwechsel. Dann ist der Campus für elf Minuten blind. Ich hab’s gezählt. Ich zähl alles.', 'signatur'),
  ], {
    choices: [
      c('„Und dann?“', 'dann'),
      c('„Warum machst du das?“', 'warum'),
    ],
  }),
  node('warum', [
    L(PIM, 'Weil die Probanden Namen haben. Ich hab sie aufgeschrieben. Klein, damit sie keiner findet. Aber wenn sie keiner findet, hat es keinen Sinn gehabt.', 'trauer'),
  ], { next: 'dann' }),
  node('dann', [
    L(PIM, 'Dann bringst du die Hefte zu Delya. Die weiß, was man damit macht. Ich weiß nur, wie man sie schreibt.'),
  ], { effects: [set('ks_plan'), msg('Nachts in den Pausenpavillon auf dem Quantum-Campus.')] }),
  node('ende', [
    L(PIM, 'Heute Abend? Auf NX1? Mit meinem Namen? … OHNE meinen Namen. Gut. Ohne ist gut.', 'ueberrascht'),
    N('Sie legt die Pinzette hin. Zum ersten Mal, seit du sie kennst, isst sie eine Nudel mit den Fingern.'),
    L(PIM, 'Morgen fragen sie im Labor, wer das war. Ich mach dann ein ganz kleines Gesicht. Darin bin ich gut.', 'freude'),
  ], {
    choices: [
      c('„Wenn sie dich rauswerfen, hast du in Dantes Werkstatt einen Platz.“', 'platz'),
      c('„Du hast was Großes gemacht, Pim. In kleiner Schrift.“', 'gross'),
      c('„Aria war auch auf so einer Liste. Danke, dass du mitgeschrieben hast.“', 'aria', { when: VEX }),
    ],
  }),
  node('platz', [L(PIM, 'Bei Dante? Da ist alles riesig und laut. … Ich bring eigene Pinzetten mit.', 'verlegen')], { effects: [set('ks_fertig'), set('pim_kleine_schrift')] }),
  node('gross', [L(PIM, 'Hör auf. Sonst werd ich rot, und dann piept irgendwo ein Scanner.', 'verlegen')], { effects: [set('ks_fertig'), set('pim_kleine_schrift')] }),
  node('aria', [
    L(PIM, 'Aria. Proband A-17. Ich hab sie gezeichnet, mit Boxhandschuhen, weil sie dem Pfleger eine verpasst hat. Das war mein Lieblingseintrag.', 'zaertlich'),
  ], { effects: [set('ks_fertig'), set('pim_kleine_schrift'), rel('aria', 20)] }),
]);

// ------------------------------------------------------------------------------------------- Pausenpavillon (nachts)
const PAUSE_OK = [give(KARTE), msg('Pims Laborschlüssel eingesteckt.')];
const pause = dlg('p23-ks-pause', [
  node('start', [
    N('Campus bei Nacht: weißes Licht auf weißem Stein, ein Rasensprenger zischt, irgendwo summt eine Drohne. Im Pausenpavillon brummt ein Kaffeeautomat. Dahinter, in einer Plastikschale: Schlüsselkarten.'),
    N('Zwei Taschenlampenkegel wandern über den Patrouillenweg. Die Drohne zieht ihre Schleife über dem Pavillon. Alle vierzig Sekunden.'),
  ], {
    choices: [
      c('Zwischen den Lichtkegeln hindurch zum Automaten.', undefined, {
        tag: '[Schleichen]',
        effects: [spiel('akt-schleichen', 3, 'p23-ks-schleichen', 'Pausenpavillon bei Nacht', [...PAUSE_OK, set('ks_lautlos')],
          [fahndung(1), msg('Ein Lichtkegel streift dich. „Hey!“ Du rennst. Nächstes Mal leiser.')])],
      }),
      cc('Am Kameramast eine Schleife einspielen: zehn Minuten leerer Pavillon in Endlosschleife.', 'schleife', chk('ks-schleife', 'technik', 7, ['hacken', 'kamera']), { effects: PAUSE_OK }),
      c('Auf die Streife warten und sie kommen lassen.', undefined, { effects: [fight('enc-campus-patrouille'), fahndung(1)] }),
      c('Nach der Prügelei die Karte aus der Schale nehmen.', 'nach-kampf', { when: won('enc-campus-patrouille'), effects: PAUSE_OK }),
      c('Hinter dem Rasensprenger hocken und auf den Schichtwechsel um 03:12 warten.', 'warten', { effects: [zeit(120), ...PAUSE_OK] }),
      bye('Zurückziehen.'),
    ],
  }),
  node('schleife', [N('Auf dem Monitor im Wachhäuschen sitzt jetzt ein leerer Pavillon, in dem ein Kaffeeautomat brummt. Er brummt sehr überzeugend. Du gehst rein, nimmst die Karte mit dem Pinzetten-Anhänger und gehst wieder.')]),
  node('nach-kampf', [N('Die Wachen schlafen auf dem Rasen. Der Rasensprenger wässert sie sorgfältig. Du nimmst die Karte mit dem Pinzetten-Anhänger.')]),
  node('warten', [
    N('Zwei Stunden. Der Sprenger zischt dir in den Nacken, eine Schnecke kriecht über deinen Schuh. Um 03:12 gehen die Taschenlampen aus, die Drohne dockt an. Elf Minuten Stille. Du brauchst vier.'),
  ]),
]);

// ------------------------------------------------------------------------------------------- Werkbank im Labor
const werkbank = dlg('p23-ks-werkbank', [
  node('start', [
    N('Pims Werkbank. Pinzetten nach Größe, Schraubenzieher nach Größe, Staubkörner vermutlich auch. Unter der Arbeitsplatte eine Schublade mit Kartenleser. Pims Karte, ein Klicken. Doppelter Boden. Drei Hefte.'),
    N('Du schlägst eins auf. Die Schrift ist so klein, dass die Buchstaben Schatten werfen. Auf der ersten Seite, groß, fast trotzig: „Proband 1: hatte Angst vor Wasser. Hatte einen Hund. Hieß Kurt.“'),
  ], {
    choices: [
      c('Die Hefte einstecken. Die Karte zurück in die Schublade.', 'raus', { effects: [give(NOTIZ), take(KARTE)] }),
      cc('Vorher den Scanner am Ausgang auf „Wartung“ stellen.', 'raus', chk('ks-scanner', 'technik', 6, ['hacken']), { effects: [give(NOTIZ), take(KARTE), set('ks_scanner_aus')] }),
    ],
  }),
  node('raus', [N('Der Ausgang piept nicht. Entweder hast du Glück, oder irgendwo im Haus sitzt jemand, der heute nicht hinsieht. Du nimmst beides.')]),
]);

// ------------------------------------------------------------------------------------------- Redaktion
const redaktion = dlg('p23-ks-redaktion', [
  node('start', [
    N('NX1-Redaktion. Bildschirme, kalter Kaffee, ein Drucker, der seit der Flut „Papierstau“ meldet. Delya sitzt mit hochgelegten Füßen da und liest einen Pressetext von Quantum, als wäre es eine Speisekarte mit Schimmel.'),
    L(D, 'Lass mich raten: Das in deiner Hand ist kein Pressetext.', 'signatur'),
    N('Sie nimmt das erste Heft, eine Lupe aus der Schublade, liest. Ihre Füße kommen vom Tisch.'),
    L(D, 'Uhrzeiten. Dosierungen. Namen. Das ist kein Gerücht, das ist ein Protokoll. Wer hat das geschrieben?', 'ueberrascht'),
  ], {
    choices: [
      c('„Jemand, der seinen Namen nicht in der Sendung hören will.“', 'quelle'),
      cc('„Bring es so, dass Quantum die Quelle nicht findet: andere Schrift, andere Daten, andere Reihenfolge.“', 'quelle', chk('ks-quelle', 'ausstrahlung', 5, ['ueberreden']), { effects: [set('ks_quelle_geschuetzt')] }),
    ],
  }),
  node('quelle', [
    L(D, 'Quellenschutz ist mein zweiter Vorname. Mein erster ist Delya, mein dritter „Ärger“. Heute Abend, zur besten Sendezeit.', 'freude'),
    L(D, 'Und Quantum wird für die nächste Woche jede zweite Wache in die Pressestelle setzen, um Dementis zu schreiben. Gut für jeden, der da drüben nachts was vorhat.'),
  ], { effects: [take(NOTIZ), set('ks_gesendet'), set('pim_weniger_wachen'), { news: 'p23-news-kleine-schrift' }] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  items,
  dialogues: byId(imbiss, pause, werkbank, redaktion),
  news: {
    'p23-news-kleine-schrift': {
      id: 'p23-news-kleine-schrift', anchor: D, headline: 'Das Protokoll in kleiner Schrift', priority: 3,
      when: flag('ks_gesendet'),
      lines: [
        L(D, 'Guten Abend, Nexus. Uns liegen Laborprotokolle von Quantum vor. Uhrzeiten, Dosierungen, Namen. Geschrieben von jemandem, der hingesehen hat, als alle anderen wegsahen.'),
        L(D, 'Proband eins hatte Angst vor Wasser und einen Hund namens Kurt. Quantum nennt ihn „Datensatz 0001“. Wir nennen ihn bei seinem Namen. Ab heute jeden Abend einen.'),
        L(D, 'Quantum hat um eine Stellungnahme gebeten. Wir haben um eine Entschuldigung gebeten. Mal sehen, wer zuerst liefert.'),
      ],
    },
  },
  mapAdditions: karten([
    ['schrottmarkt', rede('p23-ks-pim', 'imbiss-loetkolben', 'Pim: Die Labornotizen', imbiss.id,
      all(AKTIV, any(noFlag('ks_plan'), all(flag('ks_gesendet'), noFlag('ks_fertig'))), time('abend')))],
    ['quantum-campus', nutze('p23-ks-pause', 'pausenraum', 'Hinter den Kaffeeautomaten greifen', pause.id,
      all(AKTIV, flag('ks_plan'), not(HAT_KARTE), time('nacht')))],
    ['quantum-labor', nutze('p23-ks-werkbank', [1180, 800], 'Pims Schublade öffnen', werkbank.id, all(AKTIV, item(KARTE), noItem(NOTIZ)))],
    ['nx1-studio', rede('p23-ks-redaktion', 'redaktion', 'Delya Pims Notizen geben', redaktion.id, all(AKTIV, item(NOTIZ)))],
  ]),
};
