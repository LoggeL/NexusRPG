// Käpt'n Nebelhorn – Fährkapitän im Hafenbecken (world.md §4.4, §3.4 So angeln mit Hunter, §11.2).
// Tagesablauf nach design/plan/act1.json (npcSchedules.kaeptn-nebelhorn), Herz-Ereignisse he-kaeptn-nebelhorn-2/4/6,
// 8/10 angelegt und an act2 gebunden. Hotspots Nebelhorn (ab ♥2) und Koje (ab ♥4) liegen bei den Karten
// hafenkante/hausboot-nebelhorn. Nebenquest side-rostlaube und persönliche Quest pers-nebelhorn-letzte-faehre
// baut der Quest-Agent; hier nur der Auftakt im Gespräch.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, einmalig, AKT2, VOR_AKT2, alle, dialog, erz, flag, herz, herzEreignis, ich, knoten, pruefung, rede, sammle,
  sammleSzenen, sprecher, tagesgespraech, ZEIT_HINWEIS, erweitere,
} from './_lib';
import { MENUE_23, akt23 } from './nebelhorn-akt23';

const ID = 'kaeptn-nebelhorn';
const N = sprecher(ID);
const H = sprecher('hunter');
const ROSTLAUBE_AKTIV: Condition = { quest: 'side-rostlaube', state: 'active' };
const ROSTLAUBE_DONE: Condition = { quest: 'side-rostlaube', state: 'done' };

// ---------------------------------------------------------------------------------------------- Menü

function menue(): Menue {
  const zurueck: DialogueChoice[] = [{ text: 'Noch was, Käpt’n.', next: 'menue', id: 'zurueck' }, { text: 'Klar Schiff, Käpt’n.' }];
  const choices0: DialogueChoice[] = [
    { text: 'Wohin fährt deine Fähre eigentlich?', once: true, id: 'n-faehre', next: 'faehre' },
    { text: 'Warum fährst du nie raus aufs Meer?', requires: { hearts: ID, min: 2 }, tag: '[Nebelhorn ♥2]', once: true, id: 'n-angst', next: 'angst' },
    { text: 'Was steht da in deiner Garage?', when: { quest: 'side-rostlaube', state: 'inactive' }, next: 'garage', id: 'n-garage' },
    { text: 'Wie steht’s um die Rostlaube?', when: ROSTLAUBE_AKTIV, next: 'rostlaube-stand', id: 'n-rostlaube' },
    { text: 'Die Garage aufmachen.', when: { time: ['tag', 'abend'] }, next: 'garage-laden', id: 'n-garage-laden' },
    {
      text: 'Was ist mit dem alten Leuchtfeuer auf der Bojeninsel?', next: 'leuchtfeuer', id: 'n-leuchtfeuer',
      when: alle({ seen: 'he-kaeptn-nebelhorn-4' }, { quest: 'pers-nebelhorn-letzte-faehre', state: 'inactive' }),
    },
    { text: '„Ich hab das Meer gesehen, Käpt’n. Von den Glasdünen aus. Ganz hinten, ein Streifen Silber.“', tag: '[Ödnis]', when: { origin: 'origin-oednis' }, once: true, id: 'n-oednis', next: 'oednis', effects: [herz(ID, 50)] },
    { text: 'Erzähl mir eine Geschichte.', next: 'garn', id: 'n-garn' },
    { text: 'Klar Schiff, Käpt’n.' },
  ];
  const choices = einmalig(ID, choices0);
  const nodes: DialogueNode[] = [
    knoten('menue', [N('Raus damit, Landratte! Der Käpt’n hat Zeit. Die Fähre nicht, aber die Fähre hat auch keine Ohren.')], { choices }),
    knoten('faehre', [
      N('Wohin? Einmal ums Hafenbecken, an der Boje vorbei, wo der tote Kran steht, und zurück. Elf Minuten. Einunddreißig Jahre unfallfrei!', 'signatur'),
      N('Die Leute fragen: „Käpt’n, warum fahren Sie im Kreis?“ Und ich sag: „Weil ein Kreis nie zu Ende ist, Junge. Das ist Philosophie.“'),
      N('Und weil hinter der Hafenausfahrt das offene Meer anfängt. Und das offene Meer kann mich mal. TUUUT!'),
    ], { choices: zurueck }),
    knoten('angst', [
      N('Angst? Ich? Der Käpt’n hat vor nix Angst. Außer vor Möwen. Und vor dem Finanzamt. Und …', 'besorgt'),
      N('… und vor dem, was hinter der Mauer ist. Meine Großmutter ist rausgefahren. Mit einem Kutter, den sie selbst gebaut hat. Sie hat gesagt, sie kommt in drei Tagen wieder.'),
      N('Das war vor vierzig Jahren. Seitdem warte ich am Steg. Jeden Morgen um sechs. Mit dem Horn. Damit sie den Weg findet.', 'besorgt'),
      erz('Er dreht seine Mütze in den Händen. Dann setzt er sie wieder auf, sehr gerade.'),
      N('Erzähl’s keinem. Sonst halten mich die Leute für sentimental. Sentimentale Kapitäne kriegen keine Kundschaft.'),
    ], { choices: zurueck, effects: [herz(ID, 20)] }),
    knoten('garage', [
      N('Die Garage? Da steht die Rostlaube. Ein Kombi, älter als ich und ehrlicher als die meisten. Hat mein Bruder mir vermacht.', 'signatur'),
      N('Ich fahr nicht. Nie. Wer fährt, kommt irgendwo an, und wer irgendwo ankommt, muss sich entscheiden, ob er bleibt. Hab ich keine Lust drauf.'),
      N('Aber wenn einer sie zum Laufen kriegt … Zündkerze, Kühlerpumpe, Batterie, alles im Eimer … dann gehört sie dem. Zum Fahren. Nicht zum Verkaufen, sonst kriegst du das Horn über den Schädel.'),
    ], {
      choices: [
        { text: 'Ich krieg sie zum Laufen.', next: 'garage-ja', effects: [{ startQuest: 'side-rostlaube' }] },
        { text: 'Mal sehen.', next: 'menue' },
      ],
    }),
    knoten('garage-ja', [N('HA! Ein Optimist! Die sind selten am Hafen. Die meisten ertrinken früh. Klar Schiff, Kleines! Schlüssel liegt unter dem dritten Reifen von links.', 'freude')], { choices: zurueck }),
    knoten('rostlaube-stand', [
      N('Zündkerze aus der Drohnenwette oder vom alten Gustav. Kühlerpumpe von Fluss-Frieda, wenn du feilschen kannst, oder aus dem Pumpwerk, wenn du lebensmüde bist. Batterie aus Schrott zusammenlöten oder im Digitech-Keller klauen.', 'signatur'),
      N('Und wenn du alles hast, einbauen. Oder Dante fragen. Der baut alles ein. Einmal hat er mir ein Radio in die Pfeife gebaut. Ich hör seitdem Schlager beim Rauchen.'),
    ], { choices: zurueck }),
    knoten('garage-laden', [N('Ersatzteile, Öl, Kram von meinem Bruder. Fass nix an, was tickt.')], { choices: [{ text: 'Zeig her.', effects: [{ shop: 'garage-rostlaube' }] }, ...zurueck] }),
    knoten('leuchtfeuer', [
      N('Das Leuchtfeuer auf der Bojeninsel. Das war das Licht, nach dem meine Großmutter gesteuert hat. Seit dem großen Sturm ist es aus.', 'besorgt'),
      N('Wenn das wieder brennt … dann sieht man es bis hinter die Mauer. Bis aufs Meer. Dann findet jeder heim, der noch draußen ist.'),
      N('Ich fahr dich rüber. Mit der Fähre. Einmal nicht im Kreis. Mir wird jetzt schon schlecht. Kommst du?'),
    ], {
      choices: [
        { text: 'Wir bringen das Licht zurück.', next: 'leuchtfeuer-ja', effects: [{ startQuest: 'pers-nebelhorn-letzte-faehre' }] },
        { text: 'Bald, Käpt’n.', next: 'menue' },
      ],
    }),
    knoten('leuchtfeuer-ja', [N('Dann klar Schiff! Und wenn ich kotze, guckst du weg. Kapitäne kotzen nicht. Kapitäne opfern dem Meer.', 'freude')], { choices: zurueck }),
    knoten('oednis', [
      N('Du … hast es GESEHEN? Das Meer? Mit deinen eigenen Glotzern?', 'ueberrascht'),
      N('Erzähl! Nein, warte! Ich hol meinen Rum. Nein, ich hol zwei. Nein – erzähl einfach! Ist es groß? Ist es nass? Riecht es nach Fisch oder nach Freiheit?'),
      ich('Nach beidem.'),
      N('Nach beidem. Hast du gehört, Horn? NACH BEIDEM! TUUUUT!', 'freude'),
    ], { choices: zurueck }),
    knoten('garn', [
      N('Eine Geschichte? Hör zu. Einundsiebzig hatte ich einen Wal im Hafenbecken. Einen echten! So lang wie drei Fähren!', 'signatur'),
      N('Okay, es war ein Gummiboot. Ein großes. Graues. Von der Ordnungsbehörde. Mit drei Polizisten drin, die mich verhaften wollten, weil ich zu laut tute.'),
      N('Ich hab getutet, bis sie umgedreht sind. Seitdem darf ich tuten, wann ich will. Gewohnheitsrecht, Junge. Das ist das stärkste Recht von allen. TUUUT!'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

const M = erweitere(menue(), MENUE_23);

const RIVALE: Menue = {
  choices: [{ text: 'Ich will das klären, Käpt’n.', next: 'klaeren' }, { text: 'Dann eben nicht.' }],
  nodes: [
    knoten('klaeren', [
      N('Klären? Erst kommst du mir krumm und dann willst du klären? Die Fähre ist ohne dich losgefahren, und sie fährt auch morgen ohne dich los.', 'besorgt'),
      N('Bring mir was Anständiges. Treibholz. Algen-Chips. Irgendwas mit Salz. Dann reden wir. Vielleicht.'),
    ]),
  ],
};

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  rivale: tagesgespraech('kaeptn-nebelhorn-tag-rivale',
    [N('Du schon wieder. Die Fähre ist voll. Ist sie immer, wenn du kommst. Komisch, oder?', 'besorgt')],
    [N('Ich hab einunddreißig Jahre keinen Passagier über Bord geworfen. Ich überleg gerade, ob ich das Jubiläum feiern oder brechen will.')],
    RIVALE),
  erstes: tagesgespraech('kaeptn-nebelhorn-tag-erstes',
    [
      erz('Ein alter Mann mit weißem Rauschebart, Kapitänsmütze, Pfeife im Mundwinkel und einem Messinghorn unter dem Arm, so groß wie ein Waschzuber.'),
      N('Ahoi, Landratte! Neu am Hafen? Das riech ich. Du riechst nach U-Bahn und Hoffnung. Beides geht weg, wenn man lang genug am Wasser steht.', 'freude'),
      N('Käpt’n Nebelhorn. Fährkapitän, Hafenlegende, Herr über das Horn. Klar Schiff!'),
      erz('Er setzt das Horn an. TUUUUUUUT. Drei Möwen fallen vom Kran. Irgendwo flucht ein Hafenarbeiter.'),
    ],
    [N('Das macht man so. Zur Begrüßung. Und zum Abschied. Und wenn man Hunger hat. Eigentlich immer.')],
    M),
  zeit: tagesgespraech('kaeptn-nebelhorn-tag-zeit',
    [
      N('{name}. Komm her. Ich hab im Regal was gefunden. Ein altes Buch. Mit Salzflecken. Aber ich trau mich nicht, es aufzuschlagen. Noch nicht.', 'besorgt'),
      erz(ZEIT_HINWEIS),
    ],
    [N('Manche Bücher muss man erst lesen, wenn man bereit ist, dass sie einen nass machen. Von innen.')],
    M, { effects: [flag('nebelhorn_zeit_hinweis')] }),
  rostlaubeFertig: tagesgespraech('kaeptn-nebelhorn-tag-rostlaube',
    [
      N('Sie läuft! Die Rostlaube läuft! Ich hab sie gehört, die halbe Nacht. Brummbrumm. Wie ein Wal mit Schluckauf.', 'freude'),
      N('Mein Bruder hätte geheult. Ich hab nicht geheult. Ich hab nur Salz im Auge. Ich hab immer Salz im Auge, ich wohn am Hafen.'),
    ],
    [N('Fahr sie gut. Und wenn du je bis ans Meer kommst – hup. Zweimal. Dann weiß ich, du bist da.')],
    M, { effects: [flag('nebelhorn_rostlaube_kommentar')] }),
  sonntag: tagesgespraech('kaeptn-nebelhorn-tag-sonntag',
    [N('Pssst! Sonntag! Angeln mit dem Boss! Wenn du die Fische verscheuchst, binden wir dich als Köder an die Leine.', 'signatur')],
    [
      N('Hunter fängt nie was. Ich auch nicht. Aber wir reden nicht drüber. Das ist das Schöne am Angeln: Keiner muss reden, und alle wissen Bescheid.'),
      H('Nebelhorn. Du redest seit sechs Uhr.'),
      N('Das ist Seemannsgarn, Boss. Das zählt nicht als Reden.', 'freude'),
    ],
    M),
  morgen: tagesgespraech('kaeptn-nebelhorn-tag-morgen',
    [N('Morgen! Hast du das Horn gehört? Sechs Uhr, auf die Minute! Ganz Hafenkante hasst mich. Ganz Hafenkante ist wach. Das ist Dienstleistung.', 'freude')],
    [
      N('Ich steh jeden Morgen hier und guck aufs Wasser. Nicht wegen der Fische. Wegen … egal. Wegen der Aussicht. Die Aussicht ist grau. Ich mag grau. Grau lügt nicht.', 'besorgt'),
    ],
    M),
  tag: tagesgespraech('kaeptn-nebelhorn-tag-faehre',
    [N('Willkommen an Bord! Ticket? Nein? Dann eben Rudern. Spaß, Spaß! Für dich fahr ich umsonst. Einmal. Danach kostet’s Seemannsgarn.', 'signatur')],
    [
      N('Nächster Halt: die Boje. Danach: die Boje von der anderen Seite. Danach: zurück. Bitte nicht aussteigen, das Wasser ist voller Zeug, das zurückbeißt.'),
      N('Einmal ist mir ein Tourist von der Oberstadt reingefallen. Er kam mit drei Implantaten raus, die er vorher nicht hatte. Das Hafenbecken gibt, das Hafenbecken nimmt.'),
    ],
    M),
  stammtisch: tagesgespraech('kaeptn-nebelhorn-tag-stammtisch',
    [N('Ahoi! Setz dich an den Stammtisch! Hier sitzen nur Legenden. Und der Typ da hinten, der ist eingeschlafen, aber der war auch mal eine Legende.', 'freude')],
    [
      N('Barkeeper! Einen Rum! Für mich und meinen Freund hier! Und einen Kaffee, falls ich morgen wieder aufstehen muss!'),
      N('Weißt du, warum ich mittwochs und freitags herkomm? Weil da die Musik so laut ist, dass ich das Meer nicht hören kann. Das Meer ruft nämlich. Immer. Auch durch die Mauer.', 'besorgt'),
    ],
    M),
  abend: tagesgespraech('kaeptn-nebelhorn-tag-abend',
    [N('Feierabend am Steg. Die Fähre schläft, das Horn schläft, nur der Käpt’n nicht. Der Käpt’n hat Schlafstörungen. Seit einundsiebzig. Wegen des Wals.', 'signatur')],
    [N('Siehst du die Lichter da drüben, hinter dem Kran? Das ist die Bojeninsel. Früher brannte da ein Leuchtfeuer. Heute nur noch ein kaputter Automat für Krabbenbrötchen.', 'besorgt')],
    M),
  nacht: tagesgespraech('kaeptn-nebelhorn-tag-nacht',
    [N('Nachts in meiner Kajüte, Landratte? Das ist entweder sehr mutig oder sehr verzweifelt. Setz dich. Der Tee ist kalt, aber ehrlich.', 'freude')],
    [N('Nachts, wenn das Boot schaukelt, träum ich, dass die Leinen reißen. Und ich treib raus. Ganz raus. Und es ist … gar nicht schlimm. Dann wach ich auf und bin erleichtert. Und ein bisschen enttäuscht.', 'besorgt')],
    M),
  freund: tagesgespraech('kaeptn-nebelhorn-tag-freund',
    [N('Da ist ja mein Lieblingspassagier! TUUUT! Das war für dich! Ein Ehrentuter!', 'freude')],
    [N('Du bist eine gute Seele, weißt du das? Wie ein guter Anker. Hält fest, wenn’s stürmt, und lässt los, wenn’s weitergehen soll.')],
    M),
  standard: tagesgespraech('kaeptn-nebelhorn-tag-standard',
    [N('Ahoi! Klar Schiff!')],
    [N('Wetter heute? Wie immer. Grau mit Aussicht auf grau. Bei Klabautermanns Klöten, irgendwann regnet’s mal Sonne.', 'signatur')],
    M),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Steg, 06:00): Ins Horn blasen dürfen. */
const he2 = dialog('he-kaeptn-nebelhorn-2', [
  knoten('start', [
    erz('Sechs Uhr. Nebel liegt über dem Hafenbecken wie nasse Watte. Käpt’n Nebelhorn steht am Steg, das Messinghorn auf der Schulter, und guckt auf die Uhr.'),
    N('Noch dreißig Sekunden. Weißt du was? Heute nicht ich. Heute du.', 'signatur'),
    N('Das Horn ist heilig. Ich hab es seit einundvierzig Jahren. Keiner außer mir hat je reingeblasen. Außer einmal ein Pelikan. Der war danach nie mehr derselbe.'),
    N('Zehn Sekunden. Tief Luft. Aus dem Bauch, nicht aus der Lunge. Die Lunge ist für Feiglinge.'),
  ], {
    choices: [
      { text: 'Aus vollem Bauch blasen.', check: pruefung('he-nebelhorn-2-volle-lunge', 'koerper', 4, ['kraft']), next: 'voll', effects: [herz(ID, 50)] },
      { text: 'Rhythmisch tuten: lang, kurz, kurz, lang.', check: pruefung('he-nebelhorn-2-rhythmus', 'ausstrahlung', 4, ['buehne']), next: 'rhythmus', effects: [herz(ID, 50)] },
      { text: 'Vorsichtig reinpusten.', next: 'pups', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('voll', [
    erz('TUUUUUUUUUUUUUUUUUT. Der Nebel reißt auf. Am Kran fällt einem Arbeiter der Kaffee aus der Hand. Im Container-Labyrinth jubeln die Rostzähne, ohne zu wissen, warum. Weit hinten antwortet eine Schiffshupe.'),
    N('HA! DAS ist ein Ton! Das hört man bis zur Mauer! Bis hinter die Mauer! Bis … egal, das hört man!', 'freude'),
  ], { next: 'ende' }),
  knoten('rhythmus', [
    erz('Lang, kurz, kurz, lang. Das Horn singt. Von den Containern kommt ein Echo, und dann klatscht jemand. Dann noch jemand. Dann ein ganzer Kai.'),
    N('Das … das ist das alte Signal. „Heimkehr frei“. Woher weißt du das? Das kennt keiner mehr. Das hat meine Großmutter getutet.', 'ueberrascht'),
  ], { next: 'ende' }),
  knoten('pups', [
    erz('Pffffrrrt. Das Horn gibt ein Geräusch von sich wie ein Kamel, das sich auf eine Luftmatratze setzt. Eine Möwe dreht sich um und guckt dich verachtend an.'),
    N('Hahahaha! Bei Klabautermanns Klöten! Das war der schönste Furz, den das Horn je gemacht hat!', 'freude'),
    N('Nicht schlimm, Kleines. Der Pelikan hat’s schlechter gemacht. Und der Pelikan hatte Übung.'),
  ], { next: 'ende' }),
  knoten('ende', [
    N('Ab heute darfst du. Wann du willst. Das Horn kennt dich jetzt. Aber nicht vor sechs! Vor sechs ist mein Horn. Und nicht nach zehn! Dann schläft die Nachbarschaft.', 'signatur'),
    N('Okay, nach zehn darfst du auch. Die Nachbarschaft hat’s verdient.'),
  ], { effects: [flag('nebelhorn_horn_erlaubt'), { xp: 40 }, { rep: 'unterstadt', delta: 2 }] }),
]);

/** ♥4 (Kajüte, nachts): Flaschenpost mit kuestenkarte-fragment; Koje als Notschlafplatz (Karte hausboot-nebelhorn). */
const he4 = dialog('he-kaeptn-nebelhorn-4', [
  knoten('start', [
    erz('Kajüte, nachts. Eine Petroleumlampe schaukelt, der Kajütentisch ist nass. Darauf: eine grüne Glasflasche, verkrustet mit Muscheln, korkversiegelt. Nebelhorn starrt sie an wie eine Bombe.'),
    N('Hab ich heute im Netz gehabt. Neben einem Schuh und einem halben Fahrrad. Da ist was drin. Papier. Ich seh’s.', 'besorgt'),
    N('Ich trau mich nicht. Was, wenn das von … wenn das von draußen kommt? Von ganz draußen?'),
  ], {
    choices: [
      { text: 'Den Kork mit Gefühl rausdrehen, ohne das Papier zu zerreißen.', check: pruefung('he-nebelhorn-4-korken', 'technik', 4, ['reparieren']), next: 'sauber', effects: [herz(ID, 40)] },
      { text: 'Die Flasche am Tischbein zerschlagen.', next: 'scherben', effects: [herz(ID, 30)] },
      { text: '„Mach du auf, Käpt’n. Ich halt die Lampe.“', next: 'er-selbst', effects: [herz(ID, 50)] },
    ],
  }),
  knoten('sauber', [
    erz('Ein vorsichtiges Drehen, ein Plopp, ein Geruch nach Salz und Zeit. Das Papier rollt sich in deine Hand, als hätte es darauf gewartet.'),
  ], { next: 'brief' }),
  knoten('scherben', [
    erz('KLIRR. Glas überall, ein bisschen Meerwasser auf deinen Stiefeln, Nebelhorn mit einer Scherbe im Bart. Das Papier ist heil. Fast. Eine Ecke fehlt.'),
    N('Man kann auch einfach FRAGEN, ob man die Flasche zerschlagen darf! Ich hätte ja gesagt! Ich hätte nein gesagt! … Egal!', 'ueberrascht'),
  ], { next: 'brief' }),
  knoten('er-selbst', [
    erz('Nebelhorns Hände zittern. Er dreht den Korken mit den Zähnen raus, spuckt ihn in die Ecke und zieht das Papier mit zwei Fingern heraus, als würde es beißen.'),
    N('Ich hab’s gemacht. Der Käpt’n hat’s gemacht. Halt die Lampe ruhig, Kleines, ich bin gerade sehr mutig und das ist anstrengend.', 'besorgt'),
  ], { next: 'brief' }),
  knoten('brief', [
    erz('Eine Karte. Handgezeichnet, mit Bojen, Untiefen und einer Küstenlinie, die du noch nie gesehen hast. Am Rand, in verwaschener Tinte: „Wer das findet: Der Weg ist frei. Man muss nur fahren. – M.“'),
    N('M. Das könnte jeder sein. Mathilda. Meine Großmutter hieß Mathilda. Das könnte … das kann jeder sein.', 'besorgt'),
    N('Behalt du sie. Ich … ich kann die nicht anschauen. Wenn ich sie anschau, will ich losfahren. Und dann fahr ich nicht. Und dann hasse ich mich. Behalt sie.'),
  ], {
    effects: [{ give: 'kuestenkarte-fragment' }],
    choices: [
      { text: '„Irgendwann fahren wir zusammen, Käpt’n.“', next: 'zusammen', effects: [herz(ID, 20)] },
      { text: '„Ich pass drauf auf.“', next: 'ende' },
    ],
  }),
  knoten('zusammen', [N('Zusammen. Ha. Mit mir als Kapitän und dir als … was? Smutje? Kannst du kochen? Egal. Zusammen. Vielleicht.', 'freude')], { next: 'ende' }),
  knoten('ende', [
    N('Wenn du mal nicht heimkommst, Kleines: Die Koje da ist frei. Riecht nach Pfeife und altem Mann, aber sie schaukelt dich in den Schlaf wie eine Mutter mit Rum.', 'signatur'),
    erz('Die Koje auf dem Hausboot ist jetzt ein Notschlafplatz.'),
  ], { effects: [flag('nebelhorn_flaschenpost'), flag('nebelhorn_koje'), { xp: 70 }] }),
]);

/** ♥6 (High Voltage, Stammtisch, Mi/Fr abends): Pakt mit Hunter. */
const he6 = dialog('he-kaeptn-nebelhorn-6', [
  knoten('start', [
    erz('Stammtisch im High Voltage. Nebelhorn hat schon zwei Rum intus, Hunter sitzt ausnahmsweise mit am Tisch, Sonnenbrille auf, Hemd offen. Zwischen ihnen ein Bierdeckel mit einer Zeichnung: Palmen, Wellen, eine Bar.'),
    N('Da ist er ja! Kleines! Komm her! Der Boss und ich verhandeln!', 'freude'),
    H('Wir verhandeln nicht. Er redet, ich trinke.'),
    N('Der Boss will einen Strandclub bauen! Am Meer! Mit Sand und Wellen und ohne Ripper!'),
    H('Ich hab „vielleicht“ gesagt. Einmal. Beim Angeln. Ich hab nicht gewusst, dass er zuhört.', 'signatur'),
  ], {
    choices: [
      { text: '„Käpt’n, du würdest hinfahren? Raus aufs Meer?“', next: 'frage' },
      { text: '„Hunter, sag ja. Ich will die Bar.“', when: { flag: 'hunter_strandclub_idee' }, next: 'bar' },
    ],
  }),
  knoten('bar', [
    H('Die Bar kriegt sowieso schon jemand. Du. Erinnerst du dich? Miete in Cocktails.'),
    N('Siehst du! Er hat schon Personal! Dann muss er auch bauen!', 'freude'),
  ], { next: 'frage' }),
  knoten('frage', [
    N('Hinfahren. Aufs Meer.', 'besorgt'),
    erz('Nebelhorn wird ganz still. Er dreht den Bierdeckel um, dann wieder zurück.'),
    N('Wenn der Boss einen Strandclub baut … dann fahr ich hin. Mit der Fähre. Einmal nicht im Kreis. Das ist ein Versprechen. Das ist ein Pakt.'),
    H('Nebelhorn. Du hast einunddreißig Jahre das Becken nicht verlassen.'),
    N('Dann wird’s ja Zeit, verdammt!', 'freude'),
  ], {
    choices: [
      { text: 'Die Hände der beiden aufeinanderlegen. „Wer kneift, zahlt eine Runde. Für den ganzen Club.“', check: pruefung('he-nebelhorn-6-pakt', 'ausstrahlung', 5, ['ueberreden']), next: 'pakt-runde', effects: [herz(ID, 50), herz('hunter', 30)] },
      { text: '„Ich bin Zeuge. Ich schreib’s auf den Bierdeckel.“', next: 'pakt-deckel', effects: [herz(ID, 40), herz('hunter', 20)] },
    ],
  }),
  knoten('pakt-runde', [
    erz('Hunter guckt auf die Hände. Dann über die Sonnenbrille zu dir. Dann legt er seine Hand drauf. Fest.'),
    H('Eine Runde für den ganzen Club. Das ist teuer. Dann kneif ich besser nicht.', 'freude'),
    N('PAKT! TUUUUUT!'),
    erz('Nebelhorn tutet. Im Club. Mit dem Horn. Der Barkeeper lässt ein Glas fallen. Bruno steht in der Tür und überlegt, wen er rauswerfen soll, und entscheidet sich für niemanden.'),
  ], { next: 'ende' }),
  knoten('pakt-deckel', [
    erz('Du schreibst auf den Bierdeckel: „Hunter baut. Nebelhorn fährt. Beide unterschreiben.“ Nebelhorn unterschreibt mit drei Kringeln. Hunter mit einem H, das aussieht wie ein Dollarzeichen.'),
    H('Wenn das jemand sieht, bin ich ruiniert. Häng’s hinter die Bar.', 'signatur'),
  ], { next: 'ende' }),
  knoten('ende', [
    N('Du hast das gemacht, Kleines. Du hast zwei alte Säcke dazu gekriegt, was zu versprechen. Das ist Magie. Oder Rum. Wahrscheinlich beides.', 'freude'),
  ], { effects: [flag('nebelhorn_pakt'), { xp: 90 }] }),
]);

// ♥8 und ♥10 samt Akt-2/3- und Nachspiel-Gesprächen: nebelhorn-akt23.ts.
const A23 = akt23(M);

// ---------------------------------------------------------------------------------------------- Figur

const nebelhorn: NpcDef = {
  id: ID,
  name: 'Käpt’n Nebelhorn',
  unknownName: 'Alter Mann mit Horn',
  portrait: ID,
  sprite: `${ID}-walk`,
  faction: 'unterstadt',
  bio: 'Fährkapitän im Hafenbecken, Seemannsgarn-Lieferant und Herr über ein Messinghorn so groß wie ein Waschzuber. Hat die Bucht in einunddreißig Jahren nie verlassen und wartet jeden Morgen um sechs auf seine Großmutter.',
  gifts: {
    loves: ['treibholz', 'muschel-frisch', 'algen-chips'],
    likes: ['fossile-muschel', 'postkarte-meer', 'synth-kaffee', 'comic-heft', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['sonnencreme', 'sandflasche'],
    hates: ['plastikpflanze', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    ...A23.schedule,
    // Sonntags früh angelt er mit Hunter (world.md §3.4).
    { slot: 'morgen', days: ['so'], place: { map: 'hafenkante', at: 'angelsteg' } },
    { slot: 'morgen', place: { map: 'hafenkante', at: 'steg' } },
    { slot: 'tag', place: { map: 'hafenkante', at: 'faehre' } },
    { slot: 'abend', days: ['mi', 'fr'], place: { map: 'high-voltage', at: 'stammtisch' } },
    { slot: 'abend', place: { map: 'hafenkante', at: 'steg' } },
    { slot: 'nacht', place: { map: 'hausboot-nebelhorn', at: 'kajuete' } },
  ],
  heartEvents: [
    herzEreignis('he-kaeptn-nebelhorn-2', 2, 'hafenkante', 'morgen', alle({ clockBetween: [360, 450] }, { not: { weekday: 'so' } })),
    herzEreignis('he-kaeptn-nebelhorn-4', 4, 'hausboot-nebelhorn', 'nacht'),
    herzEreignis('he-kaeptn-nebelhorn-6', 6, 'high-voltage', 'abend', { weekday: ['mi', 'fr'] }),
    herzEreignis('he-kaeptn-nebelhorn-8', 8, 'hausboot-nebelhorn', 'nacht', AKT2),
    herzEreignis('he-kaeptn-nebelhorn-10', 10, 'hafenkante', 'tag', alle(AKT2, { seen: 'he-kaeptn-nebelhorn-8' }, { quest: 'pers-nebelhorn-letzte-faehre', state: 'done' }), 'szene-he-kaeptn-nebelhorn-10'),
  ],
  talk: [
    rede('kaeptn-nebelhorn-tag-rivale', { rival: ID }),
    rede('kaeptn-nebelhorn-tag-erstes', { not: { met: ID } }),
    ...A23.talk,
    rede('kaeptn-nebelhorn-tag-zeit', alle(VOR_AKT2, { notFlag: 'nebelhorn_zeit_hinweis' }), 8),
    rede('kaeptn-nebelhorn-tag-rostlaube', alle(ROSTLAUBE_DONE, { notFlag: 'nebelhorn_rostlaube_kommentar' })),
    rede('kaeptn-nebelhorn-tag-sonntag', alle({ weekday: 'so' }, { time: 'morgen' })),
    rede('kaeptn-nebelhorn-tag-stammtisch', alle({ weekday: ['mi', 'fr'] }, { time: 'abend' })),
    rede('kaeptn-nebelhorn-tag-nacht', { time: 'nacht' }),
    rede('kaeptn-nebelhorn-tag-freund', undefined, 5),
    rede('kaeptn-nebelhorn-tag-morgen', { time: 'morgen' }),
    rede('kaeptn-nebelhorn-tag-faehre', { time: 'tag' }),
    rede('kaeptn-nebelhorn-tag-abend', { time: 'abend' }),
    rede('kaeptn-nebelhorn-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: nebelhorn },
  dialogues: sammle(
    T.rivale, T.erstes, T.zeit, T.rostlaubeFertig, T.sonntag, T.morgen, T.tag, T.stammtisch, T.abend, T.nacht,
    T.freund, T.standard,
    he2, he4, he6, ...A23.dialogues,
  ),
  cutscenes: sammleSzenen({
    id: 'szene-he-kaeptn-nebelhorn-10', title: 'Einmal nicht im Kreis',
    beats: [{ image: 'cut-he-kaeptn-nebelhorn-10', pan: 'left', fade: 'in', caption: 'Die Hafenausfahrt. Dahinter: alles, wovor er einunddreißig Jahre Angst hatte.', hold: 2000 }],
  }),
};
