// „Zerberster-Herz“: Nächte der Baukasten-Spielfigur mit Aria (world.md §4.7, Aria-Ergänzung „Bleib heute Nacht“).
// Vex hat dafür eigene Stationen (hoehepunkt.ts 10/11, krise.ts, akt2.ts, enden.ts); hier läuft alles nur ohne Vex.
//
//   1. `aria-baukasten-nacht` (Herz-Ereignis `crew-quartier` · A/N): frühestens am Tag nach `rom-aria-kuss`
//      (`aria_warte2` aus). Aria klopft („Vega schnarcht.“). Reinlassen → `aria-baukasten-nacht-drinnen` (wer führt /
//      der Arm / Worte) → Abblende `aria-baukasten-abblende` → Schlafen → `aria-baukasten-morgen`. „Nicht heute“ →
//      `aria_baukasten_spaeter`; dann kommt sie in einer späteren Woche mit Nudeln wieder (`aria-baukasten-klopfen-erste`).
//   2. Wiederkehrend (onEnter `crew-quartier` · A/N, 1×/Woche über `woche_aria_baukasten_nacht`, fällt montags von
//      selbst): Mo/Di Nudeln im Regen, Mi/Do „Zehn Uhr“ (die fehlende Hand juckt), Fr–So nach dem Club (nicht im
//      Nachspiel). Je eigene Abblende und kurzer Morgen. Absage setzt `heute_aria_baukasten_gefragt` bzw. die Woche.
//   3. `aria-baukasten-meernacht` (Herz-Ereignis `das-meer` · A/N): am Abend nach `rom-aria-meer`, Lagerfeuer → Strand →
//      Dünengras → Abblende → `aria-baukasten-meer-morgen`. Zählt auch als erste Nacht, falls die noch fehlt.
//
// Die Nacht selbst bleibt immer hinter der Abblende. Alle Nächte setzen `aria_nacht` (Kanon: Vega-Kommentar am Morgen).
// Die Herz-Ereignisse hängt versoehnung.ts an Arias NpcDef (`BAUKASTEN_NAECHTE_EVENTS`).
import type { ContentPart } from '../../part';
import type { Condition, CutsceneDef, DialogueDef, HeartEventDef } from '../../../modules/contracts';
import {
  a, AKT3, all, any, BESCHWINGT, byId, ch, chk, cut, dlg, EPILOG, flag, herz, HEUTE_FREI, n, node, noFlag, not, NOT_V, p,
  R, s, seen, set, station, STATION_START, ZUSAMMEN,
} from './_util';

const PAAR: Condition = all(R, ZUSAMMEN);
const KEIN_KRACH: Condition = all(noFlag('aria_romanze_streit'), noFlag('aria_krach'));
/** Aria ist nicht greifbar: gechippt (Variante A), Master-Ende ohne 3b, Partynacht. */
const ARIA_WEG: Condition = any(
  all(flag('aria_gechippt'), not({ quest: 'main-2-countdown', state: 'done' }), noFlag('vexaria_gerettet')),
  flag('master_modus'),
  all(flag('ende_master'), noFlag('ende_doch_noch_meer')),
  all(AKT3, not(EPILOG)),
);
const ABENDS: Condition = { time: ['abend', 'nacht'] };
const WOCHE = 'woche_aria_baukasten_nacht';
const GEFRAGT = 'heute_aria_baukasten_gefragt';
const NACHT = 'aria_baukasten_nacht';
/** Jede Nacht: Kanon-Flag, eigenes Flag, Wochensperre. */
const NACHT_FLAGS = [set('aria_nacht'), set(NACHT), set(WOCHE)];

// ---------------------------------------------------------------------------
// 1 · Erste Nacht: an der Tür

const nachtTuer: DialogueDef = dlg('aria-baukasten-nacht', [
  node('start', [
    n('Crew-Quartier, spät. Unten im Club wummert der Bass durch die Containerwand, gedämpft, wie ein zweiter Herzschlag. Du hast gerade die Stiefel aufgeschnürt, da klopft es. Dreimal. Dann noch mal, lauter, ungeduldig.'),
    n('Aria. Den Schläger über der Schulter, die Zöpfe nass vom Nieselregen, die Jacke offen. Sie lehnt im Türrahmen, als hätte sie zufällig hier angehalten. Der Zerberster trommelt gegen den Rahmen. Tok. Tok. Tok.'),
    a('Vega schnarcht.', 'verlegen'),
    a('Und ich will nicht allein sein. Und …', 'verlegen'),
    a('Scheiße. Du weißt genau, warum ich hier bin. Guck nicht so. Doch, guck so. Nee. Ach, verdammt.', 'verlegen'),
  ], {
    effects: STATION_START,
    choices: [
      ch('„Komm rein.“', undefined, { when: flag('aria_kuss'), effects: [{ dialogue: 'aria-baukasten-nacht-drinnen' }] }),
      ch('„Komm rein.“', 'hand', { when: noFlag('aria_kuss') }),
      ch('„Hast du deine Zahnbürste dabei?“', 'zahnbuerste'),
      ch('„Nicht heute. Aber bleib noch kurz hier.“', 'andermal'),
    ],
  }),
  node('hand', [
    a('An der Mauer wolltest du warten. Ich hab gewartet. Einen ganzen Tag. Das ist Rekord. Frag Vega.', 'verlegen'),
    n('Sie duckt sich unter deinem Arm durch, bevor du antworten kannst.'),
  ], { effects: [{ dialogue: 'aria-baukasten-nacht-drinnen' }] }),
  node('zahnbuerste', [
    n('Sie starrt dich an. Dann greift sie in die Jackentasche und zieht eine Zahnbürste raus. Pink. Zerkaut. Sie hält sie hoch wie ein Messer.'),
    a('Halt die Klappe. Die hab ich immer dabei. Für … Notfälle.', 'verlegen'),
    a('Das hier ist ein Notfall. Lass mich rein, bevor ich\'s mir anders überleg und dir die Tür eintrete. Mit Liebe. Aber eintrete.', 'signatur'),
  ], { effects: [herz(10), { dialogue: 'aria-baukasten-nacht-drinnen' }] }),
  node('andermal', [
    n('Sie nickt. Zu schnell. Dann lehnt sie die Stirn an deinen Türrahmen, gleich neben deinem Kopf.'),
    a('Okay. Okay. Gut. Ist gut. Ich bin nicht sauer. Ich bin … erleichtert. Ein bisschen. Und ein bisschen gar nicht.', 'verlegen'),
    n('Ihr steht eine Weile so. Der Bass von unten. Ihr Atem, der nach Kaugummi und Regen riecht. Dann küsst sie dich, kurz, an der Tür, die echte Hand an deinem Kragen, und tritt zurück, bevor einer von euch es sich anders überlegen kann.'),
    a('Ich klopf wieder. Nächste Woche. Mit Nudeln. Und dann lässt du mich rein, oder ich nehm die Tür mit.', 'signatur'),
  ], { effects: [set('aria_baukasten_spaeter'), set(WOCHE), herz(10)] }),
]);

// ---------------------------------------------------------------------------
// 1 · Erste Nacht: drinnen (auch über `aria-baukasten-klopfen-erste`)

const nachtDrinnen: DialogueDef = dlg('aria-baukasten-nacht-drinnen', [
  node('start', [
    n('Sie stellt den Schläger neben die Tür. Ordentlich. Lehnt ihn an die Wand, rückt ihn gerade, rückt ihn noch mal gerade. Dann steht sie mitten im Quartier und weiß nicht, wohin mit den Händen.'),
    n('Sie redet. Natürlich redet sie. Über den Regen, über Hunters neue Zapfanlage, über Captain Kuschel, der im Hundekorb sitzt und sie mit einem geknickten Ohr beobachtet.'),
    a('Der Hase guckt. Kann der Hase aufhören zu gucken? Ich kann so nicht arbeiten.', 'verlegen'),
    n('Du drehst Captain Kuschel zur Wand. Ein Ohr fällt beleidigt nach vorn.'),
    n('Sie setzt sich auf die Bettkante. Steht wieder auf. Setzt sich wieder. Der Zerberster liegt auf ihrem Oberschenkel wie ein Gast, den sie nicht eingeladen hat, und die echte Hand knetet den Saum ihres Tops.'),
    a('Ich bin scheiße in so was. Im Anfangen. Prügeln kann ich. Rennen kann ich. Aber das hier … ich hab Schiss, dass ich was kaputtmach. Dich. Das Bett. Die Stimmung. Such dir was aus.', 'trauer'),
  ], {
    choices: [
      ch('Dich neben sie setzen. Ihre Hand nehmen. Die echte.', 'langsam'),
      ch('„Steh auf.“ Und sie an dich ziehen.', 'du-fuehrst'),
      ch('„Dann fang du an. Ich halt still.“', 'sie-fuehrt'),
    ],
  }),
  node('langsam', [
    n('Du setzt dich neben sie. Nicht zu nah. Dann doch. Eure Knie stoßen aneinander. Du nimmst ihre rechte Hand, die echte, und sie zuckt, als hättest du sie erschreckt, und lässt sie dann liegen.'),
    n('Ihre Finger sind rau. Schwielen vom Schlägergriff, eine frische Schramme über dem Knöchel. Du fährst mit dem Daumen drüber. Einmal. Langsam. Sie atmet aus, als hätte sie seit der Tür die Luft angehalten.'),
    a('Das … ist unfair. Das ist eine Hand. Das ist nur eine Hand, und ich krieg Gänsehaut bis in die Zöpfe.', 'verlegen'),
    n('Du küsst ihre Fingerknöchel. Dann das Handgelenk, da, wo der Puls hämmert. Sie lacht, kurz, zittrig, und lehnt den Kopf an deine Schulter. Ihr Haar riecht nach Regen und Kettenöl.'),
    a('Mach weiter so langsam, und ich explodier. Mach schneller, und ich explodier auch. Ich bin in jeder Variante tot.', 'zaertlich'),
    n('Sie dreht dir das Gesicht zu. Ihr Atem streift deinen Mund. Diesmal wartet keiner von euch. Der Kuss ist weich und lang und hört nicht richtig auf, nur kurz, damit sie „okay“ flüstern kann, und dann gleich noch mal.'),
  ], { effects: [herz(20)], next: 'arm' }),
  node('du-fuehrst', [
    n('Sie steht auf, weil du es sagst. Das allein ist schon ein Wunder. Du ziehst sie an den Gürtelschlaufen zu dir, und sie stolpert den halben Schritt, der noch gefehlt hat, und landet an dir. Ihr Herz hämmert. Du spürst es durch zwei Lagen Stoff.'),
    a('Oh. Okay. So also. Du bist also doch nicht nur nett.', 'ueberrascht'),
    n('Du küsst sie. Den Mundwinkel zuerst, dann richtig. Sie gibt einen Laut von sich, halb Lachen, halb was anderes, und krallt die echte Hand in deine Jacke. Ihr Rücken ist warm unter deiner Handfläche, durch das dünne Top spürst du jeden Atemzug.'),
    n('Du schiebst sie rückwärts, zwei Schritte, drei, bis ihre Schultern an die Wand stoßen. Das Kabelbrand-Poster raschelt. Sie lacht in deinen Mund.'),
    a('Wenn das Poster runterfällt, bist du tot. Das ist signiert. Von keinem. Aber signiert.', 'freude'),
    n('Deine Lippen wandern ihren Hals hinunter. Sie legt den Kopf in den Nacken und schluckt, und du spürst es an deinem Mund. Ihre Finger fahren dir ins Haar und halten fest.'),
    a('Scheiße. Okay. Ja. Da. Genau da. Wehe, du hörst auf.', 'zaertlich'),
  ], { effects: [herz(20)], next: 'arm' }),
  node('sie-fuehrt', [
    n('Sie sieht dich an. Lange. Dann grinst sie, und es ist das alte Grinsen, das, mit dem sie Mülltonnen über Marktstände wirft.'),
    a('Stillhalten. Du. Ha. Das will ich sehen.', 'signatur'),
    n('Sie stellt sich vor dich und schiebt dich mit der echten Hand nach hinten, bis du auf die Ellbogen kippst. Dann klettert sie hinterher, ein Knie links von dir, eins rechts, und guckt runter wie auf eine Beute, die sie noch nicht ganz verdient hat.'),
    a('Ich hab mir das überlegt. Auf dem Weg hierher. Drei Stockwerke lang. Ich hatte einen Plan.', 'verlegen'),
    p('Und?'),
    a('Weg. Komplett weg. Du hast mich angeguckt, und der Plan ist aus dem Fenster gesprungen.', 'verlegen'),
    n('Sie beugt sich runter. Ihre Zöpfe fallen dir ins Gesicht und kitzeln, und sie pustet sie weg und trifft dich dabei ins Auge, und ihr lacht beide so sehr, dass das Bett quietscht. Dann küsst sie dich. Frech erst, kleine Bisse an deiner Unterlippe. Dann nicht mehr frech. Dann gar nicht mehr frech.'),
    n('Du hältst still. Es ist das Schwerste, was du je gemacht hast.'),
    a('Du zitterst ja. Gut. Ich dachte schon, das bin nur ich.', 'zaertlich'),
  ], { effects: [herz(20)], next: 'arm' }),
  node('arm', [
    n('Dann merkst du es. Der Zerberster. Die ganze Zeit hat sie ihn weggehalten. Hinter dem Rücken, flach auf der Matratze, steif neben sich, wie ein Ding, das nicht dazugehört. Die silbernen Finger sind zur Faust geballt.'),
    p('Was ist mit dem Arm?'),
    a('Nix. Nichts. Der bleibt, wo er ist.', 'besorgt'),
    a('Der spürt nix. Der weiß nicht, wie fest fest ist. Ich hab Dante damit \'ne Tasse zerdrückt, als ich aufgewacht bin. Ich hab mit dem Ding Türen aus den Angeln gerissen. Ich will dir nicht wehtun. Nicht heute. Nicht dir.', 'trauer'),
  ], {
    choices: [
      ch('Ihre Metallhand nehmen und an deinen Hals legen.', 'hals'),
      ch('„Darf ich?“ Die Naht an ihrer Schulter berühren.', 'naht'),
      ch('„Dann sag ich\'s dir. Wenn\'s zu fest ist. Versprochen.“', 'wort'),
    ],
  }),
  node('hals', [
    n('Du nimmst ihr Handgelenk. Das Metall ist kühl, glatt, fast weich unter deinen Fingern, und darunter summt es leise, wie eine Stromleitung im Regen. Sie hält die Luft an. Aber sie lässt dich.'),
    n('Du öffnest die Faust, Finger für Finger. Dann legst du dir die silberne Hand an den Hals. Metall an deinem Puls. Kühl. Ganz still.'),
    a('Was machst du … nicht. Nicht da. Da ist alles weich, du Arschloch, da kann ich …', 'besorgt'),
    p('Du kannst. Du machst nicht.'),
    n('Sie starrt auf ihre eigene Hand an deinem Hals. Die Finger liegen da wie Federn. Sie bewegt den Daumen, einen Millimeter, über deine Haut, und du spürst, wie viel Kraft sie gerade nicht benutzt.'),
    a('Ich spür nix. Gar nix. Aber ich seh, dass du schluckst. Und ich seh, dass du nicht wegzuckst.', 'zaertlich'),
    a('Keiner hat sich je freiwillig von dem Ding anfassen lassen. Nicht so. Nicht am Hals.', 'trauer'),
    n('Dann küsst sie dich, und diesmal ist die silberne Hand dabei. Sie wandert in deinen Nacken, unendlich vorsichtig, so, wie man einen jungen Vogel hält.'),
  ], { effects: [herz(30)], next: 'kleidung' }),
  node('naht', [
    n('Du fragst, und sie sieht dich an, als hättest du gefragt, ob du ihr Tagebuch lesen darfst. Dann nickt sie. Einmal. Kurz.'),
    n('Du schiebst den Netzstoff von ihrer linken Schulter. Da, wo der Zerberster anfängt, läuft eine Naht über ihre Haut. Wulstig, hell, ein Ring aus Narbengewebe um die Andockplatte, da, wo Haut aufhört und Metall anfängt.'),
    a('Nicht hingucken. Das ist … das ist der hässlichste Teil an mir. Dante sagt, das verheilt noch. Dante lügt, wenn er nett sein will.', 'verlegen'),
    n('Du küsst die Naht. Langsam. Einmal rundherum, wo sie warm ist, und dann auf das kühle Metall gleich daneben, wo sie nichts spürt. Weil es trotzdem ihrs ist.'),
    n('Aria sagt gar nichts mehr. Sie atmet nur, zittrig, durch die Nase, und ihre echte Hand gräbt sich in deine Schulter, und für einen Moment glänzen ihre Augen, bevor sie es wegblinzelt.'),
    a('Wenn du das jemandem erzählst … nee. Erzähl\'s ruhig. Ist mir egal. Mach das noch mal.', 'zaertlich'),
  ], { effects: [set('aria_baukasten_naht'), herz(40)], next: 'kleidung' }),
  node('wort', [
    a('Versprochen?', 'besorgt'),
    p('Versprochen. Und du sagst es mir auch. Wenn ich zu schnell bin. Oder zu blöd.'),
    a('Du bist immer zu blöd. Das ist eingepreist.', 'freude'),
    n('Sie überlegt. Ernsthaft. Die Zunge zwischen den Zähnen, wie bei einem Schloss, das nicht aufgehen will.'),
    a('Kronkorken. Das ist das Wort. Wenn einer „Kronkorken“ sagt, ist Schluss. Sofort. Kein Gemecker, kein Beleidigtsein. Und wenn keiner was sagt …', 'verlegen'),
    p('… dann machen wir weiter.'),
    a('Dann machen wir weiter. Gott. Das klingt so erwachsen. Ich hasse es. Ich find\'s scharf. Ich hasse, dass ich\'s scharf find.', 'verlegen'),
    n('Sie öffnet die Faust. Langsam. Die silbernen Finger legen sich auf deine Hüfte, ganz flach, ohne zu greifen. Dann lacht sie leise, ungläubig, als hätte sie gerade erst gemerkt, dass sie das darf.'),
  ], { effects: [set('aria_baukasten_wort'), herz(30)], next: 'kleidung' }),
  node('kleidung', [
    n('Irgendwann wird die Jacke zu warm. Deine fliegt zuerst, quer durchs Quartier, über den Plattenspieler. Ihre bleibt an der Zerberster-Schulter hängen, und sie flucht und zerrt und reißt schließlich die Ärmelnaht auf.'),
    a('Scheißjacke. Die war eh geklaut.', 'wut'),
    n('Dann die Stiefel. Sie hat Doppelknoten gemacht. Dreifachknoten. Sie sitzt auf der Bettkante und kämpft mit den Schnürsenkeln, und du lachst, und sie wirft dir einen Stiefel an den Kopf, knapp daneben, und Captain Kuschel kippt im Hundekorb um.'),
    a('Lach nicht! Ich hab die heut Abend extra fest gemacht, damit ich nicht so ausseh, als hätt ich\'s geplant.', 'verlegen'),
    p('Du hast es geplant.'),
    a('Ich hab\'s seit der Flutmauer geplant. Halt die Klappe und hilf mir mit dem linken.', 'verlegen'),
    n('Du kniest dich vor sie und löst den Knoten. Ihre echte Hand liegt dabei in deinem Haar, die Finger kraulen ganz abwesend deinen Nacken, und du brauchst für den Knoten deutlich länger, als ein Knoten braucht.'),
    n('Als du hochsiehst, guckt sie dich an. Nicht frech. Nicht wütend. Nur still, mit roten Wangen und Augen, die zu groß sind für ihr Gesicht.'),
    a('Du hast keine Ahnung, wie du gerade aussiehst, oder?', 'zaertlich'),
  ], {
    choices: [
      ch('„Ich will dich. Seit der Flutmauer. Seit davor.“', 'will'),
      ch('„Du bist das Schönste, was mir je einen Stiefel an den Kopf geworfen hat.“', 'stiefel', { check: chk('aria-baukasten-nacht-ausstrahlung', 'ausstrahlung', 6, ['flirt']) }),
      ch('Nichts sagen. Ihre Metallhand nehmen und die Knöchel küssen.', 'still'),
    ],
  }),
  node('will', [
    n('Sie macht ein Geräusch, das kein Wort ist.'),
    a('Das kannst du nicht einfach so sagen. So gerade raus. Da muss man vorher warnen. Mit Schild. „Achtung, gleich wird\'s ehrlich.“', 'verlegen'),
    a('… Ich auch. Ich will dich auch. So sehr, dass ich vorhin auf der Treppe zweimal umgedreht bin, weil ich dachte, das sieht man mir an.', 'zaertlich'),
    n('Sie zieht dich am Shirt hoch und küsst dich, als hätte sie Angst, du könntest es dir anders überlegen. Ihre echte Hand rutscht in deinen Nacken und bleibt da, warm und fest, und ihr Herzschlag stolpert gegen deinen.'),
  ], { effects: [herz(30)], next: 'schluss' }),
  node('stiefel', [
    n('Sie starrt dich an. Dann prustet sie los, so laut, dass unten im Club garantiert jemand hochguckt.'),
    a('Das ist … das ist der schlechteste Satz, den ich je gehört hab. Und Dante hat mir mal ein Gedicht über Kekse vorgelesen.', 'freude'),
    a('Sag ihn noch mal.', 'zaertlich'),
    n('Du sagst ihn noch mal. Sie küsst dich mittendrin, damit du nicht fertig wirst, und lacht in deinen Mund. Und dann lacht sie nicht mehr.'),
  ], { effects: [herz(40)], next: 'schluss' }),
  node('still', [
    n('Du nimmst den Zerberster. Die Knöchel sind zerkratzt von hundert Mülltonnen, einer Tür in Rippers Praxis und einem Kiefer, über den sie nie redet. Du küsst sie. Jeden einzelnen. Silber, kühl, es schmeckt nach Öl und ein bisschen nach Regen.'),
    a('Der spürt das nicht.', 'trauer'),
    p('Weiß ich. Ich mach\'s trotzdem.'),
    n('Sie sieht dich an, als hättest du ihr gerade was geschenkt, das sie nicht zurückgeben kann. Dann zieht sie sich das Top über den Kopf.'),
    n('Es bleibt am Zopf hängen. Natürlich bleibt es am Zopf hängen. Sie steckt fest, die Arme über dem Kopf, das Gesicht im Stoff, und flucht dumpf durch den Netzstoff.'),
    a('Nicht lachen. NICHT LACHEN. Hilf mir, du – hör auf zu lachen, ich hör dich lachen!', 'wut'),
    n('Du befreist sie. Der Zopf ist halb offen. Ihr Gesicht ist knallrot. Das Top landet irgendwo hinter dem Bett, und du siehst nur noch ihr Gesicht, das zwischen Wut und Lachen festhängt und sich für Lachen entscheidet.'),
  ], { effects: [herz(30)], next: 'schluss' }),
  node('schluss', [
    n('Dein Shirt landet auf dem Boden. Ihr Top daneben, oder umgekehrt, keiner von euch zählt mit. Ihre Haut ist warm unter deinen Händen, am Rücken, an den Schultern, an der Hüfte, wo sie kitzlig ist und dir dafür in die Lippe beißt.'),
    n('Die Matratze quietscht, als ihr draufkippt. Der Zerberster landet neben deinem Kopf im Kissen, ganz sanft, mit einem Seufzer der Hydraulik, und bleibt da liegen wie ein Versprechen.'),
    a('Wenn du jemandem erzählst, dass ich gekichert hab, bist du tot.', 'verlegen'),
    p('Du hast noch gar nicht gekichert.'),
    a('Noch nicht.', 'signatur'),
    n('Sie streckt den Arm aus, ohne hinzusehen, und haut mit der Metallfaust auf den Lichtschalter. Der Schalter bricht ab. Das Licht geht trotzdem aus.'),
  ], { effects: [...NACHT_FLAGS, set('aria_baukasten_spaeter', false), { cutscene: 'aria-baukasten-abblende' }] }),
]);

// ---------------------------------------------------------------------------
// 1 · Der Morgen danach

const morgen: DialogueDef = dlg('aria-baukasten-morgen', [
  node('start', [
    n('Morgen. Graues Licht durch das Fenster über der Küchenecke. Unten stellt Hunter die Stühle von den Tischen, einen nach dem anderen, sehr laut, sehr absichtlich.'),
    n('Spurensuche. Der Lichtschalter liegt auf dem Boden, abgebrochen, mit vier silbernen Kratzern drauf. Ein Stiefel hängt am Plattenspieler. Captain Kuschel liegt kopfüber im Hundekorb, am Ohr klebt ein Zettel: „Ich hab nichts gehört. Ich hab Ohren wie Satellitenschüsseln. Ich hab trotzdem nichts gehört. – C. K.“'),
    n('Und am Kopfende, im Metallrohr des Bettgestells: eine Delle. Vier Finger, ein Daumen. Silberabrieb im Lack.'),
    n('Aria schläft. Quer über dem Bett, natürlich quer, die Decke um die Beine gewickelt, ein Zopf ganz offen. Sie trägt dein Shirt. Du weißt nicht mehr, wann das passiert ist. Der Zerberster liegt quer über dir, schwer, warm geworden von dir, und klackt leise, wenn sie atmet.'),
  ], {
    choices: [
      ch('Liegen bleiben. Bis sie aufwacht.', 'liegen'),
      ch('Kaffee machen. Zwei Becher.', 'kaffee'),
      ch('Ihr den offenen Zopf aus dem Gesicht streichen. Und weiterschlafen.', 'zopf'),
    ],
  }),
  node('liegen', [
    n('Du bleibst liegen. Eine Stunde. Hunter ist längst mit den Stühlen fertig. Dann bewegt sich die Metallhand. Ein Finger. Zwei. Sie tippen gegen dich wie gegen eine Tür.'),
    a('Du bist ja noch da.', 'ueberrascht'),
    n('Sie stemmt sich auf den Ellbogen. Das Haar ein einziges Vogelnest, Abdrücke vom Kissen auf der Wange, und an ihrem Hals ein roter Fleck, der bis heute Abend nicht weggeht. Du hast keine Ahnung, wie der dahin kam. Doch. Hast du.'),
    a('Guck nicht auf meinen Hals. Ich weiß, was da ist. Du hast an deinem auch einen, damit das klar ist. Wir sind quitt.', 'verlegen'),
    a('Hab deine Nudeln gegessen. Heute Nacht. Um drei. Du hast geschlafen wie ein Stein. Und dich hab ich auch geklaut. Nicht sorry.', 'freude'),
    p('Das Bett hat eine Delle.'),
    a('Das Bett hatte vorher schon eine Delle.', 'signatur'),
    p('Vier Finger. Ein Daumen.'),
    a('… Ich zahl das. Irgendwann. Sag Dante nix. Der baut mir sonst einen Drosselregler ein und benennt ihn nach dir.', 'verlegen'),
  ], { effects: [set('aria_baukasten_morgen_geblieben'), BESCHWINGT, herz(30), { advanceTime: 60 }] }),
  node('kaffee', [
    n('Du kriechst unter dem Zerberster raus, ganz langsam, wie unter einer Schranke. Sie grunzt, greift ins Leere und umarmt stattdessen dein Kissen.'),
    n('Kaffee. Zwei Becher. Der Wasserkocher klingt wie ein startendes Shuttle. Als du dich umdrehst, sitzt sie im Bett, dein Shirt bis über die Knie, und guckt dich an, als hättest du eine Bank überfallen.'),
    a('Du hast Kaffee gemacht. Für mich. Morgens. Ohne dass ich gedroht hab.', 'ueberrascht'),
    a('Wenn das rauskommt, bin ich erledigt. Die ganze Unterstadt hat Schiss vor mir. Und ich werd von einem Kaffee weich wie Butter.', 'verlegen'),
    n('Sie nimmt den Becher mit beiden Händen, der echten und der silbernen, und pustet. Über den Rand guckt sie dich an. Unter der Decke findet ihr Fuß deinen.'),
    a('Komm wieder rein. Der Kaffee kann warten. Ich nicht. … Das war schmalzig. Streich das. Komm trotzdem rein.', 'zaertlich'),
  ], { effects: [set('aria_baukasten_morgen_kaffee'), BESCHWINGT, herz(30), { advanceTime: 45 }] }),
  node('zopf', [
    n('Du streichst ihr das offene Haar aus dem Gesicht. Sie wacht nicht auf. Sie lächelt nur, im Schlaf, und murmelt was, das wie „Lieblingsproblem“ klingt.'),
    n('Du schläfst noch mal ein. Als du aufwachst, ist die Seite neben dir leer und noch warm. Auf dem Kissen liegt ein Zettel, mit Kuli geschrieben, so fest aufgedrückt, dass das Papier Löcher hat:'),
    n('„Hab deine Nudeln gegessen. Und dich geklaut. Nicht sorry. – A.“'),
    n('Darunter, kleiner, durchgestrichen und trotzdem lesbar: „War schön.“ Und darunter, noch kleiner, nicht durchgestrichen: „Sehr.“'),
    n('Neben dem Zettel liegt ihr Zopfgummi. Rot, ausgeleiert. Ob mit Absicht oder nicht, das wirst du nie erfahren.'),
  ], { effects: [set('aria_baukasten_morgen_zettel'), herz(20), { advanceTime: 90 }] }),
]);

// ---------------------------------------------------------------------------
// 2 · Wiederkehrend: Aria klopft (1×/Woche)

/** „Ein andermal“ in den Wochen-Nächten: diese Woche nicht mehr. */
const ABSAGE = [set(WOCHE), herz(10)];

const klopfenErste: DialogueDef = dlg('aria-baukasten-klopfen-erste', [
  node('start', [
    n('Es klopft. Dreimal, dann noch mal, lauter. Aria. Zwei Nudelboxen in der echten Hand, den Schläger über der Schulter, Regen auf der Jacke.'),
    a('Ich hab gesagt, ich klopf wieder. Ich hab gesagt, ich bring Nudeln. Ich halt mich an Sachen. Manchmal.', 'verlegen'),
    a('Also. Lässt du mich rein, oder muss ich die Tür mitnehmen?', 'signatur'),
  ], {
    effects: [set(GEFRAGT)],
    choices: [
      ch('„Rein mit dir.“', undefined, { effects: [{ dialogue: 'aria-baukasten-nacht-drinnen' }] }),
      ch('„Noch nicht. Aber die Nudeln nehm ich.“', 'nein'),
    ],
  }),
  node('nein', [
    a('Du bist so ein Arschloch. Ein ehrliches Arschloch. Das ist das Schlimmste.', 'freude'),
    n('Sie drückt dir eine Box in die Hand, küsst dich auf die Wange, mit Absicht zu laut, und geht pfeifend die Treppe runter.'),
  ], { effects: ABSAGE }),
]);

const klopfenNudeln: DialogueDef = dlg('aria-baukasten-klopfen-nudeln', [
  node('start', [
    n('Regen. Er trommelt aufs Containerdach, seit Stunden, gleichmäßig, wie jemand, der nicht aufgibt. Es klopft. Aria steht in der Tür, klatschnass, zwei Nudelboxen unter der Jacke wie Schmuggelware.'),
    a('Ich war in der Gegend. Ich bin immer in der Gegend. Ich wohn in der Gegend. Ich hab Nudeln.', 'freude'),
    a('Die mit der scharfen Soße, die dir die Augen rausbrennt. Und die mit der milden, die ich dir klau, sobald du\'s nicht mehr aushältst.', 'signatur'),
  ], {
    effects: [set(GEFRAGT)],
    choices: [
      ch('„Rein. Bevor die Soße kalt wird.“', 'nudeln'),
      ch('„Heute nicht. Aber lass mir die milde da.“', 'nein'),
    ],
  }),
  node('nein', [
    a('Die milde? Die MILDE? Du bist eine Schande für die Unterstadt.', 'freude'),
    n('Sie gibt dir trotzdem die milde. Und einen Kuss, der nach Regen schmeckt. Dann ist sie weg, und die Box ist noch warm.'),
  ], { effects: ABSAGE }),
  node('nudeln', [
    n('Ihr esst auf dem Bett. Im Schneidersitz, die Knie aneinander, die Boxen zwischen euch. Der Regen macht alles drinnen kleiner und wärmer. Aria isst mit Stäbchen in der echten Hand und hält mit dem Zerberster die Box, ruhig wie ein Schraubstock.'),
    n('Die scharfe Soße ist ein Fehler. Nach drei Bissen tränen dir die Augen. Aria lacht so sehr, dass ihr eine Nudel aus dem Mund rutscht, und das ist das Unromantischste, was du je gesehen hast, und du willst sie trotzdem sofort küssen.'),
    a('Du heulst. Wegen Nudeln. Komm her, ich mach\'s weg.', 'freude'),
    n('Sie wischt dir mit dem Daumen die Soße vom Mundwinkel. Dann leckt sie sich den Daumen ab, guckt dich dabei an und wird so rot, dass es mit der Soße konkurriert.'),
    a('Das war … das war nicht so gemeint. Das war ein Daumen. Ich hab nur einen Daumen abgeleckt.', 'verlegen'),
  ], {
    choices: [
      ch('„Mach das noch mal.“', 'nochmal'),
      ch('Ihr die Box aus der Hand nehmen. Und die Stäbchen.', 'box'),
      ch('„Iss deine Nudeln, Brecherin.“', 'necken'),
    ],
  }),
  node('nochmal', [
    a('Was? Den Daumen? Du bist krank. Du bist komplett krank.', 'verlegen'),
    n('Sie macht es nicht noch mal. Sie küsst dich stattdessen. Scharf, im wörtlichen Sinn: Ihre Lippen brennen nach Chili, deine auch, und ihr hustet beide mitten im Kuss und hört trotzdem nicht auf.'),
    a('Feuer. Ich schmeck nur noch Feuer. Weitermachen.', 'zaertlich'),
  ], { effects: [herz(10)], next: 'schluss' }),
  node('box', [
    n('Du stellst die Boxen auf den Boden. Erst ihre, dann deine. Sie sieht dir dabei zu, die Stäbchen noch in der Hand, und als du sie ihr aus den Fingern ziehst, lässt sie los, ohne Kampf.'),
    a('Ey. Ich war noch nicht fertig.', 'signatur'),
    p('Doch.'),
    a('… Doch. Ja. Okay. War ich.', 'verlegen'),
    n('Du ziehst sie an den Gürtelschlaufen zu dir, quer über die Matratze, und sie quiekt, ein Geräusch, das sie morgen abstreiten wird. Ihre Lippen schmecken nach Chili. Ihr Nacken ist warm unter deiner Hand, und als du ihn küsst, gleich unter dem Zopfansatz, wird sie ganz still und gräbt die Zehen in die Decke.'),
  ], { effects: [herz(10)], next: 'schluss' }),
  node('necken', [
    a('Nenn mich nicht so. Nicht hier. Nicht mit dem Gesicht.', 'verlegen'),
    p('Brecherin.'),
    n('Sie stellt die Box ab. Sehr langsam. Sehr ordentlich. Dann stürzt sie sich auf dich, und das Bett quietscht, und die Box mit der scharfen Soße fällt vom Rand und landet, natürlich, kopfüber auf Captain Kuschel.'),
    a('SCHEISSE. Der Hase! Der Hase brennt! Nicht echt. Aber er riecht so!', 'ueberrascht'),
    n('Ihr rettet den Hasen. Danach rettet ihr gar nichts mehr. Sie hält deine Handgelenke fest, mit der echten Hand, die silberne liegt flach neben deinem Kopf im Kissen, und sie küsst dich so lange, bis der Regen das einzige Geräusch ist, das noch übrig bleibt.'),
  ], { effects: [herz(10)], next: 'schluss' }),
  node('schluss', [
    n('Sie schält sich aus der nassen Jacke, endlich, dann aus den Stiefeln. Dann zieht sie dir das Shirt über den Kopf, und dabei bleibt eine Nudel in deinem Haar hängen, und sie pflückt sie raus und isst sie, und du lachst so sehr, dass sie dir den Mund zuhalten muss.'),
    a('Licht aus. Der Regen guckt.', 'zaertlich'),
  ], { effects: [...NACHT_FLAGS, herz(10), { cutscene: 'aria-baukasten-abblende-nudeln' }] }),
]);

const morgenNudeln: DialogueDef = dlg('aria-baukasten-morgen-nudeln', [
  node('start', [
    n('Morgen. Es regnet immer noch. Aria sitzt im Schneidersitz am Fußende und isst kalte Nudeln aus der Box, mit den Fingern, in deinem Shirt.'),
    a('Kalte Nudeln sind besser als warme. Das ist Wissenschaft. Vega hat\'s gemessen.', 'freude'),
    a('Du hast übrigens einen roten Fleck am Hals. Das ist Chili. Behaupte ich. Wer was anderes sagt, kriegt den Schläger.', 'signatur'),
  ], {
    choices: [
      ch('„Gib mir die milde.“', 'milde'),
      ch('Ihr die Box klauen.', 'klauen'),
    ],
  }),
  node('milde', [
    a('Die milde hab ich um vier gegessen. Du hast im Schlaf „mehr Soße“ gesagt. Ich hab dir nix gegeben. Ich bin ein Monster.', 'freude'),
  ], { effects: [BESCHWINGT, herz(10)] }),
  node('klauen', [
    n('Du greifst nach der Box. Sie hält sie mit dem Zerberster über den Kopf, außer Reichweite, und grinst, bis du sie stattdessen küsst. Dann lässt sie die Box fallen. Die Nudeln landen auf Captain Kuschel. Schon wieder.'),
  ], { effects: [BESCHWINGT, herz(10)] }),
]);

const klopfenZehn: DialogueDef = dlg('aria-baukasten-klopfen-zehn', [
  node('start', [
    n('Kurz vor zehn. Es klopft nicht. Es kratzt. Leise, an der Tür, wie ein Tier, das nicht reinwill und nicht weggehen kann.'),
    n('Aria. Kein Schläger. Keine Nudeln. Sie steht da, die echte Hand um das silberne Handgelenk gekrallt, und lächelt ein Lächeln, das nicht bis zu den Augen kommt.'),
    a('Es ist gleich zehn.', 'trauer'),
    a('Die Hand juckt. Die, die nicht mehr da ist. Jeden Abend um zehn. Wie ein Wecker.', 'trauer'),
    a('Normalerweise hau ich dann auf einen Sandsack, bis es aufhört. Heute wollt ich nicht hauen. Heute wollt ich … Scheiße. Ich wollt zu dir. Das ist alles. Darf ich?', 'verlegen'),
  ], {
    effects: [set(GEFRAGT)],
    choices: [
      ch('„Komm her.“', 'drinnen'),
      ch('„Heute nicht. Aber ich bleib an der Tür, bis es zehn nach ist.“', 'tuer'),
    ],
  }),
  node('tuer', [
    n('Ihr setzt euch auf die Schwelle. Halb drinnen, halb draußen. Um zehn krallt sie die echte Hand in dein Knie, und du lässt sie. Um zehn nach lässt sie los.'),
    a('Danke. Das war genug. Echt. Das war mehr als genug.', 'zaertlich'),
  ], { effects: ABSAGE }),
  node('drinnen', [
    n('Ihr sitzt auf dem Bett, Rücken an der Wand. Sie hält den Zerberster auf dem Schoß wie etwas Fremdes. Die Uhr springt auf 21:58.'),
    a('Gleich. Gleich geht\'s los. Und dann kratz ich mir den Arm auf, den es nicht gibt, und du guckst zu, wie ich bescheuert werd.', 'besorgt'),
  ], {
    choices: [
      ch('Da kratzen, wo nichts ist. Langsam. In der Luft unter ihrer Metallhand.', 'luft'),
      ch('Ihren Nacken küssen, bis sie die Uhr vergisst.', 'nacken'),
      ch('„In der Zelle hab ich mir Fenster vorgestellt. Bis ich sie fast gesehen hab.“', 'knast', { tag: '[Knast]', when: { origin: 'origin-knastvogel' } }),
      ch('„Da draußen sagt man: Was wehtut, weil\'s fehlt, war mal was Gutes.“', 'oednis', { tag: '[Ödnis]', when: { origin: 'origin-oednis' } }),
    ],
  }),
  node('luft', [
    n('Du schiebst die Hand unter den Zerberster. Dahin, wo ihr Unterarm wäre, wenn es ihn noch gäbe. Und kratzt. Ganz leicht, mit den Fingerspitzen, in der Luft.'),
    n('Sie starrt dich an. Dann auf deine Hand. Die Uhr springt auf 22:00.'),
    a('Das ist … das ist komplett bescheuert. Da ist nix. Du kratzt nix.', 'ueberrascht'),
    n('Du machst weiter. Langsam. Kreise. Sie atmet aus, lang und zittrig, und schließt die Augen.'),
    a('… Links. Weiter links. Da. Oh Gott. Da. Das ist das Bescheuertste, was je funktioniert hat.', 'zaertlich'),
    n('Sie lacht und weint gleichzeitig, kurz, und lehnt sich an dich. Ihre Stirn an deinem Hals, ihr Atem warm auf deiner Haut. Um 22:04 hört das Jucken auf. Um 22:05 küsst sie dich. Um 22:06 weiß keiner von euch mehr, wie spät es ist.'),
  ], { effects: [herz(20)], next: 'schluss' }),
  node('nacken', [
    n('Du schiebst ihre Zöpfe zur Seite. Ihr Nacken ist warm und ein bisschen salzig, und da, wo der Haaransatz anfängt, sitzt eine kleine Narbe, die du noch nie gesehen hast.'),
    a('Die ist vom Konzert. Von der Traverse. Die kennt keiner. Nicht mal Dante, glaub ich.', 'trauer'),
    n('Du küsst sie. Die Narbe, dann daneben, dann tiefer, die Kuhle, wo der Nacken in die Schultern übergeht. Ihr Atem stockt. Die Uhr springt auf 22:00, und sie merkt es nicht.'),
    a('Wie spät ist es?', 'verlegen'),
    p('Keine Ahnung.'),
    a('Gut. Gut. Lüg mich weiter an.', 'zaertlich'),
    n('Ihre Metallhand legt sich auf dein Knie, flach, schwer, ruhig. Zum ersten Mal seit drei Jahren juckt um zehn Uhr gar nichts.'),
  ], { effects: [herz(20)], next: 'schluss' }),
  node('knast', [
    a('Fenster?', 'ueberrascht'),
    p('Wenn man lang genug auf eine Wand guckt, kriegt sie eins. Der Kopf macht das. Er füllt auf, was fehlt. Deine Hand ist nicht weg. Dein Kopf weiß nur nicht, wohin damit.'),
    a('… Und wohin damit?', 'trauer'),
    p('Gib sie mir.'),
    n('Sie hält dir den Zerberster hin. Du verschränkst deine Finger mit den silbernen, ganz locker, und sie schließt die Augen und stellt sich vor, dass es ihre sind. Um 22:00 ist da nur deine Hand und ihr Atem, der langsamer wird.'),
    a('Das ist das Kitschigste, was mir je wer aus dem Knast erzählt hat. Und ich kenn viele aus dem Knast. Küss mich, bevor ich heul.', 'zaertlich'),
  ], { effects: [herz(30)], next: 'schluss' }),
  node('oednis', [
    a('Die Hand war nicht gut. Die hat Schläger gehalten und Bier und einmal einen Kerl am Kragen, der\'s verdient hatte.', 'trauer'),
    a('… Okay. Die war gut. Die war verdammt gut.', 'zaertlich'),
    n('Sie lehnt die Stirn an deine. Um 22:00 erzählt sie dir alles, was die Hand je gemacht hat. Es ist eine lange Liste. Bei Punkt vierzehn küsst du sie, und sie verliert den Faden und will ihn nicht wiederhaben.'),
  ], { effects: [herz(30)], next: 'schluss' }),
  node('schluss', [
    n('Später zieht sie dir das Shirt über den Kopf, ganz langsam, als hätte sie Angst, es könnte reißen. Dann ihr Top. Der Netzstoff verhakt sich an der Andockplatte, und du löst ihn, Faden für Faden, und sie hält still und sieht dir dabei zu.'),
    a('Bleib. Bis morgen. Und wenn ich nachts um mich hau, halt den echten Arm fest. Der ist harmlos.', 'zaertlich'),
    n('Du drehst das Licht runter. Sie zieht dich an der Hand ins Dunkel.'),
  ], { effects: [...NACHT_FLAGS, { cutscene: 'aria-baukasten-abblende-zehn' }] }),
]);

const morgenZehn: DialogueDef = dlg('aria-baukasten-morgen-zehn', [
  node('start', [
    n('Morgen. Sie hat nicht um sich gehauen. Sie hat die ganze Nacht deine Hand gehalten, die echte in deiner, so fest, dass deine Finger eingeschlafen sind.'),
    n('Sie ist schon wach. Liegt auf der Seite und guckt dich an, als würde sie dich auswendig lernen.'),
    a('Ich hab geschlafen. Durch. Weißt du, wann ich das letzte Mal durchgeschlafen hab?', 'zaertlich'),
    a('Ich auch nicht. Sag\'s keinem. Sag vor allem Vega nix, die schreibt das sonst in ihr Messbuch.', 'verlegen'),
  ], { effects: [BESCHWINGT, herz(20)] }),
]);

const klopfenClub: DialogueDef = dlg('aria-baukasten-klopfen-club', [
  node('start', [
    n('Wochenende. Unten im High Voltage tobt der Club, der Boden vibriert, und auf der Personaltreppe poltert es. Jemand nimmt zwei Stufen auf einmal. Dann drei.'),
    n('Die Tür fliegt auf, ohne Klopfen. Aria. Verschwitzt vom Tanzen, die Zöpfe halb offen, die Wangen glühend, den Bass noch in den Schultern. Sie riecht nach Nebelmaschine und Limo und Haut.'),
    a('Hunter hat Kabelbrand aufgelegt! KABELBRAND! Drei Lieder am Stück! Ich hab auf dem Tresen getanzt, und er hat nicht mal geschimpft, er hat nur „meine Gläser“ geflüstert!', 'freude'),
    a('Und dann hab ich gedacht: Was mach ich hier unten, wenn du da oben bist. Also. Hier bin ich. Du hast drei Sekunden. Drei. Zwei.', 'signatur'),
  ], {
    effects: [set(GEFRAGT)],
    choices: [
      ch('Sie reinziehen und die Tür mit dem Fuß zuknallen.', 'tuer'),
      ch('„Langsam, Brecherin. Erst atmen.“', 'langsam'),
      ch('„Zeig mir, wie du auf dem Tresen getanzt hast.“', 'tanz'),
      ch('„Heute nicht. Tanz für mich mit.“', 'nein'),
    ],
  }),
  node('nein', [
    a('Ohne dich? Pff. Okay. Aber ich tanz so laut, dass du\'s durch den Boden hörst. Und du denkst die ganze Zeit an mich.', 'signatur'),
    n('Sie küsst dich, schnell und hart, an der Tür, und rennt die Treppe wieder runter. Eine Minute später dreht unten jemand Kabelbrand lauter. Viel lauter. Du denkst die ganze Zeit an sie.'),
  ], { effects: ABSAGE }),
  node('tuer', [
    n('Du ziehst sie am Gürtel rein. Die Tür knallt ins Schloss, dass der Rahmen zittert, und ihr Rücken landet dagegen, und sie lacht, laut, atemlos, und hört mitten im Lachen auf, weil du sie küsst.'),
    n('Sie schmeckt nach Limo. Ihr Herz rast, der Bass von unten schlägt im selben Takt. Die echte Hand krallt sich in deinen Nacken, die silberne liegt flach an der Tür neben deinem Kopf und drückt eine Delle ins Blech, ohne dass sie es merkt.'),
    a('Die Tür. Ups. Die Tür hat jetzt auch eine Delle. Das Quartier sieht bald aus wie ich.', 'verlegen'),
    p('Halt die Klappe, Aria.'),
    a('Oh. Oha. Du kannst ja Befehle. Mach weiter. Nein, warte. Sag\'s noch mal. Langsamer.', 'zaertlich'),
  ], { effects: [herz(10)], next: 'schluss' }),
  node('langsam', [
    a('Atmen? ATMEN? Ich hab drei Lieder durchgetanzt, ich atme seit einer Stunde nur noch Nebel!', 'freude'),
    n('Aber sie bleibt stehen. Du legst ihr die Hand in den Nacken, feucht vom Tanzen, und sie atmet. Ein. Aus. Ihr Puls rennt unter deinen Fingern, und dann wird er langsamer, und dann, als du ihren Hals küsst, gleich wieder schneller.'),
    a('Das ist kein Atmen. Das ist Betrug. Du betrügst mich mit Langsamkeit.', 'verlegen'),
    n('Du nimmst dir Zeit. Ihr Hals. Die Kuhle unter dem Ohr, wo sie kitzlig ist. Ihre Schulter, wo der Netzstoff verrutscht ist. Sie zappelt, flucht, droht dir mit dem Schläger, den sie gar nicht dabeihat, und zieht dich dann an den Haaren näher, damit du ja nicht aufhörst.'),
  ], { effects: [herz(20)], next: 'schluss' }),
  node('tanz', [
    a('Hier? Das ist kein Tresen. Das ist ein Bett.', 'ueberrascht'),
    a('… Das ist ein Bett. Oh. Oh, du Arschloch.', 'verlegen'),
    n('Unten wechselt Hunter das Lied. Irgendwas Langsames, Basslastiges, das durch den Boden kriecht. Aria steht auf der Matratze, wackelig, die Arme hoch, und tanzt. Schlecht. Sehr schlecht. Sie trifft keinen einzigen Takt, und der Zerberster haut einmal gegen die Lampe, die danach schief hängt.'),
    n('Du lachst, und sie zeigt mit der Metallfaust auf dich, ohne aufzuhören, und dann kommt sie zu dir runter, auf die Knie, und tanzt gar nicht mehr, sondern küsst dich. Die Hüften immer noch im Takt.'),
    a('Siehst du. So tanz ich. Auf dem Tresen war\'s mehr Treten.', 'signatur'),
  ], { effects: [herz(20)], next: 'schluss' }),
  node('schluss', [
    n('Ihre Stiefel fliegen in zwei verschiedene Ecken. Dann das Top, verschwitzt, das am Plattenspieler hängen bleibt. Dann dein Shirt, das sie dir ungeduldig über den Kopf zerrt, wobei sie dir fast ein Ohr abreißt.'),
    a('Sorry. Sorry! Ohr noch dran? Ohr noch dran. Gut. Ich brauch das Ohr. Ich muss da noch was reinsagen.', 'verlegen'),
    n('Sie beugt sich an dein Ohr. Was sie flüstert, wird sie morgen bestreiten. Es ist kurz, es ist sehr eindeutig, und es ist mit Abstand das Netteste, was sie je zu dir gesagt hat.'),
    n('Der Bass von unten. Ihr Lachen. Die Lampe, die schief hängt und dann ausgeht, weil jemand mit dem Ellbogen an den Schalter kommt.'),
  ], { effects: [...NACHT_FLAGS, { cutscene: 'aria-baukasten-abblende-club' }] }),
]);

const morgenClub: DialogueDef = dlg('aria-baukasten-morgen-club', [
  node('start', [
    n('Morgen. Aria liegt bäuchlings quer über dem Bett, der Zerberster hängt über die Kante, und die silbernen Finger tippen im Schlaf auf den Boden. Immer noch im Takt.'),
    n('Vor der Tür steht ein Tablett. Zwei Kaffee, zwei Aspirin, ein Zettel in Hunters Druckbuchstaben: „KEINE TURTELEIEN AN MEINEM TRESEN. AUCH NICHT DRÜBER.“'),
    a('Drüber? Wieso drüber? Das Quartier ist über dem … oh. OH.', 'verlegen'),
    a('Gib mir das Aspirin und sag mir, dass ich gestern nicht auf dem Tresen getanzt hab.', 'besorgt'),
    p('Du hast auf dem Tresen getanzt.'),
    a('Scheiße. War ich gut?', 'verlegen'),
    p('Nein.'),
    a('Ich lieb – ich mein, ich lieb Aspirin. Gib her. Und guck nicht so.', 'verlegen'),
  ], { effects: [BESCHWINGT, herz(10)] }),
]);

// ---------------------------------------------------------------------------
// 3 · Die Nacht am Meer (nach `rom-aria-meer`)

const meerNacht: DialogueDef = dlg('aria-baukasten-meernacht', [
  node('start', [
    n('Der zweite Abend am Meer. Die Sonne ist weg, aber der Himmel hat es noch nicht gemerkt, er glüht orange über dem Wasser. Am Lagerfeuer erzählt Hunter zum dritten Mal, wie er den Strandclub bauen will. Keiner hört zu. Alle hören zu.'),
    n('Aria sitzt neben dir im Sand und macht etwas, das du sie noch nie hast machen sehen: Sie ölt den Zerberster. Mit einem Lappen, Fingerglied für Fingerglied. Das Salz hat weiße Ränder in die Gelenke gefressen, und bei jedem Beugen knirscht es leise.'),
    a('Das Meer ist echt. Und echt salzig. Ich hab heute Morgen den Daumen nicht mehr zugekriegt. Dante hat geheult. Vor Lachen. Dann vor Sorge. Dann wieder vor Lachen.', 'freude'),
    a('Wenn ich hierbleib, rost ich ein. Wie ein altes Fahrrad. Dann stellst du mich an den Steg und hängst ein Schild dran: „Zu verschenken. Beißt.“', 'signatur'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Ihr den Lappen abnehmen. „Lass mich.“', 'oel'),
      ch('„Dann rosten wir zusammen. Ich bleib auch.“', 'rosten'),
      ch('„Komm. Weg vom Feuer.“ Und ihr die Hand hinhalten.', 'weg'),
    ],
  }),
  node('oel', [
    n('Sie gibt dir den Lappen. Ohne Zögern, und das ist neu. Du nimmst den Zerberster auf den Schoß, schwer und warm vom Feuer, und reibst das Salz aus den Gelenken. Knöchel. Fingerglieder. Die feinen Rillen in der Handfläche, in denen der Sand sitzt.'),
    n('Aria sieht zu. Sie sagt nichts. Ihre echte Hand liegt auf deinem Knie, und mit jedem Fingerglied, das du freireibst, drückt sie ein bisschen fester.'),
    a('Weißt du, was komisch ist? Ich spür das nicht. Gar nicht. Und trotzdem krieg ich Gänsehaut. Am ganzen Arm. Also an dem, der noch da ist.', 'zaertlich'),
    n('Du beugst den Daumen. Er geht wieder zu. Ganz leise, ohne Knirschen. Sie schließt die silbernen Finger um deine, langsam, und hält dich fest.'),
    a('Repariert. Von dir. Dante wird so eifersüchtig.', 'freude'),
  ], { effects: [herz(20)], next: 'strand' }),
  node('rosten', [
    a('Du? Hierbleiben? Du rostest nicht. Du kriegst höchstens Sonnenbrand und wirst rot wie Krabbe Karl.', 'freude'),
    p('Dann werd ich rot. Neben dir.'),
    n('Sie hört auf zu ölen. Der Lappen fällt in den Sand. Sie guckt dich an, im Feuerschein, und ihre Unterlippe macht etwas, das sie sofort mit den Zähnen festhält.'),
    a('So was kannst du nicht sagen, wenn die Crew danebensitzt. Vega hat gerade den Kopf gedreht. Ich hab\'s gehört. Ihr Nacken knackt, wenn sie lauscht.', 'verlegen'),
    s('vega', 'Ich lausche nicht. Ich messe die Windrichtung.'),
    a('Der Wind kommt von UNS, Vega!', 'wut'),
  ], { effects: [herz(20)], next: 'strand' }),
  node('weg', [
    n('Du stehst auf und hältst ihr die Hand hin. Sie guckt auf die Hand, dann auf dich, dann auf die Crew, die sehr angestrengt ins Feuer starrt.'),
    a('Jetzt? Vor allen? Dann wissen doch alle, wohin wir gehen.', 'verlegen'),
    p('Die wissen das seit gestern.'),
    a('… Auch wieder wahr. Hunter hat mir heute Morgen zugezwinkert. HUNTER. Mit Sonnenbrille. Ich hab\'s trotzdem gesehen.', 'verlegen'),
    n('Sie nimmt deine Hand und zieht sich hoch und dich dabei fast um, und lacht.'),
  ], { effects: [herz(10)], next: 'strand' }),
  node('strand', [
    n('Ihr lauft am Wasser entlang, weg vom Feuer, bis die Stimmen nur noch ein Murmeln sind und das Lagerfeuer ein orangener Punkt. Die Wellen kommen und gehen. Aria läuft barfuß, die Stiefel in der silbernen Hand, und singt Kabelbrand. Falsch. Sehr falsch. Mit voller Überzeugung.'),
    a('Du schuldest mir ein Konzert, weißt du noch? Und weil hier keins ist, sing ich halt selber. Das ist dein Konzert. Erste Reihe. Applaus wär nett.', 'freude'),
    n('Der Mond kommt hinter einer Wolke hervor. Auf dem Wasser liegt eine silberne Straße, genau bis zu euren Füßen.'),
  ], {
    choices: [
      ch('Applaudieren. Laut.', 'applaus'),
      ch('Mitsingen. Genauso falsch.', 'mitsingen'),
      ch('Sie mitten im Refrain küssen.', 'refrain'),
    ],
  }),
  node('applaus', [
    n('Du klatschst. Laut. Viel zu laut für einen leeren Strand. Sie verbeugt sich tief, so tief, dass ihr die Zöpfe in den Sand hängen, und als sie hochkommt, ist sie rot und strahlt wie eine Leuchtreklame.'),
    a('Zugabe? Will das Publikum eine Zugabe? Das Publikum kriegt eine Zugabe.', 'signatur'),
    n('Die Zugabe ist kein Lied. Sie lässt die Stiefel in den Sand fallen, nimmt dein Gesicht in beide Hände, die warme und die kühle, und küsst dich, bis du vergisst, dass du je ein anderes Konzert gehört hast.'),
  ], { next: 'duene' }),
  node('mitsingen', [
    n('Du singst mit. Du kennst den Text nicht. Du erfindest einen. Er reimt sich auf nichts, und sie bleibt mitten im Wasser stehen und starrt dich an.'),
    a('Das ist nicht der Text. Das ist nicht mal Deutsch. Was singst du da?', 'ueberrascht'),
    n('Du singst weiter. Lauter. Sie hält es vier Sekunden aus. Dann singt sie deine falschen Worte mit, noch falscher, und ihr brüllt beide den erfundenen Refrain übers Meer, bis eine Möwe beleidigt auffliegt.'),
    a('Das ist jetzt unser Lied. Ich hasse es. Es ist unser Lied.', 'zaertlich'),
    n('Sie küsst dich mitten in der letzten Zeile, und die Zeile bleibt für immer unfertig.'),
  ], { next: 'duene' }),
  node('refrain', [
    n('Sie holt Luft für den Refrain. Du küsst sie, bevor er rauskommt. Sie macht „mmpf“ gegen deinen Mund, empört, und dann gar nichts mehr, und dann schlingt sie beide Arme um deinen Hals, und eine Welle läuft euch über die Füße, eiskalt, und keiner von euch merkt es.'),
    a('Du hast mein Konzert unterbrochen.', 'verlegen'),
    p('Du warst falsch.'),
    a('Ich war GRANDIOS. … Mach das noch mal. Mitten im Refrain. Das war besser als jede Bühne.', 'zaertlich'),
  ], { next: 'duene' }),
  node('duene', [
    n('Hinter dem Steg, in einer Mulde im Dünengras, wo der Wind nicht hinkommt, liegt eine Decke. Alt, kariert, sie riecht nach Hunters Rostlaube. Daneben eine Thermoskanne und ein Zettel: „Für die Windrichtung. – V.“'),
    a('Vega. Diese Kuh. Diese wunderbare, hinterlistige Kuh.', 'freude'),
    n('Ihr liegt auf der Decke. Über euch mehr Sterne, als es in der Unterstadt je gibt. Aria liegt auf der Seite, den Kopf auf die echte Hand gestützt, und malt mit dem silbernen Zeigefinger Linien in den Sand neben deinem Gesicht.'),
    a('In der Stadt hab ich nie Sterne gesehen. Nur Neon. Ich dachte, Sterne sind so ein Ding aus alten Filmen. Wie Pferde. Oder ehrliche Bullen.', 'zaertlich'),
    n('Dann wird sie still. Der Finger hört auf zu malen.'),
    a('Ich hab Schiss. Nicht vor dir. Davor, dass das hier vorbeigeht. Dass wir zurückfahren und ich wieder nur die Brecherin bin und du wieder … was auch immer du bist, wenn ich nicht hingucke.', 'trauer'),
  ], {
    choices: [
      ch('„Dann guck einfach weiter hin.“', 'gucken'),
      ch('Ihre silberne Hand nehmen und dir aufs Herz legen.', 'herz'),
      ch('„Unsere erste Nacht ist am Meer. Das glaubt uns keiner.“', 'erstes', { when: noFlag(NACHT) }),
      ch('„Kronkorken?“', 'kronkorken', { when: flag('aria_baukasten_wort') }),
    ],
  }),
  node('gucken', [
    a('Weitergucken. Das ist dein Plan. Einfach weitergucken.', 'zaertlich'),
    p('Abwechselnd. Einer schläft, einer guckt.'),
    a('… Das ist der dümmste Plan, den ich je gehört hab. Ich bin dabei.', 'zaertlich'),
    n('Sie küsst dich. Langsam. Ohne Eile. Als hätte sie herausgefunden, dass die Zeit hier draußen anders läuft, und als wollte sie jede Minute davon. Ihre Hand fährt dir durchs Haar, Sand rieselt aus ihren Zöpfen auf deinen Hals, und keiner von euch macht ihn weg.'),
  ], { effects: [herz(20)], next: 'schluss' }),
  node('herz', [
    n('Du nimmst den Zerberster und legst ihn dir auf die Brust, aufs Herz. Flach. Silber, kühl vom Wind, schwer wie ein Versprechen.'),
    a('Ich spür nix. Das weißt du. Ich spür nicht mal, ob\'s klopft.', 'trauer'),
    p('Dann zähl ich für dich. Eins. Zwei. Drei.'),
    n('Du zählst. Laut. Bei zwanzig wird deine Stimme komisch, weil sie sich über dich beugt. Bei dreißig hörst du auf, weil sie dich küsst. Sie lässt die Hand liegen, wo sie ist, und die Finger spreizen sich ganz sanft, als wollten sie mehr davon abdecken.'),
    a('Zu schnell. Dein Herz. Viel zu schnell. Gesehen hab ich\'s, nicht gespürt. Zählt trotzdem.', 'zaertlich'),
  ], { effects: [herz(30)], next: 'schluss' }),
  node('erstes', [
    a('Hä? Das ist doch nicht unsere erste – oh. Doch. Ist es. Scheiße. Ist es.', 'ueberrascht'),
    a('Dann ist das jetzt Kitsch. Voller Kitsch. Sterne, Meer, Decke. Wenn jetzt noch ein Delfin vorbeischwimmt, kotz ich.', 'verlegen'),
    n('Es schwimmt kein Delfin vorbei. Sie küsst dich trotzdem so, als würde einer. Lachend erst, dann nicht mehr, die Stirn an deiner, und flüstert, dass sie sich das genau so vorgestellt hat. Nur mit weniger Sand.'),
  ], { effects: [herz(30)], next: 'schluss' }),
  node('kronkorken', [
    a('Was? Nein! Nein. Kein Kronkorken. Nicht mal ansatzweise Kronkorken.', 'ueberrascht'),
    a('Frag mich das nie wieder an einem Strand unter Sternen, du Arschloch, sonst sag ich\'s aus Trotz.', 'verlegen'),
    n('Sie lacht. Dann zieht sie dich zu sich, und der Rest des Satzes geht in einem Kuss unter.'),
  ], { effects: [herz(30)], next: 'schluss' }),
  node('schluss', [
    n('Ihre Jacke wird zum Kissen. Dein Shirt landet im Dünengras, ihr Top auf der Thermoskanne. Der Wind ist kühl, und sie ist warm, an den Schultern, am Rücken, im Nacken, wo du sie hältst. Der Zerberster liegt neben euch im Sand und glänzt im Mondlicht, frisch geölt, ganz still.'),
    a('Wenn jemand fragt: Wir haben Sterne gezählt.', 'verlegen'),
    p('Wie viele?'),
    a('Alle. Wir waren sehr gründlich.', 'signatur'),
    n('Sie zieht die karierte Decke über eure Köpfe.'),
  ], {
    effects: [
      ...NACHT_FLAGS, set('aria_baukasten_meernacht'), { markSeen: 'aria-baukasten-nacht' }, herz(40),
      { cutscene: 'aria-baukasten-meer-abblende' },
    ],
  }),
]);

const meerMorgen: DialogueDef = dlg('aria-baukasten-meer-morgen', [
  node('start', [
    n('Morgen am Meer. Sand. Überall. In den Ohren, in den Zöpfen, an Stellen, über die keiner von euch je reden wird.'),
    n('Aria liegt bäuchlings neben dir, das Gesicht im Arm, und hat Sonnenbrand auf der Nase. Nur auf der Nase. Sie trägt dein Shirt, verkehrt herum. Die Decke ist voller Dünengras, die Thermoskanne umgekippt.'),
    n('Neben der Decke hat jemand mit dem Finger in den Sand gemalt, eine silberne Spur, tiefer als jede andere. Ein Herz. Durchgestrichen. Daneben: „Kitsch“. Daneben, nicht durchgestrichen, noch ein Herz.'),
    a('Guck nicht. Ich seh scheiße aus. Ich hab Sand in den Zähnen und eine Nase wie Krabbe Karl.', 'verlegen'),
    a('… Du guckst trotzdem. Ich hab\'s gewusst.', 'zaertlich'),
  ], {
    choices: [
      ch('„Noch zehn Minuten.“', 'zehn'),
      ch('„Wer zuerst am Wasser ist.“', 'wasser'),
    ],
  }),
  node('zehn', [
    a('Zehn. Zwanzig. Für immer. Bis Hunter mit Kaffee kommt und so tut, als hätte er nix gesehen.', 'zaertlich'),
    n('Hunter kommt nach vierzig Minuten. Mit Kaffee. Mit Sonnenbrille. Er stellt zwei Becher in den Sand, dreht sich um und geht, ohne ein Wort. Nach zehn Metern hebt er den Daumen. Ohne sich umzudrehen.'),
  ], { effects: [set('aria_baukasten_meer_morgen'), BESCHWINGT, herz(20)] }),
  node('wasser', [
    n('Sie ist auf, bevor du „Wasser“ gesagt hast. Natürlich. Dein Shirt flattert verkehrt herum um sie rum, Sand spritzt, und sie rennt kreischend in die erste Welle und dreht sich mit ausgebreiteten Armen um.'),
    a('Gewonnen! Schon wieder! Du bist so langsam, wenn du verliebt bist!', 'freude'),
    n('Dann hört sie, was sie gerade gesagt hat. Sie bleibt im Wasser stehen, bis zu den Knien, und wird röter als ihre Nase.'),
    a('Das war ein Versprecher. Das war Salzwasser im Hirn. Komm rein, du – komm einfach rein.', 'verlegen'),
  ], { effects: [set('aria_baukasten_meer_morgen'), BESCHWINGT, herz(20)] }),
]);

// ---------------------------------------------------------------------------
// Abblenden (immer Schwarz; die Nacht bleibt dahinter)

const abblende = (id: string, title: string, caption: string, line: string, next: string): CutsceneDef => cut(id, title, [
  { image: 'black', fade: 'out', sfx: 'switch', hold: 1800, caption },
  { image: 'black', lines: [n(line)], hold: 2000 },
], [{ sleep: true }, { dialogue: next }], false);

const cutscenes: CutsceneDef[] = [
  abblende('aria-baukasten-abblende', 'Reinlassen', 'Klick. Und ein Lichtschalter weniger.',
    'Auf Schwarz nur der Bass aus dem Club, der irgendwann aufhört. Der Regen auf dem Containerdach, der nicht aufhört. Und einmal, sehr deutlich, ein Kichern. Es ist nicht deins.',
    'aria-baukasten-morgen'),
  abblende('aria-baukasten-abblende-nudeln', 'Zwei Nudelboxen', 'Regen auf dem Containerdach. Zwei Nudelboxen auf dem Boden.',
    'Auf Schwarz: der Regen. Irgendwann ein Lachen, dann ein gedämpftes „Scheiße, die Soße“, dann wieder nur der Regen.',
    'aria-baukasten-morgen-nudeln'),
  abblende('aria-baukasten-abblende-zehn', 'Zehn nach zehn', '22:07. Keiner guckt mehr auf die Uhr.',
    'Auf Schwarz: Atem. Ein Flüstern ohne Worte. Der Zerberster, der einmal leise gegen das Bettgestell klackt und dann nicht mehr, weil jemand ihn festhält.',
    'aria-baukasten-morgen-zehn'),
  abblende('aria-baukasten-abblende-club', 'Unten Kabelbrand', 'Unten Kabelbrand. Oben aus.',
    'Auf Schwarz: der Bass durch den Boden, Lied um Lied, bis Hunter um vier das Licht im Club ausmacht. Dann nur noch zwei, die versuchen, leise zu lachen, und es nicht schaffen.',
    'aria-baukasten-morgen-club'),
  abblende('aria-baukasten-meer-abblende', 'Sterne zählen', 'Eine karierte Decke. Sehr viele Sterne.',
    'Auf Schwarz: Wellen, gleichmäßig wie Atem. Einmal fragt eine Möwe etwas. Keiner antwortet.',
    'aria-baukasten-meer-morgen'),
  // Tafel vor der Meernacht: das vorhandene Bild aus rom-aria-meer.
  cut('aria-baukasten-meernacht-tafel', 'Der zweite Abend', [
    { image: 'cut-rom-aria-meer', pan: 'in', fade: 'in', hold: 2600, caption: 'Der zweite Abend. Das Meer ist immer noch echt.' },
  ], undefined, false),
];

// ---------------------------------------------------------------------------
// Auslöser

/** Grundbedingung aller Nächte: Baukasten-Spielfigur, Paar, kein Streit, Aria greifbar, heute noch keine Station. */
const BASIS: Condition = all(NOT_V, PAAR, KEIN_KRACH, not(ARIA_WEG), HEUTE_FREI);

/** Herz-Ereignisse (versoehnung.ts hängt sie an Arias NpcDef). */
export const BAUKASTEN_NAECHTE_EVENTS: HeartEventDef[] = [
  // Erste Nacht: frühestens am Tag nach dem Kuss (`rom-aria-kuss` startet „zwei Tage warten“, `aria_warte2` fällt am Folgetag).
  station({
    id: 'aria-baukasten-nacht', hearts: 8, map: 'crew-quartier', time: ['abend', 'nacht'],
    when: all(BASIS, seen('rom-aria-kuss'), noFlag('aria_warte2'), noFlag(NACHT)),
    dialogue: 'aria-baukasten-nacht',
  }),
  // Meernacht: am Abend nach rom-aria-meer (das setzt die Tagessperre, also frühestens am Folgetag).
  station({
    id: 'aria-baukasten-meernacht', hearts: 6, map: 'das-meer', time: ['abend', 'nacht'],
    when: all(BASIS, EPILOG, seen('rom-aria-meer'), flag('aria_meer')),
    cutscene: 'aria-baukasten-meernacht-tafel',
    dialogue: 'aria-baukasten-meernacht',
  }),
];

/** Wiederkehrend: höchstens eine Nacht pro Woche, Absage sperrt den Tag (bzw. die Woche). */
const KLOPFEN: Condition = all(BASIS, ABENDS, seen('aria-baukasten-nacht'), noFlag(WOCHE), noFlag(GEFRAGT));

export const part: ContentPart = {
  dialogues: byId([
    nachtTuer, nachtDrinnen, morgen,
    klopfenErste, klopfenNudeln, morgenNudeln, klopfenZehn, morgenZehn, klopfenClub, morgenClub,
    meerNacht, meerMorgen,
  ]),
  cutscenes: byId(cutscenes),
  mapAdditions: {
    'crew-quartier': {
      onEnter: [
        { id: 'aria-baukasten-klopfen-erste', when: all(KLOPFEN, flag('aria_baukasten_spaeter'), noFlag(NACHT)), dialogue: 'aria-baukasten-klopfen-erste' },
        { id: 'aria-baukasten-klopfen-nudeln', when: all(KLOPFEN, flag(NACHT), { weekday: ['mo', 'di'] }), dialogue: 'aria-baukasten-klopfen-nudeln' },
        { id: 'aria-baukasten-klopfen-zehn', when: all(KLOPFEN, flag(NACHT), { weekday: ['mi', 'do'] }), dialogue: 'aria-baukasten-klopfen-zehn' },
        {
          id: 'aria-baukasten-klopfen-club', when: all(KLOPFEN, flag(NACHT), { weekday: ['fr', 'sa', 'so'] }, not(EPILOG)),
          dialogue: 'aria-baukasten-klopfen-club',
        },
      ],
    },
  },
};
