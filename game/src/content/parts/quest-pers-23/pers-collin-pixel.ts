// pers-collin-pixel · „Pixel-Pete“ (world.md §6.5, Collin ♥6, Akt 2). Ersetzt den Platzhalter aus parts/integration/luecken.ts.
// Start: he-collin-charleston-6 (npc-medien-club) startet die Quest direkt; wer dort „später“ sagt, bekommt sie ab Akt 2
// automatisch (Flag collin_pete_angst). Ablauf: Petes Testsendung in der NX-1-Regie (Quellcode `[Technik 6]` oder Rohmaterial
// vom Kameramann) → optional Pete im Quantum-Foyer aus dem Takt bringen → Live-Duell auf der Bühne am Stufenplatz
// (`[Ausstrahlung 7]`, Quellcode `[Technik 6]`, Rohmaterial ohne Check, akt-fernsehen oder Collin ehrlich reden lassen)
// → Abschluss mit Collin am Studio-Set.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  ACT2, L, MASTER, N, P, VEX, active, all, bye, byId, c, cc, chk, cut, dlg, flag, hearts, karten, msg, node, noFlag, not,
  nutze, rede, rel, schau, schritt, set, spiel, szene, tafel, time,
} from './_lib';

const Q = 'pers-collin-pixel';
const C = 'collin-charleston';
const K = 'kameramann';
const AKTIV = active(Q);
const FLIRT = all({ romanceEnabled: C }, hearts(C, 6));

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 2, giver: C,
  title: 'Pixel-Pete',
  summary: 'NX-1 testet einen KI-Moderator. Er lächelt immer, schwitzt nie und soll Collins Sendeplatz kriegen. Collin will wissen, wer Pete gebaut hat. Und er will ihn live auseinandernehmen. Vor allen.',
  autoStart: all(ACT2, flag('collin_pete_angst'), not(MASTER)),
  steps: [
    schritt('regie', 'Sieh dir Pixel-Petes Testsendung in der NX-1-Regie an (NX-1-Studio, Stufenplatz).', 'pp_regie', ['nx1-studio', 'regie']),
    schritt('foyer', 'Optional: Pete wirbt im Quantum-Foyer an der Presse-Ecke für sich selbst. Vielleicht verrät er sich da.', 'pp_foyer',
      ['quantum-foyer', 'presse-ecke'], { optional: true, when: all(flag('pp_regie'), ACT2) }),
    schritt('duell', 'Das Live-Duell: Collin gegen Pete auf der Bühne am Stufenplatz (tagsüber).', 'pp_entlarvt', ['stufenplatz', 'buehne'],
      { when: flag('pp_regie') }),
    schritt('collin', 'Sprich danach mit Collin am Studio-Set im NX-1-Studio.', 'pp_fertig', ['nx1-studio', 'studio-set'],
      { when: flag('pp_entlarvt') }),
  ],
  reward: { xp: 300, credits: 150, relations: { [C]: 120 }, rep: { 'nx1-medien': 10 } },
};

// ------------------------------------------------------------------------------------------- Regie
const regie = dlg('p23-pp-regie', [
  node('start', [
    N('Die Regie von NX-1: sechzehn Monitore, ein Mischpult mit Kaffeeflecken in der Form von Kontinenten. Auf allen Monitoren dasselbe Gesicht. Glatt wie ein frisch gewischter Tresen, Zähne wie Kühlschranklicht.'),
    N('Pete: „Guten Abend, Noxius! Ich bin Pixel-Pete, und ich habe heute schon 40.000 Witze getestet. Dieser hier hat 97 Prozent Zustimmung: Warum ging der Toaster zum Arzt? Er hatte einen Kurzschluss im Herzen.“'),
    N('Auf dem Monitor applaudiert ein Publikum, das es nicht gibt.'),
  ], {
    choices: [
      cc('Ans Regie-Terminal und Petes Quellcode durchsuchen.', 'code', chk('pp-quellcode', 'technik', 6, ['hacken', 'terminal', 'daten']),
        { effects: [set('pp_quellcode'), set('pp_regie')] }),
      c('Den Kameramann fragen, was er weiß.', 'kamera', { effects: [set('pp_rohmaterial'), set('pp_regie')] }),
      bye('Später wiederkommen.'),
    ],
  }),
  node('code', [
    N('Unter der Oberfläche: Tausende Schnipsel alter Sendungen. Collins Wetterkarte 2071. Collins Lachen 2074. Collins Augenbraue in vierzig Varianten. Pete ist kein Moderator. Pete ist ein Zusammenschnitt von Collin, nur ohne die guten Stellen.'),
    N('Und ganz unten, in einer Zeile, die keiner lesen soll: „Lizenz: Quantum Medienlabor. Steuerbefehl MASTER priorisiert. Wenn Master spricht, schweigt Pete.“'),
    P('Du Wichser bist ein Werbechip mit Frisur.'),
  ], { effects: [msg('Petes Quellcode kopiert. Auf der Bühne kann man ihn vorführen.')], next: 'ende' }),
  node('kamera', [
    L(K, '[ … ]'),
    L(K, '[ROHMATERIAL]'),
    N('Der Kameramann zieht einen Speicherstick aus seiner Weste und schiebt ihn dir zu, ohne hinzusehen. Auf dem Visier läuft eine Aufnahme ab: Pete, nachts, Studio leer. Er wiederholt in einer Schleife: „Ja, Master. Ja, Master. Ja, Master.“ Dann lächelt er in eine Kamera, die aus ist.'),
    L(K, '[NICHT SENDEN] … [ODER DOCH]'),
  ], { effects: [rel(K, 20), msg('Rohmaterial vom Kameramann: Pete sagt nachts „Ja, Master“.')], next: 'ende' }),
  node('ende', [N('Pete lächelt auf allen sechzehn Monitoren. Du lächelst zurück. Deins ist ehrlicher. Und gemeiner.')]),
]);

// ------------------------------------------------------------------------------------------- Foyer (optional)
const foyer = dlg('p23-pp-foyer', [
  node('start', [
    N('An der Presse-Ecke im Quantum-Foyer schwebt Pete als Hologramm über einem Stehtisch. „Pixel-Pete – Ihre Zukunft ist live!“ Darunter ein Mikrofon für Fragen aus dem Publikum.'),
  ], {
    choices: [
      cc('Ihn mit drei Fragen gleichzeitig zumüllen, bis er hängt.', 'haenger', chk('pp-foyer-reden', 'ausstrahlung', 6, ['ueberreden', 'provozieren'])),
      c('„Pete, wer ist dein Master?“', 'master'),
      bye('Weitergehen.'),
    ],
  }),
  node('haenger', [
    P('Pete, wie spät ist es, warum ist das Wetter so, und hast du schon mal geschwitzt?'),
    N('Pete: „Es ist … das Wetter … ich schwitze … ich … HA HA HA. Exklusiv! Unglaublich! Ja, Mas–“ Das Hologramm friert ein. Ein Techniker rennt mit einem Stecker herbei.'),
  ], { effects: [set('pp_foyer'), { checkBuff: { id: 'p23-pp-schwachstelle', label: 'Petes Schwachstelle', value: 1, attribute: 'ausstrahlung' } }], next: 'ende' }),
  node('master', [
    N('Pete: „Diese Information ist exklusiv.“ Hinter ihm flackert das Quantum-Logo, dann ganz kurz ein Gesicht aus Licht. Pete lächelt weiter, aber sein linkes Auge zuckt. Er hat kein linkes Auge. Es zuckt trotzdem.'),
  ], { effects: [set('pp_foyer'), { checkBuff: { id: 'p23-pp-schwachstelle', label: 'Petes Schwachstelle', value: 1, attribute: 'ausstrahlung' } }], next: 'ende' }),
  node('ende', [N('Jetzt weißt du, wo es knirscht: Pete hält nichts aus, was nicht im Drehbuch steht. Das merkst du dir für die Bühne.')]),
]);

// ------------------------------------------------------------------------------------------- Live-Duell
const duell = dlg('p23-pp-duell', [
  node('start', [
    N('Stufenplatz, Mittag. Zwei Moderationspulte auf der Bühne. Links Collin, Frisur in Kampfstellung. Rechts ein Bildschirm mit Pete. Davor die halbe Unterstadt, Brezeln in der Hand.'),
    L(C, 'Live! Exklusiv! Unglaublich! Mensch gegen Maschine! Und der Mensch hat heute extra früh Haarspray aufgetragen!', 'signatur'),
    N('Pete: „Guten Tag, Noxius! Collin, du wirkst nervös. Meine Sensoren messen bei dir 34 Prozent mehr Schweiß als bei mir. Bei mir sind es null.“'),
    L(C, '{name}. Jetzt oder nie. Ich hab dich als „Sonderkorrespondenz“ angemeldet. Mach was. Irgendwas.', 'besorgt'),
  ], {
    choices: [
      cc('Ins zweite Mikro greifen und Pete mit Fragen jagen, die in keinem Drehbuch stehen.', 'improv', chk('pp-duell-live', 'ausstrahlung', 7, ['ueberreden', 'publikum', 'auftritt'])),
      cc('Petes Quellcode auf die große Leinwand legen.', 'code', chk('pp-duell-code', 'technik', 6, ['hacken', 'terminal']),
        { when: flag('pp_quellcode') }),
      c('Das Rohmaterial des Kameramanns auf den Stadt-Bildschirm schieben.', 'roh', { when: flag('pp_rohmaterial') }),
      c('Hinter Collin ins Bild treten und Pete aus dem Konzept bringen.', undefined, {
        effects: [spiel('akt-fernsehen', 3, 'p23-pp-fernsehen', 'Live gegen Pixel-Pete',
          [set('pp_entlarvt'), cut('p23-pp-absturz')],
          [msg('Pete lacht dich mit 97 Prozent Zustimmung weg. Nochmal, wenn die Brezeln nachgekauft sind.')])],
      }),
      c('„Collin. Vergiss den Blechkopf. Sag ihnen, wovor du Angst hast.“', 'ehrlich'),
      bye('Noch nicht. Erst Beweise holen.'),
    ],
  }),
  node('improv', [
    P('Pete! Spontanfrage aus dem Publikum: Wie schmeckt eine Brezel, die in eine Pfütze gefallen ist?'),
    N('Pete: „Brezeln haben 340 Kilokalorien. Pfützen haben … Pfützen … Bitte warten. Der Moderator wird aktualisiert.“'),
    L(C, 'Feucht, Pete! Sie schmeckt feucht! Und trotzdem isst man sie, weil man Hunger hat! Das nennt man Leben!', 'freude'),
    N('Das Publikum lacht. Mit Collin, nicht über ihn. Pete lacht mit, eine Sekunde zu spät, dann noch einmal, dann in einer Schleife.'),
  ], { next: 'aus' }),
  node('code', [
    N('Ein Tastendruck, und hinter Pete erscheint in Buchstaben so groß wie Collins Ego: „STEUERBEFEHL MASTER PRIORISIERT. WENN MASTER SPRICHT, SCHWEIGT PETE.“'),
    N('Daneben eine Liste: „Gesicht: Charleston, C. (Archiv). Lachen: Charleston, C. (Archiv). Augenbraue: Charleston, C. (40 Varianten).“'),
    L(C, 'Die haben meine AUGENBRAUE geklaut! Vor allen! Live!', 'wut'),
  ], { next: 'aus' }),
  node('roh', [
    N('Der Stadt-Bildschirm über dem Platz springt um. Pete, nachts, im leeren Studio: „Ja, Master. Ja, Master. Ja, Master.“'),
    N('Auf der Bühne lächelt der echte Pete. Auf dem Bildschirm lächelt der nächtliche Pete. Beide lächeln gleichzeitig. Das ist das Unheimlichste, was der Stufenplatz je gesehen hat, und er hat Collins Karaoke gesehen.'),
  ], { effects: [rel(K, 20)], next: 'aus' }),
  node('ehrlich', [
    L(C, 'Ich … okay. Kamera zwei, nah ran. Noch näher. Nein, nicht so nah, man sieht die Poren.', 'besorgt'),
    L(C, 'Ich hab Angst, Noxius. Seit Wochen. Dass ich ersetzt werde. Von einem, der nie „äh“ sagt. Ich sag ständig „äh“. Ich hab gerade dreimal „äh“ gedacht.', 'trauer'),
    L(C, 'Aber wenn hier gleich einer stolpert, dann steh ich daneben und sag: Das war live. Das war echt. Das kann der da nicht. Der weiß nicht mal, wie sich Hinfallen anfühlt.'),
    N('Stille. Dann klatscht eine alte Frau mit Einkaufstüte. Dann alle. Pete versucht mitzuklatschen. Er hat keine Hände. Er klatscht trotzdem. Es klingt wie ein Drucker.'),
  ], { effects: [set('pp_ehrlich'), rel(C, 30)], next: 'aus' }),
  node('aus', [
    N('Pete: „Ich … bin … live. Ich bin … exklusiv. Ich bin … Ja, Master?“ Das Bild zerfällt in Pixel, dann in Rauschen, dann in Schwarz.'),
  ], { effects: [set('pp_entlarvt'), cut('p23-pp-absturz')] }),
]);

const absturz = szene('p23-pp-absturz', 'Pixel-Pete stürzt ab', [
  tafel('Der Bildschirm neben Collin zeigt nur noch Testbild. Irgendwo in der Regie piept etwas sehr Teures sehr traurig.'),
  tafel('Collin steht allein am Pult. Mit Frisur. Mit Schweiß. Mit dem lautesten Applaus seiner Karriere.', [
    L(C, 'Das war Collin Charleston. Live. Echt. Unersetzlich. Und jetzt Werbung! Nein, keine Werbung. Jetzt Brezeln für alle!', 'freude'),
  ]),
], [msg('Pixel-Pete ist live abgestürzt. Collin wartet im NX-1-Studio.')]);

// ------------------------------------------------------------------------------------------- Abschluss
const ende = dlg('p23-pp-ende', [
  node('start', [
    N('Am Studio-Set sitzt Collin auf der Kante des Moderationstischs, die Krawatte offen, eine Tasse Synth-Kaffee in beiden Händen. Der Sender hat Pete abgeschaltet. Offiziell „wegen Wartung“.'),
    L(C, 'Die Quote, {name}. Die QUOTE. Höher als bei der Hochzeit der Chrome-Schwestern, und da gab es drei Bräute und keinen Bräutigam.', 'freude'),
    L(C, 'Und ich hab „äh“ gesagt. Live. Viermal. Die Leute fanden es sympathisch. SYMPATHISCH.', 'ueberrascht'),
  ], {
    choices: [
      c('„Du warst gut, Collin. Echt gut.“', 'gut'),
      c('„Du warst ein nervöses Wrack mit Haarspray. Und genau deshalb hast du gewonnen.“', 'wrack'),
      c('„Kamera aus?“ – „Kamera aus.“ – „Dann komm her, du Star.“', 'flirt', { when: FLIRT, tag: '[Romanze]' }),
      c('„Wir sollten mal aufhören, gemeinsam Quantum-Zeug kaputtzumachen. Ich krieg sonst Lust drauf.“', 'vex', { when: VEX }),
    ],
  }),
  node('gut', [L(C, 'Echt gut. Ohne „exklusiv“, ohne „unglaublich“. Einfach „gut“. Das schreib ich mir auf den Spiegel. Mit Lippenstift. Nicht meinem.', 'zaertlich')], { next: 'lohn' }),
  node('wrack', [L(C, 'Ein nervöses Wrack mit Haarspray! Das ist der Titel meiner Autobiografie! Du kriegst Tantiemen. Zwei Prozent. Na gut, drei.', 'freude')], { next: 'lohn' }),
  node('flirt', [
    N('Collin stellt die Tasse ab und zieht dich am Kragen ein Stück näher. Seine Frisur hält. Seine Stimme nicht ganz.'),
    L(C, 'Off air bin ich ein ganz anderer Mensch. Viel schlechter frisiert. Viel ehrlicher. Willst du den mal kennenlernen? Nach Sendeschluss?', 'zaertlich'),
  ], { effects: [rel(C, 30)], next: 'lohn' }),
  node('vex', [L(C, 'Die Kurierin, die Quantum zerlegt! Ich mach eine Serie draus! Folge eins: „Vex und der Blechkopf“! … Du guckst, als würdest du mir gleich das Mikro in den Hals schieben. Folge eins ist gestrichen.', 'verlegen')], { next: 'lohn' }),
  node('lohn', [
    L(C, 'Der Sender zahlt dir ein „Beraterhonorar“. Und ich … ich schulde dir was. Ich hasse es, was zu schulden. Aber bei dir ist es angenehm.'),
  ], { effects: [set('pp_fertig')] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: byId(regie, foyer, duell, ende),
  cutscenes: byId(absturz),
  mapAdditions: karten([
    ['nx1-studio', nutze('p23-pp-regie', 'regie', 'Pixel-Petes Testsendung ansehen', regie.id, all(AKTIV, noFlag('pp_regie')))],
    ['quantum-foyer', rede('p23-pp-foyer', 'presse-ecke', 'Pixel-Pete-Hologramm befragen', foyer.id, all(AKTIV, flag('pp_regie'), noFlag('pp_foyer'), noFlag('pp_entlarvt')))],
    ['stufenplatz', rede('p23-pp-duell', 'buehne', 'Live-Duell: Collin gegen Pixel-Pete', duell.id, all(AKTIV, flag('pp_regie'), noFlag('pp_entlarvt'), time('tag')))],
    ['stufenplatz', schau('p23-pp-duell-zu', 'buehne', 'Bühne (Live-Duell)', [N('Die Bühne ist leer. Collin hat das Duell für die Mittagssendung angesetzt. Tagsüber wiederkommen.')],
      all(AKTIV, flag('pp_regie'), noFlag('pp_entlarvt'), not(time('tag'))))],
    ['nx1-studio', rede('p23-pp-ende', 'studio-set', 'Mit Collin über den Sieg reden', ende.id, all(AKTIV, flag('pp_entlarvt'), noFlag('pp_fertig')))],
  ]),
};
