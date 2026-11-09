// Vex × Aria „Funken“ (world.md §4.7, Stationen 4–6): Bude, Tanz, Oberlicht. Ab hier Romanze- und Freundschaftsfassung.
// Romanze: { playerIs: 'vex' } + { romance: 'aria' } + aria_romanze_angebahnt. Freundschaft: Standard-Ausdrücke.
import type { ContentPart } from '../../part';
import type { DialogueDef, HeartEventDef, PhoneMessageDef } from '../../../modules/contracts';
import {
  a, all, byId, ch, chk, cut, dlg, flag, herz, HEUTE_FREI, msg, n, node, noFlag, ROM_AN, s, seen, set, STATION_START, twin, V, v,
} from './_util';

const KRONKORKEN = [set('vexaria_kronkorken'), { give: 'aria-kronkorken' } as const];

// ---------------------------------------------------------------------------
// Station 4 · rom-vexaria-bude · „Nichts zum Behalten“ (Tafel)

const budeTuer = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Kurz nach neun. Die Kurierbude ist dunkel bis auf die nackte Glühbirne an ihrer Kette. Dann klopft draußen ein Schläger ans Rolltor. Zweimal kurz, einmal lang.'),
    a('Lieferung. Zwei Nudeln. Zahlung in Ehrlichkeit.', 'signatur'),
    n('Du ziehst das Rolltor halb hoch. Aria duckt sich drunter durch, zwei dampfende Boxen in der echten Hand, den Schläger über der Schulter, Regen in den Zöpfen.'),
    n('Die Bude ist fast leer. Eine Matte, zusammengerollt in der Ecke. Eine Kiste als Tisch. Ein Wasserkocher. Ein Haken an der Wand für das Gurtzeug. Ein Regal mit fremden Paketen. Keine Bilder. Keine Deko. Nichts, das jemandem gehört.'),
    n('Aria setzt sich auf die Kiste, macht ihre Box auf und sieht sich um. Lange. Sie kaut sehr langsam für jemanden, der normalerweise schlingt.'),
    a('Wohnst du hier, oder wartest du hier nur auf was?', 'ueberrascht'),
    v('Ich behalt nix. Pakete bleiben \'ne Nacht. Dann sind sie weg.'),
    a('Und du?', 'neutral'),
    v('Ich auch.', 'signatur'),
    n('Sie zeigt mit den Stäbchen auf dein Gurtzeug. Die Riemen sitzen locker, die Schnalle am Brustgurt zwei Löcher weiter als sie müsste.'),
    a('Das Gurtzeug ist dir zwei Löcher zu weit. Das sieht man sogar im Dunkeln.', 'neutral'),
    v('Geerbt.'),
    a('Von wem?', 'besorgt'),
    v('Von \'nem Idioten.', 'trauer'),
    n('Du sagst es kurz. Zu kurz. Aria nickt nur, als hätte sie genau so eine Antwort erwartet, und hebt etwas Kleines, Rundes aus ihrer Hosentasche. Ein Kronkorken. Rot, mit einem schwarzen Blitz drauf.'),
    a('Kabelbrand-Edition. Aus dem Jahr, bevor … egal. Ich hab hundert davon. Okay, tausend.', 'freude'),
    n('Sie kaut ihren Kaugummi zu Ende, nimmt ihn raus, und bevor du was sagen kannst, klebt der Kronkorken innen an deinem Rolltor.'),
    a('So. Jetzt hast du was. Wenn du\'s abkratzt, merk ich das. Ich merk alles.', 'freude'),
  ], { effects: [...STATION_START, { cutscene: rom ? 'rom-vexaria-bude' : 'rom-vexaria-bude-fs' }] }),
]);

const budeWahl = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', rom ? [
    a('… Fast alles. Du guckst grad auf meinen Mund, oder? Merk ich auch.', 'verlegen'),
    v('Da klebt Nudel.', 'verlegen'),
    a('Da klebt KEINE Nudel.', 'verlegen'),
    n('Sie wischt sich mit dem Handrücken übers Kinn. Daneben.'),
    a('… Oder? Wo?', 'verlegen'),
  ] : [
    a('Crew-Markierung. Jetzt weiß jeder, dass hier eine von uns pennt.', 'signatur'),
    v('Eine von euch.'),
    a('Ja. Gewöhn dich dran. Wir sind wie Schimmel. Wenn wir einmal da sind, gehen wir nicht mehr weg.', 'freude'),
  ], {
    choices: [
      ch('Den Kronkorken dranlassen. „Bleibt. Eine Nacht.“', 'bleibt', { effects: [herz(40), ...KRONKORKEN] }),
      ch('„Wo ich herkomm, klaut man, was hängt. Der da hält keine drei Tage.“', 'gosse', { tag: '[Gosse]', effects: [herz(50), ...KRONKORKEN] }),
      ch('Ihn abkratzen und ihr zurückgeben.', 'abkratzen', { effects: [herz(-20)] }),
    ],
  }),
  node('bleibt', [
    v('Bleibt. Eine Nacht.'),
    a('Wir reden in \'ner Woche nochmal.', rom ? 'zaertlich' : 'freude'),
  ], { next: rom ? 'flirt' : 'ende-fs' }),
  node('gosse', [
    a('Dann kleb ich jede Woche \'n neuen. Ich hab tausend.', 'signatur'),
    v('Dann bist du jede Woche hier.'),
    a('… Ja. Das war der Plan. Glaub ich. Ich hab keinen Plan. Iss.', rom ? 'verlegen' : 'freude'),
  ], { next: rom ? 'flirt' : 'ende-fs' }),
  node('abkratzen', [
    n('Du kratzt den Kronkorken mit dem Daumennagel ab. Er löst sich mit einem kleinen, schmatzenden Geräusch. Du hältst ihn ihr hin.'),
    n('Aria nimmt ihn. Steckt ihn ein. Ohne Witz. Das ist das Schlimmste daran.'),
    a('Okay. Verstanden. Noch nicht.', 'trauer'),
  ], { next: rom ? 'flirt' : 'ende-fs' }),
  ...(rom ? [
    node('flirt', [
      n('Die Glühbirne summt. Draußen tropft der Regen vom Wellblech. Aria isst weiter, aber sie sieht dich dabei an, über den Rand der Box hinweg, und in ihrem Mundwinkel hängt ein Tropfen Soße wie eine Einladung, die sie selbst nicht verschickt hat.'),
    ], {
      choices: [
        ch('„Ich liefer auch nachts. An jede Tür.“', 'nachts', { check: chk('vexaria-bude-strasse', 'strasse', 5, ['flirt']), effects: [herz(30)] }),
        ch('Ihr mit dem Daumen die Soße vom Mundwinkel wischen.', 'daumen', { effects: [herz(30)] }),
        ch('„Iss deine Nudeln, Zöpfe.“', 'rolltor'),
      ],
    }),
    node('nachts', [
      n('Aria verschluckt sich an einer Nudel. Richtig. Mit Husten, Tränen und einem Schlag mit der Metallfaust auf die Kiste, der eine Delle hinterlässt.'),
      a('DU. Du bist so –', 'verlegen'),
      a('Iss deine Nudeln, Postbotin.', 'verlegen'),
      n('Sie isst ihre. Hektisch. Mit roten Ohren. Der Zerberster klopft dabei leise auf ihrem Knie, ein nervöser Takt, den sie nicht bemerkt.'),
    ], { next: 'rolltor' }),
    node('daumen', [
      n('Du beugst dich vor. Langsam. Dein Daumen, der echte, unter dem fingerlosen Handschuh, streicht über ihren Mundwinkel. Die Haut dort ist warm. Ihre Lippen sind weicher, als jemand mit ihrem Mundwerk ein Recht drauf hätte.'),
      n('Aria hält ganz still. So still hast du sie noch nie gesehen. Sie atmet nicht einmal.'),
      a('… Mach das nicht, wenn du\'s nicht meinst.', 'zaertlich'),
      v('Hab Soße gesehen.', 'verlegen'),
      a('Klar. Soße.', 'zaertlich'),
      n('Ihre Metallhand kommt hoch und legt sich um dein Handgelenk. Nicht fest. Kühl. Sie hält es eine Sekunde dort, deine Hand an ihrem Gesicht, ihre Augen auf deinen. Dann lässt sie los, ganz vorsichtig, als würde sie etwas zurück ins Regal stellen.'),
      a('Das war … eine Menge Soße.', 'verlegen'),
    ], { effects: [set('vexaria_daumen')], next: 'rolltor' }),
    // Beinahe-Moment: Das Rolltor klemmt, der Kurierfunk nicht.
    node('rolltor', [
      n('Irgendwann sind die Boxen leer. Aria steht auf, nimmt den Schläger und will sich unter dem Rolltor durchducken. Das Rolltor hat andere Pläne. Es rutscht mit einem Rasseln zwei Handbreit runter und klemmt.'),
      a('Dein Tor hasst mich.', 'verlegen'),
      v('Mein Tor hasst jeden. Lass mich.'),
      n('Du greifst über sie hinweg, die Metallhand flach ans Wellblech über ihrem Kopf, und ruckst. Nichts. Du ruckst nochmal. Jetzt steht ihr so: Aria mit dem Rücken am kalten Blech, du einen halben Schritt vor ihr, dein Ratenarm über ihrer Schulter. Zwischen euch passt kein Paket mehr.'),
      n('Sie dreht sich nicht weg. Sie dreht sich um. Zu dir.'),
      a('… Du hast das Tor gar nicht richtig angefasst.', 'verlegen'),
      v('Hab ich.'),
      a('Hast du nicht. Ich hab hingeguckt. Ich guck immer hin.', 'verlegen'),
      n('Die Glühbirne pendelt noch von deinem Ruckeln und schiebt Licht und Schatten über eure Gesichter, hin und her. Ihr Atem riecht nach Chili und Volt-Limo. Ihre echte Hand kommt hoch, zögert über deinem Brustriemen, und dann hakt sie einen Finger hinter die oberste Schnalle. Sie zieht nicht. Sie hält sich nur fest.'),
      a('Wie viele hat das Ding eigentlich?', 'verlegen'),
      v('Find\'s raus.', 'signatur'),
      n('Ihr Finger rutscht eine Schnalle tiefer. Klick, macht das Metall. Nicht auf. Nur ein Geräusch. Dein ganzer Körper hört es trotzdem.'),
      n('Ihre Nasenspitze streift deine. Der Zerberster liegt plötzlich an deiner Taille, ganz leicht, die Metallfinger gespreizt, als wüsste sie nicht, wie viel Druck richtig ist, und als wollte sie es auf gar keinen Fall falsch machen.'),
      a('Sag, wenn ich aufhören soll.', 'zaertlich'),
      v('Sag ich nicht.', 'zaertlich'),
      n('Ein Millimeter. Weniger. Ihr Atem liegt schon auf deiner Unterlippe, warm, und ihre Augen gehen zu –'),
      n('Es knackt. An deinem Schulterriemen, genau zwischen euch, rauscht das Kurierfunkgerät los.'),
      n('KANAL 4 · Kurier Sieben-Neun: „Chefin? Bist du wach? Rippers Paket tickt wieder. Lauter als gestern. Soll ich\'s in den Kanal werfen oder unters Kopfkissen legen?“'),
      n('Ihr erstarrt beide. Dann reißt Aria die Augen auf.'),
      a('Ist die Taste gedrückt? Sag mir, dass die Scheißtaste nicht gedrückt ist.', 'verlegen'),
      n('Du siehst runter. Das Lämpchen ist grün, nicht rot. Empfangen, nicht senden. Die Flotte hat nichts gehört. Diesmal nicht.'),
      v('Nicht gedrückt.', 'verlegen'),
      a('Gott. Okay. Ich dachte grad, alle deine Kuriere hören, wie ich atme.', 'verlegen'),
      n('Sie atmet immer noch so. Ihr Finger hängt immer noch an deiner Schnalle.'),
    ], {
      choices: [
        ch('Das Funkgerät abschalten. Ganz. „Kanal ist zu.“', 'funk-aus', { effects: [herz(20)] }),
        ch('Die Taste drücken, ohne den Blick von ihr zu nehmen. „Wirf\'s in den Kanal. Und dich hinterher.“', 'funk-frech', { effects: [herz(10)] }),
        ch('Ihr das Funkgerät hinhalten. „Sag du\'s ihm.“', 'funk-aria', { effects: [herz(20)] }),
      ],
    }),
    node('funk-aus', [
      n('Du drehst am Knopf, bis es klickt. Stille. Nur die Glühbirne summt, und draußen tropft Regen vom Wellblech.'),
      v('Kanal ist zu.', 'zaertlich'),
      n('Aria sieht dich an. Lange. Ihr Finger löst sich von der Schnalle, ganz langsam, als würde sie eine Zündschnur loslassen, von der sie nicht weiß, wie kurz sie ist.'),
      a('… Nee. Das ist ja das Problem. Wenn der Kanal zu ist, geh ich heut nicht mehr.', 'zaertlich'),
      a('Und du hast gesagt, du behältst nix über Nacht. Ich will nicht \'n Paket sein, Postbotin. Ich will … länger.', 'verlegen'),
      n('Sie lehnt die Stirn an deine Schulter, genau auf den Riemen. Ihr Atem geht warm durch dein Top, einmal, zweimal. Dann stemmt sie den Zerberster unters Rolltor und drückt es mit einer Hand hoch, als wäre es aus Pappe.'),
      v('Ging also doch.', 'signatur'),
      a('Ging die ganze Zeit. Ich wollt nur, dass du\'s versuchst.', 'signatur'),
    ], { next: 'abschied' }),
    node('funk-frech', [
      n('Das Lämpchen wird rot.'),
      v('Wirf\'s in den Kanal, Sieben-Neun. Und dann wirf dich hinterher. Ich bin beschäftigt.', 'signatur'),
      n('KANAL 4 · Kurier Sieben-Neun: „… Beschäftigt. Um zehn. Chefin, du bist nie besch– oh. OH. Verstanden. Ich bin gar nicht da. Ich war nie da.“'),
      n('Aria beißt sich in den Handrücken. Den echten. Es hilft nichts. Sie lacht so sehr, dass sie am Rolltor runterrutscht, und das Rolltor rasselt mit, als würde es auch lachen.'),
      a('„Beschäftigt.“ Die ganze Flotte weiß jetzt, dass du beschäftigt bist. Womit denn, Postbotin? WOMIT?', 'freude'),
      v('Mit Nudeln.', 'verlegen'),
      a('Mit Nudeln. Klar. Ich bin jetzt offiziell \'ne Nudel.', 'verlegen'),
      n('Der Moment ist weg, irgendwo zwischen Funkgerät und Gelächter. Aber sie sieht von unten zu dir hoch, vom Boden, mit roten Ohren, und es ist, als hätte sie ihn sich nur in die Tasche gesteckt. Für später.'),
      n('Sie lässt sich von dir hochziehen. Dann stemmt sie den Zerberster unters Rolltor, und das Ding gleitet hoch, als hätte es nie geklemmt.'),
    ], { next: 'abschied' }),
    node('funk-aria', [
      n('Du hakst das Funkgerät vom Riemen und hältst es ihr hin. Sie starrt es an. Dann dich. Dann drückt sie die Taste mit dem Metalldaumen, so fest, dass das Plastik knackt.'),
      a('Hier ist Aria. Die Chefin hat Feierabend. Das Paket tickt bis morgen. Und wer heut Nacht nochmal auf diesem Kanal rauscht, dem stell ich persönlich was zu.', 'signatur'),
      n('KANAL 4 · Kurier Sieben-Neun: „… Die Brecherin. In der Bude. Um zehn.“ Rauschen. Eine zweite Stimme: „Ich krieg zehn Cr von Kiki.“ Eine dritte: „Ich hab\'s GEWUSST.“'),
      a('Oh nein. Ich hab grad der ganzen Flotte gesagt, dass ich bei dir bin. Nachts. Mit Nudeln.', 'verlegen'),
      v('Hast du.', 'signatur'),
      a('Ich hab mein Revier markiert. Auf FUNK. Wie Bolzens ganzes Rudel.', 'verlegen'),
      v('Gefällt mir.', 'zaertlich'),
      a('… Ja? Dann bin ich nicht peinlich. Dann bin ich gefährlich. Merk dir das.', 'signatur'),
      n('Sie gibt dir das Funkgerät zurück. Ihre Finger bleiben eine Sekunde zu lang auf deinen. Dann drückt sie das Rolltor mit dem Zerberster hoch, einhändig, als wäre es nie geklemmt.'),
    ], { next: 'abschied' }),
    node('abschied', [
      n('Draußen, schon unter dem Rolltor durch, dreht sie sich noch einmal um. Regen auf ihrem Gesicht, ein Zopf halb offen, und sie sieht aus, als wäre sie gerade eine Treppe zu schnell runtergerannt.'),
      a('Gute Nacht, Postbotin. Träum was Dreckiges. Von mir.', 'signatur'),
      a('… Das war ein Witz. Halb. Ein Drittel. Gute Nacht!', 'verlegen'),
      n('Das Rolltor rasselt runter. Du stehst eine Weile davor, eine Hand auf der Brustschnalle, an der eben noch ihr Finger hing. Dein Herz hat sich noch nicht entschieden, ob es wieder langsamer werden will. Der Kronkorken, falls er noch hängt, fängt das Licht der Glühbirne. Zum ersten Mal hängt in dieser Bude etwas, das bleiben soll.'),
    ], { effects: [msg('Ab jetzt flirtet Aria mit dir im Tagesgespräch.')] }),
  ] : [
    node('ende-fs', [
      n('Ihr esst. Sie erzählt von Hunters neuer Sonnenbrille, von Dantes Keksunfall, von einem Inkasso, bei dem der Schuldner sich im eigenen Kühlschrank versteckt hat. Du sagst fast nichts. Sie stört das nicht.'),
      a('Gute Nacht, Postbotin. Schließ ab. Nicht wegen mir. Wegen Ripper.', 'freude'),
    ]),
  ]),
]);

// ---------------------------------------------------------------------------
// Station 5 · rom-vexaria-tanz · „Vex tanzt nicht“ (Tafel nur Romanze)

const tanzBar: DialogueDef = dlg('rom-vexaria-tanz', [
  node('start', [
    n('Freitagnacht im High Voltage. Der Bass macht die Gläser nervös. Du lieferst Kiki Karbon an der Bar ein Paket ab, und Kiki unterschreibt mit einem Herzchen über dem i, obwohl ihr Name kein i hat.'),
    s('kiki-karbon', 'Kurs liegt an, Süße! Wenn du mal \'ne Lieferung nach oben brauchst: Ich hab \'ne Rückbank. Groß. Sauber. Meistens.'),
    v('Ich lauf lieber, Kiki.'),
    s('kiki-karbon', 'Lauf, wohin du willst. Ich fahr hinterher.'),
    n('Hinter dir ein Geräusch wie eine Abrissbirne, die sich durch eine Menschenmenge drängelt. Dann eine Hand. Die echte. Sie landet flach auf deiner Hüfte, über dem Nietengürtel, und der Daumen hakt sich in deine Gürtelschlaufe, als wäre die Schlaufe genau dafür genäht worden.'),
    n('Aria schiebt sich halb vor dich, das Kinn auf deiner Schulter, die Zöpfe noch im Takt der Musik, und lächelt Kiki an. Mit allen Zähnen. Es ist das Lächeln vom Schrottmarkt. Das, bei dem Händler zahlen.'),
    a('Kiki, Schätzchen. Dein Taxi steht im Halteverbot. Gleich steht\'s auf dem Dach.', 'signatur'),
    s('kiki-karbon', 'Ohoo. Kurs geändert. Die Lieferung ist schon vergeben, verstehe. Ich bin weg, bevor die Brecherin mir \'ne neue Karosserie verpasst!'),
    n('Kiki ist weg. Aria bleibt. Die Hand auch. Sie atmet dir warm in den Nacken und tut so, als hätte sie nur zufällig hier gestanden. Mit dem Daumen in deiner Gürtelschlaufe. Zufällig.'),
    v('Bist du eifersüchtig?', 'signatur'),
    a('NEIN.', 'verlegen'),
    a('… Ja. Halt die Klappe.', 'verlegen'),
    a('Die hat dich angeguckt wie \'nen Döner um vier Uhr früh.', 'wut'),
    v('Und wie guckst du mich an?', 'signatur'),
    a('Wie \'nen Döner um vier Uhr früh, den ich zuerst gesehen hab. Und den ich mit keinem teil. Mit KEINEM.', 'signatur'),
    n('Ihr Daumen streicht einmal über deinen Hüftknochen, quer über den Gürtel, langsam, als würde sie eine Unterschrift setzen. Dann packt sie dich an den Gurtriemen. Mit der echten Hand, die Finger unter dem Brustriemen eingehakt, und zieht. Richtung Tanzfläche.'),
    v('Ich tanz nicht.', 'wut'),
    a('Du springst auch nicht über Lücken, und trotzdem kommst du immer an. Komm her.', 'signatur'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Mitgehen. Nur weil sie zieht.', 'schnell'),
      ch('„Einen. Dann bin ich weg.“', 'schnell', { effects: [herz(10)] }),
    ],
  }),
  node('schnell', [
    n('Ein schnelles Lied. DJ Lumo dreht auf. Aria tanzt, wie sie rennt: wild, raumgreifend, mit dem Ellbogen voran. Sie wirft die Zöpfe, sie lacht, sie singt falsch mit und drischt mit der Metallfaust in die Luft, wenn der Refrain kommt.'),
    n('Du stehst. Dann wippst du. Dann ist da irgendwas in deinen Beinen, das sich wie Ausweichen anfühlt, nur ohne Grund. Aria sieht es und johlt.'),
    a('DA! Da war ein Schritt! Ich hab\'s gesehen! Die Postbotin TANZT!', 'freude'),
    n('Dann wird es dunkler. An der Bar hebt Hunter zwei Finger, ganz knapp über die Sonnenbrille. DJ Lumo nickt. Das nächste Lied ist langsam.'),
    n('Aria hört auf zu hüpfen. Sie steht vor dir, außer Atem, verschwitzt, und für einen Moment weiß sie nicht, wohin mit ihren Händen.'),
    n('Dann weiß sie es.'),
  ], { effects: [{ cutscene: 'rom-vexaria-tanz' }] }),
]);

const tanzLangsam: DialogueDef = dlg('rom-vexaria-tanz-langsam', [
  node('start', [
    n('Ihr dreht euch kaum. Es ist eher ein Wiegen, ein gemeinsames Atmen im Takt. Die ganze Tanzfläche ist voller Leute, und keiner davon existiert.'),
    a('Halt mal still. Ich will nur … du riechst immer noch nach Regen und Kettenöl. Das ist unfair.', 'verlegen'),
    n('Ihre Stirn kommt deiner näher. Ein Zentimeter. Noch einer. Du spürst ihren Atem auf deinen Lippen, warm und nach Volt-Limo.'),
    v('Deine Hand zittert.', 'ueberrascht'),
    a('Die Metallhand zittert nie. Das ist die andere. Halt die Klappe.', 'zaertlich'),
  ], {
    choices: [
      ch('Sie in eine Drehung ziehen und auffangen.', 'drehung', { check: chk('vexaria-tanz-reflexe', 'reflexe', 6, ['ausweichen']), effects: [herz(50)] }),
      ch('Die Hand auf ihren Rücken legen. Über dem Shirt.', 'ruecken', { effects: [herz(40)] }),
      ch('„Ich hab gesagt, ich tanz nicht.“ Stehen bleiben. Aber nicht weggehen.', 'stehen', { effects: [herz(30)] }),
    ],
  }),
  node('drehung', [
    n('Du ziehst sie an der echten Hand in eine Drehung, schnell, wie man einem Wurfgeschoss ausweicht, und fängst sie auf, bevor sie gegen ein Pärchen knallt. Sie landet rückwärts an deiner Brust. Ihr Lachen vibriert durch dein Gurtzeug.'),
    a('Woher kannst du DAS?', 'ueberrascht'),
    v('Ausweichen. Ist das Gleiche, nur mit Absicht.', 'signatur'),
    a('Mach das nochmal. Nein. Mach das nie wieder. Doch.', 'verlegen'),
  ], { next: 'keks' }),
  node('ruecken', [
    n('Du legst die Hand auf ihren Rücken. Über dem Shirt, zwischen die Schulterblätter, da, wo der Netzstoff aufhört. Sie hält den Atem an. Du spürst, wie sie unter deiner Hand stillhält, ganz kurz, wie ein Tier, das überlegt, ob es weglaufen soll.'),
    a('… Okay. Ja. Das darfst du.', 'zaertlich'),
    n('Sie läuft nicht weg. Sie lehnt sich rein.'),
  ], { next: 'keks' }),
  node('stehen', [
    v('Ich hab gesagt, ich tanz nicht.'),
    a('Du tanzt nicht. Du stehst nur sehr nah bei mir rum. Das reicht.', 'zaertlich'),
    n('Ihr steht. Sehr nah. Das Lied dauert ewig und ist trotzdem zu kurz.'),
  ], { next: 'keks' }),
  node('keks', [
    n('Ihre Stirnen berühren sich fast. Ihr Mund ist so nah, dass du nicht mehr sagen kannst, wessen Atem wessen ist. Ihre Augen gehen zu. Deine auch. Noch ein Zentimeter. Ein halber –'),
    s('dante', 'HEILIGES KANONENROHR, IST DAS MEIN KEKS?', 'ueberrascht'),
    a('SCHEISSE!', 'wut'),
    v('SCHEISSE.', 'wut'),
    n('Gleichzeitig. Im Chor. Die Hälfte der Tanzfläche dreht sich um. Dante steht an der Bar und hält einen Keks hoch wie ein Beweisstück vor Gericht.'),
    a('Ich bring ihn um.', 'wut'),
    n('Sie packt dich am Brustriemen und zieht dich durch die Menge, am Klo vorbei, durch die Hintertür, raus in die Seitengasse neben dem ratternden Lüftungsschacht.'),
  ], { next: 'gasse' }),
  node('gasse', [
    n('Die Tür fällt zu. Der Bass ist nur noch ein dumpfes Herzklopfen in der Wand. Es riecht nach Regen und Frittierfett. Aria drückt dich mit dem Rücken gegen die Mauer, beide Hände an deinen Gurtriemen, Stirn an Stirn, atemlos.'),
    a('Ich bring Dante um. Ich steck ihn in seinen eigenen Ofen.', 'wut'),
    a('… Morgen. Heute bin ich zu … egal.', 'verlegen'),
    n('Und dann küsst sie dich. Blitzschnell, auf den Mundwinkel, zu schnell für einen richtigen Kuss. Ein Streifschuss. Sie ist schon wieder einen halben Schritt weg, bevor du überhaupt gemerkt hast, dass es passiert ist.'),
    a('Das war kein Kuss. Das war Abschlagen. Du bist dran, Postbotin.', 'verlegen'),
  ], {
    choices: [
      ch('Dran sein.', 'kuss', { effects: [herz(50), set('vexaria_knutsch')] }),
      ch('„Abschlagen gilt nur, wenn ich nicht zurückschlag.“', 'kuss-strasse', { check: chk('vexaria-tanz-strasse', 'strasse', 5, ['flirt']), effects: [herz(60), set('vexaria_knutsch')] }),
      ch('„Nicht hier.“', 'nicht-hier', { effects: [herz(30)] }),
    ],
  }),
  node('kuss-strasse', [
    v('Abschlagen gilt nur, wenn ich nicht zurückschlag.', 'signatur'),
    a('… Oh. Oh, du –', 'verlegen'),
  ], { next: 'kuss' }),
  node('kuss', [
    n('Du ziehst sie an der Gürtelschlaufe zurück, bevor sie sich umdrehen kann. Der Schläger poltert aufs Pflaster. Dann ist sie einfach da.'),
    n('Mund. Atem. Ein überraschter kleiner Laut gegen deine Lippen, der sofort zu etwas anderem wird. Das kalte Metall der Zerberster-Finger in deinem Nacken, die warme andere Hand unter deinem Gurtzeug, flach auf deinem Top, genau da, wo dein Herz gegen die Rippen hämmert.'),
    n('Du hast die Finger in ihren Zöpfen und keine Ahnung mehr, wie man rennt. Sie schmeckt nach Volt-Limo und nach Wut auf Dante und nach etwas, das schon sehr lange gewartet hat. Sie küsst, wie sie alles macht: zu viel, zu schnell, mit ganzem Körper. Und dann plötzlich langsam. So langsam, dass dir die Knie weich werden, und deine Knie werden nie weich.'),
    n('Die Mauer in deinem Rücken ist nass. Ihr Oberschenkel ist zwischen deinen, ihr Bauch an deinem, die Schnallen deines Gurtzeugs klirren leise gegen die Silberschnalle ihres Gürtels. Irgendwo ganz weit weg rattert der Lüftungsschacht. Er hört sich an wie dein Puls.'),
    n('Dann geht die Hintertür auf.'),
    s('dante', 'Ich hab nichts gesehen! Ich bin ein Müllsack! Müllsäcke sehen nichts!', 'ueberrascht'),
    n('Er stellt tatsächlich einen Müllsack ab. Sehr vorsichtig. Rückwärts. Tür zu. Von drinnen, gedämpft und sehr hoch:'),
    s('dante', 'HUNTER! HUNTER, ich hab\'s GEWUSST!', 'freude'),
    n('Aria lacht. Gegen deinen Hals. Ihr ganzer Körper bebt davon, und ihr Atem ist heiß auf deiner Haut, genau unter dem Ohr.'),
    a('Morgen weiß es die ganze Unterstadt.', 'zaertlich'),
    v('Gut.', 'zaertlich'),
    a('… Gut?', 'ueberrascht'),
    v('Spart mir das Erklären.', 'signatur'),
    n('Sie hebt den Kopf. Ihre Lippen sind rot und ein bisschen geschwollen, ein Zopf hat sich halb gelöst, und sie sieht dich an, als hättest du gerade ein Dach übersprungen, das es gar nicht gibt.'),
    a('Du bist … Gott. Ich geh jetzt rein und hau Dante. Und dann komm ich wieder raus und mach weiter. Beweg dich nicht.', 'verlegen'),
    n('Sie bleibt trotzdem noch. Eine Minute. Fünf. Der Schläger liegt vergessen im Regen.'),
  ], { next: 'zuviel' }),
  // Beinahe-Moment: Aria bricht selbst ab, weil sie zu viel will.
  node('zuviel', [
    n('Sie geht nicht rein. Sie küsst dich wieder. Langsamer jetzt, gründlicher, als hätte Dante ihr nur bewiesen, dass die Zeit knapp ist. Ihre echte Hand wandert unter dem Gurtzeug nach hinten, über deinen Rücken, bis zu dem Streifen Haut über dem Hosenbund, wo das Top hochgerutscht ist. Ihre Fingerspitzen sind heiß. Sie bleiben dort liegen und zeichnen kleine Kreise, und jeder einzelne geht dir bis in die Knie.'),
    n('Deine Metallhand liegt an ihrer Hüfte, auf dem Gürtel. Du hältst sie kaum. Du traust dem Ratenarm nicht, wie viel er drückt, wenn du nicht hinsiehst. Aria merkt es. Sie legt den Zerberster auf deine Metallfinger und drückt sie selbst fester an sich. Metall auf Metall auf Hüfte.'),
    a('Mich verbiegst du nicht. Fass richtig an.', 'zaertlich'),
    n('Ihr Atem kommt stoßweise. Deiner auch. Ihr Mund wandert an deinem Kiefer entlang zum Hals, und ihre Zähne streifen die Stelle unter deinem Ohr, nur ganz kurz, und dein Hinterkopf schlägt gegen die nasse Mauer, und es ist dir vollkommen egal.'),
    n('Dann hört sie auf. Abrupt. Als hätte jemand den Strom abgestellt. Sie zieht die Hand unter deinem Gurtzeug hervor und hält sie zwischen euch hoch wie ein Beweisstück. Sie zittert. Die echte. Natürlich die echte.'),
    a('Stopp. Stopp, stopp, stopp. Nicht wegen dir.', 'verlegen'),
    a('Wegen mir. Ich will zu viel. Ich will so viel, dass ich gleich in \'ner Gasse neben Dantes Müllsack an deinen Schnallen rumreiß. Und das will ich nicht. Nicht so. Nicht das erste Mal.', 'verlegen'),
    n('Sie lehnt die Stirn an deine. Ihr Herz hämmert so laut, dass du es durch ihr Shirt und dein Gurtzeug spürst. Oder es ist deins. Bei dem Krach kann man das nicht so genau sagen.'),
    a('Sag was. Bevor ich\'s mir anders überleg.', 'verlegen'),
  ], {
    choices: [
      ch('„Okay.“ Die Hände wegnehmen. Stirn an Stirn bleiben.', 'zuviel-okay', { effects: [herz(30)] }),
      ch('„Ich hab \'ne Matte.“', 'zuviel-matte', { effects: [herz(20)] }),
      ch('„Eins noch. Wo du willst.“', 'zuviel-eins', { effects: [herz(30)] }),
    ],
  }),
  node('zuviel-okay', [
    v('Okay.', 'zaertlich'),
    n('Du nimmst die Hände weg. Beide. Die Metallhand von ihrer Hüfte, die echte aus ihrem Zopf. Du bleibst nur da, wo du bist: Stirn an Stirn, den Rücken an der Mauer.'),
    a('… Einfach so. „Okay.“', 'ueberrascht'),
    v('Du hast Stopp gesagt.'),
    a('Weißt du, wie scheiße das ist? Dass du das so einfach machst? Jetzt will ich nur noch mehr.', 'verlegen'),
    n('Sie lacht. Wackelig. Dann gibt sie dir einen Kuss auf die Nasenspitze. Auf die Nasenspitze. Das ist das Gefährlichste, was sie heute Nacht gemacht hat.'),
  ], { next: 'zuviel-schluss' }),
  node('zuviel-matte', [
    v('Ich hab \'ne Matte.', 'signatur'),
    a('ICH WEISS, dass du \'ne Matte hast! Ich hab sie gesehen! Ich denk seit Tagen an die Scheißmatte!', 'verlegen'),
    n('Das hallt durch die ganze Gasse. Irgendwo über euch knallt ein Fenster zu. Aria schlägt sich die echte Hand vor den Mund, und du lachst. Laut. Richtig. Das Geräusch überrascht euch beide.'),
    a('Hör auf, so zu lachen. Das macht\'s nicht besser. Das macht\'s viel schlimmer.', 'verlegen'),
    a('Wenn ich auf die Matte komm, dann nicht, weil Dante uns aus \'ner Bar gescheucht hat. Dann, weil du mich reinlässt. Mit Absicht.', 'zaertlich'),
    v('Das Rolltor klemmt.', 'signatur'),
    a('Dann reiß ich\'s raus. Ich bin gut im Rausreißen.', 'signatur'),
  ], { next: 'zuviel-schluss' }),
  node('zuviel-eins', [
    v('Eins noch. Wo du willst.', 'zaertlich'),
    n('Aria sieht dich an. Dann hebt sie, ganz langsam, den Zerberster und hält dir die Metallhand hin. Knöchel nach oben. Silber, Spiralfedern, eine frische Kerbe vom Armdrücken.'),
    a('Da. Spürt eh nix.', 'verlegen'),
    n('Du nimmst ihre Hand in deine echte und küsst die Knöchel. Einen nach dem anderen. Das Metall ist kühl und schmeckt nach Regen. Du lässt dir Zeit. Beim dritten hört sie auf zu atmen. Beim vierten macht sie die Augen zu.'),
    a('… Ich hab gelogen. Ich hab\'s gespürt. Jeden einzelnen.', 'zaertlich'),
    a('Und jetzt geh ich rein, bevor ich dir den Rest auch noch hinhalte.', 'verlegen'),
  ], { next: 'zuviel-schluss' }),
  node('zuviel-schluss', [
    n('Sie fischt den Schläger aus der Pfütze, schüttelt ihn ab und geht rückwärts zur Hintertür, ohne dich aus den Augen zu lassen. Ein Zopf ist offen. Ihre Lippen sind noch rot.'),
    a('Das hier ist nicht vorbei, Postbotin. Das ist vertagt. Ich vertag nicht oft.', 'signatur'),
  ], { next: 'ende' }),
  node('nicht-hier', [
    v('Nicht hier.'),
    a('Wo dann? Auf deinem scheiß Dach?', 'wut'),
    v('Irgendwann.', 'verlegen'),
    a('… Ich hasse, dass das funktioniert.', 'verlegen'),
    n('Sie hebt den Schläger auf, tippt dir damit sacht gegen die Brust, genau aufs Herz, und geht rein. An der Tür bleibt sie stehen.'),
    a('Irgendwann ist bald, Postbotin. Ich warte nicht gern.', 'signatur'),
  ], { next: 'ende' }),
  node('ende', [
    n('Später, drinnen, tut Hunter so, als hätte er nichts gesehen. Er poliert ein Glas, das schon sauber ist, sehr lange.'),
  ], {
    effects: [
      set('vexaria_eifersucht'),
      msg('Die Gasse neben dem High Voltage hat jetzt eine Geschichte. Die Tauben auch.'),
      { travel: 'neon-gasse', entry: 'von-high-voltage', minutes: 5 },
    ],
  }),
]);

const tanzFs: DialogueDef = dlg('rom-vexaria-tanz-fs', [
  node('start', [
    n('Freitagnacht im High Voltage. Du lieferst Kiki an der Bar ein Paket ab. Kiki unterschreibt mit Herzchen.'),
    s('kiki-karbon', 'Kurs liegt an, Süße! Wenn du mal \'ne Lieferung nach oben brauchst: Ich hab \'ne Rückbank.'),
    a('KIKI. Die Rückbank ist voller Pizzakartons. Ich hab reingeguckt. Ich hab\'s nie vergessen.', 'freude'),
    s('kiki-karbon', 'Das ist Ambiente, Süße!'),
    n('Die halbe Bar lacht. Kiki lacht am lautesten und verschwindet. Aria packt dich am Ärmel.'),
    a('Crew tanzt. Keine Ausreden.', 'signatur'),
    v('Ich tanz nicht.'),
    a('Alle tanzen. Sogar Hunter. Einmal im Jahr. Mit geschlossenen Augen, damit er\'s nicht sieht.', 'freude'),
  ], {
    effects: STATION_START,
    choices: [
      ch('Mitgehen und verlieren. Im Tanzen.', 'tanz'),
      ch('Mitgehen und es richtig machen.', undefined, {
        effects: [{
          minigame: 'akt-tanz', level: 2, key: 'vexaria-tanz-crew', label: 'Crew tanzt – mit Aria',
          win: [herz(30), { dialogue: 'rom-vexaria-tanz-fs-ende' }],
          lose: [herz(20), { dialogue: 'rom-vexaria-tanz-fs-ende' }],
        }],
      }),
    ],
  }),
  node('tanz', [
    n('Ein schnelles Lied. Aria tanzt wie ein Unwetter, du wie eine Laterne im Wind. Ihr lacht beide, sie lauter.'),
  ], { effects: [{ dialogue: 'rom-vexaria-tanz-fs-ende' }] }),
]);

const tanzFsEnde: DialogueDef = dlg('rom-vexaria-tanz-fs-ende', [
  node('start', [
    s('dante', 'HEILIGES KANONENROHR, IST DAS MEIN KEKS?', 'ueberrascht'),
    a('DANTE, DAS IST EIN BIERDECKEL!', 'freude'),
    s('dante', '… Oh. Ich hab schon reingebissen.', 'verlegen'),
    n('Aria lacht so sehr, dass sie sich an dir festhalten muss. Mit der Metallhand, an deiner Schulter. Ein Klacken, Metall auf Metall.'),
    a('Siehst du? Crew. Wir sind alle komplett bescheuert. Du passt perfekt rein.', 'freude'),
  ], { effects: [set('vexaria_crew_getanzt')] }),
]);

// ---------------------------------------------------------------------------
// Station 6 · rom-vexaria-oberlicht · „Zwei Idioten auf dem Glas“ (Tafel)

const oberlicht = (id: string, rom: boolean): DialogueDef => dlg(id, [
  node('start', [
    n('Hafenkante, blaue Stunde. Der Container mit dem verblassten Hai auf der Seite. Du sitzt oben auf dem Dach, die Beine über der Kante. Du hast „Bitte“ geschrieben. Du schreibst nie „Bitte“.'),
    n('Aria klettert hoch, den Schläger auf dem Rücken, und setzt sich neben dich. Dann sieht sie, wohin du schaust. Gegenüber, über dem schwarzen Wasser, liegt die Rennhalle 9. Dunkel. Das kaputte Glasoberlicht. Eine einzelne rote Warnlampe auf dem Dach.'),
    n('Sie hat sie drei Jahre nicht angesehen. Man sieht es an der Art, wie sie jetzt nicht wegsieht.'),
    a('Du hast mich hergeholt, um mir die Scheißhalle zu zeigen? Bist du –', 'wut'),
    v('Hundert Meter. Nicht näher. Wenn du sagst, wir gehen, gehen wir.'),
    n('Sie sagt es nicht. Sie sitzt da, die Fäuste auf den Knien, die Metallhand und die echte.'),
    v('Ich war da.', 'trauer'),
    a('… Was?', 'ueberrascht'),
    v('Auf dem Oberlicht. Mit meinem Bruder. Wir haben durch die Lüftung gehört, umsonst. Kabelbrand. Er hat alles mitgesungen. Falsch.'),
    v('Als das Ding runterkam, hat er mich weggezogen. „Nie umdrehen.“ Unten hat einer geschrien. Ich hab mich nicht umgedreht.', 'trauer'),
    v('Auf der Feuerleiter hast du von den zwei Kids auf dem Glas erzählt. Da hab ich\'s gemerkt. Das warst du. Der Schrei.', 'besorgt'),
    n('Aria sagt lange nichts. Das Wasser klatscht gegen die Kaimauer. Ein Kran quietscht. Irgendwo bellt Bolzens Rudel.'),
    a('… Ihr wart die zwei auf dem Glas.', 'ueberrascht'),
    a('Ich hab euch gesehen. Vor dem Soundcheck. Ich stand auf der Traverse und hab gedacht: Scheiße, die zwei Idioten fallen gleich durch.', 'trauer'),
    a('Und dann bin ICH gefallen.', 'trauer'),
    a('Jeder ist gerannt. Jeder. Nur Vega nicht.', 'trauer'),
    a('Du warst \'n Kind auf \'nem Glasdach. Was hättest du denn machen sollen, runterspringen?', 'wut'),
    n('Die Wut gilt nicht dir. Sie gilt ihr selbst, drei Jahre alt und immer noch frisch.'),
  ], {
    effects: STATION_START,
    choices: [
      ch('„Mich umdrehen. Wenigstens das.“', 'umdrehen', { effects: [herz(60)] }),
      ch('„Tut mir leid.“', 'leid', { effects: [herz(50)] }),
      ch('„Vega hat dich rausgetragen. Ich hätt dich nicht mal hochgekriegt. Du bist schwer.“', 'schwer', { check: chk('vexaria-oberlicht-strasse', 'strasse', 5, ['trost']), effects: [herz(50)] }),
      ch('Schweigen. Sitzen bleiben, bis sie „Wir gehen“ sagt.', 'schweigen', { effects: [herz(40)] }),
    ],
  }),
  node('umdrehen', [
    v('Mich umdrehen. Wenigstens das.'),
    n('Aria nimmt mit der echten Hand deinen Handschuh. Die linke, die mit den Narben, die keiner sieht. Sie drückt sie. Fest.'),
    a('Dann dreh dich jetzt um. Ich bin hier.', rom ? 'zaertlich' : 'besorgt'),
    n('Du drehst den Kopf. Nicht zur Halle. Zu ihr.'),
  ], { next: 'bruder' }),
  node('leid', [
    v('Tut mir leid.'),
    a('Hör auf. Du bist die Einzige, die sich je entschuldigt hat. Und du warst nicht mal schuld.', 'trauer'),
  ], { next: 'bruder' }),
  node('schwer', [
    n('Aria lacht unter Tränen. Es klingt kaputt und wunderschön. Dann boxt sie dir mit der Metallfaust sacht gegen den Arm. Metall auf Metall. Klong.'),
    a('Ich bin ZIERLICH, du Arschloch.', 'freude'),
  ], { next: 'bruder' }),
  node('schweigen', [
    n('Ihr sitzt. Die Sonne ist längst weg, die Hafenlichter gehen an, eins nach dem anderen. Du wartest darauf, dass sie „Wir gehen“ sagt.'),
    n('Sie sagt es nicht. Ihr bleibt bis Mitternacht.'),
  ], { effects: [{ advanceTime: 60 }], next: 'bruder' }),
  node('bruder', [
    a('Wer ist dein Bruder?', 'besorgt'),
    v('Später.', 'trauer'),
    v('Nicht heute. Heute ist deins.'),
  ], { effects: [{ cutscene: rom ? 'rom-vexaria-oberlicht' : 'rom-vexaria-oberlicht-fs' }] }),
]);

const OBERLICHT_ENDE = (rom: boolean) => [set('vexaria_oberlicht'), msg(rom ? 'Neuer Spitzname: „Stern“.' : 'Hundert Meter. Nächstes Mal neunzig.')];

const oberlichtSchluss = (id: string, rom: boolean): DialogueDef => dlg(id, rom ? [
  node('start', [
    a('Weißt du, was komisch ist? Ich hab da drei Jahre nicht hingeguckt. Und jetzt guck ich hin, und das Einzige, woran ich denk, ist: Du warst die ganze Zeit in der Nähe.', 'zaertlich'),
    n('Ihr Kopf liegt an deiner Schulter. Die Zöpfe kitzeln an deinem Hals. Du spürst, wie ihr Atem langsamer wird.'),
    v('Stern.', 'verlegen'),
    a('Was?', 'ueberrascht'),
    v('Dein Shirt. Der Stern. Brecherin sag ich nicht. Das sagen die anderen.', 'verlegen'),
    n('Aria hebt den Kopf nicht. Aber ihre Hand findet deine, und ihre Finger schieben sich zwischen deine, über dem Handschuh.'),
    a('… Sag\'s nochmal.', 'zaertlich'),
    v('Stern.', 'zaertlich'),
    a('Nochmal.', 'zaertlich'),
    v('Wird nicht besser vom Wiederholen.', 'signatur'),
    a('Doch. Wird es.', 'zaertlich'),
    // Beinahe-Moment: Hunter ruft an.
    n('Ihr sitzt so, bis auch das letzte Hafenlicht brennt. Dann hebt sie den Kopf doch. Nicht weit. Gerade so weit, dass ihre Nase an deiner Wange liegt und ihr Atem in deinen Mundwinkel fällt.'),
    a('Diesmal kein Keks.', 'zaertlich'),
    v('Kein Dante.', 'zaertlich'),
    a('Keine Gasse. Kein Müllsack. Nur Wasser und \'n Hai.', 'zaertlich'),
    n('Der Zerberster liegt auf deinem Oberschenkel. Ganz vorsichtig, die Finger kaum gekrümmt, als wäre dein Bein aus Glas und sie wüsste genau, wie das ist, wenn Glas bricht. Ihre echte Hand ist in deinem Nacken, unter den Locken, und ihr Daumen streicht hinter deinem Ohr entlang, hin und her, so wie du sonst an deiner Schnalle reibst.'),
    n('Du merkst, dass dein eigener Daumen still ist. Zum ersten Mal seit sehr langer Zeit.'),
    n('Ihre Lippen streifen deine. Nur ein Hauch. Eine Frage. Du willst gerade antworten –'),
    n('Da plärrt ihre Hosentasche los. Eine Polizeisirene, blechern und viel zu laut, quer über die halbe Hafenkante. Drüben fangen Bolzens Hunde an zu bellen.'),
    a('Das ist Hunter. Das ist sein Klingelton. Ich hab ihm die Sirene als Witz gegeben. Ich hasse diesen Witz.', 'wut'),
    a('Wenn ich nicht rangeh, schickt er Vega. Und Vega hat \'n Fernglas und kein Schamgefühl.', 'verlegen'),
  ], {
    choices: [
      ch('„Geh ran.“ Ihr Platz machen.', 'hunter-ran', { effects: [herz(20)] }),
      ch('Ihr das Telefon aus der Tasche fischen und selbst rangehen.', 'hunter-vex', { check: chk('vexaria-oberlicht-hunter-reflexe', 'reflexe', 6, ['taschendieb']), effects: [herz(30)] }),
      ch('Leise: „Darf ich?“ Den Mund an ihrem Hals, noch ohne Berührung.', 'hunter-hals', { effects: [herz(30)] }),
    ],
  }),
  node('hunter-ran', [
    n('Du lehnst dich zurück. Nicht weg. Nur so weit, dass sie Luft kriegt. Aria starrt dich an, als hättest du ihr gerade etwas viel Schlimmeres angetan als jede Sirene, und nimmt ab.'),
    s('hunter', 'Brecherin. Tür vom High Voltage. Da steht einer mit \'ner Kettensäge und Liebeskummer. Ich weiß nicht, was davon schlimmer ist.', 'neutral'),
    a('Bin unterwegs, Boss.', 'neutral'),
    n('Sie legt auf. Ihre Hand ist die ganze Zeit in deiner geblieben, und ihr Daumen hat nicht aufgehört, über deinen Handschuh zu streichen.'),
    a('Ich geh jetzt. Und ich hau dem Typen mit der Kettensäge eine rein und denk dabei an dich. Das wird für ihn sehr verwirrend.', 'verlegen'),
    a('Du hast mich gehen lassen. Schon wieder. Irgendwann lässt du mich nicht gehen, Postbotin. Und dann gnade dir Gott.', 'zaertlich'),
  ], { next: 'ende' }),
  node('hunter-vex', [
    n('Bevor sie reagieren kann, hast du das Telefon aus ihrer Hosentasche gefischt. Schneller als jeder Taschendieb in den Lötgassen. Aria macht ein Geräusch wie ein Wasserkessel.'),
    v('Sie ist beschäftigt, Boss.', 'signatur'),
    s('hunter', '… Postbotin.', 'neutral'),
    s('hunter', 'Tür vom High Voltage. Einer mit Kettensäge. Wenn sie in zwanzig Minuten nicht da ist, zieh ich dir die Prozente vom Lohn ab. Rückwirkend. Und ich will keine Einzelheiten.', 'signatur'),
    n('Klick. Aria starrt dich an. Ihr Mund steht offen. Ihre Ohren glühen so rot, dass man sie vermutlich von der Rennhalle aus sieht.'),
    a('Du hast grad. Meinen Chef. Weggedrückt. Mit MEINEM Telefon.', 'verlegen'),
    v('Er hat aufgelegt.', 'signatur'),
    a('„Sie ist beschäftigt.“ Ich bin beschäftigt. Mit dir. Hunter weiß das jetzt. Hunter weiß jetzt ALLES.', 'verlegen'),
    n('Dann packt sie dich am Brustriemen, zieht dich die letzten Zentimeter ran und küsst dich. Hart und kurz, wie ein Schlag mit dem Schläger. Das ist keine Antwort. Das ist eine Quittung.'),
    a('Zwanzig Minuten. Ich brauch neunzehn bis zur Tür. Die eine nehm ich mir jetzt.', 'signatur'),
    n('Sie nimmt sie sich. Die ganze Minute. Dann ist sie weg, die Leiter runter, und du sitzt allein auf dem Hai und schmeckst Volt-Limo.'),
  ], { next: 'ende' }),
  node('hunter-hals', [
    v('Darf ich?', 'zaertlich'),
    n('Du sagst es gegen ihre Haut, ohne sie zu berühren. Dein Mund schwebt über der Stelle, wo ihr Hals in die Schulter übergeht, da, wo der Kragen vom Shirt ausgefranst ist. Das Telefon plärrt weiter.'),
    n('Aria antwortet nicht mit Worten. Sie legt den Kopf schief, zur anderen Seite. Langsam. Das ist eine Antwort. Dann nimmt sie ab.'),
    a('Ja, Boss?', 'neutral'),
    s('hunter', 'Brecherin. Tür vom High Voltage. Da steht einer mit \'ner Kettensäge und Liebeskummer.', 'neutral'),
    n('Du küsst sie unter dem Ohr. Einmal. Ganz leicht. Ihr ganzer Körper wird erst steif und dann weich, in dieser Reihenfolge, in einer Sekunde.'),
    a('Mh-hm. Kettensäge. Klar. Ich bin – ich komm.', 'verlegen'),
    s('hunter', 'Warum klingst du so?', 'besorgt'),
    n('Du küsst die Stelle daneben. Die Metallfinger auf deinem Oberschenkel krallen sich ins Hosenbein und lassen sofort wieder los, erschrocken über sich selbst.'),
    a('Treppen. Ich bin. Treppen gelaufen. Sehr. Viele.', 'verlegen'),
    s('hunter', 'Du sitzt auf \'nem Container. Vega sieht dich.', 'signatur'),
    a('VEGA SOLL SICH UM IHREN EIGENEN SCHEISS KÜMMERN!', 'wut'),
    n('Klick. Das Telefon rutscht ihr aus der Hand, schlittert übers Containerdach, und sie fängt es mit dem Zerberster, ohne hinzusehen. Dann sieht sie dich an. Ihr Atem geht, als wäre sie tatsächlich Treppen gelaufen.'),
    a('Du bist ein Monster. Ein Monster mit Gurtzeug. Ich muss los. Ich muss so dermaßen los.', 'verlegen'),
    a('Und wenn ich wiederkomm, machst du da weiter. Genau da. Unterschreib das.', 'zaertlich'),
    v('Unterschrieben.', 'signatur'),
  ], { next: 'ende' }),
  node('ende', [
    n('Die Leiter klappert unter ihren Stiefeln. Unten auf dem Kai dreht sie sich noch einmal um und zeigt mit dem Schläger auf dich, als wollte sie sagen: Du. Später. Hinter dir liegt die Rennhalle 9 dunkel über dem Wasser. Du hast seit einer ganzen Weile nicht mehr hingesehen.'),
  ], { effects: OBERLICHT_ENDE(true) }),
] : [
  node('start', [
    a('Weißt du, was komisch ist? Ich hab da drei Jahre nicht hingeguckt. Und jetzt guck ich hin, und das Einzige, woran ich denk, ist: Du warst die ganze Zeit in der Nähe.', 'neutral'),
    n('Sie lehnt sich nicht an. Sie stößt ihre Schulter gegen deine. Und lässt sie dort.'),
    a('Zwei Idioten auf dem Glas. Und jetzt zwei Idioten auf \'nem Container. Wir steigen auf, Postbotin.', 'freude'),
  ], { effects: OBERLICHT_ENDE(false) }),
]);

// ---------------------------------------------------------------------------
// Cutscenes

const cutscenes = [
  cut('rom-vexaria-bude', 'Nichts zum Behalten', [
    { image: 'cut-rom-vexaria-bude', pan: 'in', fade: 'in', hold: 2000, caption: 'Die Kurierbude. Eine Matte, eine Kiste, eine Glühbirne. Und jetzt ein Kronkorken.' },
    {
      image: 'cut-rom-vexaria-bude', pan: 'right',
      lines: [
        n('Aria sitzt auf der Kiste und isst, als würde ihr die Bude schon halb gehören. Du lehnst im Türrahmen. Arme verschränkt. Und dein Mundwinkel macht etwas, das du ihm nicht erlaubt hast.'),
      ],
    },
  ], [{ dialogue: 'rom-vexaria-bude-wahl' }]),
  cut('rom-vexaria-bude-fs', 'Nichts zum Behalten', [
    { image: 'cut-rom-vexaria-bude', pan: 'in', fade: 'in', hold: 2000, caption: 'Die Kurierbude. Eine Matte, eine Kiste, eine Glühbirne. Und jetzt ein Kronkorken.' },
  ], [{ dialogue: 'rom-vexaria-bude-wahl-fs' }]),
  cut('rom-vexaria-tanz', 'Vex tanzt nicht', [
    { image: 'black', fade: 'in', sfx: 'switch', caption: 'DJ Lumo legt etwas Langsames auf.' },
    { image: 'cut-rom-vexaria-tanz', pan: 'in', fade: 'in', hold: 2400 },
    {
      image: 'cut-rom-vexaria-tanz', pan: 'out',
      lines: [
        n('Ihre silberne Metallhand liegt auf deiner schwarzen Schulter, ganz vorsichtig, als könnte sie etwas verbiegen. Deine Metallhand liegt flach auf ihrem Rücken. Eure echten Hände haben sich irgendwo in der Mitte gefunden und lassen sich nicht mehr los.'),
        n('Zwei Metallarme, zwei Narbenstellen, ein Lied, das eigentlich keiner von euch kennt.'),
      ],
    },
  ], [{ dialogue: 'rom-vexaria-tanz-langsam' }]),
  cut('rom-vexaria-oberlicht', 'Zwei Idioten auf dem Glas', [
    { image: 'cut-rom-vexaria-oberlicht', pan: 'left', fade: 'in', hold: 2600, caption: 'Hafenkante. Gegenüber die Rennhalle 9. Hundert Meter.' },
    {
      image: 'cut-rom-vexaria-oberlicht', pan: 'in',
      lines: [n('Irgendwann, ohne Vorwarnung, legt Aria den Kopf an deine Schulter. Du sitzt ganz still. So still, wie man sitzt, wenn ein Vogel auf einem landet.')],
    },
  ], [{ dialogue: 'rom-vexaria-oberlicht-schluss' }]),
  cut('rom-vexaria-oberlicht-fs', 'Zwei Idioten auf dem Glas', [
    { image: 'cut-rom-vexaria-oberlicht', pan: 'left', fade: 'in', hold: 2600, caption: 'Hafenkante. Gegenüber die Rennhalle 9. Hundert Meter.' },
  ], [{ dialogue: 'rom-vexaria-oberlicht-schluss-fs' }]),
];

// ---------------------------------------------------------------------------
// Telefon: Station 6 kündigt sich an (Vex hat „Bitte“ geschrieben)

const phone: PhoneMessageDef[] = [
  {
    id: 'aria-vex-bitte', from: 'aria',
    text: 'du hast BITTE geschrieben. bitte. du. bin unterwegs. hai-container. wenn das \'ne falle ist bring ich dich um',
    auto: all(V, seen('rom-aria-albtraum'), not_seen('rom-vexaria-oberlicht'), HEUTE_FREI, { time: ['abend', 'nacht'] }),
  },
];
function not_seen(id: string) { return { not: seen(id) }; }

// ---------------------------------------------------------------------------
// Herz-Ereignisse

export const FUNKEN_EVENTS: HeartEventDef[] = [
  ...twin({
    id: 'rom-vexaria-bude', hearts: 8, map: 'loetgassen', time: 'nacht',
    when: all(V, HEUTE_FREI, seen('rom-aria-dach'), { clockBetween: [1260, 1500] }),
  }, ROM_AN, { dialogue: 'rom-vexaria-bude-tuer' }, { dialogue: 'rom-vexaria-bude-tuer-fs' }),
  ...twin({
    id: 'rom-vexaria-tanz', hearts: 8, map: 'high-voltage', time: 'nacht',
    when: all(V, HEUTE_FREI, seen('rom-vexaria-bude'), { weekday: ['fr', 'sa'] }),
  }, ROM_AN, { dialogue: 'rom-vexaria-tanz' }, { dialogue: 'rom-vexaria-tanz-fs' }),
  ...twin({
    id: 'rom-vexaria-oberlicht', hearts: 8, map: 'hafenkante', time: ['abend', 'nacht'],
    when: all(V, HEUTE_FREI, seen('rom-aria-albtraum')),
  }, ROM_AN, { dialogue: 'rom-vexaria-oberlicht' }, { dialogue: 'rom-vexaria-oberlicht-fs' }),
];

// Nachklang: Hunter am nächsten Abend, Lio am Samstag (nur nach dem Kuss in der Gasse).
const nachklang = {
  'high-voltage': {
    onEnter: [
      {
        id: 'vexaria-hunter-turtelei', when: all(V, flag('vexaria_knutsch'), noFlag('aria_heute'), { time: ['abend', 'nacht'] }),
        dialogue: 'vexaria-hunter-turtelei',
      },
      {
        id: 'vexaria-lio-ballade', when: all(V, flag('vexaria_knutsch'), seen('enter:high-voltage:vexaria-hunter-turtelei'), { weekday: 'sa' }, { time: 'nacht' }),
        dialogue: 'vexaria-lio-ballade',
      },
    ],
  },
};

const hunterTurtelei: DialogueDef = dlg('vexaria-hunter-turtelei', [
  node('start', [
    s('hunter', 'Keine Turteleien auf meiner Tanzfläche.', 'signatur'),
    s('hunter', '… Das war keine Turtelei, das war ein Unfall mit Keks. Wird nicht wieder vorkommen.', 'neutral'),
    s('hunter', 'Oder doch. Mir egal. Weitermachen.', 'neutral'),
    n('Er geht. Hinter dir flüstert ein Gast: „Hast du gehört? Die Postbotin und die Brecherin. In der Gasse. Die Tauben haben\'s bestätigt.“'),
  ]),
]);

const lioBallade: DialogueDef = dlg('vexaria-lio-ballade', [
  node('start', [
    n('Samstagnacht. Lio Funkel steht auf der kleinen Bühne, das Akkordeon vor der Brust, und kündigt ein neues Lied an. „Die Ballade vom Eisenarm“. Er zwinkert. Zu Aria.'),
    s('lio-funkel', 'Oh Eisenarm, oh Eisenarm, du machst mein kaltes Herz so warm …', 'freude'),
    n('Aria grinst. Sie grinst! Über Lio! Über diesen Reim!'),
  ], {
    choices: [
      ch('„Lio. Noch ein Reim auf ‚Arm‘, und du bist arm dran.“', 'drohung', { effects: [herz(20)] }),
      ch('Die Arme verschränken und zuhören.', 'still'),
    ],
  }),
  node('drohung', [
    s('lio-funkel', '… Oh Eisenarm, du … machst … Alarm? Nein. Ich hör auf. Ich hör schon auf.', 'besorgt'),
    a('DU bist ja auch eifersüchtig! Ha! Das ist das Beste an der ganzen Woche!', 'freude'),
    n('Sie hängt sich an deinen Metallarm, die ganze restliche Ballade lang, und summt falsch mit.'),
  ]),
  node('still', [
    a('Guck nicht so. Ist nur Lio. Lio reimt alles auf alles.', 'freude'),
    n('Sie lehnt sich trotzdem an dich. Demonstrativ. In Lios Richtung.'),
  ]),
]);

export const part: ContentPart = {
  dialogues: byId([
    budeTuer('rom-vexaria-bude-tuer', true), budeTuer('rom-vexaria-bude-tuer-fs', false),
    budeWahl('rom-vexaria-bude-wahl', true), budeWahl('rom-vexaria-bude-wahl-fs', false),
    tanzBar, tanzLangsam, tanzFs, tanzFsEnde,
    oberlicht('rom-vexaria-oberlicht', true), oberlicht('rom-vexaria-oberlicht-fs', false),
    oberlichtSchluss('rom-vexaria-oberlicht-schluss', true), oberlichtSchluss('rom-vexaria-oberlicht-schluss-fs', false),
    hunterTurtelei, lioBallade,
  ]),
  cutscenes: byId(cutscenes),
  phone: byId(phone),
  mapAdditions: nachklang,
};
