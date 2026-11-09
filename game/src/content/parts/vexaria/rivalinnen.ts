// Vex × Aria, Akt 1 „Rivalinnen“ (world.md §4.7, Stationen 1–3) plus Kurzszenen Arm-Wartung bei Dante und Ripper-Tag.
// Stationen 1–3 liegen unter ♥8 und sind in beiden Fassungen gleich: Sticheleien, Doppeldeutigkeiten, kein ausdrücklicher
// Flirt, keine Ausdrücke verlegen/zaertlich.
import type { ContentPart } from '../../part';
import type { DialogueDef, HeartEventDef } from '../../../modules/contracts';
import {
  a, all, byId, ch, chk, cut, dlg, flag, herz, HEUTE_FREI, msg, n, node, noFlag, s, seen, set, station, STATION_START, V, v,
} from './_util';

// ---------------------------------------------------------------------------
// Station 1 · rom-vexaria-schutzgeld · „Zehn Prozent, Postbotin“ (ohne Tafel)

const schutzgeld: DialogueDef = dlg('rom-vexaria-schutzgeld', [
  node('start', [
    n('Die Kurierbude neben Mira Lötzinns Laden. Rolltor halb oben, drinnen zwei Kuriere, die Pakete nach Gewicht und Gestank sortieren. Draußen Stiefel, die es nicht eilig haben.'),
    n('Dann ein Schläger, der gegen das Wellblech klopft. Dreimal. Wie ein Gerichtsvollzieher mit Rhythmusgefühl.'),
    a('Na, Postbotin. Hunter sagt, wer durch unser Revier liefert, zahlt zehn Prozent. Bar, sofort, und lächeln. Ich bin die zehn Prozent.', 'signatur'),
    n('Sie schlendert rein, als gehöre ihr die Bude, und setzt sich auf den Paketstapel. Auf DEN Paketstapel. Der Aluschläger liegt auf ihrer Schulter wie ein Haustier, das beißt.'),
    v('Ich bin in seiner Crew, du Großmaul.'),
    a('Ja. Deshalb nur zehn. Fremde zahlen zwanzig und \'nen Zahn.', 'freude'),
    v('Runter von meinem Paket. Das ist älter als deine Manieren.', 'wut'),
    n('Unter ihrem Hintern: ein leises, sehr regelmäßiges Ticken.'),
    a('Was ist da drin? Es tickt. Warum tickt es? Scheiße, WARUM TICKT ES?', 'ueberrascht'),
    v('Wecker. Für Ripper. Sonst verpennt der seine eigenen Verbrechen.'),
    a('Uuh. Die Postbotin hat Zähne.', 'freude'),
    n('Du legst die Nagelpistole beiläufig auf ihre Stiefelspitze. Nicht drohend. Einfach so. Wie man eine Tasse abstellt.'),
    v('Die Postbotin hat \'ne Nagelpistole. Und deine Stiefel haben Zehen drin.', 'signatur'),
    a('… Okay. Du gefällst mir. Nicht so sehr, dass ich dir nicht trotzdem die Bude zerleg. Aber du gefällst mir.', 'ueberrascht'),
    n('Kurier eins hat aufgehört zu sortieren. Kurier zwei hat aufgehört zu atmen. Zwei Frauen mit Metallarmen, ein tickendes Paket und eine Nagelpistole auf einer Stiefelspitze. Patt.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('„Ich zahl dir nix. Aber ich renn dich in Grund und Boden. Freitag, über die Neon-Gasse. Wer verliert, zahlt.“', 'strasse', { check: chk('vexaria-schutzgeld-strasse', 'strasse', 5, ['einschuechtern']), effects: [herz(30)] }),
      ch('Ein Nagel in den Schlägergriff. Haarscharf neben ihre Hand.', 'nagel', { check: chk('vexaria-schutzgeld-reflexe', 'reflexe', 6, ['fernkampf']), effects: [herz(40)] }),
      ch('„Wo ich herkomm, zahlt man Schutzgeld an Leute, die einen schützen. Wovor schützt du mich? Vor deinem Shirt?“', 'shirt', { tag: '[Gosse]', effects: [herz(20)] }),
      ch('20 Cr auf die Kiste legen.', 'zahlen', { requires: { credits: 20 }, effects: [{ credits: -20 }, herz(10)] }),
    ],
  }),
  node('strasse', [
    a('Abgemacht. Bring Taschentücher mit. Für dich.', 'signatur'),
    v('Ich bring \'ne Stoppuhr. Für dich. Damit du weißt, wie lang du hinter mir warst.', 'signatur'),
  ], { next: 'wette' }),
  node('nagel', [
    n('Ein Zischen, ein trockenes Klack. Der Nagel steckt im schwarzen Schlägergriff, eine Fingerbreite neben ihren Knöcheln. Die Kuriere hinter dir machen ein Geräusch wie ein kaputtes Ventil.'),
    n('Aria starrt auf den Nagel. Dann auf dich. Dann wieder auf den Nagel. Dann lacht sie so laut, dass draußen eine Taube vom Dach fällt.'),
    a('Du bist komplett irre. Ich will dir eine reinhauen und dich in meinem Team. Gleichzeitig.', 'freude'),
    v('Such dir eins aus.'),
    a('Nee. Ich nehm beides. Ich bin gierig.', 'signatur'),
  ], { next: 'wette' }),
  node('shirt', [
    a('Das ist KABELBRAND, du Banausin!', 'wut'),
    n('Sie zeigt auf den roten Stern auf ihrer Brust, als hättest du gerade auf eine Kirche gespuckt.'),
    a('Das ist das beste Shirt der Unterstadt. Das hat mehr Konzerte gesehen als du Dächer. … Früher.', 'wut'),
    n('Das „früher“ hängt kurz in der Luft. Dann wischt sie es mit einem Grinsen weg.'),
    a('Okay. Okay, das war gut. Gossenmaul. Ich mag Gossenmäuler.', 'freude'),
  ], { next: 'wette' }),
  node('zahlen', [
    n('Du zählst zwanzig Credits auf die Kiste. Langsam. Jeden einzeln.'),
    a('Langweilig. Aber pünktlich.', 'neutral'),
    n('Sie steckt das Geld ein, ohne hinzusehen, und tippt sich mit dem Schläger an die Stirn.'),
    a('Freitag. Dach. Ich hol mir die zwanzig mit Zinsen zurück. Von dir. Persönlich.', 'signatur'),
  ], { next: 'wette' }),
  node('wette', [
    a('Also. Wette. Freitag oder Samstag, nachts. Kante über dem Kiosk in der Neon-Gasse, Ziel ist Opa Gurrmanns Taubenschlag in den Lötgassen. Wer zuerst da ist, gewinnt.', 'signatur'),
    a('Wer verliert, zahlt. Zehn Prozent, rückwirkend bis zur Steinzeit, und \'ne Volt-Limo. Jeden Abend. Eine Woche.', 'freude'),
    v('Und wenn du verlierst?'),
    a('Ich verlier nicht. Ich hab \'nen Arm, der Stahltüren aufmacht.', 'signatur'),
    v('Und ich hab Beine, die nicht vor Stahltüren stehen bleiben.'),
    a('… Uuuh. Freitag, Postbotin.', 'freude'),
    n('Sie rutscht vom Paketstapel, das Ticken tickt weiter, und an der Tür dreht sie sich noch einmal um.'),
    a('Und hör auf, so lässig an der Wand zu lehnen. Das macht mich aggressiv. Glaub ich. Irgendwas macht\'s jedenfalls.', 'ueberrascht'),
    n('Weg ist sie. Kurier zwei atmet wieder. Kurier eins sagt leise: „Chefin. Ich setz zehn Cr auf die Zöpfe.“'),
    v('Du bist gefeuert.'),
  ], { effects: [set('vexaria_wette'), msg('Neue Wette: Dachrennen gegen Aria, Fr/Sa nachts, Dachkante der Neon-Gasse.')] }),
]);

// ---------------------------------------------------------------------------
// Station 2 · rom-vexaria-luecke · „Da spring ich nicht“ (Tafel)

const luecke1: DialogueDef = dlg('rom-vexaria-luecke', [
  node('start', [
    n('Die Dachkante über der Neon-Gasse. Unten wummert der High Voltage, oben pfeift der Wind durch Antennen und Kabelsalat. Jemand hat mit Kreide einen Strich auf den Lüftungsschacht gezogen.'),
    n('Hinter dir drängeln sich ein halbes Dutzend Schrapnell-Kuriere und schieben Credits hin und her. Die Quoten werden geflüstert, als wären sie unanständig.'),
    a('Regeln: Es gibt keine. Wer zuerst am Taubenschlag ist, gewinnt. Wer runterfällt, hat verloren und ist tot. In der Reihenfolge.', 'signatur'),
    v('Du redest zu viel für jemanden, der gleich nur meine Hacken sieht.', 'signatur'),
    a('Deine Hacken sind mir egal. Ich guck eh lieber woanders hin. … Auf die Strecke. Auf die STRECKE, Postbotin.', 'freude'),
    s('vega', 'Vega hier, Ausguck. Ich hab euch im Visier. Rein beruflich. Wind von links, sechs Knoten. Wenn eine von euch fällt, mach ich ein Foto für Hunter.', 'signatur'),
    a('Vega, du bist die Schlechteste.', 'freude'),
    s('vega', 'Ich bin die Beste. Drei. Zwei. Eins.', 'neutral'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Los.', 'rennen'),
      ch('„Letzte Chance, Zöpfe. Gib auf, dann tut\'s nicht weh.“', 'stichelei'),
    ],
  }),
  node('stichelei', [
    a('Ich geb nie auf. Ich geb höchstens an.', 'signatur'),
    s('vega', 'EINS, hab ich gesagt.', 'wut'),
  ], { next: 'rennen' }),
  node('rennen', [
    n('Du fliegst. Das ist das einzige Wort dafür. Kante, Rohr, Geländer, ein Schritt auf eine Satellitenschüssel, die unter dir scheppert wie ein Gong. Dächer sind dein Zuhause. Der Rest der Stadt ist nur der Keller.'),
    n('Aria rennt nicht. Aria passiert. Wie ein Unwetter. Wo du über ein Gitter steigst, geht sie durch – der Zerberster schlägt einmal zu, das Gitter fliegt drei Meter weit und landet in jemandes Wäsche.'),
    s('vega', 'Abstand vier Meter. Drei. Aria, das war ein Geländer. Das war Hunters Geländer.', 'neutral'),
    v('Das ist Betrug!', 'wut'),
    a('Das ist WERKZEUG!', 'freude'),
    n('Ihr seid gleichauf. Ihr Atem ist laut, deiner ist leise. Ihr Lachen ist lauter als beides.'),
    n('Dann kommt die Lücke.'),
    n('Viereinhalb Meter. Neun Stockwerke. Unten nur Dunkelheit und das ferne Pink einer Reklame, die „GLÜCK“ verspricht. Deine Beine bleiben stehen. Einfach so. Wie angeschraubt. Dein Daumen findet die Schnalle am Brustriemen und reibt daran, hin und her, hin und her.'),
  ], {
    choices: [
      ch('Springen.', 'springen-nicht', { tag: '[Nicht hier]', requires: { flag: 'vexaria_luecke_gesprungen' } }),
      ch('Die Feuertreppe. Runter, rüber, wieder rauf.', 'treppe'),
    ],
  }),
  node('springen-nicht', [n('Nein.')], { next: 'treppe' }),
  node('treppe', [
    n('Du nimmst die Feuertreppe. Dreißig rostige Stufen runter, durch einen Hinterhof, der nach Fett riecht, dreißig wieder rauf. Ohne nachzudenken. Dein Körper kennt den Weg, als wäre er ihn hundertmal gegangen. Ist er auch.'),
    n('Über dir hörst du, wie Aria Anlauf nimmt.'),
  ], { effects: [{ cutscene: 'rom-vexaria-luecke' }] }),
]);

const luecke2: DialogueDef = dlg('rom-vexaria-luecke-ziel', [
  node('start', [
    n('Die letzten Dächer. Du holst auf. Natürlich holst du auf – über Wellblech und Taubendreck bist du schneller als jeder Mensch mit zwei echten Armen, und schneller als jede Frau mit einem Zerberster.'),
    n('Der Taubenschlag. Opa Gurrmanns Wäscheleine. Ihr kommt gleichzeitig an, ihr springt gleichzeitig, ihr verheddert euch gleichzeitig.'),
  ], {
    choices: [
      ch('Durchziehen. Das letzte Stück auf die Zehenspitzen.', 'fotofinish', { check: chk('vexaria-luecke-reflexe', 'reflexe', 6, ['dach', 'springen']), effects: [herz(40), set('vexaria_luecke_gleichstand')] }),
      ch('Sie kommt einen Hauch eher an. Ist so.', 'verloren', { effects: [herz(30), set('vexaria_limo_schuld')] }),
    ],
  }),
  node('fotofinish', [
    s('vega', 'Gleichstand. Auf den Zentimeter. Ich hab gemessen. Zweimal.', 'neutral'),
    a('Gleichstand?! Ich hab Hunters Geländer GEOPFERT!', 'wut'),
    v('Und ich die Treppe. Wir teilen.'),
  ], { next: 'leine' }),
  node('verloren', [
    s('vega', 'Aria. Mit einer Nasenlänge. Wobei sie auch die größere Nase hat.', 'neutral'),
    a('HA! Volt-Limo, Postbotin! Eine Woche! Jeden Abend! Mit Strohhalm!', 'freude'),
    v('Ich hasse Strohhalme.'),
    a('Darum ja.', 'signatur'),
  ], { next: 'leine' }),
  node('leine', [
    n('Und dann liegt ihr da. In einem Haufen aus Opa Gurrmanns Overalls, verheddert in seiner Wäscheleine, Aria quer über dir. Irgendwo gurrt eine Taube empört.'),
    a('Ich lieg auf dir.', 'ueberrascht'),
    v('Merk ich.'),
    a('Ich bin schwer.', 'neutral'),
    v('Merk ich auch.'),
    n('Ihr Herz hämmert gegen dein Brustbein. Oder deins gegen ihres. Bei dem Krach kann man das nicht so genau sagen.'),
    a('… Ich steh gleich auf.', 'ueberrascht'),
  ], {
    choices: [
      ch('„Gleich ist nicht jetzt.“', 'liegen', { effects: [herz(20)] }),
      ch('„Runter von mir, Zöpfe.“', 'runter', { effects: [herz(10)] }),
    ],
  }),
  node('liegen', [
    v('Gleich ist nicht jetzt.', 'signatur'),
    n('Aria bleibt liegen. Eine Sekunde. Zwei. Drei. Drei Sekunden zu lang für zwei Leute, die sich nicht leiden können. Dann rappelt sie sich auf und klopft sich Federn vom Shirt.'),
    a('Du bist echt komisch, Postbotin.', 'ueberrascht'),
  ], { next: 'dach' }),
  node('runter', [
    v('Runter von mir, Zöpfe.'),
    n('Aria lacht, rollt sich ab und nimmt dabei einen ganzen Overall mit, der jetzt wie ein Umhang an ihr hängt.'),
    a('Ich bin jetzt Superheldin. Captain Wäscheleine. Fürchte mich.', 'freude'),
  ], { next: 'dach' }),
  node('dach', [
    n('Danach sitzt ihr auf dem Dach des Taubenschlags. Die Kuriere sind abgezogen, Vega hat sich ausgeklinkt, unten blinkt die Stadt. Eine Taube sitzt zwischen euch wie eine Anstandsdame.'),
    a('Schrapnell-Kuriere, my ass. Ich dachte, du bist die Königin der Dächer, und dann nimmst du die TREPPE?', 'freude'),
    v('Treppe ist auch ein Weg.'),
    a('Treppe ist für Omas und Ripper. Du hast da gestanden wie ein Kühlschrank.', 'signatur'),
    n('Beim Reden schaust du rüber. Zur Lücke. Dein Daumen reibt an der Schnalle, hin und her. Du merkst es erst, als Aria es merkt.'),
    v('Da spring ich nicht. Punkt.', 'wut'),
    a('Okay. … Okay. Kein Ding. Ich frag nicht.', 'besorgt'),
    a('… Ich frag später.', 'freude'),
  ], {
    choices: [
      ch('„Jeder hat \'ne Stelle, an der er nicht springt. Ich hab gehört, deine ist jede Bühne der Stadt.“', 'buehne', { check: chk('vexaria-luecke-strasse', 'strasse', 5, ['geruecht']), effects: [herz(40)] }),
      ch('„Revanche. Ohne Lücke.“', 'revanche', { effects: [herz(30)] }),
      ch('„Geht dich nichts an.“', 'nichts'),
    ],
  }),
  node('buehne', [
    n('Sie wird still. Richtig still. Das hast du bei Aria noch nie gehört, und es ist lauter als alles andere an ihr.'),
    a('… Arschloch.', 'trauer'),
    a('Stimmt aber.', 'trauer'),
    n('Dann stößt sie dir mit der echten Schulter gegen die Schulter. Fest. Nicht ganz so fest, wie sie könnte.'),
    a('Gossenradio, was? Wer quatscht? Kiki? Ich bring Kiki um. Nach dir.', 'freude'),
  ], { next: 'schluss' }),
  node('revanche', [
    a('Du darfst die Strecke aussuchen. Feigling.', 'signatur'),
    v('Ich nehm die mit den meisten Treppen.'),
    a('… Du bist so ein Arsch. Ich mag das nicht. Doch. Nein.', 'freude'),
  ], { next: 'schluss' }),
  node('nichts', [
    a('Hast recht. Noch nicht.', 'neutral'),
  ], { next: 'schluss' }),
  node('schluss', [
    n('Sie steht auf, streckt sich, dass die Spiralfedern am Zerberster singen, und springt vom Taubenschlag auf das nächste Dach. Natürlich springt sie.'),
    a('Fr oder Sa, Postbotin. Jede Woche. Bis du mich einmal schlägst, ohne Treppe.', 'signatur'),
    n('Die Taube bleibt bei dir sitzen. Du bleibst auch noch. Drüben, über der Neon-Gasse, liegt die Lücke schwarz und still da und tut so, als wäre sie nichts.'),
  ], {
    effects: [
      set('vexaria_luecke_gemieden'),
      msg('Die Lücke ist jetzt auf der Karte markiert. Dachrennen mit Aria: Fr/Sa nachts im Tagesgespräch.'),
      { travel: 'loetgassen', entry: 'dach-taubenschlag', minutes: 15 },
    ],
  }),
]);

// ---------------------------------------------------------------------------
// Station 3 · rom-vexaria-armdruecken · „Mit rechts“ (Tafel, akt-armdruecken)

const armdrueckenNach = (prefix: string) => [
  node(`${prefix}-hand`, [
    n('Der Kampf ist vorbei. Eure Hände nicht. Metall um Metall, verkeilt, warm von der Reibung. Keine von euch macht Anstalten.'),
  ], {
    choices: [
      ch('Hand nicht loslassen.', `${prefix}-halten`, { effects: [herz(20), set('vexaria_hand')] }),
      ch('Loslassen.', `${prefix}-los`),
    ],
  }),
  node(`${prefix}-halten`, [
    a('Wir sind fertig, Postbotin.', 'ueberrascht'),
    n('Du hältst weiter. Die Servos summen leise. Sie zieht nicht weg.'),
    a('… Du kannst jetzt loslassen.', 'neutral'),
    n('Du lässt nicht los.'),
    a('… Oder halt nicht.', 'ueberrascht'),
    s('kiki-karbon', 'Oh. Oh, das geht übern Taxifunk. Das geht SOFORT übern Taxifunk.'),
    a('KIKI. Ich weiß, wo dein Taxi parkt.', 'wut'),
    s('kiki-karbon', 'Im Halteverbot, Süße. Wie immer. Kurs liegt an!'),
  ], { next: `${prefix}-ende` }),
  node(`${prefix}-los`, [
    n('Du lässt los. Sie auch. Gleichzeitig, als hättet ihr es abgesprochen. Hattet ihr nicht.'),
    a('Nächste Woche. Selber Tisch. Selbe Kerze.', 'signatur'),
  ], { next: `${prefix}-ende` }),
  node(`${prefix}-ende`, [
    n('Als du aufstehst, knirscht dein Ellbogen. Ein neues Geräusch. Kein gutes. Ripper-Ware mag keine Klassenkämpfe.'),
    a('Hörst du das? Dein Ellbogen klingt wie Dantes Kaffeemaschine. Geh zu Dante. Echt jetzt. Ich komm mit und guck zu, wie er flucht.', 'besorgt'),
  ], { effects: [msg('Dein Ellbogen knirscht. Dante könnte mal draufschauen (Werkstatt, tagsüber oder abends).')] }),
];

const armdruecken: DialogueDef = dlg('rom-vexaria-armdruecken', [
  node('start', [
    n('Aria hat den Zerberster demonstrativ hinter den Rücken geklemmt. Rechts gegen rechts. Fair.'),
    n('Du knallst deinen Metallarm auf den Tisch. Die Kolben am Ellbogen zischen wie eine beleidigte Katze. Die Crew macht „Uuuh“.'),
    v('Rechts ist Blech, Zöpfe. Wenn schon Mord, dann fair.', 'signatur'),
    n('Aria grinst. Langsam. Gefährlich. Dann holt sie den Zerberster wieder nach vorn und legt ihn auf die Tischecke, ihr linker gegen deinen rechten, die Daumen verkeilt.'),
    a('Ratenarm gegen Dante-Arm. Das ist kein Armdrücken mehr, das ist Klassenkampf.', 'freude'),
    s('kiki-karbon', 'Kurs liegt an, Süße! Metall gegen Metall, Leute, Abstand, gleich spritzt Hydrauliköl! Drei zu eins auf den Zopf, fünf zu eins auf die Locken!'),
    v('Fünf zu eins? Kiki, ich bring dir nie wieder ein Paket.', 'wut'),
    s('kiki-karbon', 'Dann fahr ich halt selber, Süße. Ich hab \'ne Rückbank.'),
    n('Kiki gibt das Zeichen. Die Servos singen. Das Holz knackt. Zwei Metallhände, die beide nichts spüren, und zwei Gesichter, die sich über ihnen immer näher kommen.'),
    a('Dein Ding zischt.', 'signatur'),
    v('Deins klappert.', 'signatur'),
    a('Meins klappert nie.', 'neutral'),
    v('Dann ist es meins. Lass los, dann wird\'s leiser.'),
    a('Vergiss es.', 'freude'),
    v('Zwei Blechhände. Spürt keine von uns was.'),
    a('Red für dich, Postbotin.', 'ueberrascht'),
    n('Sie senkt den Blick nicht. Ihr Gesicht ist so nah, dass du die Sommersprosse unter ihrem linken Auge zählen könntest, wenn es mehr als eine wäre.'),
    a('Du riechst nach Regen und Kettenöl. Das lenkt ab. Hör auf damit.', 'ueberrascht'),
    v('Ich riech nach Arbeit. Du riechst nach Kneipe.'),
    a('Ich riech nach SIEG.', 'signatur'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Durchdrücken. Fair. Mit allem, was der Ratenarm hergibt.', 'koerper', { check: chk('vexaria-armdruecken-koerper', 'koerper', 5, ['kraft']), effects: [herz(50), set('vexaria_armdruecken_sieg')] }),
      ch('„Dein Zopf hängt in der Kerze.“', 'zopf', { check: chk('vexaria-armdruecken-strasse', 'strasse', 5, ['bluff']), effects: [herz(40), set('vexaria_armdruecken_sieg')] }),
      ch('Eine Münze unter den Ellbogen schieben. Gassentrick gegen Rutschen.', 'muenze', { tag: '[Gosse]' }),
      ch('Ausspielen. Im Takt ziehen, halten, nicht nachgeben.', undefined, {
        effects: [{
          minigame: 'akt-armdruecken', level: 3, key: 'vexaria-armdruecken', label: 'Armdrücken gegen Aria – Metall gegen Metall',
          win: [herz(50), set('vexaria_armdruecken_sieg'), { dialogue: 'rom-vexaria-armdruecken-sieg' }],
          lose: [herz(30), { dialogue: 'rom-vexaria-armdruecken-verloren' }],
        }],
      }),
      ch('Nachgeben. Langsam. Sie soll es nicht merken.', 'verlieren', { effects: [herz(30)] }),
    ],
  }),
  node('muenze', [
    n('Eine Münze aus der Hüfttasche, unter den Ellbogen geschoben. Hält wie festgeschweißt.'),
    a('Das ist dreckig.', 'ueberrascht'),
    v('Das ist Gosse.', 'signatur'),
  ], {
    choices: [
      ch('Jetzt durchdrücken.', 'koerper', { check: chk('vexaria-armdruecken-koerper-muenze', 'koerper', 4, ['kraft']), effects: [herz(50), set('vexaria_armdruecken_sieg')] }),
      ch('Nachgeben. Die Münze war nur fürs Ego.', 'verlieren', { effects: [herz(30)] }),
    ],
  }),
  node('koerper', [
    n('Zentimeter für Zentimeter. Dein Ellbogen kreischt, ihre Federn singen, Kiki kreischt mit. Dann liegt Arias Handrücken auf dem Holz.'),
    n('Stille. Die Crew hält die Luft an. Aria starrt auf ihre Hand, als gehöre sie jemand anderem.'),
    a('… Nochmal. NOCHMAL. Und diesmal guck ich dir nicht in die Augen. Das ist unfair.', 'ueberrascht'),
    v('Was ist mit meinen Augen?'),
    a('Die sind … braun. Und frech. Halt die Klappe.', 'wut'),
  ], { next: 'n-hand' }),
  node('zopf', [
    n('Aria guckt hin. Natürlich guckt sie hin. Ein halber Herzschlag – und ihr Handrücken knallt aufs Holz.'),
    a('DU MIESE … das war … das war gut.', 'wut'),
    a('Ich hasse dich. Ich zahl die nächste Runde.', 'freude'),
  ], { next: 'n-hand' }),
  node('verlieren', [
    n('Du gibst nach. Langsam genug, dass es echt aussieht. Dein Handrücken landet auf dem Holz. Die Crew johlt.'),
    a('Fast. FAST. Du hast mir fast den Zerberster verbogen. Dante hätte geheult.', 'freude'),
    a('… Komm, ich geb dir \'nen Drink aus. Als Trost. Und weil ich will. Das zweite ist wichtiger. Vergiss, dass ich das gesagt hab.', 'ueberrascht'),
  ], { next: 'n-hand' }),
  ...armdrueckenNach('n'),
]);

const armdrueckenSieg: DialogueDef = dlg('rom-vexaria-armdruecken-sieg', [
  node('start', [
    n('Arias Handrücken liegt auf dem Holz. Die Kerze flackert. Kiki zählt schon Geld.'),
    a('… Nochmal. NOCHMAL. Und diesmal guck ich dir nicht in die Augen. Das ist unfair.', 'ueberrascht'),
  ], { next: 's-hand' }),
  ...armdrueckenNach('s'),
]);

const armdrueckenVerloren: DialogueDef = dlg('rom-vexaria-armdruecken-verloren', [
  node('start', [
    n('Dein Handrücken liegt auf dem Holz. Die Crew johlt, Kiki kassiert.'),
    a('Fast. FAST. Du hast mir fast den Zerberster verbogen. Dante hätte geheult.', 'freude'),
    a('Komm, ich geb dir \'nen Drink aus. Als Trost. Und weil ich will. Das zweite ist wichtiger. Vergiss, dass ich das gesagt hab.', 'ueberrascht'),
  ], { next: 'l-hand' }),
  ...armdrueckenNach('l'),
]);

// Arm-Wartung bei Dante: gebaut in npc-crew-a/dante.ts (`dante-tag-armwartung`, Flag `vexaria_armwartung`).

// ---------------------------------------------------------------------------
// Ripper-Tag (beide Fassungen, ab Spielstart): Montagabend am Ecktisch, 25 Cr Rate.

const ripperVarianten: { id: string; days: number[]; line: string }[] = [
  { id: 'a', days: [1, 2, 3, 4, 5, 6, 7], line: 'Noch dreißig. Ich hab Geduld. Der Arm auch.' },
  { id: 'b', days: [8, 9, 10, 11, 12, 13, 14], line: 'Pünktlich wie immer. Du bist meine Lieblingsschuldnerin.' },
  { id: 'c', days: [15, 16, 17, 18, 19, 20, 21], line: 'Wenn du mal nicht zahlst, hol ich ihn mir. Finger für Finger.' },
  { id: 'd', days: [22, 23, 24, 25, 26, 27, 28], line: 'Montag, Schätzchen. Mein Lieblingstag. Ich zähl Geld, du zählst Finger.' },
];

const ripperTag = (id: string, line: string): DialogueDef => dlg(`vexaria-ripper-tag-${id}`, [
  node('start', [
    n('Montagabend. Rippers Ecktisch im High Voltage. Ein Kassenbuch, ein Glas mit irgendwas Grünem, eine Lupe. Er sieht nicht hoch, als du dich setzt.'),
    s('ripper', line, 'signatur'),
  ], {
    choices: [
      ch('25 Cr hinlegen.', 'bezahlt', { requires: { credits: 25 }, effects: [{ credits: -25 }] }),
      ch('„Nächste Woche doppelt.“', 'anschreiben'),
    ],
  }),
  node('bezahlt', [
    v('Montag. Wie immer.', 'signatur'),
    s('ripper', 'Wie immer. Du bist so zuverlässig, dass es mich ein bisschen traurig macht.'),
  ], {
    choices: [
      ch('Aufstehen.', 'raus'),
      ch('Aria ansehen, die mit dem Schläger neben dem Tisch steht.', 'aria', { when: all({ companion: 'aria' }, seen('rom-vexaria-armdruecken')) }),
    ],
  }),
  node('anschreiben', [
    s('ripper', 'Ich schreib\'s an. Mit Zinsen, Schätzchen. Zinsen sind die einzigen Kinder, die ich hab.', 'signatur'),
    v('Montag. Doppelt.'),
  ], {
    choices: [
      ch('Aufstehen.', 'raus'),
      ch('Aria ansehen, die mit dem Schläger neben dem Tisch steht.', 'aria', { when: all({ companion: 'aria' }, seen('rom-vexaria-armdruecken')) }),
    ],
  }),
  node('aria', [
    a('Ich zahl nix. Ich guck nur. Das ist gratis.', 'signatur'),
    s('ripper', 'Die Brecherin. Wie reizend. Möchtest du auch einen Ratenplan, Liebes? Ich hab noch Platz im Buch.'),
    a('Ich hab noch Platz in deinem Gesicht, Ripper.', 'wut'),
  ], {
    choices: [
      ch('„Lass gut sein, Stern.“', 'raus', { when: flag('vexaria_oberlicht') }),
      ch('„Lass gut sein, Zöpfe.“', 'raus', { when: noFlag('vexaria_oberlicht') }),
      ch('Ihr Angebot, die Raten zu übernehmen, ablehnen.', 'angebot', { when: flag('aria_kuss') }),
    ],
  }),
  node('angebot', [
    a('Ich könnte die übernehmen, weißt du. Die Raten. Alle. Hunter zahlt mir zu viel, ich kauf eh nur Kronkorken.', 'besorgt'),
    v('Nee. Den stotter ich selber ab. Ist das Einzige, was ich behalt.', 'zaertlich'),
    n('Aria sagt nichts. Sie legt nur kurz die echte Hand auf deinen Metallarm, genau da, wo die Lichtnähte laufen. Ripper sieht es und schreibt etwas in sein Buch. Wahrscheinlich „Zinsen“.'),
  ], { next: 'raus' }),
  node('raus', [n('Ripper klappt das Buch zu. Der Arm summt, als wüsste er, dass er noch eine Woche dir gehört.')]),
]);

// ---------------------------------------------------------------------------
// Cutscenes mit Tafeln

const cutscenes = [
  cut('rom-vexaria-luecke', 'Da spring ich nicht', [
    { image: 'black', fade: 'in', sfx: 'step', lines: [n('Über dir, auf dem Dach: Anlauf. Schwere Stiefel. Ein Lachen, das schon vor dem Sprung gewonnen hat.')] },
    { image: 'cut-rom-vexaria-luecke', pan: 'right', fade: 'in', hold: 2200, caption: 'Die Lücke. Viereinhalb Meter. Neun Stockwerke.' },
    {
      image: 'cut-rom-vexaria-luecke', pan: 'left',
      lines: [
        n('Aria springt. Landet unsauber, rollt ab, bleibt in der Hocke, die Metallhand auf dem Beton, der Schläger klappernd daneben. Dann zeigt sie mit dem Finger auf dich und johlt.'),
        a('WAS IST LOS, POSTBOTIN? HAST DU DEINE FLÜGEL ZUHAUSE GELASSEN?', 'freude'),
        n('Du stehst diesseits an der Kante, die Arme verschränkt. Kinn oben. Ganz ruhig. Nur dein Daumen nicht.'),
        v('Treppe.', 'signatur'),
      ],
    },
  ], [{ dialogue: 'rom-vexaria-luecke-ziel' }]),
  cut('rom-vexaria-armdruecken', 'Mit rechts', [
    {
      image: 'cut-rom-vexaria-armdruecken', pan: 'in', fade: 'in', hold: 1800,
      caption: 'High Voltage, Ecktisch. Revanche.',
    },
    {
      image: 'cut-rom-vexaria-armdruecken', pan: 'left',
      lines: [
        s('kiki-karbon', 'Wetten werden angenommen, Süße! Revanche des Jahrhunderts! Zöpfe gegen Locken!'),
        a('Mit rechts. Mit links wär\'s Mord, und Hunter hat gesagt, keine Morde vor Mitternacht.', 'signatur'),
        n('Klebriges Holz, eine Kerze in einer Flasche, die ganze Crew drängt sich um den Tisch. Eure Hände greifen ineinander. Echte Haut gegen Handschuh. Noch.'),
      ],
    },
  ], [{ dialogue: 'rom-vexaria-armdruecken' }]),
];

// ---------------------------------------------------------------------------
// Herz-Ereignisse (hängen an Aria, siehe aria.ts)

export const RIVALINNEN_EVENTS: HeartEventDef[] = [
  station({
    id: 'rom-vexaria-schutzgeld', hearts: 4, map: 'loetgassen', time: 'abend',
    when: all(V, HEUTE_FREI, { quest: 'main-1-dexter', state: 'done' }),
    dialogue: 'rom-vexaria-schutzgeld',
  }),
  station({
    id: 'rom-vexaria-luecke', hearts: 5, map: 'neon-gasse', time: 'nacht',
    when: all(V, HEUTE_FREI, flag('vexaria_wette'), { weekday: ['fr', 'sa'] }),
    dialogue: 'rom-vexaria-luecke',
  }),
  station({
    id: 'rom-vexaria-armdruecken', hearts: 6, map: 'high-voltage', time: 'abend',
    when: all(V, HEUTE_FREI, seen('rom-vexaria-luecke'), seen('rom-aria-training')),
    cutscene: 'rom-vexaria-armdruecken',
  }),
];

// Ripper-Tag als Kartenauslöser (wiederholbar, einmal pro Montag).
const ripperTrigger = ripperVarianten.map((r) => ({
  id: `vexaria-ripper-tag-${r.id}`,
  once: false,
  when: all(V, { weekday: 'mo' }, { time: 'abend' }, noFlag('vexaria_rate_diese_woche'), { cycleDay: r.days }),
  dialogue: `vexaria-ripper-tag-${r.id}`,
  effects: [set('vexaria_rate_diese_woche')],
}));

export const part: ContentPart = {
  dialogues: byId([
    schutzgeld, luecke1, luecke2, armdruecken, armdrueckenSieg, armdrueckenVerloren,
    ...ripperVarianten.map((r) => ripperTag(r.id, r.line)),
  ]),
  cutscenes: byId(cutscenes),
  mapAdditions: {
    'high-voltage': { onEnter: ripperTrigger },
  },
};

