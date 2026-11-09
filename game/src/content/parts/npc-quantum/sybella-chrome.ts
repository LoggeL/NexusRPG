// Sybella Chrome (Rot) – die Rechnerin der Chrome-Schwestern, Erfinderin von „Chrome 10“ (world.md §4.3).
// Volle Fassung für Akt 1–3 und Nachspiel; ersetzt npc-welt/sybella-chrome.ts (gleiche ID, Akt-1-Sätze übernommen).
// Tagesablauf nach design/plan/act23.json (npcSchedules.sybella-chrome, „ersetzt“), Herz-Ereignisse he-sybella-chrome-2…10
// (laut Plan 8/10 schon in Akt 2), Rivalität re-sybella-chrome-2/5. Keine Romanze, kein Begleiter.
// ♥8: gemeinsamer Flohmarktstand (akt-flohmarkt kennt den Sybella-Bonus über „he-sybella-chrome-8 gesehen“).
// side-teekraenzchen und pers-sybella-schnaeppchen bauen die Quest-Teile; hier Start und Verweise.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, NpcDef } from '../../../modules/contracts';
import {
  type Menue, AKT2, EPILOG, PARTYNACHT, ab, alle, dialog, erz, flag, gesehen, geschenk, gespraech, herz, ich, knoten,
  meldung, nicht, nichtGetroffen, ort, pruefung, queststand, rede, rivale, sammle, sprecher, VEX, weg, xp, zurueck,
} from './_q';

const ID = 'sybella-chrome';
const S = sprecher(ID);

const EINBRUCH: Condition = queststand('side-alte-gewohnheiten', 'active');
/** Nach he-4 weiß sie, dass die Spielfigur die Verkleidung kennt. */
const ENTTARNT: Condition = gesehen('he-sybella-chrome-4');
const Z = zurueck('Noch was, Sybella.', 'Ich muss weiter.');
/** side-alte-gewohnheiten: Der Lastenaufzug fuhr als „Blumenlieferung, Rosen, dringend“ ins Penthouse. */
const BLUMEN: Condition = { flag: 'alte-gewohnheiten-blumenlieferung' };
const BLUMEN_ERKANNT = 'sybella_blumenlieferung_erkannt';
/** side-chrome-10: Gutschein-Gerd entlarvt, gefälschte Chrome-10-Gutscheine aus dem Verkehr. */
const PIRATERIE: Condition = { flag: 'chrome10_markenpiraterie' };
const PIRATERIE_GEDANKT = 'sybella_markenpiraterie_gedankt';

// ---------------------------------------------------------------------------------------------- Menü

const choices: DialogueChoice[] = [
  {
    text: '„Drei Credits? Für das Sieb? Zwei, und du legst den Deckel dazu.“', tag: '[Gosse]', when: { origin: 'origin-gossenkind' },
    once: true, id: 'sy-gosse', next: 'gosse', effects: [herz(ID, 50)],
  },
  { text: '„Was ist eigentlich „Chrome 10“?“', once: true, id: 'sy-chrome10', next: 'chrome10' },
  { text: '„Warum feilscht eine Milliardärin auf dem Schrottmarkt?“', when: ENTTARNT, once: true, id: 'sy-warum', next: 'warum' },
  { text: '„Ich such ein Geschenk. Was ist hier ein Schnäppchen?“', next: 'schnaeppchen' },
  {
    text: '„Dante hatte mal eine Espressomaschine. Die steht jetzt bei dir, oder?“', tag: '[Sybella ♥3]', requires: ab(ID, 3),
    when: alle(AKT2, queststand('pers-sybella-schnaeppchen', 'inactive')), next: 'espresso', effects: [{ startQuest: 'pers-sybella-schnaeppchen' }],
  },
  { text: '„Was stand in deinen Büchern über Projekt Schwarm?“', when: alle(AKT2, gesehen('he-sybella-chrome-6'), nicht(EPILOG)), once: true, id: 'sy-schwarm', next: 'schwarm' },
  { text: 'Ich muss weiter.' },
];

const nodes: DialogueNode[] = [
  knoten('gosse', [
    S('ZWEI? Und den Deckel? Das ist ja …', 'ueberrascht'),
    erz('Sie mustert dich über die Sonnenbrille. Dann, sehr leise, sehr anerkennend:'),
    S('… Respekt. Zwölf Prozent Respekt. Mehr gibt es nicht ohne Gutschein. Na gut, fünfzehn.', 'freude'),
  ], { choices: Z }),
  knoten('chrome10', [
    S('Zehn Prozent auf alles bei Quantum. Für alle, die den Chip nehmen. Danach brauchen sie keinen Rabatt mehr, weil sie sowieso alles kaufen.', 'signatur'),
    S('Ich habe die Kampagne erfunden. Ich bin sehr stolz. Und ich habe gerade gemerkt, wie das klingt. Weniger stolz.'),
  ], { choices: Z }),
  knoten('warum', [
    S('Weil man oben nicht feilschen darf. Oben zahlt man. Mit Stil. Unten darf man schreien „Das ist ja Markenpiraterie!“ und keiner holt die Presse.', 'freude'),
    S('Feilschen ist mein Sport. Seraphina hat Golf, Serenity hat Gefühle. Ich habe drei Credits Unterschied und einen roten Kopf.'),
  ], { choices: Z }),
  knoten('schnaeppchen', [
    S('Kaufe nie, was der Händler dir zeigt. Kaufe, was er versteckt. Der Typ mit den Platten hat unter dem Tisch eine Kiste, die er für wertlos hält. Ist sie nicht.', 'signatur'),
    S('Und Seidentücher? Nur bei mir. Rot. Blau trägt meine Schwester, Grün die andere, beides ist ein Fehler.'),
  ], { choices: Z }),
  knoten('espresso', [
    S('Die Siebträgermaschine mit dem Messingadler? Ersteigert. Für einen Spottpreis. Von einem Pfandleiher, der sie von einem Typen hatte, der „Dante“ hieß und nicht aufhören konnte zu reden.', 'freude'),
    S('Du willst sie zurück? Dann feilsch. Richtig. Ich verschenke nichts, aber ich verkaufe alles. Zum richtigen Preis. Der richtige Preis ist meistens zu hoch.'),
  ], { choices: Z }),
  knoten('schwarm', [
    S('Zwölf Millionen für „Infrastruktur Schwarm“. Keine Rechnung, keine Lieferanten, nur Blades Unterschrift. Die ist sehr schwungvoll.', 'besorgt'),
    S('Ich habe Kopien. Für den Fall, dass jemand mal Zahlen braucht, die lügen. Das ist das Wertvollste, was ein Buchhalter besitzt.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: S('Noch was? Zeit ist Geld. Deine Zeit ist Kleingeld, aber trotzdem.'), choices, nodes };

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  // Akt-1-Sätze aus npc-welt/sybella-chrome.ts (gleiche IDs).
  gosse: gespraech('sybella-tag-gosse', [
    S('Du feilschst? Richtig? Mit Zahlen und Zähnen? … Respekt. Zwölf Prozent Respekt. Mehr gibt es nicht ohne Gutschein.'),
  ], M),
  oberstadt: gespraech('sybella-tag-oberstadt', [
    S('Du hast doch sicher einen Gutschein? Leute wie wir haben immer einen Gutschein.'),
  ], M),
  nacht: dialog('sybella-tag-nacht', [knoten('start', [
    erz('Im roten Schlafzimmer brennt Licht. Eine Frau sitzt im Bett und rechnet auf einem Abakus aus Rubinen. Laut. „Achtzehn Komma vier Prozent. Unverschämt.“'),
  ])]),
  standard: gespraech('sybella-tag-standard', [
    erz('Eine Frau mit Kopftuch, Sonnenbrille und einem Mantel, der eindeutig mehr kostet als der ganze Stand vor ihr, hält ein rostiges Sieb hoch.'),
    S('Drei Credits? Für DAS? Das ist ja Markenpiraterie! Zwei. Und ich nehme die Tüte gratis.'),
  ], M),
  verkleidet: gespraech('sybella-tag-verkleidet', [
    erz('Kopftuch, Sonnenbrille, Mantel. Die Verkleidung ist dieselbe. Nur der Händler vor ihr sieht diesmal aus, als würde er gleich weinen.'),
    S('Du schon wieder. Hilf mir. Der Mann will vier für einen Toaster ohne Stecker. Vier! Das ist Wucher mit Kabelbruch.', 'wut'),
  ], M),
  enttarnt: gespraech('sybella-tag-enttarnt', [
    S('Psst! Nicht so laut. Hier heiße ich Frau Rot. Ich verkaufe Topflappen. Und ich kaufe den Rest des Markts. Langsam. Mit System.', 'signatur'),
  ], M),
  bibliothek: gespraech('sybella-tag-bibliothek', [
    erz('Die Bibliothek im Penthouse: keine Romane, nur Kassenbücher. Hunderte, in rotes Leder gebunden. Sybella sitzt zwischen ihnen wie eine Spinne in einem sehr ordentlichen Netz.'),
    S('Morgens sind die Zahlen am ehrlichsten. Bevor die Leute aufwachen und anfangen, sie schönzureden.'),
  ], M),
  boutique: gespraech('sybella-tag-boutique', [
    erz('Boutique „Chrome & Co.“: Seidentücher in Glasvitrinen, eine Verkäuferin, die aussieht, als hätte sie seit Jahren nicht geblinzelt. Sybella steht an der Kasse und zählt das Wechselgeld zweimal.'),
    S('Willkommen bei Chrome & Co. Hier gibt es keine Rabatte. Außer Chrome 10. Und meinen persönlichen. Den gibt es nie.', 'signatur'),
  ], M),
  flohmarkt: gespraech('sybella-tag-flohmarkt', [
    erz('Sonntagsflohmarkt. Sybella hat einen eigenen Stand: „Frau Rots Raritäten“. Sie verkauft Seidentücher für drei Credits und kauft Kassenbücher für einen.'),
    S('Sonntags bin ich auf der anderen Seite. Es ist schrecklich. Die Leute feilschen mit mir! Ich liebe es.', 'freude'),
  ], M),
  vertraut: gespraech('sybella-tag-vertraut', [
    S('Da ist ja meine Lieblingskundin. Kunde. Du kaufst nie was, aber du feilschst so schön.', 'freude'),
  ], M),
  partyFoyer: dialog('sybella-tag-party-foyer', [knoten('start', [
    erz('Im Foyer, unter einem riesigen Hologramm „CHROME 10 – Heute 10 % auf die Zukunft!“, verteilt Sybella Gutscheine an die Gäste. Sie verteilt sie, als würden sie ihr wehtun.'),
    S('Nimm einen. Nein, nimm keinen. Doch, nimm einen. Nein. Ach, ich weiß auch nicht mehr, was ich hier verkaufe.', 'besorgt'),
  ])]),
  party: dialog('sybella-tag-party', [knoten('start', [
    S('VIP-Lounge. Champagner gratis. Gratis! Ich trinke aus Prinzip nur die Hälfte. Die andere Hälfte rechne ich ab.', 'signatur'),
  ])]),
  rivale: dialog('sybella-tag-rivale', [knoten('start', [
    S('Für dich: zwanzig Prozent Aufschlag. Überall. Ich habe mit jedem Händler zwischen hier und dem Hafen telefoniert.', 'wut'),
  ], {
    choices: [
      {
        text: 'Einen Chrome-10-Gutschein über die Theke schieben.', when: { item: 'chrome-10-gutschein' }, next: 'gutschein',
        effects: [{ take: 'chrome-10-gutschein' }, { reconcile: ID }],
      },
      {
        text: '„Zwanzig Prozent? Ich biete dir null und eine Entschuldigung. Das ist das beste Angebot, das du heute kriegst.“', tag: '[Straße 6]',
        check: pruefung('sybella-rivale-feilschen', 'strasse', 6, ['feilschen']), next: 'feilschen', effects: [{ reconcile: ID }],
      },
      { text: 'Gehen.' },
    ],
  }), knoten('gutschein', [
    S('Ein Chrome-10-Gutschein. Mein eigenes Produkt. Gegen mich.', 'ueberrascht'),
    S('… Das ist genial. Ich hasse es. Aufschlag aufgehoben.'),
  ]), knoten('feilschen', [
    S('Null und eine Entschuldigung. Das ist … ein lausiges Angebot.', 'wut'),
    S('Angenommen. Ich hasse mich dafür. Aber Respekt für die Dreistigkeit. Achtzehn Prozent Respekt.', 'freude'),
  ])]),
};

// ---------------------------------------------------------------------------------------------- Teekränzchen und Finale

/**
 * Teekränzchen (side-teekraenzchen, Akt 2): Wer nach side-alte-gewohnheiten als „Blumenlieferung“ im Penthouse war,
 * wird an der Salontür erkannt. Eigener Dialogweg, danach läuft das Teekränzchen normal weiter.
 */
const blumenlieferung = dialog('sybella-tee-blumenlieferung', [
  knoten('start', [
    erz('An der Salontür bleibt Sybella stehen. Sie sieht dich an. Dann deine Hände. Dann wieder dich. Ihr Abakus-Finger zuckt.'),
    S('Moment. Moment, Moment, Moment. Sie waren doch die Blumenlieferung!', 'ueberrascht'),
    S('„Rosen, dringend.“ Hauslog, Lastenaufzug, Dienstag, dreiundzwanzig Uhr zwölf. Es kamen keine Rosen. Es kamen Fußspuren. Auf meinem Teppich. Bis zum Tresor.', 'wut'),
  ], {
    choices: [
      { text: '„Die Rosen waren unterwegs. Lieferengpass. Sie wissen ja, wie das ist.“', next: 'engpass' },
      {
        text: '„Ich hab eine Pollenallergie. Ich würde nie im Leben Blumen liefern. Fragen Sie meinen Arzt.“', tag: '[Straße 5]',
        check: pruefung('sybella-blumen-bluff', 'strasse', 5, ['bluff']), next: 'bluff',
      },
      { text: '„Unterschrift bei Lieferung. Die fehlt übrigens noch.“', tag: '[Kurierin]', when: VEX, next: 'kurierin' },
      { text: '„Ja. War ich. Und die Rosen hätten Sie sowieso runtergehandelt.“', next: 'gestaendnis' },
    ],
  }),
  knoten('engpass', [
    S('Lieferengpass. Bei Rosen. In der Oberstadt. Wo ein Laden pro Straße nur Rosen verkauft.', 'signatur'),
    S('Das ist die schlechteste Ausrede, die ich je gehört habe. Ich bin beeindruckt. Ich ziehe sie Ihnen vom Tee ab.'),
  ], { next: 'ende', effects: [herz(ID, 10)] }),
  knoten('bluff', [
    S('Eine Pollenallergie. Natürlich. Sie sehen auch … verschnupft aus. Ein wenig. Um die Augen.', 'besorgt'),
    erz('Sie zieht ein rotes Seidentuch aus dem Ärmel und reicht es dir. Dann, ganz leise, zu sich selbst: „Das Hauslog lügt. Ich muss das Hauslog verklagen.“'),
  ], { next: 'ende', effects: [herz(ID, 20)] }),
  knoten('kurierin', [
    S('Eine Kurierin. Natürlich. Kurierinnen tragen Rosen, Pakete und Fußspuren. Das steht so im Tarifvertrag.', 'signatur'),
    S('Ich unterschreibe nichts. Ich habe noch nie etwas unterschrieben, das ich nicht bestellt habe. Außer einmal. Das war Chrome 10.', 'trauer'),
  ], { next: 'ende', effects: [herz(ID, 20)] }),
  knoten('gestaendnis', [
    S('Natürlich hätte ich sie runtergehandelt! Rosen, Dienstag, Nacht, Expresszuschlag! Auf dreißig Prozent! Mindestens!', 'wut'),
    S('… Sie haben nichts mitgenommen. Ich habe gezählt. Dreimal. Wer einbricht und nichts mitnimmt, ist entweder dumm oder will etwas anderes. Sie sehen nicht dumm aus. Meistens.', 'besorgt'),
    S('Setzen Sie sich. Wir reden über Chrome 10. Und danach reden wir über meinen Teppich. Der Teppich kriegt eine eigene Rechnung.'),
  ], { next: 'ende', effects: [herz(ID, 30)] }),
  knoten('ende', [
    erz('Hinter ihr klappern im Salon die Tassen. Seraphina ruft nach dir, als wärst du ein Hund, der zu spät zum Gassi kommt.'),
    S('Kein Wort zu meinen Schwestern. Seraphina würde die Blumenlieferung verklagen. Serenity würde ein Kapitel darüber schreiben. Beides wäre teuer.', 'signatur'),
  ], { effects: [flag(BLUMEN_ERKANNT), xp(40)] }),
]);

/** Akt 3: Nach side-chrome-10 bedankt sie sich für die Jagd auf Gutschein-Gerd („Markenpiraterie!“). */
const markenpiraterie = dialog('sybella-tag-markenpiraterie', [
  knoten('start', [
    erz('Sybella zieht dich zwischen zwei Champagnerpyramiden. Sie hat einen Ausdruck in der Hand, zerknittert, mit einem Polizeifoto: Gutschein-Gerd, frontal, mit Druckerschwärze im Gesicht.'),
    S('Sie! Sie waren das! Gutschein-Gerd! Viertausend gefälschte Chrome-10-Gutscheine, auf meinem Logo, in MEINER Schrift!', 'ueberrascht'),
    S('Das ist ja Markenpiraterie! Und Sie haben sie beendet. Einfach so. Ohne Rechnung.', 'freude'),
  ], {
    choices: [
      { text: '„Dexter hat sein Geld zurück. Das war die Rechnung.“', next: 'dexter' },
      { text: '„Ihr Logo hat mir nie gefallen. Aber gefälscht ist es noch hässlicher.“', next: 'logo' },
    ],
  }),
  knoten('dexter', [
    S('Ein Schrotthändler. Sie haben das für einen Schrotthändler getan. Das ist unwirtschaftlich. Das ist … schön.', 'zaertlich'),
  ], { next: 'ende' }),
  knoten('logo', [
    S('Frech. Ehrlich. Und leider richtig. Das Rot ist zu laut. Ich habe es Seraphina gesagt. Sie hat gesagt: „Laut verkauft sich.“', 'signatur'),
  ], { next: 'ende' }),
  knoten('ende', [
    S('Ich verschenke nichts. Aber ich vergesse auch nichts. Wenn heute Nacht hier etwas schiefgeht: Ich stehe auf Ihrer Seite der Rechnung.', 'signatur'),
  ], { effects: [herz(ID, 40), flag(PIRATERIE_GEDANKT), meldung('Sybella Chrome ♥ +40: „Das ist ja Markenpiraterie!“')] }),
]);

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Schrottmarkt, Di/Sa abends, ab Akt 1): Feilschduell, Gewinn chrome-10-gutschein. */
const he2 = dialog('he-sybella-chrome-2', [
  knoten('start', [
    erz('Schrottmarkt, Abend. Die Frau mit Kopftuch und Sonnenbrille steht vor einem Stand mit Messingknöpfen, die Arme verschränkt.'),
    S('Du da. Ich wette mit dir: Wer den Knopfkönig hier runterhandelt, gewinnt. Ich habe einen Gutschein. Du hast … Mut. Oder Langeweile.', 'signatur'),
    erz('Der Knopfkönig, ein Mann mit Monokel, zeigt auf ein Glas Knöpfe: „Fünfzig. Unverhandelbar.“'),
  ], {
    choices: [
      {
        text: '„Fünfzig? Die Hälfte davon ist Plastik. Zehn, und ich sag keinem, wo du sie herhast.“', tag: '[Straße 4]',
        check: pruefung('he-sybella-chrome-2-strasse', 'strasse', 4, ['feilschen']), next: 'gewonnen', effects: [herz(ID, 50)],
      },
      {
        text: 'Den Knopfkönig mit einem Lächeln um den Finger wickeln.', tag: '[Ausstrahlung 4]',
        check: pruefung('he-sybella-chrome-2-charme', 'ausstrahlung', 4, ['feilschen']), next: 'gewonnen', effects: [herz(ID, 50)],
      },
      { text: '„Fünfzig. Okay.“ Bezahlen.', next: 'voll', effects: [herz(ID, 25)] },
    ],
  }),
  knoten('gewonnen', [
    erz('Der Knopfkönig seufzt, als würdest du ihm ein Bein amputieren. Dann: „Zwölf. Und verschwinde.“'),
    S('ZWÖLF! Von fünfzig! Das sind vierundsiebzig Prozent! Das ist … das ist Kunst!', 'freude'),
  ], { next: 'ende' }),
  knoten('voll', [
    S('Du zahlst den vollen Preis? Absichtlich? Vor meinen Augen?', 'wut'),
    erz('Sie greift sich ans Herz. Der Knopfkönig grinst bis zu den Ohren.'),
    S('Das kann ich nicht mitansehen. Hier. Nimm den Gutschein. Aus Mitleid. Mitleid ist das teuerste Gefühl, das ich habe.'),
  ], { next: 'ende' }),
  knoten('ende', [
    S('Ein Chrome-10-Gutschein. Echt. Nicht von Gutschein-Gerd, der verkauft Fälschungen. Das ist ja Markenpiraterie!', 'signatur'),
  ], { effects: [geschenk('chrome-10-gutschein'), flag('sybella_feilschduell'), xp(40)] }),
]);

/** ♥4 (Schrottmarkt, Di/Sa abends): Die Spielfigur erkennt die Verkleidung. */
const he4 = dialog('he-sybella-chrome-4', [
  knoten('start', [
    erz('Wieder der Schrottmarkt. Wieder Kopftuch und Sonnenbrille. Aber diesmal rutscht beim Feilschen die Brille, und darunter blitzen rote Kontaktlinsen auf. Mit Chrome-Logo.'),
  ], {
    choices: [
      { text: '„Guten Abend, Frau Chrome.“', next: 'erkannt' },
      {
        text: 'Leise: „Deine Ohrringe kosten mehr als der Markt. Und Rot trägt hier unten keiner freiwillig.“', tag: '[Straße 4]',
        check: pruefung('he-sybella-chrome-4-detail', 'strasse', 4, ['durchschauen']), next: 'detail', effects: [herz(ID, 20)],
      },
      { text: 'So tun, als hättest du nichts gesehen.', next: 'schweigen', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('erkannt', [
    S('Psst! PSST! Bist du wahnsinnig?', 'ueberrascht'),
    erz('Sie zieht dich hinter einen Stapel Autoreifen.'),
  ], { next: 'geheimnis', effects: [herz(ID, 40)] }),
  knoten('detail', [
    S('Die Ohrringe. Natürlich. Ich wusste es. Seraphina hat gesagt, ich soll die Plastikperlen nehmen. Plastik! Ich!', 'wut'),
  ], { next: 'geheimnis', effects: [herz(ID, 30)] }),
  knoten('schweigen', [
    erz('Du drehst dich um und prüfst sehr interessiert einen Eimer Schrauben. Hinter dir ein erleichtertes Ausatmen.'),
    S('Danke. Das war … das war diskret. Das ist das Teuerste, was man auf diesem Markt kaufen kann.'),
  ], { next: 'geheimnis' }),
  knoten('geheimnis', [
    S('Hör zu. Wenn das rauskommt, lacht die ganze Oberstadt. „Sybella Chrome feilscht um Siebe.“ Ich könnte nie wieder Golf spielen. Ich spiele kein Golf. Aber trotzdem.', 'besorgt'),
    S('Du verrätst nichts, ich gebe dir … zwei Prozent Rabatt auf mein Schweigen. Nein. Fünf. Du kriegst fünf Prozent Freundschaft.'),
    ich('Fünf Prozent Freundschaft?'),
    S('Das ist sehr viel. Meine Schwestern haben drei.', 'freude'),
  ], { effects: [flag('sybella_enttarnt'), xp(60)] }),
]);

/** ♥6 (Boutique, tags, act2): Ihre Bücher zeigen „Projekt Schwarm“. */
const he6 = dialog('he-sybella-chrome-6', [
  knoten('start', [
    erz('Hinterzimmer der Boutique. Sybella sitzt vor einem aufgeschlagenen Kassenbuch und rechnet mit dem Abakus. Der Abakus klappert, als hätte er Angst.'),
    S('Komm her. Sieh dir das an. Nein, setz dich nicht, da liegen die Quittungen von 2079.', 'besorgt'),
    S('Zwölf Millionen, an eine Firma, die es nicht gibt. „Infrastruktur Schwarm“. Ich finde alles. Jeden Cent. Diesen nicht.'),
  ], {
    choices: [
      {
        text: 'Die Buchungen nachrechnen und den Querverweis suchen.', tag: '[Technik 5]',
        check: pruefung('he-sybella-chrome-6-buecher', 'technik', 5, ['raetsel']), next: 'gefunden', effects: [herz(ID, 50)],
      },
      { text: '„Frag Blade direkt. Er liebt es, über Geld zu reden.“', next: 'blade', effects: [herz(ID, 30)] },
      { text: '„Schwarm. Hab ich schon mal gehört. Im Foyer.“', when: { flag: 'blade_fuehrung_zahlen' }, next: 'gefunden', effects: [herz(ID, 50)] },
    ],
  }),
  knoten('gefunden', [
    erz('Ihr legt die Seiten nebeneinander. Die zwölf Millionen tauchen wieder auf: als Rechnung des Quantum-Labors. „Serverkern, Erweiterung Sendeleistung, 4.000 Endpunkte“.'),
    S('Viertausend. Wie die Gäste der Releaseparty. Ich habe die Gästeliste kalkuliert. Viertausend Häppchen.', 'trauer'),
    S('Er will sie alle chippen. Auf unserer Party. Mit unserem Champagner. Und ich habe den Champagner auch noch günstig eingekauft!', 'wut'),
  ], { next: 'ende', effects: [flag('sybella_schwarm_beweis')] }),
  knoten('blade', [
    S('Hab ich. Er hat gesagt: „Liebste Sybella, Geld ist eine Frage des Vertrauens.“ Dann hat er mir einen Gutschein geschenkt. Einen Chrome-10-Gutschein. Meinen eigenen!', 'wut'),
  ], { next: 'ende' }),
  knoten('ende', [
    S('Ich mache Kopien. Drei. Eine für mich, eine für den Tresor, eine für dich. Ich verschenke nichts. Das ist eine Investition in mein Gewissen.'),
  ], { effects: [flag('sybella_buecher'), xp(80)] }),
]);

/** ♥8 (Schrottmarkt, Flohmarkt, So tags, act2): gemeinsamer Flohmarktstand (+5 % über akt-flohmarkt). */
const he8 = dialog('he-sybella-chrome-8', [
  knoten('start', [
    erz('Sonntagsflohmarkt. Ein Stand mit roter Tischdecke und einem Schild: „FRAU ROT & PARTNER“. Sybella winkt dich mit beiden Armen heran.'),
    S('Partner! Da bist du! Ich habe dich eingetragen. Ohne zu fragen. Das ist eine feindliche Übernahme, aber eine freundliche.', 'freude'),
    S('Heute verkaufen wir. Zusammen. Ich rechne, du lächelst. Oder du rechnest und ich lächle. Nein. Ich rechne.'),
  ], {
    choices: [
      {
        text: 'Hinter den Stand stellen und loslegen.',
        effects: [{
          minigame: 'akt-flohmarkt', level: 2, key: 'sybella-flohmarkt', label: 'Frau Rot & Partner',
          win: [{ dialogue: 'he-sybella-chrome-8-danach' }, herz(ID, 40)],
          lose: [{ dialogue: 'he-sybella-chrome-8-danach' }, herz(ID, 20)],
        }],
      },
      { text: '„Ich hol uns Kaffee und halt die Kasse fest.“', next: 'kaffee', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('kaffee', [
    erz('Du holst Kaffee. Sybella verkauft in der Zeit ein Seidentuch, drei Kassenbücher und aus Versehen den Klapptisch.'),
    S('Den Tisch hätten wir behalten sollen. Egal. Gewinn ist Gewinn. Auch wenn wir jetzt auf dem Boden stehen.', 'freude'),
  ], { next: 'ende' }),
  knoten('ende', [
    S('Ab heute: Wann immer du hier verkaufst, schick die Leute zu Frau Rot. Ich rede sie hoch. Fünf Prozent mehr. Für dich. Mindestens.', 'signatur'),
  ], { effects: [flag('sybella_flohmarkt_partner'), xp(100)] }),
]);

const he8Danach = dialog('he-sybella-chrome-8-danach', [knoten('start', [
  erz('Am Ende des Tages zählt Sybella die Kasse. Zweimal. Dreimal. Dann umarmt sie dich, ganz kurz, ganz steif, als hätte sie es irgendwo gelesen.'),
  S('Das war der beste Sonntag seit … seit immer. Ich habe gelacht. Laut. Mit Zahlen. Ich wusste nicht, dass das geht.', 'freude'),
  S('Ab heute: Wann immer du hier verkaufst, schick die Leute zu Frau Rot. Ich rede sie hoch. Fünf Prozent mehr. Für dich. Mindestens.', 'signatur'),
], { effects: [flag('sybella_flohmarkt_partner'), xp(100)] })]);

/** ♥10 (Boutique, tags, nach ♥8): Geschäftspartnerschaft, goldene-kundenkarte. */
const he10 = dialog('he-sybella-chrome-10', [
  knoten('start', [
    erz('Boutique „Chrome & Co.“, nach Ladenschluss. Auf der Theke liegt ein Vertrag, sechzig Seiten, in rotes Leder gebunden. Daneben ein goldener Füller.'),
    S('Geschäftspartnerschaft. Fünfzig zu fünfzig. Ich habe es zwölfmal durchgerechnet. Es lohnt sich für mich nicht. Ich will es trotzdem.', 'besorgt'),
    S('Weißt du, warum? Weil du nie versucht hast, mir etwas zu verkaufen. Alle wollen mir etwas verkaufen. Du hast mit mir gefeilscht. Das ist Respekt.'),
  ], {
    choices: [
      { text: 'Unterschreiben.', next: 'unterschrift' },
      { text: '„Ich les erst Seite 47.“', next: 'seite', effects: [herz(ID, 20)] },
    ],
  }),
  knoten('seite', [
    erz('Seite 47, Absatz 3: „Im Falle von Streit entscheidet ein Feilschduell auf dem Schrottmarkt, Dienstag oder Samstag, nach Sonnenuntergang.“'),
    S('Du hast Seite 47 gelesen. Niemand liest Seite 47. Ich liebe dich. Geschäftlich.', 'freude'),
  ], { next: 'unterschrift' }),
  knoten('unterschrift', [
    erz('Der Füller kratzt. Sybella stempelt dreimal, mit drei verschiedenen Stempeln. Dann überreicht sie dir eine Karte aus echtem Gold, so schwer, dass sie in der Tasche zieht.'),
    S('Die goldene Kundenkarte. Die einzige. Damit bekommst du überall in der Oberstadt den Preis, den ich bekommen würde. Den bekommt sonst keiner. Nicht mal Seraphina.'),
    S('Ich verschenke nichts. Aber Partner beschenkt man nicht. Partner teilt man mit.', 'signatur'),
  ], { effects: [geschenk('goldene-kundenkarte'), flag('sybella_partnerschaft'), xp(250)] }),
]);

// ---------------------------------------------------------------------------------------------- Rivalität

const re2 = dialog('re-sybella-chrome-2', [knoten('start', [
  erz('An jedem Stand hängt ein neues Schild, rot, mit Goldrand: „Sonderpreis für Sie: +20 %. Mit freundlichen Grüßen, Frau Rot.“ Darunter dein Gesicht. Gut getroffen.'),
], { effects: [flag('sybella_aufschlag')] })]);

const re5 = dialog('re-sybella-chrome-5', [knoten('start', [
  erz('Der Händler, bei dem du gestern ein Geschenk bestellt hast, zuckt mit den Schultern. „Weg. Gekauft. Eine Dame mit Kopftuch, zum doppelten Preis. Sie hat gesagt, Sie würden verstehen.“'),
  erz('Auf dem leeren Regal liegt ein Zettel: „Boykott. S.“'),
], { effects: [flag('sybella_boykott'), meldung('Sybella kauft dir die Geschenke weg.')] })]);

// ---------------------------------------------------------------------------------------------- Figur

const sybella: NpcDef = {
  id: ID,
  name: 'Sybella Chrome',
  unknownName: 'Verkleidete Frau mit Sonnenbrille',
  portrait: 'sybella',
  sprite: 'sybella-walk',
  faction: 'chrome-haus',
  maxHearts: 10,
  bio: 'Die Rechnerin der Chrome-Schwestern, Rabatt-Fanatikerin, Erfinderin von „Chrome 10“. Farbe Rot. Geht dienstags und samstags verkleidet auf den Schrottmarkt feilschen. „Das ist ja Markenpiraterie!“',
  gifts: {
    loves: ['seidentuch-rot', 'chrome-10-gutschein', 'kassenbuch'],
    likes: ['alte-euromuenze', 'glitzerschrott', 'bao-dampfnudel', 'edelbrause', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['seidentuch-blau', 'planungsbrett-glas'],
    hates: ['raubkopie-stick', 'rostige-dose', 'virus-implantat'],
  },
  schedule: [
    ort('*', 'quantum-foyer', 'sybella-stand', { when: alle(PARTYNACHT, nicht(queststand('main-3-einlass', 'done'))) }),
    ort('*', 'himmelsgarten', 'vip-lounge', { when: PARTYNACHT }),
    ort('N', 'chrome-penthouse', 'schlafzimmer-rot', { when: EINBRUCH }),
    ort('T', 'schrottmarkt', 'flohmarkt', { days: ['so'] }),
    ort('M', 'chrome-penthouse', 'bibliothek'),
    ort('T', 'chrome-boulevard', 'boutique-chrome'),
    ort('A', 'schrottmarkt', 'sybella-verkleidet', { days: ['di', 'sa'] }),
    weg(),
  ],
  heartEvents: [
    { id: 'he-sybella-chrome-2', hearts: 2, map: 'schrottmarkt', time: 'abend', when: { weekday: ['di', 'sa'] }, dialogue: 'he-sybella-chrome-2' },
    { id: 'he-sybella-chrome-4', hearts: 4, map: 'schrottmarkt', time: 'abend', when: alle({ weekday: ['di', 'sa'] }, gesehen('he-sybella-chrome-2')), dialogue: 'he-sybella-chrome-4' },
    { id: 'he-sybella-chrome-6', hearts: 6, map: 'chrome-boulevard', time: 'tag', when: alle(AKT2, gesehen('he-sybella-chrome-4')), dialogue: 'he-sybella-chrome-6' },
    { id: 'he-sybella-chrome-8', hearts: 8, map: 'schrottmarkt', time: 'tag', when: alle(AKT2, { weekday: 'so' }, gesehen('he-sybella-chrome-6')), dialogue: 'he-sybella-chrome-8' },
    { id: 'he-sybella-chrome-10', hearts: 10, map: 'chrome-boulevard', time: 'tag', when: alle(AKT2, gesehen('he-sybella-chrome-8')), dialogue: 'he-sybella-chrome-10' },
    { id: 're-sybella-chrome-2', hearts: -2, map: 'schrottmarkt', dialogue: 're-sybella-chrome-2' },
    { id: 're-sybella-chrome-5', hearts: -5, map: 'glasarkaden', dialogue: 're-sybella-chrome-5' },
  ],
  talk: [
    rede('sybella-tag-rivale', rivale(ID)),
    rede('sybella-tag-markenpiraterie', alle(PARTYNACHT, PIRATERIE, { notFlag: PIRATERIE_GEDANKT })),
    rede('sybella-tag-party-foyer', alle(PARTYNACHT, nicht(queststand('main-3-einlass', 'done')))),
    rede('sybella-tag-party', PARTYNACHT),
    rede('sybella-tag-nacht', { time: 'nacht' }),
    rede('sybella-tag-gosse', alle(nichtGetroffen(ID), { origin: 'origin-gossenkind' })),
    rede('sybella-tag-oberstadt', alle(nichtGetroffen(ID), { origin: 'origin-oberstadt' })),
    rede('sybella-tag-standard', nichtGetroffen(ID)),
    rede('sybella-tag-flohmarkt', alle({ weekday: 'so' }, { time: 'tag' })),
    rede('sybella-tag-enttarnt', alle(ENTTARNT, { time: 'abend' })),
    rede('sybella-tag-verkleidet', { time: 'abend' }),
    rede('sybella-tag-bibliothek', { time: 'morgen' }),
    rede('sybella-tag-vertraut', undefined, 4),
    rede('sybella-tag-boutique'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: sybella },
  dialogues: sammle(
    T.gosse, T.oberstadt, T.nacht, T.standard, T.verkleidet, T.enttarnt, T.bibliothek, T.boutique, T.flohmarkt, T.vertraut,
    T.partyFoyer, T.party, T.rivale, he2, he4, he6, he8, he8Danach, he10, re2, re5, blumenlieferung, markenpiraterie,
  ),
  mapAdditions: {
    // Teekränzchen: Sybella erkennt die Blumenlieferung, bevor das Teekränzchen im Salon beginnt.
    'chrome-penthouse': {
      onEnter: [{
        id: 'sybella-tee-blumenlieferung', once: true, dialogue: blumenlieferung.id,
        when: alle(
          queststand('side-teekraenzchen', 'active'), { flag: 'tee_sybella_getroffen' }, { notFlag: 'tee_tee_getrunken' },
          BLUMEN, { notFlag: BLUMEN_ERKANNT },
        ),
      }],
    },
  },
};
