// Vega in Akt 2, Akt 3 und im Nachspiel (world.md §4.2, §5.3–5.5; Orte nach design/plan/act23.json).
// Kein eigener Inhaltsteil: vega.ts mischt Tagesgespräche, Tagesabläufe, Menüwahlen und Telefon hier hinein.
// Herz-Ereignisse he-vega-8 (Vernissage, Glasarkaden) und he-vega-10 (Dachgarten, Andenken vegas-zielfernrohr,
// Duo „Die Wachhunde“ verstärkt) sind hier als volle Szenen gebaut.
import type { Condition, DialogueChoice, DialogueNode, ScheduleEntry } from '../../../modules/contracts';
import {
  type Akt23, type Menue, AB_AKT2, AKT2, ARIA_WEG, ARIA_ZURUECK, DANTE_CREW, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER,
  NACHSPIEL, NYRA_IM_TURM, PARTYNACHT, PARTY_BEREIT, PARTY_PLAN, VEX, dialog, erz, flag, herz, knoten, pruefung, rede,
  sprecher, tagesgespraech,
} from './_helfer';

const V = sprecher('vega');

const JIMMY_GERETTET: Condition = { any: [{ quest: 'side-jimmys-chip', state: 'done' }, { flag: 'jimmy_gerettet' }] };
const JIMMY_IM_TURM: Condition = { all: [{ flag: 'jimmy_gechippt' }, { not: JIMMY_GERETTET }, { not: { quest: 'main-3-labor', state: 'done' } }] };
const IM_EINSATZ: Condition = { all: [AB_AKT2, { not: PARTYNACHT }, { not: MASTER }] };

// ---------------------------------------------------------------------------------------------- Menüwahlen ab Akt 2

export function menue23(zurueck: DialogueChoice[]): Menue {
  const choices: DialogueChoice[] = [
    { text: 'Was siehst du da drüben? Am Turm.', when: { all: [IM_EINSATZ, { notFlag: 'heute_vega_turmblick' }] }, next: 'turmblick' },
    { text: 'Wie hältst du durch, seit sie Aria haben?', when: ARIA_WEG, next: 'aria-weg' },
    { text: 'Aria ist wieder wach. Und du?', when: { all: [ARIA_ZURUECK, AKT2] }, once: true, id: 'v23-aria-zurueck', next: 'aria-zurueck', effects: [herz('vega', 20)] },
    { text: 'Nyra. Glaubst du, sie hält durch da drin?', when: NYRA_IM_TURM, next: 'nyra-turm' },
    { text: 'Was hältst du von der Releaseparty?', when: { all: [PARTY_PLAN, AKT2] }, next: 'party' },
    { text: 'Und jetzt, Vega? Wo zielst du jetzt hin?', when: NACHSPIEL, once: true, id: 'v23-und-jetzt', next: 'und-jetzt', effects: [herz('vega', 30)] },
  ];
  const nodes: DialogueNode[] = [
    knoten('turmblick', [
      erz('Vega reicht dir das Gewehr, ohne es loszulassen. Durch das Zielfernrohr: der Quantum-Turm, sauber wie ein Zahnpastalächeln, und drumherum ein Schwarm kleiner roter Lichter.'),
      V('Dreiundvierzig Drohnen auf der Ostseite. Vor einer Woche waren es zwölf. Die Neuen fliegen tiefer und gucken in Fenster. Wie Rentner mit Propellern.', 'besorgt'),
      V('Zwischen der achten und der neunten Runde haben sie eine Lücke. Elf Sekunden. Wenn du heute irgendwo reinwillst, wo du nicht reinsollst: elf Sekunden.'),
      erz('Vegas Turmzählung: +1 auf deinen nächsten Schleich-, Beobachtungs- oder Versteck-Check heute.'),
    ], {
      choices: zurueck,
      effects: [
        { checkBuff: { id: 'vega-turmzaehlung', label: 'Vegas Turmzählung', value: 1, tags: ['schleichen', 'beobachten', 'verstecke'], forDays: 0 } },
        flag('heute_vega_turmblick'),
      ],
    }),
    knoten('aria-weg', [
      V('Ich halt nicht durch. Ich putz das Gewehr. Seit gestern viermal. Es ist sauberer als Hunters Gewissen.', 'wut'),
      V('Sie hat mir mal gesagt, ich soll sie nicht noch mal raustragen. Dass das peinlich ist. Ich hab gesagt: Dann fall halt nicht um.', 'trauer'),
      V('Wenn wir Xion finden, sag mir die Entfernung nicht. Ich will sie selber messen. Langsam.'),
    ], { choices: zurueck }),
    knoten('aria-zurueck', [
      V('Ich? Gut. Ich hab heute Nacht geschlafen. Vier Stunden. Am Stück. Mit beiden Augen zu.', 'freude'),
      V('Sie hat mich angerufen, kaum dass sie wach war. Erster Satz: „Hast du mich wieder rausgetragen? Du weißt, dass ich das hasse.“'),
      V('Ich hab gesagt: Diesmal war’s ein Lieferwagen. Und Dante. Und eine Mülltonne voller Konfetti. Ich war nur dabei.', 'signatur'),
    ], { choices: zurueck }),
    knoten('nyra-turm', [
      V('Nyra hält mehr aus, als sie aussieht. Sie sieht aus wie ein nasser Pullover. Aber ein nasser Pullover reißt nicht.', 'besorgt'),
      V('Ich seh das Fenster vom Labortrakt. Dritter Stock unter der Erde, also seh ich’s nicht. Ich seh die Lüftung. Da kommt um zehn Uhr abends Dampf raus. Jeden Abend. Pünktlich.'),
      V('Ich bild mir ein, das ist sie. Wie sie Kaffee kocht. Hör auf zu gucken. Ich weiß, dass das dumm ist.', 'trauer'),
    ], { choices: zurueck }),
    knoten('party', [
      V('Eine Party. Bei denen. Im Himmelsgarten. Auf fünfhundert Metern Höhe, mit Glasboden.', 'wut'),
      V('Hunter will, dass ich ein Kleid trag. Ich hab gesagt: Ich trag ein Gewehr. Das ist schwarz. Das passt zu allem.'),
      V('Ich lieg auf den Antennen. Von da seh ich das Rednerpult, die Bar und den Landeplatz. Wenn einer von euch Ärger kriegt, kriegt der Ärger Ärger.', 'signatur'),
    ], { choices: zurueck }),
    knoten('und-jetzt', [
      V('Ich ziel nirgends hin. Das ist neu. Ich hab heute Morgen eine Stunde lang aufs Wasser geguckt und nichts gemessen.', 'freude'),
      V('Na gut, ich hab die Wellen gezählt. Aber nur so. Aus Gewohnheit. Viertausenddreihundertelf.'),
      V('Vielleicht bau ich einen Garten. Einen echten. Mit zwei Pflanzen. Man soll ja nicht übertreiben.', 'signatur'),
    ], { choices: zurueck }),
  ];
  return { choices, nodes };
}

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse 8 und 10

export const he8 = dialog('he-vega-8', [
  knoten('start', [
    erz('Glasarkaden, Abend. Die Galerie „Weißraum“ am Springbrunnen hat Vernissage: „Noxius brennt – Bilder einer Unterstadt“. Sekt in Gläsern, die mehr kosten als eine Monatsmiete. Leute in Weiß, die über Armut reden wie über ein Wetterphänomen.'),
    erz('Vega steht in einer Ecke, im einzigen Hemd, das sie ohne Patronengurt besitzt, und hält ihr Glas wie eine Granate.'),
    V('Ich hasse feine Leute. Die gucken dich an, als wärst du ein Fleck. Und dann kaufen sie ein Bild von einem Fleck.', 'wut'),
    V('Ich bin wegen eines Bildes hier. Nummer siebzehn. Frag nicht. Doch. Frag später.'),
    erz('Eine Galeristin mit Silberhaar und Monokel-Implantat steuert auf euch zu. Das Monokel surrt, als es dich scannt. „Madame Opaline. Und Sie sind …?“'),
  ], {
    choices: [
      { text: '„Kunstkritik. Unterstadt-Szene. Sehr gefürchtet. Ich hab drei Galerien in den Ruin geschrieben.“', check: pruefung('he-vega-8-ausrede', 'ausstrahlung', 6, ['luegen']), next: 'kritik', effects: [herz('vega', 40)] },
      { text: '„Security. Meine Kollegin hat Ihr Bild seit zwei Stunden im Visier. Es hat sich nicht bewegt. Verdächtig.“', check: pruefung('he-vega-8-security', 'strasse', 6, ['luegen', 'einschuechtern']), next: 'security', effects: [herz('vega', 40)] },
      { text: '„Opaline, Liebes. Die Stadtratsgala. Sie trugen Beige. Ich hab’s Ihnen nie verziehen.“', tag: '[Oberstadt]', when: { origin: 'origin-oberstadt' }, next: 'oberstadt', effects: [herz('vega', 40)] },
      { text: '„Wir sind wegen des Buffets hier.“', next: 'buffet', effects: [herz('vega', 30)] },
    ],
  }),
  knoten('kritik', [
    erz('Opalines Monokel zuckt. „Oh. Oh! Dann müssen Sie die Ostwand sehen. Ganz neue Positionen.“ Sie verschwindet rückwärts.'),
    V('Gefürchtet. Ja. Ich hab gerade beschlossen, dass ich die Ostwand hasse. Mit Leidenschaft.', 'signatur'),
  ], { next: 'bild' }),
  knoten('security', [
    erz('Opaline schluckt, schaut auf Vegas Schultern, die eindeutig ein Gewehr gewohnt sind, und hält ihr wortlos ein zweites Glas hin.'),
    V('Zwei Stunden, ja. Es hat sich nicht bewegt. Ich hab’s trotzdem nicht aus den Augen gelassen.', 'signatur'),
  ], { next: 'bild' }),
  knoten('oberstadt', [
    erz('Opaline erbleicht unter dem Puder. „Das … das war Champagner-Beige. Das ist etwas völlig anderes.“ Sie flieht zum Sekt.'),
    V('Du kannst Snob. Das ist widerlich. Mach das öfter.', 'freude'),
  ], { next: 'bild' }),
  knoten('buffet', [
    erz('Opaline lächelt mit genau einem Mundwinkel und schwebt weiter. Vega räumt in aller Ruhe ein Tablett mit Häppchen ab, die so klein sind, dass man sie mit Pinzette essen müsste.'),
    V('Ehrlich. Gut. Ehrlich ist hier drin so selten wie ein Kohlehydrat.', 'freude'),
  ], { next: 'bild' }),
  knoten('bild', [
    erz('Nummer siebzehn. Ein riesiges Foto, nachkoloriert: die Rennhalle 9 in Flammen. Im Vordergrund trägt eine Gestalt eine andere aus dem Rauch. Der Getragenen fehlt der linke Arm. Titel: „Rettung (Akt in Rot)“. Preis: 40.000 Credits.'),
    V('Das bin ich. Und das ist Aria. Drei Jahre her. Irgendein Arsch mit Kamera stand am Notausgang und hat auf den richtigen Moment gewartet. Statt mit anzufassen.', 'wut'),
    V('Und jetzt hängt das hier. Neben Sekt. Und Leute sagen „ergreifend“ und essen Lachs dazu.'),
    V('Aria weiß nichts davon. Wenn sie’s sieht, zerlegt sie die Galerie. Zu Recht. Ich will nur … ich weiß nicht, was ich will.', 'trauer'),
  ], {
    choices: [
      { text: 'Zu Opaline gehen. „Das Bild hängt ab. Jetzt. Die Frau darauf steht neben Ihnen. Mit sehr ruhigen Händen.“', check: pruefung('he-vega-8-abhaengen', 'ausstrahlung', 7, ['einschuechtern', 'ueberreden']), next: 'abhaengen', effects: [herz('vega', 50), flag('vega_bild_abgehaengt')] },
      { text: '„Lenk sie ab. Ich nehm’s mit.“', check: pruefung('he-vega-8-klauen', 'reflexe', 7, ['stehlen', 'schleichen']), next: 'geklaut', effects: [herz('vega', 50), flag('vega_bild_geklaut')] },
      { text: '„Lass es hängen. Guck’s dir an. Mit mir.“', next: 'anschauen', effects: [herz('vega', 40)] },
      { text: 'Ein Glas Rotwein „versehentlich“ über das Preisschild kippen.', next: 'kleckern', effects: [herz('vega', 30)] },
    ],
  }),
  knoten('abhaengen', [
    erz('Opaline will lachen. Dann sieht sie Vegas Gesicht, dann deins, dann wieder das Bild. Das Lachen kommt nicht.'),
    erz('Zwei Assistenten in weißen Handschuhen hängen Nummer siebzehn ab und tragen es weg wie einen Sarg. An der Wand bleibt ein heller Fleck. Ein Gast nennt ihn „mutig“.'),
    V('Das war gruselig. Du warst gruselig. Mach das nie bei mir.', 'ueberrascht'),
    V('… Doch. Wenn’s nötig ist. Dann schon.'),
  ], { next: 'brunnen' }),
  knoten('geklaut', [
    erz('Vega fragt Opaline sehr laut, ob die Lachshäppchen „aus der Bucht“ sind. Während Opaline Herzrasen bekommt, hängst du Nummer siebzehn ab und an seine Stelle die gerahmte Getränkekarte.'),
    erz('Niemand merkt es. Ein Mann im Seidenschal bleibt vor der Getränkekarte stehen und flüstert: „Radikal.“'),
    V('Wir haben gerade ein Kunstwerk geklaut. Ich fühl mich großartig. Ich hätte nie gedacht, dass ich mich mal wegen Kunst großartig fühle.', 'freude'),
  ], { next: 'brunnen' }),
  knoten('anschauen', [
    erz('Ihr steht davor. Lange. Gäste schieben sich vorbei, sagen „ergreifend“, essen Lachs. Ihr bleibt stehen.'),
    V('Weißt du, was komisch ist? Ich seh das Feuer gar nicht. Ich seh nur, dass sie noch lebt. Auf dem Bild. Da lebt sie schon.', 'trauer'),
    erz('Vega nimmt einen roten Klebepunkt vom Galerietresen und klebt ihn neben den Titel. „Verkauft“.'),
    V('So. Jetzt kauft’s keiner mehr. Das reicht mir.', 'signatur'),
  ], { next: 'brunnen' }),
  knoten('kleckern', [
    erz('Der Rotwein läuft über das Preisschild, die Wand hinunter und bildet auf dem weißen Boden eine Pfütze in Form eines Mittelfingers. Zufall. Vermutlich.'),
    erz('Opaline kreischt. Dann hält sie inne, legt den Kopf schief und schreibt mit zitternder Hand ein neues Schild: „Unverkäuflich. Interaktive Installation.“'),
    V('Du hast gerade Kunst gemacht. Aus Versehen. Mit billigem Wein. Ich bin so stolz.', 'freude'),
  ], { next: 'brunnen' }),
  knoten('brunnen', [
    erz('Später, draußen am Springbrunnen. Vega hat die Schuhe ausgezogen und hält die Füße ins Wasser, was laut Schild mit 80 Credits bestraft wird. Kein Wachmann traut sich her.'),
    V('Danke, dass du mitgekommen bist. Allein hätte ich das Glas geworfen. Ziemlich präzise. Durchs Oberlicht.'),
    V('Sag Aria nichts. Oder doch. Irgendwann. Wenn sie gut drauf ist. Also nie.'),
  ], {
    choices: [
      { text: '„Ich sag nichts. Ehrenwort. Auf jede Entfernung.“', next: 'ende', effects: [herz('vega', 20)] },
      { text: '„Du solltest es ihr selbst sagen. Sie trägt dich auch, nur anders.“', next: 'ende-sagen', effects: [herz('vega', 30), flag('vega_aria_bild_erzaehlen')] },
      { text: 'Die Schuhe ausziehen und die Füße mit ins Wasser halten.', next: 'ende-fuesse', effects: [herz('vega', 30)] },
    ],
  }),
  knoten('ende-sagen', [V('… Sie trägt mich auch. Hm. Das schreib ich mir nicht auf. Das merk ich mir so.', 'trauer')], { next: 'ende' }),
  knoten('ende-fuesse', [
    erz('Das Wasser ist warm und riecht nach Chlor und Geld. Vega stupst mit dem großen Zeh gegen deinen.'),
    V('Achtzig Credits pro Fuß. Wir schulden der Stadt dreihundertzwanzig. Ich zahl nicht.', 'signatur'),
  ], { next: 'ende' }),
  knoten('ende', [
    V('Feine Leute. Pah. Du bist feiner als die alle. Und du riechst nach Unterstadt. Das ist ein Kompliment.', 'freude'),
  ], { effects: [{ xp: 120 }, flag('vega_vernissage')] }),
]);

export const he10 = dialog('he-vega-10', [
  knoten('start', [
    erz('Morgengrauen auf dem Dach. Der Smog ist rosa, wie immer, kurz bevor er wieder grau wird. Zwischen Fernrohr und Windmesser steht ein Blumentopf aus einer halben Ölkanne. Darin: eine einzige Pflanze, grün, trotzig, kaum höher als ein Daumen.'),
    V('Mein Garten. Eine Pflanze. Mehr hält die Luft hier oben nicht aus. Ich auch nicht.', 'freude'),
  ], {
    choices: [
      { text: '(Weiter.)', when: JIMMY_GERETTET, next: 'name-gerettet' },
      { text: '(Weiter.)', when: { all: [{ not: JIMMY_GERETTET }, { flag: 'jimmy_gechippt' }] }, next: 'name-turm' },
      { text: '(Weiter.)', when: { all: [{ not: JIMMY_GERETTET }, { notFlag: 'jimmy_gechippt' }] }, next: 'name-offen' },
    ],
  }),
  knoten('name-gerettet', [V('Ich hab sie Jimmy genannt. Sie stand drei Wochen lang braun da und hat dann einfach weitergemacht. Sie hat sich auch berappelt.', 'freude')], { next: 'pflanze' }),
  knoten('name-turm', [V('Ich hab sie Jimmy genannt. Der echte liegt im Turm auf einer Liege und sagt „Master“. Ich glaub trotzdem dran. Irgendwer muss ja.', 'trauer')], { next: 'pflanze' }),
  knoten('name-offen', [V('Ich hab sie Jimmy genannt. Der echte steht noch am Bahnsteig und begrüßt Züge. Die hier wächst schneller. Sag’s ihm nicht.', 'besorgt')], { next: 'pflanze' }),
  knoten('pflanze', [
    V('Das Problem: Wenn ich auf Einsatz bin, stirbt sie. Drei Tage ohne Wasser. Ich kann Wind lesen. Gießkannen kann ich nicht.'),
  ], {
    choices: [
      { text: 'Aus einem alten Netzwerkkabel und einer Limoflasche eine Tropfbewässerung bauen.', check: pruefung('he-vega-10-tropf', 'technik', 6, ['reparieren', 'maschine']), next: 'tropf', effects: [herz('vega', 40), flag('vega_garten_bewaessert')] },
      { text: '„Die Kinder. Daria gießt für zwei Credits und einen Keks, Freya schreibt einen Gießplan, Jakko redet mit ihr.“', check: pruefung('he-vega-10-kinder', 'strasse', 5, ['verhandeln', 'kinder']), next: 'kinder', effects: [herz('vega', 40), herz('daria', 10), herz('freya', 10), herz('jakko', 10)] },
      { text: '„Ich komm gießen. Jeden Tag, an dem du weg bist.“', next: 'giessen', effects: [herz('vega', 30)] },
      { text: '„Nimm halt eine Plastikpflanze. Die überlebt alles.“', next: 'plastik', effects: [herz('vega', 10)] },
    ],
  }),
  knoten('tropf', [
    erz('Ein Kabel, eine Flasche, ein Loch mit der Nadel. Wasser fällt Tropfen für Tropfen in den Topf. Ein Tropfen alle vierzig Sekunden.'),
    V('Vierzig Sekunden. Das ist präzise. Ich mag präzise.', 'ueberrascht'),
  ], { next: 'geschenk' }),
  knoten('kinder', [
    erz('Du rechnest es ihr vor: zwei Credits pro Gießgang, ein Keks Gefahrenzulage, Jakko als ehrenamtlicher Pflanzen-Unterhalter.'),
    V('Jakko redet mit Pflanzen? … Natürlich redet Jakko mit Pflanzen. Gut. Die Kinder kriegen den Job. Schriftlich. Freya besteht bestimmt auf schriftlich.', 'freude'),
  ], { next: 'geschenk' }),
  knoten('giessen', [V('Jeden Tag. Das sagt sich leicht. Ich halt dich beim Wort. Ich halt alles beim Wort. Auf jede Entfernung.', 'signatur')], { next: 'geschenk' }),
  knoten('plastik', [
    V('Eine Plastikpflanze. Auf meinem Dach.', 'wut'),
    V('Ich schieß dich gleich runter. Liebevoll. Mit Platzpatronen. Vielleicht.'),
  ], { next: 'geschenk' }),
  knoten('geschenk', [
    erz('Vega wickelt etwas aus einem öligen Lappen. Ein Zielfernrohr, alt, die Gummikappe abgegriffen, an der Seite ein Kratzer in Form eines Blitzes.'),
    V('Mein erstes. Das hier hat mich durch alles gebracht, was ich nicht erzähle. Ich brauch’s nicht mehr. Ich hab ja jetzt dich. Du passt auf.'),
    V('Im Deckel ist die Sternkarte. Dein Stern ist drin. In Bleistift. Ich radier ihn nie aus.', 'trauer'),
    V('Und Aria und ich haben geübt. Zweimal schießen, einmal hauen. Die Wachhunde haben neue Zähne.', 'signatur'),
  ], {
    choices: [
      { text: '„Ich pass drauf auf. Und auf dich.“', next: 'ende', effects: [herz('vega', 40)] },
      { text: '„Die Pflanze kriegt einen zweiten Namen. Jimmy Zwei.“', next: 'ende', effects: [herz('vega', 30)] },
      { text: 'Einfach neben ihr am Geländer liegen bleiben, bis die Sonne durch den Smog kommt.', next: 'ende', effects: [herz('vega', 40)] },
    ],
  }),
  knoten('ende', [
    V('Wachhunde. Für immer. Auf jede Entfernung.', 'signatur'),
    erz('Andenken erhalten: Vegas Zielfernrohr. Die Duo-Aktion „Die Wachhunde“ ist verstärkt: Vega beherrscht jetzt den Doppelschuss.'),
  ], {
    effects: [{ give: 'vegas-zielfernrohr' }, flag('vega_wachhunde_verstaerkt'), { xp: 150 }],
  }),
]);

// ---------------------------------------------------------------------------------------------- Tagesgespräche ab Akt 2

export function akt23(M: Menue): Akt23 {
  const kurz: Menue = { choices: [{ text: 'Schon gut.' }], nodes: [] };
  const T = {
    master: tagesgespraech('vega-tag-master',
      [
        V('Du stehst in meinem Schussfeld. Diesmal ist geladen.', 'wut'),
        V('Achtzehn Meter. Ich sag dir das, damit du weißt, dass ich zähle. Ich hör nicht auf zu zählen, Master.'),
      ],
      [
        V('Raven hat gesagt, du teilst auch nicht gerne. Sie hat nicht geweint dabei. Ich auch nicht. Ich hab nur sehr lange in die andere Richtung geguckt.', 'trauer'),
        V('Wenn du irgendwann wieder du bist: Sechs Uhr. Dach. Kaffee. Bis dahin geh mir aus dem Visier, du Arschloch.', 'wut'),
      ],
      kurz, { plauschText: 'Vega. Hör mir zu.' }),
    partynacht: tagesgespraech('vega-tag-partynacht',
      [
        erz('Vega liegt bäuchlings zwischen den Antennen, das Gewehr auf einem zusammengerollten Partyprogramm. Im Ohr ein Funkknopf, im Gesicht ein Ausdruck wie Beton.'),
        V('Dreihundertvierzig Meter bis zum Rednerpult. Zweihundertzehn bis zur Bar. Neunzig bis zum Landeplatz. Wind aus West, böig. Champagner aus Ost, ständig.', 'signatur'),
      ],
      [
        V('Ich bin nicht nervös. Mein Puls ist zweiundfünfzig. Das ist für mich hysterisch.', 'besorgt'),
        V('Geh. Mach. Und wenn einer von denen dich anfasst, fällt ihm das Glas aus der Hand. Einfach so. Physik.'),
      ],
      M, { plauschText: 'Wie sieht’s aus da oben?' }),
    ende3b: tagesgespraech('vega-tag-ende-3b',
      [
        V('Du. Hier. Am Wasser.', 'ueberrascht'),
        V('Ich hab dich die ganze Zeit im Visier gehabt. Von der Düne aus, vom Dach aus, aus jedem verdammten Fenster. Ich hab nie abgedrückt. Weißt du, warum?'),
        V('Weil ich wusste, dass du zurückkommst. Ich irre mich selten.', 'freude'),
      ],
      [V('Raven sagt: „Du teilst ja doch.“ Ich sag: Halt die Klappe und setz dich. Zweiter Platz von links. Bester Wind. Hab ich freigehalten. Die ganze Zeit.', 'trauer')],
      M, { effects: [flag('vega_kommentar_ende'), herz('vega', 30)] }),
    endeMeer: tagesgespraech('vega-tag-ende-meer',
      [
        V('Das Meer. Ich hab’s gemessen. Man kann’s nicht messen. Es hört einfach nicht auf.', 'ueberrascht'),
        V('Aria ist als Erste rein. In voller Montur, mit Schläger. Ich hab sie nicht rausgetragen. Sie ist von allein rausgekommen. Lachend. Das war das Beste, was ich je durch ein Zielfernrohr gesehen hab.', 'freude'),
      ],
      [V('Blade sitzt. Die Stadt hat deine Botschaft gehört oder Nexus hat sich selbst gelöscht, ich hab nicht so genau zugehört. Ich hab Wellen gezählt.', 'signatur')],
      M, { effects: [flag('vega_kommentar_ende'), herz('vega', 30)] }),
    endeNexus: tagesgespraech('vega-tag-ende-nexus',
      [
        V('Die KI hat mich heute Morgen gefragt, ob sie mir „bei der Zielerfassung assistieren“ darf. Durchs Funkgerät. Freundlich.', 'besorgt'),
        V('Ich hab gesagt: Wenn du mir einmal reinredest, schieß ich die Antenne vom Auto. Sie hat gesagt: „Verstanden, Kollegin. Westwind, vier Knoten.“ Sie hatte recht. Ich hasse das.', 'wut'),
      ],
      [V('Dante vertraut ihr. Dante vertraut auch seinem Toaster. Ich behalt sie im Auge. Beide.', 'signatur')],
      M, { effects: [flag('vega_kommentar_ende'), herz('vega', 30)] }),
    strand: tagesgespraech('vega-tag-strand',
      [
        erz('Vega sitzt im Dünengras, das Gewehr ausnahmsweise im Futteral, die Hosenbeine hochgekrempelt. Neben ihr ein Becher Kaffee, der längst kalt ist.'),
        V('Setz dich. Hier oben ist der Wind ehrlich. Kein Gully, keine Wäsche. Nur Wind.'),
      ],
      [V('Ich hab gestern einen Krebs beobachtet. Drei Stunden. Er hat nichts gemacht. Ich auch nicht. Bester Tag seit Jahren.', 'freude')],
      M),
    nachspielMorgen: tagesgespraech('vega-tag-nachspiel-morgen',
      [V('Morgen. Kein Turm mehr am Horizont, der mich angrinst. Nur noch Smog. Ich vermiss den Turm nicht. Ich vermiss das Zählen.', 'signatur')],
      [V('Ich hab den Drohnen gestern beim Abbau zugeschaut. Dreiundvierzig. Jede einzeln. Wie Blätter im Herbst. Nur lauter und mit Firmenlogo.', 'freude')],
      M),
    akt2: tagesgespraech('vega-tag-akt2',
      [
        V('Letzte Nacht hat der Turm geblinzelt. Alle Fenster gleichzeitig. Ich hab’s gesehen. Ich hab’s nicht verstanden.', 'besorgt'),
        V('Ich hab schon viel gesehen, was blinzelt. Hochhäuser gehören nicht dazu.'),
      ],
      [
        V('Und jetzt hängt überall „Chrome 10 – bald gratis“. Am Kiosk. Am Klo im HV. Auf dem Rücken eines Rentners, der’s nicht gemerkt hat.', 'wut'),
        V('Gratis. Das teuerste Wort der Stadt. Ich hab’s Jimmy gesagt, damals. Ich sag’s jetzt allen.'),
      ],
      M, { effects: [flag('vega_kommentar_akt2')] }),
    schuss: tagesgespraech('vega-tag-schuss',
      [
        V('Drei Meter. Durch ein Gitter. Mit einer Hand am Geländer, weil die andere Kabel gehalten hat.', 'signatur'),
        V('Der Typ, der Aria festgehalten hat, hat jetzt ein Loch im Ärmel und einen sehr neuen Glauben.'),
      ],
      [V('Aria hat sich nicht bedankt. Sie hat gesagt: „Fast daneben, Vega.“ Das ist bei ihr eine Umarmung. Ich hab sie trotzdem umarmt. Sie hat gezappelt.', 'freude')],
      M, { effects: [flag('vega_kommentar_schuss'), herz('vega', 20)] }),
    ariaZurueck: tagesgespraech('vega-tag-aria-zurueck',
      [
        V('Sie ist wach. Sie flucht. Sie hat Dante „Lötkolben-Jesus“ genannt und ihm dann eine Kopfnuss gegeben, weil er geweint hat.', 'freude'),
        V('Alles normal. Ich hab nie so gern etwas Normales gesehen.'),
      ],
      [V('Sie erinnert sich an ein bisschen was. An eine weiße Decke und eine Stimme, die „Master“ will. Sie hat gesagt, es fühlt sich an wie ein Kater ohne Party. Ich hab gesagt: Dann holen wir uns die Party.', 'signatur')],
      M, { effects: [flag('vega_kommentar_aria_zurueck'), herz('vega', 20)] }),
    jimmyChip: tagesgespraech('vega-tag-jimmy-gechippt',
      [
        V('Sie haben Jimmy.', 'trauer'),
        V('Er lag auf der zweiten Liege. Er hat mich angeguckt. Er hat „Guten Abend, Master“ gesagt. Zu MIR. Ich hab ihm Nudeln gebracht, drei Monate lang, und er sagt „Master“.', 'wut'),
      ],
      [V('Ich hab mal gesagt, der berappelt sich. Ich sag’s immer noch. Ich sag’s jetzt nur leiser.', 'trauer')],
      M, { effects: [flag('vega_kommentar_jimmy_chip')] }),
    nyraWeg: tagesgespraech('vega-tag-nyra-weg',
      [
        V('Ihr Hocker im HV ist leer. Ich setz mich drauf, wenn keiner guckt. Damit er warm bleibt. Sag das keinem.', 'trauer'),
        V('Sie hat gefragt, ob wir sie noch wollen, wenn sie zurückkommt. Jedes Mal. Ich hab nie geantwortet. Ich dachte, die Frage ist albern.'),
      ],
      [V('Die Frage war nicht albern. Die Antwort ist ja. Ich übe, es ihr zu sagen. Ohne Gewehr in der Hand. Schwierig.', 'besorgt')],
      M, { effects: [flag('vega_kommentar_nyra'), herz('vega', 10)] }),
    danteCrew: tagesgespraech('vega-tag-dante-crew',
      [
        V('Dante sitzt jetzt am Stammtisch. Mit uns. Freiwillig. Er hat einen Teller Kekse mitgebracht und „für die Moral“ gesagt.', 'ueberrascht'),
        V('Vor einer Woche hat er uns die Tür vor der Nase zugemacht. Jetzt erklärt er Hunter, wie man ein Glas richtig hält.'),
      ],
      [V('Ich trau Leuten nicht, die ihre Meinung ändern. Bei ihm mach ich eine Ausnahme. Er hat sie ja nicht geändert. Er hat sie nur endlich zugegeben.', 'signatur')],
      M, { effects: [flag('vega_kommentar_dante')] }),
    ariaWeg: tagesgespraech('vega-tag-aria-weg',
      [
        erz('Vega sitzt auf dem Dach. Das Gewehr liegt zerlegt vor ihr auf einem Tuch, jedes Teil in einer exakten Reihe. Sie setzt es zusammen. Nimmt es auseinander. Setzt es zusammen.'),
        V('Nicht reden. Nur sagen, wenn du was weißt. Weißt du was?', 'wut'),
      ],
      [V('Xion hat sie über die Schulter geworfen wie einen Sack Kabel. Ich hatte ihn im Fadenkreuz. Vier Sekunden lang. Hunter hat „Nicht!“ gesagt. Ich hab auf Hunter gehört. Das verzeih ich mir nie. Und ihm auch nicht.', 'trauer')],
      M, { plauschText: 'Ich weiß nichts. Aber ich bin da.' }),
    partyBereit: tagesgespraech('vega-tag-party-bereit',
      [
        V('Morgen Nacht. Ich hab die Antennen auf dem Himmelsgarten dreimal auf den Plänen gesucht. Dreimal gefunden. Beruhigend.', 'besorgt'),
        V('Ich hab das Gewehr geputzt. Und den Funk. Und meine Stiefel. Und Arias Schläger, als sie nicht geguckt hat. Ich putz, wenn ich nervös bin. Ich bin nicht nervös.'),
      ],
      [V('Wenn’s schiefgeht, hörst du mich nicht. Du merkst nur, dass der Typ vor dir plötzlich liegt. Das hab ich dir schon mal gesagt. Es gilt immer noch.', 'signatur')],
      M),
    salon: tagesgespraech('vega-tag-salon',
      [
        erz('Vor dem Salon Gina steht Vega in einer Wolke aus Pailletten und guckt, als hätte man ihr eine Granate ohne Stift in die Hand gedrückt.'),
        V('Gina will mir Glitzer ankleben. An die SCHULTERN. Wer zielt denn bitte mit glitzernden Schultern? Die Reflexion sieht man auf drei Kilometer.', 'wut'),
      ],
      [V('Ich hab mich auf Schwarz geeinigt. Schwarz, matt, mit Taschen. Gina hat geweint. Vor Kunst. Oder vor Wut. Bei Gina ist das dasselbe.', 'signatur')],
      M),
    bruecke: tagesgespraech('vega-tag-bruecke',
      [
        V('Fußgängerbrücke. Bester Blick auf den Campus. Ich zähl die Fenster vom Turm. Dreihundertacht. Eins davon gehört zum Labor. Ich weiß nicht, welches.', 'besorgt'),
      ],
      [V('Gestern hat ganz unten ein Licht dreimal geblinkt. Kurz, lang, kurz. Wahrscheinlich ein Wackelkontakt. Ich hab trotzdem zurückgeblinkt. Mit der Taschenlampe. Wie ein Idiot.', 'trauer')],
      M),
    a2Morgen: tagesgespraech('vega-tag-a2-morgen',
      [V('Morgen. Siebenundvierzig Quantum-Drohnen über der Unterstadt. Gestern waren’s einundvierzig. Die vermehren sich. Wie Tauben. Nur ohne Charme.', 'besorgt')],
      [V('Eine hat heute vor meinem Ausguck gehalten und mich gescannt. Ich hab zurückgescannt. Mit dem Zielfernrohr. Sie ist dann weitergeflogen. Kluges Ding.', 'signatur')],
      M),
    a2Markt: tagesgespraech('vega-tag-a2-markt',
      [V('Der Typ mit den Hütchen hat jetzt einen „Chrome 10“-Aufkleber auf der Stirn. Er sagt, er kriegt dafür zehn Prozent Rabatt auf irgendwas. Auf was, weiß er nicht.', 'wut')],
      [V('Babette hat ein Schild aufgehängt: „Keine Chips im Essen.“ Damit meint sie die anderen Chips. Glaub ich. Ich frag nicht. Die Nudeln sind gut.')],
      M),
    a2Club: tagesgespraech('vega-tag-a2-club',
      [V('Setz dich. Hunter hat heute zum ersten Mal seit Jahren Stammtisch gemacht. Er nennt es „Lagebesprechung“. Wir trinken trotzdem.', 'signatur')],
      [V('Halb Noxius redet über die Releaseparty. Die andere Hälfte trägt schon einen Chip und redet gar nicht mehr. Die sitzen da und lächeln. Ich hab lieber Leute, die fluchen.', 'besorgt')],
      M),
    a2Nacht: tagesgespraech('vega-tag-a2-nacht',
      [V('Nachts leuchtet der Turm jetzt blau. Früher war er weiß. Blau heißt, sie hat ein Gefühl. Sagt Nyra. Sagte Nyra.', 'trauer')],
      [V('Ich schlaf wieder hier oben. Mit einem offenen Auge. Das andere ist auch offen. Ich schlaf eigentlich gar nicht.')],
      M),
  };

  // Morgen danach (world.md §4.7): Vega kommentiert, einmal je Romanze.
  const nacht = (id: string, flagName: string, gruss: string, plausch: string, extra: Condition[] = []) => ({
    dialogue: tagesgespraech(id, [V(gruss, 'signatur')], [V(plausch)], M, { effects: [flag(`vega_kommentar_${flagName}`)] }),
    talk: rede(id, { all: [{ flag: flagName }, { notFlag: `vega_kommentar_${flagName}` }, { time: ['morgen', 'tag'] }, { not: MASTER }, { not: PARTYNACHT }, ...extra] }),
  });
  const naechte = [
    nacht('vega-tag-nacht-vexaria', 'vexaria_nacht',
      'Ich hab die Tür gehört. Und dann eine Weile gar nichts mehr. Ich hab mich umgedreht. Auf meinem eigenen Dach. In die andere Richtung. Das ist Freundschaft.',
      'Sie hat heute Morgen „Guten Morgen, Vega“ gesagt. Mit Komma. Aria setzt nie Kommas. Pass gut auf sie auf, Postbotin. Ich mess sonst nach.', [VEX]),
    nacht('vega-tag-nacht-aria', 'aria_nacht',
      'Aria hat heute beim Frühstück gesummt. Und mir Kaffee eingeschenkt. Ohne dass ich gefragt hab. Ich weiß, wo sie war. Und mit wem.',
      'Ich sag nur eins: Wenn du ihr wehtust, find ich dich. Wenn du sie glücklich machst, find ich dich auch. Dann bring ich Kaffee.', [{ not: VEX }]),
    nacht('vega-tag-nacht-hunter', 'hunter_nacht',
      'Hunter hat heute Morgen ohne Sonnenbrille gefrühstückt. Und gelächelt. Ich hab den Notruf schon gewählt. Dann hab ich dich gesehen und wieder aufgelegt.',
      'Er hat Dante gefragt, ob es Kekse ohne Zucker gibt. „Für die Linie.“ Was hast du mit unserem Chef gemacht?'),
    nacht('vega-tag-nacht-dante', 'dante_nacht',
      'Dantes Plattenspieler lief bis vier Uhr. Immer dieselbe Seite. Ich wohn zwei Dächer weiter. Ich kann die Platte jetzt auswendig.',
      'Er hat heute Morgen Kekse gebacken, die nicht verbrannt sind. Das erste Mal seit drei Jahren. Ich will gar nicht wissen, warum. Doch, will ich. Erzähl’s mir nie.'),
    nacht('vega-tag-nacht-collin', 'collin_nacht',
      'Der Moderator vom Stadt-TV hat heute Morgen die Wettervorhersage gestottert. Live. Ich hab auf dem Bildschirm einen Kratzer an seinem Hals gesehen. Achtzehn Millimeter.',
      'Ich messe auch Dinge, die ich nicht wissen will. Berufskrankheit.'),
    nacht('vega-tag-nacht-lio', 'lio-funkel_nacht',
      'Lio hat heute Morgen auf dem Schrottmarkt ein Lied gespielt, das sich gereimt hat. Lio reimt nie. Ich hab eins und eins zusammengezählt.',
      'Es war ein schönes Lied. Kitschig. Aber schön. Sag ihm, ich hab nicht geweint. Ich hatte Smog im Auge.'),
  ];

  const dialogues = [
    ...Object.values(T), ...naechte.map((n) => n.dialogue), he8, he10,
  ];

  const talk = [
    rede('vega-tag-master', MASTER),
    rede('vega-tag-partynacht', PARTYNACHT),
    rede('vega-tag-ende-3b', { all: [ENDE_3B, { notFlag: 'vega_kommentar_ende' }] }),
    rede('vega-tag-ende-meer', { all: [NACHSPIEL, ENDE_MEER, { notFlag: 'vega_kommentar_ende' }] }),
    rede('vega-tag-ende-nexus', { all: [NACHSPIEL, ENDE_NEXUS, { notFlag: 'vega_kommentar_ende' }] }),
    ...naechte.map((n) => n.talk),
    rede('vega-tag-strand', { all: [NACHSPIEL, { time: 'abend' }, { weekday: ['sa', 'so'] }] }),
    rede('vega-tag-nachspiel-morgen', { all: [NACHSPIEL, { time: 'morgen' }] }),
    rede('vega-tag-akt2', { all: [AKT2, { notFlag: 'vega_kommentar_akt2' }] }),
    rede('vega-tag-schuss', { all: [AKT2, { flag: 'bruch_vega_schuss' }, { notFlag: 'vega_kommentar_schuss' }] }),
    rede('vega-tag-aria-zurueck', { all: [AKT2, ARIA_ZURUECK, { notFlag: 'vega_kommentar_aria_zurueck' }] }),
    rede('vega-tag-jimmy-gechippt', { all: [AKT2, JIMMY_IM_TURM, { notFlag: 'vega_kommentar_jimmy_chip' }] }),
    rede('vega-tag-nyra-weg', { all: [AKT2, NYRA_IM_TURM, { notFlag: 'vega_kommentar_nyra' }] }),
    rede('vega-tag-dante-crew', { all: [AKT2, DANTE_CREW, { notFlag: 'vega_kommentar_dante' }] }),
    rede('vega-tag-aria-weg', { all: [AKT2, ARIA_WEG] }),
    rede('vega-tag-party-bereit', { all: [AKT2, PARTY_BEREIT] }),
    rede('vega-tag-salon', { all: [AKT2, PARTY_PLAN, { weekday: 'sa' }, { time: 'tag' }] }),
    rede('vega-tag-bruecke', { all: [AKT2, NYRA_IM_TURM, { weekday: ['di', 'do'] }, { time: 'tag' }] }),
    rede('vega-tag-a2-morgen', { all: [AKT2, { time: 'morgen' }] }),
    rede('vega-tag-a2-markt', { all: [AKT2, { time: 'tag' }, { not: { weekday: ['mo', 'mi', 'fr'] } }] }),
    rede('vega-tag-a2-club', { all: [AKT2, { time: 'abend' }] }),
    rede('vega-tag-a2-nacht', { all: [AKT2, { time: 'nacht' }] }),
  ];

  const schedule: ScheduleEntry[] = [
    { when: PARTYNACHT, place: { map: 'himmelsgarten', at: 'antennen' } },
    { when: MASTER, place: { map: 'neon-gasse', at: 'vegas-ausguck' } },
    { slot: 'abend', days: ['sa', 'so'], when: NACHSPIEL, place: { map: 'das-meer', at: 'duenengras' } },
    { when: { all: [AKT2, ARIA_WEG] }, place: { map: 'neon-gasse', at: 'vegas-ausguck' } },
    { slot: 'tag', days: ['di', 'do'], when: { all: [AKT2, NYRA_IM_TURM] }, place: { map: 'stufenplatz', at: 'fussgaengerbruecke' }, dialogue: 'vega-tag-bruecke' },
    { slot: 'tag', days: ['sa'], when: { all: [AKT2, PARTY_PLAN] }, place: { map: 'stufenplatz', at: 'salon-gina' }, dialogue: 'vega-tag-salon' },
  ];

  const phone = {
    'tel-vega-vernissage': {
      id: 'tel-vega-vernissage', from: 'vega',
      text: 'Vernissage in den Glasarkaden. Abends. Ich muss da hin, wegen eines Bildes. Ich brauch jemanden, der nicht nach Geld riecht und mich festhält, wenn ich werfe. – V.',
      auto: { all: [{ hearts: 'vega', min: 8 }, IM_EINSATZ, { not: { seen: 'he-vega-8' } }] },
      replies: [{ text: 'Ich zieh mein bestes Hemd an.' }, { text: 'Werfen? Was denn?' }],
    },
    'tel-vega-garten': {
      id: 'tel-vega-garten', from: 'vega',
      text: 'Morgen früh. Dach. Ich zeig dir meinen Garten. Er ist sehr klein. Lach nicht. Doch, lach. Aber leise.',
      auto: { all: [{ hearts: 'vega', min: 10 }, { seen: 'he-vega-8' }, { not: { seen: 'he-vega-10' } }, { not: PARTYNACHT }, { not: MASTER }] },
    },
    'tel-vega-party': {
      id: 'tel-vega-party', from: 'vega',
      text: 'Ich lieg auf den Antennen über dem Himmelsgarten. 340 m bis zum Pult. Wenn es knallt, war ich das. Wenn es nicht knallt, war ich das auch.',
      auto: PARTY_BEREIT,
      replies: [{ text: 'Pass auf dich auf da oben.', effects: [herz('vega', 10)] }, { text: 'Triff nicht Hunter.' }],
    },
    'tel-vega-meer': {
      id: 'tel-vega-meer', from: 'vega',
      text: 'Wochenende, Dünen, abends. Ich zähl Wellen. Bin bei 4.311. Komm mitzählen. Kaffee bring ich mit, du bringst nichts, was raschelt.',
      auto: { all: [NACHSPIEL, { flag: 'meer_offen' }, { hearts: 'vega', min: 4 }] },
    },
  };

  return { dialogues, talk, schedule, phone };
}

