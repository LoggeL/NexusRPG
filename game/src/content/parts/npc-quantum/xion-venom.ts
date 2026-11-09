// Xion Venom – Sicherheitschef von Quantum mit der Venomkralle (world.md §4.3, §4.6).
// Volle Fassung für Akt 1–3 und Nachspiel; ersetzt npc-welt/xion-venom.ts (gleiche ID, Akt-1-Sätze übernommen).
// Tagesablauf nach design/plan/act23.json (npcSchedules.xion-venom, „ersetzt“), Herz-Ereignisse he-xion-venom-2…10,
// Rivalität re-xion-venom-2/5/8 (Durchsuchung, Hinterhalt, Boss). Startwert −200 nach side-digitech-geist setzt die
// Quest selbst. Später Begleiter im Nachspiel ab ♥8. Keine Romanze.
// side-xions-kralle (Duell) und pers-xion-umschulung bauen die Quest-Teile; hier Start und Verweise.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode, EncounterDef, NpcDef } from '../../../modules/contracts';
import {
  type Menue, AKT2, EPILOG, NUR_AKT2, PARTYNACHT, ab, alle, dialog, erz, flag, gesehen, geschenk, gespraech, herz, ich,
  knoten, nicht, nichtGetroffen, ort, pruefung, queststand, rede, rivale, sammle, sprecher, weg, xp, zurueck,
} from './_q';

const ID = 'xion-venom';
const X = sprecher(ID);
const RI = sprecher('ripper');
const AR = sprecher('aria');
const B = sprecher('blade');

const UMGESCHULT: Condition = queststand('pers-xion-umschulung', 'done');
const Z = zurueck('Noch was, Xion.', 'Schon gut. Ich geh.');

// ---------------------------------------------------------------------------------------------- Menü

const choices: DialogueChoice[] = [
  {
    text: '„Nachtschicht Labortrakt, Wechsel um eins. Wer hat den Plan geschrieben – du oder ein Würfel?“', tag: '[Ex-Wache]',
    when: { origin: 'origin-ex-wache' }, once: true, id: 'x-wache', next: 'wache', effects: [herz(ID, 30)],
  },
  {
    text: '„„Snacks inklusive!“ Den Spruch kennt in der Rohrsiedlung jedes Kind. Als Witz.“', tag: '[Gosse]',
    when: { origin: 'origin-gossenkind' }, once: true, id: 'x-gosse', next: 'gosse',
  },
  { text: '„Was ist das eigentlich für eine Kralle?“', once: true, id: 'x-kralle', next: 'kralle' },
  { text: '„Freiwillige wofür?“', once: true, id: 'x-freiwillige', next: 'freiwillige', when: nicht(EPILOG) },
  {
    text: '„Wie behandelt dich Blade eigentlich?“', tag: '[Xion ♥4]', requires: ab(ID, 4), when: nicht(EPILOG), once: true,
    id: 'x-blade', next: 'blade',
  },
  {
    text: '„Du sagst ständig, dass du weißt, wer ich bin. Dann beweis es. Im Ring.“', when: alle(NUR_AKT2, queststand('side-xions-kralle', 'inactive')),
    next: 'duell', effects: [{ startQuest: 'side-xions-kralle' }],
  },
  {
    text: '„Bruno sucht einen zweiten Mann an der Tür. Einen, der gut aussieht, wenn er droht.“', tag: '[Xion ♥6]', requires: ab(ID, 6),
    when: alle(EPILOG, queststand('pers-xion-umschulung', 'inactive')), next: 'umschulung', effects: [{ startQuest: 'pers-xion-umschulung' }],
  },
  {
    text: '„Ich könnte jemanden mit Kralle brauchen. Kommst du mit?“', tag: '[Xion ♥8]', requires: ab(ID, 8),
    when: alle(EPILOG, nicht({ recruited: ID })), next: 'mitkommen', effects: [{ recruit: ID }],
  },
  { text: 'Schon gut. Ich geh.' },
];

const nodes: DialogueNode[] = [
  knoten('wache', [
    X('Ich. Mit Würfel. Den Würfel hat Blade ausgesucht.', 'wut'),
    X('… Du warst Wache. Du weißt, wie das ist. Zwölf Stunden stehen und dann fragt einer, warum du nicht gelächelt hast.', 'trauer'),
    X('Der Wechsel um eins ist Mist. Ich weiß. Ich hab’s gemeldet. Dreimal. Keiner liest meine Meldungen. Ich schreib zu viele Ausrufezeichen, sagen sie.'),
  ], { choices: Z }),
  knoten('gosse', [
    X('Als Witz?', 'wut'),
    X('… Was ist der Witz? Sag’s mir. Ich lach dann später. Allein. Wenn keiner guckt.', 'besorgt'),
  ], { choices: Z }),
  knoten('kralle', [
    erz('Er hebt die rechte Hand. Fünf Klingen, grün schimmernd, jede so lang wie ein Unterarm. Er klickt sie einzeln aus, wie ein Kind, das zählt.'),
    X('Venomkralle. Quantum-Prototyp Nummer zwei. Nummer eins hat Alesa abgefackelt.', 'signatur'),
    X('Die Leute denken, ich hab sie, weil ich gefährlich bin. Ich hab sie, weil keiner was anderes mit ihr anfangen konnte. Wie mit mir.'),
  ], { choices: Z }),
  knoten('freiwillige', [
    X('Für die Zukunft. Chip-Test. Man kriegt Snacks. Und danach ist man glücklich. Immer. Total.', 'signatur'),
    X('Ich hab keinen genommen. Ich bin nicht dumm. Glücklich sein ist was für Leute, die nicht aufpassen müssen.'),
  ], { choices: Z }),
  knoten('blade', [
    X('„Meine grobe Arbeit.“ So nennt er mich. Vor Gästen. „Darf ich vorstellen, meine grobe Arbeit.“', 'wut'),
    X('Ich hab ihm in der Digitech-Nacht den Rücken freigehalten. Hab die Wachen abgezogen. Für ihn. Und er hat mir nicht mal die Hand gegeben. Weil die Kralle sein Hemd zerreißen könnte.', 'trauer'),
    X('Ich bin nicht dumm. Ich weiß, wer er ist. Ich hab nur gehofft, ich irre mich.'),
  ], { choices: Z, effects: [herz(ID, 20)] }),
  knoten('duell', [
    X('Im Ring.', 'ueberrascht'),
    erz('Ein Grinsen kriecht über sein Gesicht wie ein Riss durch Beton.'),
    X('Samstag. Nachts. Schrottring an der Hafenkante. Ich bin nicht dumm. Ich weiß, wer du bist. Und Samstag weiß es die ganze Hafenkante.', 'signatur'),
  ], { choices: Z }),
  knoten('umschulung', [
    X('Türsteher. Im High Voltage. Wo die Leute mich mit Pfandflaschen beworfen haben, als ich noch Werbung gemacht hab.', 'besorgt'),
    X('… Bruno ist ein Profi. Ich hab ihn mal beobachtet. Er sagt „Nur Gäste mit Stil“ und alle nicken. Wenn ich was sage, rennen alle.'),
    X('Okay. Bring’s mir bei. Wie man Leute wegschickt, ohne dass sie Angst haben. Nur ein bisschen Angst.'),
  ], { choices: Z }),
  knoten('mitkommen', [
    X('Ich? Mit euch? Mit der Crew, die mich …', 'ueberrascht'),
    X('Ja. Gut. Aber ich lauf vorne. Und wenn einer fragt, ich bin der Gefährliche.', 'freude'),
  ], { choices: Z }),
];

const M: Menue = { zeile: X('Noch was? Mach schnell. Ich bin im Dienst. Ich bin immer im Dienst.'), choices, nodes };

// ---------------------------------------------------------------------------------------------- Tagesgespräche

const T = {
  // Akt-1-Sätze aus npc-welt/xion-venom.ts (gleiche IDs).
  exwache: gespraech('xion-tag-exwache', [
    X('Du. Du bist die, die gekündigt hat. Ich vergess keine Dienstnummer. Ich bin nicht dumm. Ich weiß, wer du bist.'),
  ], M),
  gosse: gespraech('xion-tag-gosse', [
    X('„Freiwillige gesucht – Snacks inklusive!“ Was glotzt du so? Den Spruch hab ich selbst geschrieben.'),
    erz('Du kennst den Spruch. Er steht seit Wochen an jeder Ecke. Er wird nicht besser.'),
  ], M),
  container: gespraech('xion-tag-container', [
    erz('Zwischen den Containern glimmt eine Zigarette. Eine Hand mit langen Metallkrallen schnippt die Asche weg.'),
    X('Verpiss dich vom Hafen. Hier ist nichts. Und wenn hier was wär, wärst du nicht hier gewesen.'),
  ], M),
  standard: gespraech('xion-tag-standard', [
    erz('Ein Hüne in Quantum-Uniform lehnt an einem Werbestand voller Flyer und Snacktüten. Seine rechte Hand ist eine Kralle.'),
    X('Freiwillige gesucht! Snacks inklusive! … Du nicht. Du siehst aus, als würdest du die Snacks klauen.'),
  ], M),
  werbestand: gespraech('xion-tag-werbestand', [
    X('Ah. Du. Willst du einen Keks? Die sind mit Quantum-Logo. Das Logo schmeckt nach Pappe. Der Rest auch.', 'signatur'),
  ], M),
  foyer: gespraech('xion-tag-foyer', [
    erz('Xion steht im Foyer neben der Drehtür, die Arme verschränkt, die Kralle eingefahren. Er sieht dich und fährt sie langsam aus.'),
    X('Ich bin nicht dumm. Ich weiß, wer du bist. Ich weiß, wo du wohnst. Ich weiß, was du frühstückst. Synth-Nudeln. Kalt. Ekelhaft.', 'wut'),
  ], M),
  zentrale: gespraech('xion-tag-zentrale', [
    erz('Die Sicherheitszentrale: vierzig Bildschirme, auf einem davon läuft heimlich eine Kochsendung. Xion schaltet hastig um.'),
    X('Das war … Überwachung. Eines Kochs. Der ist verdächtig. Er benutzt zu viel Butter.', 'besorgt'),
  ], M),
  patrouille: gespraech('xion-tag-patrouille', [
    X('Campus nach Mitternacht. Keiner hier außer mir, den Drohnen und dir. Rate mal, wer von uns hier nicht hingehört.', 'wut'),
  ], M),
  ring: gespraech('xion-tag-ring', [
    erz('Der alte Schrottring an der Hafenkante. Xion schlägt auf einen Sandsack ein, bis der Sand rieselt. Dann schlägt er auf den Sand.'),
    X('Samstag ist Ringtag. Hier unten zählt nicht, wer man ist. Nur, wer stehen bleibt.'),
  ], M),
  kanal: dialog('xion-tag-kanal', [knoten('start', [
    X('Weg hier. Ich hab einen Termin. Mit Ripper. Geschäftlich. Sechshundert Credits geschäftlich.', 'wut'),
  ])]),
  party: dialog('xion-tag-party', [knoten('start', [
    erz('Xion steht am Rand der Glastanzfläche, in einem Smoking, der über der Kralle aufgerissen ist. Er versucht, im Takt zu nicken.'),
    X('Blade hat gesagt, ich soll mich unters Volk mischen. Ich misch mich. Siehst du? Ich nicke.', 'besorgt'),
    X('Wenn du Ärger machst, hör ich auf zu nicken.'),
  ])]),
  arbeitslos: gespraech('xion-tag-arbeitslos', [
    erz('Schrottmarkt, mittags. Xion sitzt auf einer Kiste, vor ihm ein Pappschild: „Ex-Sicherheitschef sucht Arbeit · kann drohen, heben, stehen“.'),
    X('Keiner will mich. Die Leute sagen, ich hab ihre Kinder erschreckt. Hab ich. Aber nur die frechen.', 'trauer'),
  ], M),
  tuersteher: gespraech('xion-tag-tuersteher', [
    erz('Vor dem High Voltage, unter dem Neonblitz. Xion im schwarzen Hemd neben Bruno, die Kralle mit einem Samtüberzug versehen. Er nickt dir zu, ganz professionell.'),
    X('Nur Gäste mit Stil. … Du darfst trotzdem rein.', 'freude'),
  ], M),
  rivale: dialog('xion-tag-rivale', [knoten('start', [
    X('Du. Ich bin nicht dumm. Ich weiß, wer du bist. Und heute Nacht weiß es jede Streife in der Stadt.', 'wut'),
  ], {
    choices: [
      {
        text: 'Ihm einen Krallen-Schleifstein hinwerfen.', when: { item: 'klauen-schleifstein' }, next: 'stein',
        effects: [{ take: 'klauen-schleifstein' }, { reconcile: ID }],
      },
      {
        text: '„Dann klären wir das wie Erwachsene. Im Ring.“', when: alle(AKT2, queststand('side-xions-kralle', 'inactive')),
        next: 'ring', effects: [{ startQuest: 'side-xions-kralle' }],
      },
      { text: 'Rückwärts weggehen. Langsam.' },
    ],
  }), knoten('stein', [
    erz('Er fängt den Schleifstein mit der Kralle. Dreht ihn. Schnuppert sogar daran.'),
    X('Echter Schleifstein. Aus Rippers Praxis. Der teure.', 'ueberrascht'),
    X('… Okay. Ich hör auf mit den Durchsuchungen. Aber nur, weil der Stein gut ist. Nicht wegen dir.'),
  ]), knoten('ring', [X('Samstag. Nacht. Schrottring. Bring einen Sanitäter mit. Für dich.', 'signatur')])]),
};

// ---------------------------------------------------------------------------------------------- Herz-Ereignisse

/** ♥2 (Werbestand, abends, ab Akt 1): Er will ein besseres Werbeplakat. Es kommt nur eine Taube. */
const he2 = dialog('he-xion-venom-2', [
  knoten('start', [
    erz('Neon-Gasse, abends. Xion steht vor seinem Werbestand und starrt auf ein neues Plakat. „QUANTUM SUCHT DICH! (Freiwillige)“. Das „DICH“ ist größer als der Rest. Viel größer.'),
    X('Seit drei Wochen steh ich hier. Null Freiwillige. Eine Oma hat sich einen Keks genommen und mir auf die Stiefel gespuckt.', 'wut'),
    X('Du. Du kommst von hier. Was muss da draufstehen, damit die Leute kommen?'),
  ], {
    choices: [
      {
        text: '„„Gratis Essen. Keine Fragen.“ Mehr liest hier unten keiner.“', tag: '[Straße 4]',
        check: pruefung('he-xion-venom-2-spruch', 'strasse', 4), next: 'spruch', effects: [herz(ID, 50)],
      },
      {
        text: '„Lächle. Einmal. Auf dem Foto.“', tag: '[Ausstrahlung 4]',
        check: pruefung('he-xion-venom-2-laecheln', 'ausstrahlung', 4, ['ueberreden']), next: 'laecheln', effects: [herz(ID, 50)],
      },
      { text: '„Häng die Kralle drauf. Leute kommen gucken, ob sie echt ist.“', next: 'kralle', effects: [herz(ID, 30)] },
      { text: '„Vielleicht: „Lauft!““', next: 'lauft', effects: [herz(ID, -10)] },
    ],
  }),
  knoten('spruch', [erz('Xion kritzelt mit einem Edding drüber: „GRATIS ESSEN. KEINE FRAGEN.“ Er tritt zurück. Er nickt. Er wartet.')], { next: 'taube' }),
  knoten('laecheln', [
    erz('Xion versucht es. Sein Gesicht macht etwas, das Mundwinkel normalerweise nicht dürfen. Ein Kind in der Nähe beginnt zu weinen.'),
    X('So?', 'freude'),
    ich('… Fast. Wir arbeiten dran.'),
  ], { next: 'taube' }),
  knoten('kralle', [erz('Er klebt die Kralle mit Klebeband neben das Plakat, nur kurz, zum Testen. Die Klebestreifen reißen. Er klebt sie nochmal. Er sieht sehr konzentriert aus.')], { next: 'taube' }),
  knoten('lauft', [X('„Lauft.“ Das ist kein Werbespruch. Das ist eine Warnung.', 'wut'), X('… Wobei. Das würde passen.')], { next: 'taube' }),
  knoten('taube', [
    erz('Ihr wartet. Fünf Minuten. Zehn. Dann landet etwas auf dem Stand. Eine Taube. Sie pickt einen Quantum-Keks an, guckt Xion an und bleibt sitzen.'),
    X('Eine Freiwillige.', 'ueberrascht'),
    erz('Er sieht die Taube an wie ein Wunder. Er schreibt sie in die Liste. Name: „Taube“. Grund: „Keks“.'),
    X('Eins mehr als gestern. Das ist Wachstum. Danke. Ich mein … ja. Verpiss dich jetzt. Aber danke.', 'freude'),
  ], { effects: [flag('xion_taube'), xp(40)] }),
]);

/** ♥4 (Container 77, Di nachts): ertappt mit Ripper; Passierschein gegen Schweigen. */
const he4 = dialog('he-xion-venom-4', [
  knoten('start', [
    erz('Container 77, Dienstag, kurz nach Mitternacht. Die Tür steht einen Spalt offen. Drinnen: Xion und Ripper, zwischen ihnen eine Kiste Implantate mit Quantum-Prägung.'),
    RI('Achtzig für die Kiste. Und wenn du nochmal auf meine Schuhe tropfst, ziehe ich dir die Kralle ohne Narkose.'),
    X('Hundert. Die sind fast neu. Nur einmal eingebaut. Kurz.'),
    erz('Ein Kronkorken knirscht unter deinem Stiefel. Zwei Köpfe drehen sich zu dir.'),
    X('Scheiße.', 'ueberrascht'),
    RI('Ach, wie schön. Publikum. Ich geh dann mal. Xion, das regelst du. Du regelst ja so gern.'),
    erz('Ripper verschwindet mit der Kiste in der Dunkelheit. Xion bleibt. Die Kralle fährt aus, langsam, Klinge für Klinge.'),
    X('Du hast nichts gesehen. Ich bin nicht dumm. Ich weiß, was du gesehen hast. Und du hast es nicht gesehen.'),
  ], {
    choices: [
      { text: '„Ich hab nichts gesehen. Was krieg ich dafür?“', when: { noItem: 'xion-passierschein' }, next: 'schein', effects: [herz(ID, 50)] },
      { text: '„Ich hab nichts gesehen. Aber ich hab Hunger.“', when: { item: 'xion-passierschein' }, next: 'geld', effects: [herz(ID, 40), { credits: 150 }] },
      {
        text: '„Warum verkauft der Sicherheitschef von Quantum Ausschuss an einen Kanalchirurgen?“', tag: '[Straße 5]',
        check: pruefung('he-xion-venom-4-warum', 'strasse', 5, ['durchschauen']), next: 'warum', effects: [herz(ID, 50)],
      },
      { text: 'Hände hoch, Mund zu, rückwärts in den Nebel.', next: 'nebel', effects: [herz(ID, 20)] },
    ],
  }),
  knoten('nebel', [
    erz('Du gehst rückwärts. Langsam. Die Kralle folgt dir mit dem Blick, nicht mit den Klingen.'),
    X('Klug. Langweilig, aber klug. Merk dir den Abend nicht. Ich merk mir dein Gesicht.', 'signatur'),
  ], { next: 'ende' }),
  knoten('schein', [
    erz('Er zieht einen zerknitterten Zettel aus der Brusttasche. Grüne Tinte, eine Unterschrift wie ein Krallenkratzer.'),
    X('Passierschein. Öffnet Türen auf dem Campus. Wenn keiner genau hinguckt. Und keiner guckt genau hin, weil alle Angst vor mir haben.', 'signatur'),
    X('Wir sind quitt. Und du warst nie hier.'),
  ], { next: 'ende', effects: [geschenk('xion-passierschein')] }),
  knoten('geld', [
    X('Hunger. Hier.', 'wut'),
    erz('Er drückt dir einen Packen Credits in die Hand, ohne nachzuzählen. Zu viele. Er merkt es. Er sagt nichts.'),
  ], { next: 'ende' }),
  knoten('warum', [
    X('Weil Blade mir seit drei Jahren keine Gehaltserhöhung gibt. „Grobe Arbeit wird nach Gewicht bezahlt, nicht nach Stunden.“', 'wut'),
    X('Ich wiege hundertzwanzig Kilo. Rechne mal. Ich hab’s gerechnet. Es kommt zu wenig raus.', 'trauer'),
    erz('Er zieht einen Passierschein aus der Tasche und hält ihn dir hin, ohne hinzusehen.'),
    X('Nimm. Bevor ich’s mir überleg.'),
  ], { next: 'ende', effects: [geschenk('xion-passierschein')] }),
  knoten('ende', [
    X('Und wenn du Ripper erzählst, dass ich nett war, bring ich dich um. Nett. Aber um.', 'signatur'),
  ], { effects: [flag('xion_ripper_geheimnis'), xp(60)] }),
]);

/** ♥6 (Foyer, morgens, act2): „Dumpfbacke“ – die Spielfigur zeigt ihm einen Kopfrechentrick. */
const he6 = dialog('he-xion-venom-6', [
  knoten('start', [
    erz('Quantum-Foyer, früher Morgen. Aus dem Lautsprecher über der Drehtür knackt Blades Stimme: „Xion, Dumpfbacke, sieben mal acht? Für die Gästeliste. Heute noch.“'),
    erz('Xion steht vor dem Empfangsterminal und zählt an der Kralle ab. Er hat nur fünf Klingen. Er ist bei der dritten Runde.'),
    X('Sechsundfünfzig. Oder fünfundsechzig. Eins davon. Die Zahlen drehen sich, wenn ich hingucke.', 'besorgt'),
    X('Guck nicht so. Ich bin nicht dumm. Ich bin nur … in Zahlen nicht schlau.'),
  ], {
    choices: [
      {
        text: '„Neunerreihe mit den Fingern: Finger runter, links zählen, rechts zählen. Für den Rest: Verdoppeln, verdoppeln, verdoppeln.“',
        tag: '[Technik 4]', check: pruefung('he-xion-venom-6-trick', 'technik', 4, ['erklaeren']), next: 'trick', effects: [herz(ID, 60)],
      },
      { text: '„Sieben mal acht: Fünf, sechs, sieben, acht. 56 = 7 × 8. Die Zahlen stehen der Reihe nach.“', next: 'reihe', effects: [herz(ID, 50)] },
      { text: '„Sag halt „ungefähr sechzig“. Blade kann’s eh nicht nachprüfen.“', next: 'ungefaehr', effects: [herz(ID, 30)] },
    ],
  }),
  knoten('trick', [
    erz('Du zeigst es ihm an den Fingern. Er macht es nach. An der Kralle geht es nicht, also nimmt er die linke Hand. Er macht es nochmal. Und nochmal.'),
    X('Neun mal vier. Finger runter. Drei … sechs. Sechsunddreißig. SECHSUNDDREISSIG!', 'freude'),
    erz('Die Empfangsdame zuckt zusammen. Xion drückt den Sprechknopf.'),
    X('Sechsundfünfzig, Chef. Und neun mal vier ist sechsunddreißig. Falls Sie’s mal brauchen.'),
    B('… Danke, Xion. Das ist … erstaunlich.'),
  ], { next: 'ende' }),
  knoten('reihe', [
    X('Fünf, sechs, sieben, acht.', 'ueberrascht'),
    erz('Er murmelt es. Dreimal. Fünfmal. Dann drückt er den Sprechknopf, sehr gerade, sehr stolz.'),
    X('Sechsundfünfzig, Chef. Wie die Reihe. Fünf, sechs, sieben, acht.'),
  ], { next: 'ende' }),
  knoten('ungefaehr', [
    X('Ungefähr sechzig, Chef.', 'signatur'),
    B('Ungefähr? Xion, du Dumpfbacke …'),
    erz('Xion lässt den Knopf los. Sein Kiefer mahlt.'),
    X('Das nächste Mal weiß ich’s. Dann sag ich’s genau. Und dann sag ich ihm, er soll’s selbst rechnen.'),
  ], { next: 'ende' }),
  knoten('ende', [
    erz('Xion sieht dich an. Zum ersten Mal ohne Kralle in der Haltung.'),
    X('Weißt du, wie viele Leute mich schon Dumpfbacke genannt haben? Alle. Weißt du, wie viele mir was erklärt haben? Du.', 'trauer'),
    X('Ich weiß, wer du bist. Ich hab’s immer gesagt. Jetzt weiß ich’s anders.'),
  ], { effects: [flag('xion_rechentrick'), xp(80)] }),
]);

/** ♥8 (Nachspiel, Schrottmarkt): Jobbörse. Start pers-xion-umschulung. */
const he8 = dialog('he-xion-venom-8', [
  knoten('start', [
    erz('Schrottmarkt, Mittag. Eine improvisierte Jobbörse: drei Tische, ein Pappschild „ARBEIT FÜR EX-QUANTUM“. Xion steht in der Schlange, zwischen einem Ex-Buchhalter und einem Kantinenroboter.'),
    erz('Am Tisch vorne schüttelt die Vermittlerin den Kopf, bevor er überhaupt etwas sagt.'),
    X('Sie hat nicht mal gefragt. Sie hat die Kralle gesehen und „Nein“ gesagt. Zwei Buchstaben. Vier. Egal.', 'trauer'),
    X('Ich kann was. Ich kann stehen. Ich kann gucken. Ich kann Leute davon überzeugen, dass sie woanders sein wollen.'),
  ], {
    choices: [
      { text: '„Das ist ein Türsteher. Das bist du schon die ganze Zeit.“', next: 'tuer' },
      {
        text: '„Komm mit. Wir reden mit Bruno. Ich bürge für dich.“', tag: '[Ausstrahlung 5]',
        check: pruefung('he-xion-venom-8-buergen', 'ausstrahlung', 5, ['ueberreden']), next: 'buergen', effects: [herz(ID, 40)],
      },
    ],
  }),
  knoten('tuer', [X('Türsteher. Im High Voltage? Da, wo die Leute …', 'besorgt'), X('… Bruno ist ein Profi. Wenn er mich nimmt, dann bin ich auch einer.')], { next: 'start-quest' }),
  knoten('buergen', [
    X('Du bürgst? Für mich? Weißt du, was ich gemacht hab?', 'ueberrascht'),
    ich('Ja. Darum ja.'),
    erz('Xion starrt dich an, dann den Boden, dann wieder dich. Die Kralle hängt locker an seiner Seite.'),
  ], { next: 'start-quest' }),
  knoten('start-quest', [
    X('Okay. Neon-Gasse. Bruno. Ich zieh das schwarze Hemd an. Das, wo die Kralle durchpasst.', 'freude'),
  ], { effects: [{ startQuest: 'pers-xion-umschulung' }, xp(100)] }),
]);

/** ♥10 (Nachspiel, HV-Eingang nachts, nach pers-xion-umschulung): Türsteher, Entschuldigung bei Aria, xion-vip-band. */
const he10 = dialog('he-xion-venom-10', [
  knoten('start', [
    erz('Vor dem High Voltage. Bass wummert durch die Tür. Xion und Bruno stehen nebeneinander wie zwei Ausrufezeichen. Dann kommt Aria die Gasse runter, den Schläger über der Schulter.'),
    AR('Na sieh mal an. Der Mann, der mich an Ripper verscherbeln wollte. Mit Fliege.', 'wut'),
    erz('Xion tritt einen Schritt vor. Bruno legt ihm die Hand auf die Schulter. Xion schüttelt sie ab, nicht unfreundlich.'),
    X('Aria. Ich … hab dich verkauft. Sechshundert Credits. Für deinen Arm. Du lagst da und hast geschlafen, und ich hab gerechnet. Schlecht gerechnet.', 'trauer'),
    X('Es tut mir leid. Nicht weil ich jetzt hier steh. Sondern weil es falsch war. Das weiß ich jetzt. Ich bin nicht dumm.'),
  ], {
    choices: [
      { text: 'Aria ansehen. Abwarten.', next: 'aria' },
      { text: '„Er meint es ernst, Aria. Ich hab ihn rechnen sehen.“', next: 'aria', effects: [herz('aria', 10)] },
    ],
  }),
  knoten('aria', [
    AR('Hm.', 'besorgt'),
    erz('Aria tritt ganz nah an ihn ran. Sie muss den Kopf in den Nacken legen. Sie tut es so, dass es aussieht, als würde er sich ducken.'),
    AR('Wenn du mich nochmal verkaufst, mach ich aus deiner Kralle einen Schuhanzieher. Klar?'),
    X('Klar.'),
    AR('Gut. Und lass mich rein. Ohne Gästeliste.', 'freude'),
    X('Nur Gäste mit Stil.', 'signatur'),
    erz('Er hält ihr die Tür auf. Bruno grinst. Das hat noch niemand gesehen.'),
  ], { next: 'band' }),
  knoten('band', [
    erz('Als die Tür zufällt, zieht Xion etwas aus der Tasche: ein schwarzes Stoffband mit grüner Aufschrift „VIP · XION PERSÖNLICH“.'),
    X('Das ist das Einzige. Ich hab’s selbst genäht. Mit der Kralle. Drei Finger kaputt. Egal.', 'freude'),
    X('Mit dem kommst du überall rein, wo ich an der Tür steh. Und ich steh jetzt an vielen Türen.'),
  ], { effects: [geschenk('xion-vip-band'), herz('aria', 20), xp(200)] }),
]);

// ---------------------------------------------------------------------------------------------- Rivalität

const re2 = dialog('re-xion-venom-2', [knoten('start', [
  erz('Kaum biegst du in die Gasse, stellt sich dir ein Schatten in den Weg. Xion. Hinter ihm zwei Wachen mit Taschenlampen.'),
  X('Routinekontrolle. Arme hoch. Taschen leer. Ich bin nicht dumm. Ich weiß, wer du bist.', 'wut'),
  erz('Sie kippen deine Taschen aus, zählen deine Kaugummis und stecken einen davon ein. Dann lassen sie dich stehen.'),
], { effects: [flag('xion_durchsuchung'), { advanceTime: 20 }] })]);

const re5 = dialog('re-xion-venom-5', [knoten('start', [
  erz('Zwischen den Containern ein Pfiff. Zwei Gestalten in Venom-Grün springen von oben herab. Ein Funkgerät knackt: „Grüße vom Chef.“'),
], { effects: [{ battle: 'enc-rival-xion-hinterhalt' }] })]);

const re8 = dialog('re-xion-venom-8', [
  knoten('start', [
    erz('Campus, nach Mitternacht. Die Scheinwerfer gehen alle gleichzeitig an, und mitten im Licht steht Xion, die Kralle ausgefahren, vier Rekruten hinter sich.'),
    X('Jetzt. Hier. Keine Kameras. Nur du und ich und meine Jungs.', 'wut'),
  ], {
    choices: [
      { text: 'Kämpfen.', effects: [{ battle: 'enc-rival-xion-boss' }] },
      {
        text: '„Blade nennt dich „grobe Arbeit“. Willst du für den kämpfen?“', tag: '[Ausstrahlung 7]',
        check: pruefung('re-xion-venom-8-worte', 'ausstrahlung', 7, ['ueberreden']), next: 'worte',
      },
    ],
  }),
  knoten('worte', [
    erz('Xion erstarrt. Einer der Rekruten kichert. Xion dreht sich nicht um, aber das Kichern hört schlagartig auf.'),
    X('… Abmarsch. Alle. Ich hab Kopfweh.', 'trauer'),
  ], { effects: [{ reconcile: ID }, xp(150)] }),
]);

const encounters: EncounterDef[] = [
  {
    id: 'enc-rival-xion-hinterhalt', name: 'Venom-Hinterhalt', arena: 'arena-hafen',
    enemies: [{ enemy: 'venom-rekrut', count: 2 }, { enemy: 'spaeherdrohne' }],
    start: 'hinterhalt', canFlee: true,
    intro: [{ speaker: 'narrator', text: '„Der Chef sagt, wir sollen dir nicht wehtun. Nur ein bisschen.“' }],
    reward: { xp: 120, credits: 60 },
  },
  {
    id: 'enc-rival-xion-boss', name: 'Xion stellt dich', arena: 'arena-labor-quantum',
    enemies: [{ enemy: 'boss-xion' }, { enemy: 'venom-rekrut', count: 2 }],
    canFlee: false,
    intro: [{ speaker: 'xion-venom', text: 'Ich bin nicht dumm. Ich weiß, wer du bist. Und gleich weiß ich, wie du liegst.' }],
    onWin: [{ reconcile: ID }, { message: 'Xion liegt im Rasen und starrt in den Himmel. „Okay. Okay. Wir sind quitt.“' }],
    reward: { xp: 300, credits: 200 },
  },
];

// ---------------------------------------------------------------------------------------------- Figur

const xion: NpcDef = {
  id: ID,
  name: 'Xion Venom',
  unknownName: 'Hüne mit Metallkralle',
  portrait: 'xion',
  sprite: 'xion-walk',
  faction: 'quantum',
  maxHearts: 10,
  bio: 'Sicherheitschef von Quantum mit der „Venomkralle“. Zog in der Digitech-Nacht die Wachen ab. Blades „grobe Arbeit“, hasst es, unterschätzt zu werden. „Ich bin nicht dumm. Ich weiß, wer du bist.“',
  gifts: {
    loves: ['klauen-schleifstein', 'gruene-augenlinse', 'seltenes-implantat'],
    likes: ['volt-limo', 'synth-nudeln', 'algen-chips', 'drohnen-propeller', 'echtobst-apfel', 'hofhonig'],
    dislikes: ['liebesroman', 'plueschmoehre'],
    hates: ['rechenfibel', 'logik-raetsel-modul', 'rostige-dose', 'virus-implantat'],
  },
  // Nach dem Rechentrick (♥6) freut er sich über die Rechenfibel.
  giftVariants: [{
    when: { flag: 'xion_rechentrick' },
    gifts: {
      loves: ['klauen-schleifstein', 'gruene-augenlinse', 'seltenes-implantat'],
      likes: ['volt-limo', 'synth-nudeln', 'algen-chips', 'drohnen-propeller', 'rechenfibel', 'echtobst-apfel', 'hofhonig'],
      dislikes: ['liebesroman', 'plueschmoehre'],
      hates: ['logik-raetsel-modul', 'rostige-dose', 'virus-implantat'],
    },
  }],
  schedule: [
    ort('A,N', 'neon-gasse', 'hv-eingang', { when: alle(EPILOG, UMGESCHULT) }),
    ort('T', 'schrottmarkt', 'marktplatz-mitte', { when: EPILOG }),
    weg('*', { when: EPILOG }),
    weg('*', { when: alle(PARTYNACHT, { flag: 'xion_fehlt' }) }),
    ort('*', 'himmelsgarten', 'tanzflaeche-glas', { when: PARTYNACHT }),
    ort('*', 'pumpwerk-sieben', 'op-nische', { when: queststand('main-2-kanal', 'active') }),
    ort('N', 'hafenkante', 'container-77', { days: ['di'] }),
    ort('N', 'hafenkante', 'alte-arena', { days: ['sa'], when: alle(AKT2, nicht(queststand('side-xions-kralle', 'done'))) }),
    ort('M', 'quantum-foyer', 'xion-posten'),
    ort('T', 'quantum-foyer', 'sicherheitszentrale'),
    ort('A', 'neon-gasse', 'werbestand'),
    ort('N', 'quantum-campus', 'patrouillenweg', { when: AKT2 }),
    weg(),
  ],
  heartEvents: [
    { id: 'he-xion-venom-2', hearts: 2, map: 'neon-gasse', time: 'abend', when: { notFlag: 'epilog' }, dialogue: 'he-xion-venom-2' },
    {
      id: 'he-xion-venom-4', hearts: 4, map: 'hafenkante', time: 'nacht',
      when: alle({ weekday: 'di' }, gesehen('he-xion-venom-2'), { notFlag: 'epilog' }, nicht(queststand('side-container-77', 'active'))),
      dialogue: 'he-xion-venom-4',
    },
    { id: 'he-xion-venom-6', hearts: 6, map: 'quantum-foyer', time: 'morgen', when: alle(AKT2, { notFlag: 'epilog' }, gesehen('he-xion-venom-4')), dialogue: 'he-xion-venom-6' },
    { id: 'he-xion-venom-8', hearts: 8, map: 'schrottmarkt', time: 'tag', when: EPILOG, dialogue: 'he-xion-venom-8' },
    { id: 'he-xion-venom-10', hearts: 10, map: 'neon-gasse', time: 'nacht', when: alle(EPILOG, UMGESCHULT, gesehen('he-xion-venom-8')), dialogue: 'he-xion-venom-10' },
    { id: 're-xion-venom-2', hearts: -2, map: 'neon-gasse', time: 'abend', when: { notFlag: 'epilog' }, dialogue: 're-xion-venom-2' },
    { id: 're-xion-venom-5', hearts: -5, map: 'hafenkante', time: 'nacht', when: { notFlag: 'epilog' }, dialogue: 're-xion-venom-5' },
    { id: 're-xion-venom-8', hearts: -8, map: 'quantum-campus', time: 'nacht', when: alle(AKT2, { notFlag: 'epilog' }), dialogue: 're-xion-venom-8' },
  ],
  companion: {
    // world.md §4.6: nur im Nachspiel ab ♥8; „Kenn ich, war ich“ ab ♥10.
    recruit: alle(EPILOG, ab(ID, 8)),
    stats: {
      hp: 60, armor: 3, morale: 80,
      attributes: { technik: 2, koerper: 8, reflexe: 7, ausstrahlung: 3, strasse: 5 },
      weapon: { kind: 'nahkampf', damage: 6, range: 1, hit: 5 },
      abilities: ['xion-venom-krallengriff', 'xion-venom-sicherheitsprotokoll'],
    },
    heartAbilities: [{ hearts: 10, ability: 'xion-venom-kenn-ich-war-ich' }],
  },
  partyCheckBonus: [{ attribute: 'koerper', tags: ['einschuechtern'], value: 1, label: 'Xion knackt mit der Kralle' }],
  talk: [
    rede('xion-tag-rivale', rivale(ID)),
    rede('xion-tag-tuersteher', alle(EPILOG, UMGESCHULT)),
    rede('xion-tag-arbeitslos', EPILOG),
    rede('xion-tag-party', PARTYNACHT),
    rede('xion-tag-kanal', queststand('main-2-kanal', 'active')),
    rede('xion-tag-exwache', alle(nichtGetroffen(ID), { origin: 'origin-ex-wache' })),
    rede('xion-tag-gosse', alle(nichtGetroffen(ID), { origin: 'origin-gossenkind' })),
    rede('xion-tag-container', alle({ time: 'nacht' }, { weekday: 'di' })),
    rede('xion-tag-standard', nichtGetroffen(ID)),
    rede('xion-tag-ring', alle(AKT2, { weekday: 'sa' }, { time: 'nacht' })),
    rede('xion-tag-patrouille', alle(AKT2, { time: 'nacht' })),
    rede('xion-tag-foyer', alle(AKT2, { time: 'morgen' })),
    rede('xion-tag-zentrale', alle(AKT2, { time: 'tag' })),
    rede('xion-tag-werbestand', undefined, 2),
    rede('xion-tag-standard'),
  ],
};

export const part: ContentPart = {
  npcs: { [ID]: xion },
  dialogues: sammle(
    T.exwache, T.gosse, T.container, T.standard, T.werbestand, T.foyer, T.zentrale, T.patrouille, T.ring, T.kanal, T.party,
    T.arbeitslos, T.tuersteher, T.rivale, he2, he4, he6, he8, he10, re2, re5, re8,
  ),
  encounters: Object.fromEntries(encounters.map((e) => [e.id, e])),
};
