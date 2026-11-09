// side-hartlaufs-rache · „Hartlaufs Rache“ (world.md §6.3 Nr. 41). Direktorin Hartlauf, digitech-areal, tagsüber, Akt 2.
// Hartlauf will beweisen, dass Quantum Digitechs Patente gestohlen hat → Archiv sichern (Patentakten „Lichtbogen“) →
// beim Öffnen erwacht der Wachkoloss. Wege: Boss enc-ruine-wachkoloss (Koloss zerstört: Ruf digitech −10, §10.1) ·
// gc-131 [Technik 7] umprogrammieren (er bewacht danach das Pförtnerhaus) · Abschaltcode von Ole Gähn: gc-130
// [Ausstrahlung 5] wach halten, Synth-Kaffee oder ohne alles lange schütteln (kostet Zeit). Danach Akten an Hartlauf,
// optional eine Kopie an Delya (NX-1-Redaktion, morgens; Ruf nx1-medien +10, eigene Sendung).
// Belohnung 300 XP, Ruf digitech +30, karte-lieferzone, haut-tarnlack zum Einkaufspreis (1200 Cr, Angebot bleibt).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, NewsDef, PhoneMessageDef, QuestDef } from '../../../modules/contracts';
import {
  ACT2, VEX, active, all, any, bild, ch, dlg, done, flag, herz, inactive, item, l, msg, n, noFlag, noItem, node, not, p, rep, set,
  tafel, time, won,
} from './_lib';

const Q = 'side-hartlaufs-rache';
const HA = 'direktorin-hartlauf';
const OL = 'ole-gaehn';
const DE = 'delya-delloraine';
const ENC = 'enc-ruine-wachkoloss';

const WACH = 'hr_koloss_wach';
const CODE = 'hr_abschaltcode';
const UMPROG = 'wachkoloss_umprogrammiert';
const ABGESCHALTET = 'hr_koloss_abgeschaltet';
const AKTEN = 'hr_akten';
const DELYA = 'hr_delya';
const ABGEGEBEN = 'hr_akten_abgegeben';
const TARNLACK = 'hr_tarnlack_gekauft';

const KOLOSS_RUHIG = any(won(ENC), flag(UMPROG), flag(ABGESCHALTET));
/** Akten in der Hand: nach jedem der drei Wege (der Kampf setzt kein Flag, daher der Sieg direkt). */
const AKTEN_DA = any(flag(AKTEN), won(ENC));

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Hartlaufs Rache',
  summary: 'Direktorin Hartlauf will beweisen, dass Quantum Digitechs Patente gestohlen hat. Die Beweise liegen im Archiv. Neben einem Wachroboter, der seit 2071 auf Besuch wartet.',
  giver: HA,
  act: 2,
  steps: [
    {
      id: 'archiv', text: 'Hol mit Hartlauf die Patentakten „Lichtbogen“ aus dem Archiv des Digitech-Areals (tagsüber).',
      done: flag(WACH), marker: { map: 'digitech-areal', at: 'archiv' },
    },
    {
      id: 'koloss', text: 'Der Wachkoloss ist erwacht. Leg ihn still: kämpfen, umprogrammieren oder Ole Gähns Abschaltcode besorgen.',
      when: flag(WACH), done: KOLOSS_RUHIG, marker: { map: 'digitech-areal', at: 'wachkoloss' },
    },
    {
      id: 'ole', optional: true, when: all(flag(WACH), not(KOLOSS_RUHIG), noFlag(CODE)),
      text: 'Weg: Ole Gähn kennt den Abschaltcode. Er muss nur lange genug wach bleiben, um ihn auszusprechen (Bank am Pförtnerhaus).',
      done: flag(CODE), marker: { map: 'digitech-areal', at: 'pfoertnerhaus-bank' },
    },
    {
      id: 'delya', optional: true, when: all(AKTEN_DA, noFlag(ABGEGEBEN)),
      text: 'Optional: Bring Delya eine Kopie der Akten in die NX-1-Redaktion (morgens). Gerichte brauchen Jahre. Delya braucht eine Sendung.',
      done: flag(DELYA), marker: { map: 'nx1-studio', at: 'redaktion' },
    },
    {
      id: 'hartlauf', text: 'Übergib Hartlauf die Patentakten (Archiv, tagsüber).',
      when: AKTEN_DA, done: flag(ABGEGEBEN), marker: { map: 'digitech-areal', at: 'archiv' },
    },
  ],
  reward: { xp: 300, rep: { digitech: 30 }, items: { 'karte-lieferzone': 1 } },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const tel: PhoneMessageDef = {
  id: 'tel-hartlauf-rache',
  from: HA,
  text: 'Ich telefoniere nicht. Telefone hört Quantum ab. Kommen Sie ins Pförtnerhaus. Tagsüber. Bringen Sie Zeit mit und keine Kekse. – Dir. Hartlauf',
  auto: all(ACT2, inactive(Q), { met: HA }, { dayAtLeast: 2 }),
};

const start: DialogueDef = dlg('hartlauf-rache-start', [
  node('start', [
    n('Hartlauf hat die achtzehn gerahmten Formbriefe von der Wand genommen und vor sich auf den Tisch gelegt. Daneben ein neunzehnter, noch im Umschlag. Sie öffnet ihn nicht.'),
    l(HA, 'Sie haben es gesehen. Die ganze Stadt hat es gesehen. Chrome 10, Nexus, dieses lächelnde Ding auf jedem Bildschirm. Wissen Sie, was das ist?', 'wut'),
    l(HA, 'Das ist Projekt Lichtbogen. Unser Projekt. Digitech, Abteilung sieben, 2077. Ich habe die Kaffeemaschine dafür gekauft. Ich habe die Weihnachtsfeier dafür abgesagt. Zweimal.', 'wut'),
  ], {
    choices: [
      ch('„Und Sie können es beweisen?“', 'beweis'),
      ch('„Quantum hat geklaut? Schockierend. Wie wenn der Hai das Fischstäbchen frisst.“', 'spott'),
      ch('„Rache ist teuer. Wer zahlt?“', 'geld'),
    ],
  }),
  node('spott', [
    l(HA, 'Ihr Sarkasmus ist bemerkenswert unbezahlt. Behalten Sie ihn. Ich brauche Ihre Hände.', 'neutral'),
  ], { next: 'beweis' }),
  node('geld', [
    l(HA, 'Digitech zahlt in Prototypen. Und in Gefälligkeiten. Wir haben nicht viel Geld, aber wir haben Dinge, die Quantum nie bauen durfte, weil sie zu gut funktionieren.', 'signatur'),
  ], { next: 'beweis' }),
  node('beweis', [
    l(HA, 'Im Archiv liegen die Originalakten. Mit Eingangsstempel, Datum, Unterschrift. Sechs Wochen vor Quantums Patentantrag. Wenn ich die habe, gehen die Formbriefe nicht mehr in den Rahmen. Dann gehen sie zurück.', 'neutral'),
    l(HA, 'Das Problem ist der Schrank. Und das Problem neben dem Schrank. Der Wachkoloss. Ruhemodus seit dem Einbruch. Er wacht auf, wenn jemand den Schrank öffnet. Das ist sein Beruf. Er ist sehr gut in seinem Beruf.', 'besorgt'),
    l(HA, 'Ole hat den Abschaltcode irgendwann einmal gewusst. Ole weiß vieles irgendwann einmal.', 'neutral'),
  ], {
    choices: [
      ch('„Gehen wir ins Archiv.“', 'zusage', { effects: [{ startQuest: Q }] }),
      ch('„Ich such mir einen anderen sieben Meter großen Roboter. Später.“'),
    ],
  }),
  node('zusage', [
    l(HA, 'Gut. Ich gehe vor. Ich nehme den Feuerlöscher mit. Nicht wegen Feuer.', 'signatur'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Archiv

const archiv: DialogueDef = dlg('hartlauf-rache-archiv', [
  node('start', [
    n('Das Archiv ist ein Saal aus Regalen, die bis unter die eingestürzte Decke reichen. Durch das Loch im Dach fällt Licht auf Staub, der seit sieben Jahren in der Luft hängt und sich weigert zu landen.'),
    n('Hinten im Halbdunkel sitzt etwas auf dem Boden, groß wie ein Lieferwagen, die Arme um die Knie, als würde es schlafen. Der Wachkoloss. Ein grünes Licht blinkt auf seiner Brust. Langsam. Wie ein Herz.'),
    l(HA, 'Schrank vierzehn. Code „Kaffeepause“. Ich habe ihn selbst vergeben. Ich war damals witziger.', 'neutral'),
  ], {
    choices: [
      ch('Den Schrank öffnen.', 'oeffnen'),
      ch('„Wir sollten den Riesen vorher irgendwie …“', 'vorher'),
      ch('Noch nicht.'),
    ],
  }),
  node('vorher', [
    l(HA, 'Ausschalten? Er schaltet sich nur aus, wenn er wach ist. Und wenn er wach ist, schaltet er Sie aus. Das ist die Ironie der Sicherheitstechnik.', 'neutral'),
  ], { next: 'start' }),
  node('oeffnen', [
    n('K-A-F-F-E-E-P-A-U-S-E. Das Schloss klackt. Die Tür schwingt auf, und drinnen liegt ein grauer Ordner mit roter Aufschrift: „LICHTBOGEN – VERTRAULICH – NICHT FÜR QUANTUM“. Jemand hat das letzte Wort dreimal unterstrichen.'),
    n('Hinter dir geht ein Licht an. Dann ein zweites, sieben Meter höher. Es sind Augen.'),
  ], { effects: [set(WACH), { cutscene: 'side-hartlaufs-rache-koloss' }] }),
]);

const erwacht: CutsceneDef = {
  id: 'side-hartlaufs-rache-koloss',
  title: 'Der Wachkoloss',
  gallery: false,
  beats: [
    bild('bg-digitech-areal', { pan: 'in', fade: 'in', hold: 1200, caption: 'Staub rieselt aus sieben Jahren Stillstand, als der Wachkoloss aufsteht. Seine Gelenke klingen wie ein Parkhaus, das gähnt.' }),
    tafel('„DIGITECH-WACHKOLOSS. BETRIEBSJAHR 2071. LETZTE WARTUNG: NIE. EINDRINGLINGE WERDEN FREUNDLICH ZERQUETSCHT.“', { sfx: 'alarm', hold: 1600 }),
    tafel('Hartlauf hebt den Feuerlöscher wie eine Hellebarde. „Die Akten! Halten Sie die Akten hoch! Er darf sie nicht zertreten!“', { hold: 1400 }),
  ],
  effects: [{ dialogue: 'hartlauf-rache-koloss' }],
};

const koloss: DialogueDef = dlg('hartlauf-rache-koloss', [
  node('start', [
    n('Der Wachkoloss steht zwischen dir und dem Ausgang. Er bewegt sich langsam, aber jeder Schritt lässt die Regale zittern. Auf seiner Brustplatte leuchtet eine Wartungsklappe. Daneben ein Tastenfeld für den Abschaltcode.'),
    l(HA, 'Er ist alt, aber er ist nicht dumm. Er war mal das Beste, was wir hatten. Bitte machen Sie ihn nicht kaputt, wenn es anders geht.', 'besorgt'),
  ], {
    choices: [
      ch('Den Abschaltcode eintippen.', 'code', { when: flag(CODE), effects: [set(ABGESCHALTET), set(AKTEN)] }),
      ch('Unter die Wartungsklappe tauchen und ihn umprogrammieren.', 'umprog', { check: 'gc-131', effects: [set(UMPROG), set(AKTEN)] }),
      ch('Kämpfen. Großer Roboter, große Beule.', 'kampf'),
      ch('Rückzug! Ole weiß den Code!', 'rueckzug', { when: noFlag(CODE) }),
    ],
  }),
  node('code', [
    n('Du tippst die Ziffern, die Ole dir genuschelt hat. Der Koloss hält mitten im Schritt inne. „CODE AKZEPTIERT. GUTE NACHT, OLE.“'),
    n('Er setzt sich wieder hin, schlingt die Arme um die Knie und schaltet ab. Das grüne Licht wird langsam. Wie ein Herz, das wieder schläft.'),
    l(HA, 'Gute Nacht, Ole. Natürlich. Er hat den Code nach sich selbst benannt. Er wollte, dass der Koloss sich an ihn erinnert.', 'trauer'),
  ]),
  node('umprog', [
    n('Du rollst zwischen den Beinen des Kolosses hindurch, reißt die Wartungsklappe auf und findest Technik aus einer Zeit, in der Kabel noch Farben hatten. Rot zu Blau, Gelb zu Grün, ein Wackelkontakt, den du mit Spucke und Hoffnung überbrückst.'),
    n('„NEUE ANWEISUNG ERKANNT. SCHÜTZEN: DIGITECH. ZERQUETSCHEN: QUANTUM. FREUNDLICH.“ Der Koloss dreht sich um, verbeugt sich vor Hartlauf und stellt sich vor die Tür wie ein Türsteher mit Panzerplatten.'),
    l(HA, 'Oh. Oh, das ist schön. Das ist das Schönste, was hier seit sieben Jahren passiert ist. Er hat sich verbeugt.', 'freude'),
  ], { effects: [herz(HA, 40), rep('digitech', 5)] }),
  node('kampf', [
    l(HA, 'Nicht die Regale! NICHT DIE REGALE!', 'wut'),
  ], { effects: [{ battle: ENC }] }),
  node('rueckzug', [
    n('Du rennst. Hartlauf rennt hinter dir her, den Ordner unter dem Arm, den Feuerlöscher im Anschlag. Der Koloss stampft bis zur Archivtür, bückt sich, passt nicht durch und bleibt beleidigt im Türrahmen stehen.'),
    l(HA, 'Er kommt nicht raus. Er kam noch nie raus. Er war für drinnen gebaut. Holen Sie den Code. Ich bewache den Koloss. Mit Blicken.', 'neutral'),
  ]),
]);

const kolossTuer: DialogueDef = dlg('hartlauf-rache-koloss-tuer', [
  node('start', [
    n('Der Wachkoloss steht im Türrahmen des Archivs, halb drin, halb draußen, und summt. „EINDRINGLING ERKANNT. BITTE NÄHER TRETEN. ZUM ZERQUETSCHEN.“'),
  ], {
    choices: [
      ch('Den Abschaltcode eintippen.', 'code', { when: flag(CODE), effects: [set(ABGESCHALTET), set(AKTEN)] }),
      ch('Unter die Wartungsklappe tauchen und ihn umprogrammieren.', 'umprog', { check: 'gc-131', effects: [set(UMPROG), set(AKTEN)] }),
      ch('Kämpfen.', 'kampf'),
      ch('Erst den Code holen.'),
    ],
  }),
  ...koloss.nodes.filter((x) => ['code', 'umprog', 'kampf'].includes(x.id)),
]);

// ---------------------------------------------------------------------------------------------- Ole Gähn

const ole: DialogueDef = dlg('hartlauf-rache-ole', [
  node('start', [
    n('Ole liegt auf der Bank, die Mütze über dem Gesicht, den Besen im Arm. Aus dem Archiv dröhnt der Koloss. Ole schnarcht im Takt.'),
    p('Ole. OLE. Der Wachkoloss ist wach. Wie lautet der Abschaltcode?'),
    l(OL, '… Hm? … Der Code … Der Code ist … ganz einfach … Der Code ist …', 'neutral'),
    n('Er schläft ein. Mitten im Satz. Mit offenem Mund.'),
  ], {
    choices: [
      ch('„Ole, bleib bei mir. Erzähl mir von dem Tag, als du ihn eingeschaltet hast. Wie war das?“', 'wach', { check: 'gc-130' }),
      ch('Ihm einen Synth-Kaffee unter die Nase halten.', 'kaffee', { requires: item('synth-kaffee'), effects: [{ take: 'synth-kaffee' }] }),
      ch('Ihn schütteln. Wieder. Und wieder. Und wieder.', 'schuetteln', { effects: [{ advanceTime: 45 }] }),
      ch('Ihn schlafen lassen.'),
    ],
  }),
  node('wach', [
    l(OL, '… Eingeschaltet? … 2071. Ich war jung. Er war jung. Er war so groß, und ich hab ihm „Guten Morgen“ gesagt, und er hat „GUTEN MORGEN“ zurückgesagt, so laut, dass die Fenster …', 'freude'),
    l(OL, 'Und abends hab ich ihm „Gute Nacht“ gesagt. Jeden Abend. Und irgendwann hab ich gedacht: Das ist ein guter Code. „Gute Nacht, Ole.“ Ziffern auf dem Tastenfeld. 4-8-8-3 … 6-5-3.', 'zaertlich'),
    n('Er ist wach. Ganz wach. Er schaut in Richtung Archiv, und in seinen Augen steht etwas, das man bei einem Hausmeister nicht erwartet.'),
    l(OL, 'Mach ihn nicht kaputt. Er hat nur gemacht, was ich ihm gesagt hab. Aufpassen.', 'trauer'),
  ], { effects: [set(CODE), herz(OL, 40)] }),
  node('kaffee', [
    n('Ole schnuppert. Seine Nase findet den Kaffee vor seinen Augen. Er trinkt, ohne die Mütze abzunehmen. Dann setzt er sich auf, sehr gerade, wie ein Mann, dem man einen Strom angeschlossen hat.'),
    l(OL, 'Abschaltcode: „Gute Nacht, Ole.“ Auf dem Tastenfeld. Hab ich selbst eingerichtet. Damit er weiß, wer ihn ins Bett bringt.', 'neutral'),
    l(OL, 'Noch einen Kaffee, und ich kehr das ganze Areal. Hast du noch einen? Nein? Gut. Ich hätte es eh nicht gemacht.', 'signatur'),
  ], { effects: [set(CODE), herz(OL, 20)] }),
  node('schuetteln', [
    n('Du schüttelst Ole. Er sagt „Gu“. Du schüttelst ihn noch mal. „…te.“ Eine Viertelstunde später: „Nacht.“ Noch eine Viertelstunde: „O…“ Und dann, nach einer Pause, in der ein ganzer Zug vorbeifahren könnte: „…le.“'),
    p('„Gute Nacht, Ole.“ Das ist der Code? Das hätte man auch schneller sagen können.'),
    l(OL, 'Hätte man. Hat man aber nicht.', 'neutral'),
  ], { effects: [set(CODE)] }),
]);

// ---------------------------------------------------------------------------------------------- Delya

const delya: DialogueDef = dlg('hartlauf-rache-delya', [
  node('start', [
    n('Delya sitzt in der Redaktion zwischen drei Bildschirmen und einem Kaffee, der kalt genug ist, um als Beweismittel durchzugehen. Sie schaut nicht auf.'),
    l(DE, 'Wenn das eine Beschwerde über Collins Frisur ist: Ich teile sie. Wenn es eine Geschichte ist: Setz dich.', 'neutral'),
    p('Digitech-Akten. Projekt Lichtbogen. Datiert sechs Wochen vor Quantums Patent auf Nexus.'),
    n('Jetzt schaut sie auf.'),
  ], {
    choices: [
      ch('Die Kopie auf den Tisch legen.', 'kopie'),
      ch('„Was zahlt NX-1 für so was?“', 'geld'),
    ],
  }),
  node('geld', [
    l(DE, 'Nichts. Wir sind ein seriöser Sender. Und wir sind pleite. Das hängt zusammen. Aber ich nenne deine Quelle nicht und deinen Namen auch nicht, und das ist hier mehr wert als Geld.', 'signatur'),
  ], { next: 'kopie' }),
  node('kopie', [
    n('Delya blättert. Langsam, dann schneller. Sie fotografiert jede Seite zweimal. Ihr Kaffee wird kälter. Es interessiert sie nicht.'),
    l(DE, 'Eingangsstempel. Unterschriften. Eine Kaffeerechnung auf Seite zwölf, die beweist, dass da jemand bis drei Uhr morgens saß. Das ist kein Patentstreit. Das ist eine Geschichte.', 'ueberrascht'),
    l(DE, 'Ich bringe es heute Abend. Und morgen bringe ich die Antwort von Quantum, die „kein Kommentar“ lauten wird. Und übermorgen bringe ich, warum sie „kein Kommentar“ gesagt haben.', 'signatur'),
  ], { effects: [set(DELYA), rep('nx1-medien', 10), herz(DE, 30), msg('Die Akten gehen auf Sendung.')] }),
]);

// ---------------------------------------------------------------------------------------------- Übergabe

const uebergabe: DialogueDef = dlg('hartlauf-rache-uebergabe', [
  node('start', [
    l(HA, 'Zeigen Sie her.', 'neutral'),
    n('Hartlauf nimmt den grauen Ordner wie ein Neugeborenes. Sie schlägt ihn auf, findet ihre eigene Unterschrift auf Seite eins und legt eine Hand darauf. Lange.'),
  ], {
    choices: [
      ch('„Der Koloss lebt noch. Er gehört jetzt Ihnen.“', 'umprog', { when: flag(UMPROG) }),
      ch('„Er schläft wieder. Ole hat ihm Gute Nacht gesagt.“', 'schlaeft', { when: all(flag(ABGESCHALTET), noFlag(UMPROG)) }),
      ch('„Der Koloss ist Schrott. Tut mir leid. Er wollte nicht reden.“', 'schrott', { when: all(won(ENC), noFlag(UMPROG), noFlag(ABGESCHALTET)) }),
    ],
  }),
  node('umprog', [
    n('Draußen vor dem Pförtnerhaus steht der Wachkoloss und winkt einem Lieferroller. Der Fahrer fällt fast vom Sitz.'),
    l(HA, 'Er bewacht das Pförtnerhaus. Er hat heute Morgen einem Quantum-Gutachter den Hut abgenommen, sehr freundlich, und ihn auf die Antenne gehängt. Ich habe gelacht. Laut. Vor Zeugen.', 'freude'),
  ], { next: 'delya' }),
  node('schlaeft', [
    l(HA, 'Er schläft. Und Ole hat heute zum ersten Mal seit Jahren gefegt. Das Archiv. Freiwillig. Ich weiß nicht, was Sie gemacht haben, aber machen Sie es nie wieder. Ich vertrage so viel Veränderung nicht.', 'neutral'),
  ], { next: 'delya' }),
  node('schrott', [
    l(HA, 'Er war alt. Er war das Beste, was wir hatten. Und jetzt ist er ein Haufen Ersatzteile. Ich werde die Teile in Prototypen verbauen. Er wäre gern ein Prototyp gewesen.', 'trauer'),
    n('Sie sagt es ruhig. Sie meint es nicht ruhig.'),
  ], { effects: [rep('digitech', -10)], next: 'delya' }),
  node('delya', [
    n('Hartlauf klappt den Ordner zu und schaut dich über den Brillenrand an.'),
  ], {
    choices: [
      ch('„Eine Kopie liegt schon bei Delya. Heute Abend weiß es die ganze Stadt.“', 'medien', { when: flag(DELYA) }),
      ch('„Und jetzt? Brief Nummer neunzehn?“', 'gericht', { when: noFlag(DELYA) }),
    ],
  }),
  node('medien', [
    l(HA, 'Bei Delya? Ohne mich zu fragen?', 'wut'),
    n('Eine Pause. Dann lacht Hartlauf. Es klingt eingerostet, aber es funktioniert.'),
    l(HA, 'Das Gericht hätte zwölf Jahre gebraucht. Delya braucht einen Abend. Sie sind unmöglich. Sie hätten bei Digitech anfangen sollen. Wir hätten Sie gefeuert und dann wieder eingestellt.', 'freude'),
  ], { next: 'lohn' }),
  node('gericht', [
    l(HA, 'Nummer neunzehn geht an das Gericht. Mit Kopie an Quantum. Und mit einer Kopie an jeden einzelnen Aktionär, dessen Adresse ich finde. Ich habe Zeit. Ich habe ein Pförtnerhaus und sehr viel Zeit.', 'signatur'),
  ], { next: 'lohn' }),
  node('lohn', [
    l(HA, 'Digitech zahlt in Dingen. Hier: der Lageplan der Quantum-Lieferzone. Schichtwechsel, Laster, Schlösser. Unsere Ingenieure haben ihn nachts gezeichnet, aus purer Bosheit.', 'neutral'),
    l(HA, 'Und ein Angebot: Unser Prototyp „Tarnlack“. Hautbeschichtung, die Kameras langweilt. Für Sie zum Einkaufspreis. Zwölfhundert. Quantum würde dafür Menschen verklagen.', 'signatur'),
  ], {
    choices: [
      ch('Den Tarnlack kaufen. (1200 Cr)', 'kauf', {
        when: all(noItem('haut-tarnlack'), { not: { cyberware: 'haut-tarnlack' } }),
        effects: [{ credits: -1200 }, { give: 'haut-tarnlack' }, set(TARNLACK)],
      }),
      ch('„Später. Ich bin gerade arm.“', 'spaeter'),
    ],
  }),
  node('kauf', [
    l(HA, 'Eine kluge Investition. Die erste in diesem Gebäude seit sieben Jahren.', 'freude'),
  ], { next: 'schluss' }),
  node('spaeter', [
    l(HA, 'Das Angebot bleibt. Ich bin tagsüber hier. Ich bin immer tagsüber hier. Das ist mein Problem und Ihr Vorteil.', 'neutral'),
  ], { next: 'schluss' }),
  node('schluss', [
    n('Hartlauf nimmt den neunzehnten Brief, den ungeöffneten, und wirft ihn in den Papierkorb.'),
    l(HA, 'Den brauche ich nicht mehr. Ich schreibe ab jetzt keine Briefe. Ich schreibe Geschichte.', 'signatur'),
  ], {
    choices: [
      ch('„Das war jetzt sehr pathetisch, Direktorin.“', 'pathos', { effects: [set(ABGEGEBEN), herz(HA, 60)] }),
      ch('„Viel Glück, Chefin. Und tret ihnen in den Arsch.“', 'vex', { when: VEX, effects: [set(ABGEGEBEN), herz(HA, 60)] }),
      ch('Nicken.', undefined, { effects: [set(ABGEGEBEN), herz(HA, 60)] }),
    ],
  }),
  node('pathos', [
    l(HA, 'Ich weiß. Ich habe es seit sieben Jahren geübt. Lassen Sie mir das.', 'verlegen'),
  ]),
  node('vex', [
    l(HA, 'Mit Stahlkappen. Ich habe welche bestellt. Für die Hauptversammlung.', 'signatur'),
  ]),
]);

/** Späterer Tarnlack-Kauf, solange das Angebot steht. */
const tarnlack: DialogueDef = dlg('hartlauf-rache-tarnlack', [
  node('start', [
    l(HA, 'Der Tarnlack? Zwölfhundert. Wie besprochen. Ich halte mein Wort. Es ist das Einzige, was Quantum mir nicht abkaufen konnte.', 'neutral'),
  ], {
    choices: [
      ch('Kaufen. (1200 Cr)', 'kauf', { effects: [{ credits: -1200 }, { give: 'haut-tarnlack' }, set(TARNLACK)] }),
      ch('Noch nicht.'),
    ],
  }),
  node('kauf', [l(HA, 'Viel Spaß beim Unsichtbarsein. Grüßen Sie die Kameras nicht.', 'signatur')]),
]);

const news: NewsDef = {
  id: 'news-side-hartlauf',
  anchor: DE,
  headline: 'Projekt Lichtbogen',
  when: flag(DELYA),
  priority: 3,
  lines: [
    l(DE, 'Exklusiv: Interne Akten belegen, dass Digitech die Grundlagen von Nexus sechs Wochen vor Quantum zum Patent angemeldet hat. Projekt Lichtbogen.', 'signatur'),
    l('collin-charleston', 'Quantum sagt dazu: „Kein Kommentar.“ Und dann noch mal: „Wirklich kein Kommentar.“ Und dann hat der Sprecher geweint.', 'ueberrascht'),
    l(DE, 'Morgen bei uns: Warum ein Wachroboter im Digitech-Areal neuerdings Hüte von Gutachtern einsammelt.', 'freude'),
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [start.id]: start, [archiv.id]: archiv, [koloss.id]: koloss, [kolossTuer.id]: kolossTuer, [ole.id]: ole,
    [delya.id]: delya, [uebergabe.id]: uebergabe, [tarnlack.id]: tarnlack,
  },
  cutscenes: { [erwacht.id]: erwacht },
  phone: { [tel.id]: tel },
  news: { [news.id]: news },
  mapAdditions: {
    'digitech-areal': {
      hotspots: [
        {
          id: 'q-hartlauf-start', at: 'pfoertnerhaus', radius: 64, label: 'Direktorin Hartlauf: „Wir müssen reden.“', kind: 'talk',
          dialogue: start.id, when: all(ACT2, inactive(Q), time('tag')),
        },
        {
          id: 'q-hartlauf-archiv', at: 'archiv', radius: 64, label: 'Mit Hartlauf ins Archiv', kind: 'use', dialogue: archiv.id,
          when: all(active(Q), noFlag(WACH), time('tag')),
        },
        {
          id: 'q-hartlauf-koloss', at: 'wachkoloss', radius: 70, label: 'Der Wachkoloss', kind: 'use', dialogue: kolossTuer.id,
          when: all(active(Q), flag(WACH), not(KOLOSS_RUHIG)),
        },
        {
          id: 'q-hartlauf-ole', at: 'pfoertnerhaus-bank', radius: 56, label: 'Ole nach dem Abschaltcode fragen', kind: 'talk', dialogue: ole.id,
          when: all(active(Q), flag(WACH), not(KOLOSS_RUHIG), noFlag(CODE), time('morgen', 'tag', 'abend')),
        },
        {
          id: 'q-hartlauf-uebergabe', at: 'archiv', radius: 64, label: 'Hartlauf die Akten geben', kind: 'talk', dialogue: uebergabe.id,
          when: all(active(Q), AKTEN_DA, noFlag(ABGEGEBEN), time('tag')),
        },
        {
          id: 'q-hartlauf-tarnlack', at: 'pfoertnerhaus', radius: 64, label: 'Hartlauf: Tarnlack zum Einkaufspreis', kind: 'talk', dialogue: tarnlack.id,
          when: all(done(Q), noFlag(TARNLACK), noItem('haut-tarnlack'), { not: { cyberware: 'haut-tarnlack' } }, time('tag')),
        },
      ],
    },
    'nx1-studio': {
      hotspots: [{
        id: 'q-hartlauf-delya', at: 'redaktion', radius: 60, label: 'Delya die Lichtbogen-Akten zeigen', kind: 'talk', dialogue: delya.id,
        when: all(active(Q), AKTEN_DA, noFlag(DELYA), time('morgen')),
      }],
    },
  },
};
