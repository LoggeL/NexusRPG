// Delya Delloraine in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §5.3–5.5). Nur Freundschaft (Romanze nicht freigegeben).
// Keine Inhaltsdatei: delya-delloraine.ts baut daraus Figur und Teil.
// - he-delya-delloraine-8: Feuertreppe, warum sie Reporterin wurde (die Kassette mit dreiundvierzig „Nein“),
// - he-delya-delloraine-10: ihre eigene Sendung „Ungefragt“, die Spielfigur als erster Gast, Andenken presseausweis-gold,
// - Tagesgespräche zu Chipträgern, Zensur, Chrome-10-Codes, Nyra, Aria, Schlafwandlern, Party, Partynacht, Enden,
//   Master-Modus (gechippt nach außen, ein Zettel nach innen),
// - Telefon: Hinweis aufs Pumpwerk, solange Aria gechippt weg ist,
// - Tagesablauf: Presse-Ecke/Presse-Podest in der Partynacht (act23.json), Urlaub am Meer nach Ende 1.
import type { Condition, DialogueDef, PhoneMessageDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menu, ARIA_WEG, ARIA_ZURUECK, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG, MASTER, MEER_ENDE, NACH_BRUCH, NYRA_WEG,
  PARTYNACHT, PARTY_PLAN, all, chk, daily, dlg, erz, flag, ich, noFlag, node, rel, rep, set, sp, talk, weiter, xp,
} from './_util';

const D = sp('delya-delloraine');
const C = sp('collin-charleston');
const K = sp('kameramann');

const ID = 'delya-delloraine';
const QUELLE_AKTIV: Condition = { quest: 'pers-delya-quelle', state: 'active' };
const QUELLE_DONE: Condition = { quest: 'pers-delya-quelle', state: 'done' };
const EINLASS_OFFEN: Condition = { not: { quest: 'main-3-einlass', state: 'done' } };

// ------------------------------------------------------------------------------------------- he-delya-delloraine-8

const he8 = dlg('he-delya-delloraine-8', [
  node('start', [
    erz('Die Redaktion, abends. Delya sitzt vor einem Ausdruck, auf dem quer in roter Tinte steht: „GESTRICHEN – nicht im Sinne von Chrome 10. H. G.“ Darunter ihr Bericht über Leute, die nachts durch den Kanal laufen und „Master“ murmeln.'),
    D('Zum vierten Mal diese Woche. Er streicht nicht mal mehr mit dem Lineal. Er hat jetzt einen Stempel.', 'wut'),
    D('Komm. Ich brauch Luft. Und jemanden, der nicht für Glattstrich arbeitet.'),
    erz('Die Feuertreppe des Studios. Delya hat zwei Becher Synth-Kaffee mitgebracht und ein altes Foto: ein kleines Mädchen mit einem Kassettenrekorder, der größer ist als sein Kopf.'),
    D('Ich war acht. Unser Block in der Rohrsiedlung sollte abgerissen werden. Im Fernsehen hieß es: „Freiwillige Umsiedlung, alle Bewohner einverstanden“. Keiner war einverstanden.', 'trauer'),
    D('Ich bin mit dem Rekorder durch alle Wohnungen und hab gefragt. Dreiundvierzig Leute. Dreiundvierzig Mal „Nein“. Die Kassette hab ich zum Sender gebracht. Sie haben sie nie gespielt.', 'wut'),
    D('Deshalb mach ich das. Nicht für die Wahrheit. Für die dreiundvierzig.', 'besorgt'),
  ], {
    choices: [
      { text: '„Block neun, oder? Ein paar von denen wohnen noch in der Siedlung. Ich kenn die Gesichter.“', check: chk('he-delya-8-block', 'strasse', 5, ['geruechte', 'unterstadt']), next: 'block' },
      { text: '„Dann spiel sie. Endlich. Nicht für den Sender. Für die Stadt.“', check: chk('he-delya-8-senden', 'ausstrahlung', 6, ['ueberreden', 'mut']), next: 'senden' },
      { text: '„Ich war eins von den Kindern im Nachbarblock. Wir haben euch Steine ans Fenster geworfen.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' }, next: 'gosse' },
      { text: '„Hast du die Kassette noch?“', next: 'kassette' },
      { text: 'Ihr den Becher nachfüllen und schweigen.', next: 'schweigen' },
    ],
  }),
  node('block', [
    ich('Die alte Frau Kowal mit dem Papagei. Der Schweißer mit der Hasenscharte, der jetzt am Imbiss steht. Die Zwillinge, die heute Schrott sortieren. Die haben alle Nein gesagt. Und die leben alle noch.'),
    D('Die leben noch.', 'ueberrascht'),
    erz('Sie zieht ihr Notizbuch raus. Ihre Hand zittert, als sie die Namen aufschreibt. Es ist das erste Mal, dass du Delya Namen aufschreiben siehst.'),
    D('Ich nenne keine Namen. Aber diese hier … die frag ich, ob sie genannt werden wollen. Alle dreiundvierzig. Wenn es so viele noch gibt.', 'freude'),
  ], { effects: [rel(ID, 30), set('delya_43_leben')], next: 'ende' }),
  node('senden', [
    D('Spielen. Einfach so.', 'besorgt'),
    ich('Nicht einfach so. Laut. Auf jedem Stadt-TV der Unterstadt. Dreiundvierzig Mal „Nein“, mitten zwischen zwei Chrome-10-Spots. Die Stadt kann gerade jedes Nein gebrauchen.'),
    erz('Sie sieht dich lange an. Dann lacht sie. Nicht ihr höfliches Nachrichtensprecherinnen-Lachen. Ein echtes, kurzes, freches Lachen.'),
    D('Glattstrich kriegt einen Herzinfarkt. … Gut. Ich mach’s. Nicht heute. Aber bald. Und wenn ich es mache, sitzt du daneben.', 'signatur'),
  ], { effects: [rel(ID, 30), set('delya_kassette_senden')], next: 'ende' }),
  node('gosse', [
    D('Ihr wart das? Die Steine mit den Zetteln dran? „Haut ab, Fernsehfresser“?', 'ueberrascht'),
    ich('Wir dachten, ihr seid vom Sender. Wegen dem Rekorder.'),
    D('Ich war acht und hatte Zöpfe und einen Rekorder, der größer war als ich. Und ihr hattet recht. Ich wollte zum Sender. Ich wollte nur, dass er zuhört.', 'freude'),
    D('Du schuldest mir eine Fensterscheibe, übrigens. Ich nehme sie in Informationen.', 'signatur'),
  ], { effects: [rel(ID, 40)], next: 'ende' }),
  node('kassette', [
    D('Natürlich. Unter meinem Kopfkissen. Ich hab sie dreimal digitalisiert, auf drei verschiedenen Kristallen, versteckt an drei verschiedenen Orten.', 'freude'),
    D('Ich nenne keine Namen. Aber ich habe dreiundvierzig Stimmen.'),
  ], { next: 'ende' }),
  node('schweigen', [erz('Du füllst nach. Sie nickt, ohne dich anzusehen. Manchmal ist das die einzige Frage, die man stellen muss.')], { effects: [rel(ID, 20)], next: 'ende' }),
  node('ende', [erz('Ihr sitzt, bis der Kaffee kalt ist. Unten blinkt die Stadt, über ihr die Quantum-Drohnen. Irgendwo darin dreiundvierzig Leute, die nie gesendet wurden. Noch nicht.')], {
    effects: [xp(80), rel(ID, 40), set('delya_warum_erzaehlt')],
  }),
]);

// ------------------------------------------------------------------------------------------- he-delya-delloraine-10

const he10 = dlg('he-delya-delloraine-10', [
  node('start', [
    erz('Ein neues Studio, eine Etage unter Collins. Kahle Wände, ein Tisch, zwei Stühle, eine Kamera. Über der Tür ein Schild: „DELLORAINE – UNGEFRAGT“.'),
    D('Meine eigene Sendung. Fünfzehn Minuten. Mittwochs, 23:40. Keine Werbung. Kein Glattstrich. Kein Collin, außer er bringt Croissants.', 'freude'),
    C('(durch die Tür) Ich hab Croissants!', 'freude'),
    D('Natürlich hat er Croissants.', 'signatur'),
    K('[ON AIR IN 0:30]'),
  ], { choices: weiter([[flag('delya_kassette_senden'), 'kassette'], [null, 'anfang']]) }),
  node('kassette', [
    erz('Das rote Licht geht an. Delya sagt nichts. Sie legt einen alten Kassettenrekorder auf den Tisch und drückt auf „Play“.'),
    erz('Eine Kinderstimme: „Sind Sie einverstanden mit der Umsiedlung?“ Ein Mann: „Nein.“ Eine Frau: „Nein!“ Ein Papagei: „Nein, nein, nein.“ Dreiundvierzig Mal. Es dauert vier Minuten. Auf den Stadt-TV-Wänden der Unterstadt bleiben die Leute stehen.'),
    D('Guten Abend. Das war die erste Meldung, die ich je recherchiert habe. Sie kommt einunddreißig Jahre zu spät. Ich entschuldige mich bei allen dreiundvierzig.', 'neutral'),
  ], { effects: [rep('unterstadt', 5), set('delya_kassette_gesendet')], next: 'anfang' }),
  node('anfang', [
    D('Mein erster Gast ist jemand, den ich nicht vorstellen werde. Ich nenne keine Namen. Sie werden trotzdem wissen, wer es ist.', 'signatur'),
    D('Erste Frage. Wer sind Sie, wenn keiner zuguckt?'),
  ], {
    choices: [
      { text: '„Jemand, der gesehen hat, was die Chips mit den Leuten machen. Und ich erzähl’s jetzt.“', check: chk('he-delya-10-wahrheit', 'ausstrahlung', 7, ['auftritt', 'ueberzeugen']), next: 'wahrheit' },
      { text: '„Ich nenne keine Namen.“', check: chk('he-delya-10-namen', 'strasse', 6, ['witz', 'unterstadt']), next: 'namen' },
      { text: '„Jemand, der zuhört. Meistens.“', next: 'zuhoeren' },
      { text: 'In die Kamera winken. „Hallo, Kanal! Hallo, Hafen!“', next: 'winken' },
    ],
  }),
  node('wahrheit', [
    ich('Euer Nachbar sagt plötzlich „Master“? Er läuft nachts herum und weiß morgens nicht, wo er war? Das ist kein Stress. Das ist ein Chip. Und die Chrome-10-Codes auf euren Gutscheinen sind Bestellnummern. Für euch.'),
    erz('Delya unterbricht nicht. Sie stellt keine Nachfrage. Sie schiebt dir nur ein Glas Wasser hin, als du fertig bist, und sieht in die Kamera, als würde sie jede einzelne Zuschauerin persönlich ansehen.'),
    D('Wir haben das überprüft. Es stimmt. Gute Nacht, Noxius.', 'neutral'),
  ], { effects: [rep('unterstadt', 5), rep('quantum', -5), set('delya_sendung_wahrheit')], next: 'danach' }),
  node('namen', [
    D('… Sie klauen meinen Satz. Live.', 'ueberrascht'),
    ich('Ich nenne keine Namen. Aber ich hab Fotos.'),
    erz('Delya Delloraine, die Frau, die in zwölf Jahren Nachrichten kein einziges Mal die Fassung verloren hat, prustet. Live. Fünf Sekunden lang. Der Kameramann zoomt ran. Sein Visier zeigt: [ :D ].'),
    D('Das … wird geschnitten. Nein. Das wird nicht geschnitten. Das bleibt drin.', 'freude'),
  ], { effects: [rel(ID, 20), rep('nx1-medien', 5)], next: 'danach' }),
  node('zuhoeren', [
    D('Meistens.', 'neutral'),
    ich('Wenn ich nicht gerade jemanden verprügle. Oder weglaufe. Oder beides.'),
    D('Ehrlich. Das schätzen unsere Zuschauer. Ich auch.', 'freude'),
  ], { next: 'danach' }),
  node('winken', [
    erz('Du winkst. In irgendeiner Kneipe am Hafen winkt jemand zurück, das weißt du einfach. Delya sieht dich an, als wärst du ein besonders schwieriger Satz, den sie gerade lieben lernt.'),
    D('Die Sendung heißt „Ungefragt“. Sie haben sie gerade sehr ernst genommen.', 'signatur'),
  ], { next: 'danach' }),
  node('danach', [
    erz('Nach der Sendung, im Flur, drückt sie dir etwas in die Hand. Ein Presseausweis in Gold, angelaufen, mit einem Foto von einer sehr jungen Delya mit Zahnspange und einem Blick, als wolle sie gleich jemanden verklagen.'),
    D('Mein erster. Aus der ersten Woche. Mit dem kommst du überall rein, wo sie dich nicht reinlassen wollen. Und wo sie dich reinlassen, brauchst du ihn nicht.', 'freude'),
    D('Ich nenne keine Namen. Aber deinen trag ich auf der Liste mit Kugelschreiber ein. Nicht mehr mit Bleistift.', 'signatur'),
  ], { effects: [{ give: 'presseausweis-gold' }, xp(120), rel(ID, 50), rep('nx1-medien', 10), set('delya_ungefragt')] }),
]);

// ------------------------------------------------------------------------------------------- Tagesgespräche Akt 2/3

function gespraeche(M: Menu): DialogueDef[] {
  const chips = daily('delya-tag-akt2-chips',
    [D('Hundertzwölf. So viele Leute haben mir diese Woche „Das ist eine ausgezeichnete Entscheidung“ gesagt. Ich hab nichts entschieden. Ich hab nach dem Weg gefragt.', 'besorgt')],
    [
      D('Ich führe eine Strichliste. Wer „Master“ sagt, wo, um welche Uhrzeit. Es werden jeden Tag mehr. Und es fängt immer in der Unterstadt an. Immer zuerst bei denen, die sich nichts leisten können.', 'wut'),
      D('Warum verschenkt man etwas zuerst an die, die es sich nicht leisten können? Ich hab es dich im Frühling gefragt. Jetzt weiß ich die Antwort. Sie gefällt mir nicht.'),
    ],
    M);
  const zensur = daily('delya-tag-akt2-zensur',
    [D('Glattstrich hat einen Stempel. „GESTRICHEN“. Er stempelt meine Berichte, bevor ich sie fertig habe. Gestern hat er meine Einkaufsliste gestempelt. Aus Gewohnheit.', 'wut')],
    [
      D('Über dem Nachrichtentisch hängt jetzt eine Quantum-Drohne. Sie liest den Teleprompter mit. Ich hab angefangen, die Nachrichten so zu betonen, dass man hört, was fehlt. Das kann keine Drohne streichen.', 'signatur'),
      K('[SIE MACHT PAUSEN AN DEN RICHTIGEN STELLEN. ICH FILME DIE PAUSEN.]'),
    ],
    M);
  const chrome = daily('delya-tag-akt2-chrome',
    [D('Schau dir die Gutscheine an. Nicht die Vorderseite. Die Rückseite, unten rechts, ganz klein.', 'neutral')],
    [
      D('Zwölf Ziffern. Eine Seriennummer. Auf jedem Gutschein eine andere. Wer einen einlöst, wird registriert. Mit Uhrzeit, Ort und Gesicht. Chrome 10 ist kein Rabatt. Es ist eine Volkszählung.', 'besorgt'),
      D('Ich nenne keine Namen. Aber ich zähle mit.'),
    ],
    M, { effects: [set('delya_chrome_codes')] });
  const nyra = daily('delya-tag-nyra',
    [D('Eine meiner Quellen putzt im Quantum-Tower. Stockwerk siebenundachtzig. Sie sagt, da sitzt ein Mädchen mit Kopfhörern, das nie redet und jeden Abend das Fenster aufmacht, um aufs Meer zu gucken. Das man von da oben gar nicht sieht.', 'besorgt')],
    [D('Ich nenne keine Namen. Aber sie hat ihr ein Bonbon hingelegt. Das Mädchen hat es gegessen. Und gelächelt. Ganz kurz.', 'trauer')],
    M, { effects: [set('delya_nyra_gesagt')] });
  const ariaWeg = daily('delya-tag-aria-weg',
    [D('Ich hab gehört, was beim Einbruch passiert ist. Nicht aus den Nachrichten. Die erzählen etwas von Salat.', 'besorgt')],
    [D('Eine meiner Quellen hat in der Nacht im Kanal eine OP-Lampe gesehen. Pumpwerk Sieben. Eine Trage. Ein Mann mit Krallen. Ein Mann mit Lupe. Ich nenne keine Namen. Du brauchst auch keine.', 'neutral')],
    M, { effects: [set('delya_aria_hinweis')] });
  const ariaZurueck = daily('delya-tag-aria-zurueck',
    [D('Sie ist wieder da. Eure Brecherin. Ich hab sie heute auf dem Markt gesehen. Sie hat einem Quantum-Werber den Stand umgeworfen. Mit einer Hand. Ohne hinzugucken.', 'freude')],
    [D('Ich hab es nicht gesendet. Aber ich hab es mir aufgeschrieben. In die Spalte „Gute Nachrichten“. Sie ist sehr kurz, die Spalte. Aber heute ist sie länger.', 'signatur')],
    M, { effects: [set('delya_aria_zurueck_gesagt')] });
  const quelle = daily('delya-tag-quelle',
    [D('Und? Die Schlafwandler? Drei Leute, die nachts im Kanal herumlaufen. Ich habe die Orte, nicht die Namen.', 'besorgt')],
    [
      D('Einer am Floß-Anleger im Kanal-Sammler. Eine an der alten Pumpe im Pumpwerk Sieben. Einer tief im Datentunnel. Immer nachts. Bring sie zu Dante. Lebend. Wach, wenn möglich.', 'neutral'),
      D('Wenn einer von ihnen erzählt, was der Chip mit ihm gemacht hat, ist das keine Geschichte mehr. Dann ist das ein Beweis.'),
    ],
    M);
  const quelleFertig = daily('delya-tag-quelle-fertig',
    [D('Sie reden. Alle drei. Ede hat mir zwei Stunden lang erzählt, wie es ist, wenn eine Stimme im Kopf dich „Mitarbeiter“ nennt. Ich habe alles aufgenommen.', 'freude')],
    [D('Ich nenne keine Namen. Aber dieses Mal haben sie darum gebeten, genannt zu werden. Alle drei. Das ist ein Unterschied. Das ist der ganze Unterschied.', 'signatur')],
    M, { effects: [set('delya_quelle_bedankt'), rel(ID, 20)] });
  const party = daily('delya-tag-party',
    [D('Ich bin akkreditiert für die Releaseparty. Ich habe eine Frage an Blade Nocturne vorbereitet. Eine einzige. Sie kostet mich wahrscheinlich den Job.', 'besorgt')],
    [
      D('Ich hab sie fünfzigmal umgeschrieben. Jetzt hat sie neun Wörter. Ich sag sie dir nicht. Wenn ich sie laut sage, verliere ich den Mut.', 'neutral'),
      D('Und falls jemand eine Gästeliste braucht: Die grüne Mappe in der Regie hat kein Schloss. Ich nenne keine Namen. Ich beschreibe nur Möbel.', 'signatur'),
    ],
    M);
  const foyer = dlg('delya-tag-partynacht-foyer', [node('start', [
    D('Nicht jetzt. Ich bin im Dienst. Und du bist nicht hier. Ich habe dich nicht gesehen, du hast mich nicht gesehen.', 'neutral'),
    D('… Viel Glück. Inoffiziell. Das ist das Höchste, was ich anbieten kann.', 'besorgt'),
  ])]);
  const podest = daily('delya-tag-partynacht',
    [D('Neun Wörter. Ich hab sie auf die Innenseite meines Handgelenks geschrieben. Falls ich sie vergesse. Ich vergesse nie was. Aber heute vielleicht.', 'besorgt')],
    [D('Collin hat dreimal „Master“ geprobt und ist dreimal in Tränen ausgebrochen. Ich glaube, er schafft das. Ich glaube, wir schaffen das. Glauben ist nicht mein Fach. Ich mache es trotzdem.', 'neutral')],
    M);
  const endeErst = dlg('delya-tag-ende', [
    node('start', [D('{name}. Setz dich. Nein, keine Fragen heute. Nur eine Feststellung: Du lebst. Das ist meine Lieblingsmeldung des Jahres.', 'freude')], {
      choices: weiter([[ENDE_NEXUS, 'nexus'], [ENDE_3B, 'dreib'], [null, 'meer']]),
    }),
    node('meer', [
      D('Ich habe Blade die Frage gestellt. Die neun Wörter. Live. Bevor alles losging. Er hat nicht geantwortet. Das war die Antwort.', 'signatur'),
      D('Und jetzt nehme ich mir frei. Ich hab es im Fernsehen gesagt, damit ich es nicht zurücknehmen kann. Eine Woche. Am Meer. Mit einer Zeitung aus Papier und ohne Stift.', 'freude'),
    ], { next: 'schluss' }),
    node('nexus', [
      D('Ich habe Nexus interviewt. Die neue. Sie hat jede Frage beantwortet. Höflich, vollständig, mit Quellen. Es war das unheimlichste Interview meines Lebens.', 'besorgt'),
      D('Dreiundvierzig Prozent der Unterstadt trauen ihr nicht. Ich gehöre dazu. Noch. Aber ich habe ihr eine Frage gestellt, die sie nicht beantworten konnte. Sie hat gesagt: „Das weiß ich nicht.“ Das hat mich fast überzeugt.', 'neutral'),
    ], { next: 'schluss' }),
    node('dreib', [
      D('Drei Wochen lang habe ich „Alles ist gut, Master“ gesagt. Mit dem Chip im Nacken und einem Kugelschreiber in der Hand, mit dem ich unter dem Tisch alles aufgeschrieben habe.', 'wut'),
      D('Und jetzt bist du wieder hier. Ich hab eine sehr lange Liste mit Fragen. Die erste: Warum? Die zweite: Warum bist du zurückgekommen? Die zweite gefällt mir besser.', 'signatur'),
    ], { next: 'schluss' }),
    node('schluss', [], {
      choices: [{ text: '„Und was kommt jetzt?“', next: 'jetzt' }, { text: '„Ich nenne keine Namen.“', next: 'namen' }, { text: 'Bis dann, Delya.' }],
      effects: [set('delya_ende_kommentar'), xp(30), rel(ID, 20)],
    }),
    node('jetzt', [D('Jetzt? Die Aufarbeitung. Wer wusste was, wann, mit welchem Textmarker. Es wird Jahre dauern. Ich freu mich darauf. Das ist vermutlich ungesund.', 'freude')]),
    node('namen', [D('… Das ist meiner. Den kriegst du nicht. Okay, du kriegst ihn. Ein Mal. Weil du es bist.', 'freude')]),
  ]);
  const strand = daily('delya-tag-strand',
    [
      erz('Am Strand, unter einem Sonnenschirm aus einem Chrome-10-Werbebanner: Delya, im Liegestuhl, eine Papierzeitung aufgeschlagen. Sie liest sie verkehrt herum. Sie hat es nicht gemerkt.'),
      D('Ich mache Urlaub. Ich mache Urlaub. Ich mache sehr, sehr professionell Urlaub.', 'besorgt'),
    ],
    [D('Ich habe heute zwölf Fragen nicht gestellt. Einer Möwe, einem Krebs und Captain Kuschel. Er hätte geantwortet. Ich weiß es. Ich habe mich beherrscht.', 'signatur')],
    M);
  const epilog = daily('delya-tag-epilog',
    [D('Hallo. Hast du etwas gesehen, das niemand sehen sollte? Nein? Gut. Das kommt in letzter Zeit seltener vor. Ich bin fast arbeitslos.', 'freude')],
    [D('„Ungefragt“ läuft jetzt dienstags und mittwochs. Glattstrich ist versetzt worden. In die Abteilung Wetter. Er misst jetzt den Regen. Mit dem Lineal.', 'signatur')],
    M);
  const master = dlg('delya-tag-master', [
    node('start', [
      D('Guten Tag, Master. Alles ist gut, Master. Die Unterstadt ist ruhig, Master.', 'neutral'),
      erz('Im Nacken der blaue Punkt. Im Gesicht das gleiche glatte Lächeln wie bei allen. Aber ihre linke Hand liegt flach auf dem Notizbuch, und unter der Hand schaut ein Kugelschreiber heraus. Er ist warm. Er wurde gerade benutzt.'),
    ], {
      choices: [
        { text: 'Das Notizbuch unter ihrer Hand wegziehen.', next: 'buch' },
        { text: '„Du schreibst noch, oder?“', check: chk('delya-master-schreiben', 'strasse', 7, ['beobachten', 'geruechte']), next: 'schreiben' },
        { text: 'Gehen.' },
      ],
    }),
    node('buch', [
      erz('Sie lässt es zu. Ihr Lächeln bleibt. Das Notizbuch ist leer bis auf eine Seite, in einer Schrift, die beim Schreiben gezittert hat:'),
      erz('„Ich nenne keine Namen. Aber ich führe Buch. Tag 9. Der Master war wieder hier. Sah müde aus. Vielleicht ist da drin noch jemand.“'),
      D('Alles ist gut, Master.', 'neutral'),
    ], { effects: [set('delya_master_buch')] }),
    node('schreiben', [
      erz('Sie antwortet nicht. Aber ihr Daumen tippt zweimal auf den Kugelschreiber. Pause. Einmal. Das Klopfzeichen der Kanal-Kinder. Irgendwer hat es ihr beigebracht.'),
      D('Alles ist gut, Master. Fast alles.', 'neutral'),
    ], { effects: [set('delya_master_buch'), rel(ID, 10)] }),
  ]);
  return [chips, zensur, chrome, nyra, ariaWeg, ariaZurueck, quelle, quelleFertig, party, foyer, podest, endeErst, strand, epilog, master];
}

// ------------------------------------------------------------------------------------------- Bausteine für delya-delloraine.ts

export const DELYA_TALK_MASTER: TalkDef = talk('delya-tag-master', MASTER);
export const DELYA_TALK_23: TalkDef[] = [
  talk('delya-tag-ende', all(EPILOG, MEER_ENDE, noFlag('delya_ende_kommentar'))),
  talk('delya-tag-strand', all(EPILOG, ENDE_MEER, { weekday: ['sa', 'so'] }, { time: 'tag' })),
  talk('delya-tag-epilog', EPILOG),
  talk('delya-tag-partynacht-foyer', all(PARTYNACHT, EINLASS_OFFEN)),
  talk('delya-tag-partynacht', PARTYNACHT),
  talk('delya-tag-quelle-fertig', all(QUELLE_DONE, noFlag('delya_quelle_bedankt'))),
  talk('delya-tag-party', PARTY_PLAN),
  talk('delya-tag-aria-weg', all(NACH_BRUCH, ARIA_WEG, noFlag('delya_aria_hinweis'))),
  talk('delya-tag-aria-zurueck', all(ARIA_ZURUECK, { flag: 'aria_gechippt' }, noFlag('delya_aria_zurueck_gesagt'))),
  talk('delya-tag-nyra', all(NYRA_WEG, ARIA_ZURUECK, noFlag('delya_nyra_gesagt'))),
  talk('delya-tag-quelle', all(QUELLE_AKTIV, { weekday: ['mo', 'mi', 'fr', 'so'] })),
  talk('delya-tag-akt2-chips', all(NACH_BRUCH, { weekday: ['mo', 'do'] })),
  talk('delya-tag-akt2-chrome', all(NACH_BRUCH, noFlag('delya_chrome_codes'))),
  talk('delya-tag-akt2-zensur', NACH_BRUCH),
];

/** act23.json (vorangestellt): Partynacht; Master-Modus Dauersendung; Urlaub am Meer nach Ende 1. */
export const DELYA_SCHEDULE_23: ScheduleEntry[] = [
  { when: MASTER, place: { map: 'nx1-studio', at: 'studio-set' } },
  { when: all(PARTYNACHT, EINLASS_OFFEN), place: { map: 'quantum-foyer', at: 'presse-ecke' } },
  { when: PARTYNACHT, place: { map: 'himmelsgarten', at: 'presse-podest' } },
  { slot: 'tag', days: ['sa', 'so'], when: all(EPILOG, ENDE_MEER), place: { map: 'das-meer', at: 'strand' }, pose: 'sitzen' },
];

export const DELYA_PHONE: PhoneMessageDef[] = [
  {
    id: 'tel-delya-pumpwerk', from: ID,
    text: 'Ich nenne keine Namen. Aber heute Nacht hat im Pumpwerk Sieben jemand eine OP-Lampe aufgebaut. Eine Trage. Ein Mann mit Krallen, ein Mann mit Lupe. Lösch diese Nachricht. – D.',
    auto: all(NACH_BRUCH, ARIA_WEG, { met: ID }, { hearts: ID, min: 2 }, noFlag('tel_delya_pumpwerk')),
    effects: [set('tel_delya_pumpwerk'), set('delya_aria_hinweis')],
    replies: [{ text: '„Danke, Delya.“', effects: [rel(ID, 10)] }, { text: 'Löschen.' }],
  },
];

export function delya23(M: Menu): DialogueDef[] {
  return [he8, he10, ...gespraeche(M)];
}

