// Daria in Akt 2, Akt 3 und im Nachspiel (world.md §4.4, §5.3–5.5, §10.4–10.7; act23.json events/flags).
// Volle Herz-Ereignisse he-daria-8 (gegen Ripper und Chrome 10) und he-daria-10 (Bandenabzeichen), Tagesgespräche nach
// Phase (Chip-Panik, Aria/Nyra, Party, Nachspiel je Ende, Master-Modus) und das Fundbüro der Nest-Bande im Nachspiel.
// Wird von daria.ts in NpcDef.talk/heartEvents/schedule eingehängt. Nur Freundschaft (Kind).
import type { HeartEventDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  A2_CHAOS, A2_FREI, A2_OFFEN, A2_PARTY, ARIA_GECHIPPT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, GOSSE, HERZ_SPAET,
  KINDER_MEER, L, MASTER, N, NACHSPIEL, NYRA_BEFREIT, PARTYNACHT, VEX, chk, dialogs, dlg, einmal, herz, node,
} from './_dsl';

const D = 'daria';
const KANAL_AKTIV = { quest: 'main-2-kanal', state: 'active' } as const;
const PREISTAFEL = { quest: 'pers-freya-fairer-lohn', state: 'done' } as const;
const DACH_DICHT = { quest: 'pers-kinder-wasserturm', state: 'done' } as const;

export const DARIA_HE_23: HeartEventDef[] = [
  {
    id: 'he-daria-8', hearts: 8, map: 'schrottmarkt', time: 'tag',
    when: { all: [HERZ_SPAET, { not: KANAL_AKTIV }] },
    dialogue: 'dlg-he-daria-8', effects: [{ xp: 60 }],
  },
  {
    id: 'he-daria-10', hearts: 10, map: 'das-nest', time: 'morgen', when: HERZ_SPAET,
    dialogue: 'dlg-he-daria-10', effects: [{ xp: 80 }, { give: 'bandenabzeichen' }, { setFlag: 'bande_mitglied' }],
  },
];

/** Vor allen Akt-1-Sonderfällen: Master-Modus, Einmal-Gespräche der Phasen. */
export const DARIA_TALK_FRUEH: TalkDef[] = [
  { dialogue: 'daria-master', when: MASTER },
  { dialogue: 'daria-3b', when: einmal('daria-3b', ENDE_3B) },
  { dialogue: 'daria-nachspiel', when: einmal('daria-nachspiel', NACHSPIEL) },
  { dialogue: 'daria-meer', when: { all: [KINDER_MEER, { weekday: 'sa' }, { time: 'tag' }] } },
  { dialogue: 'daria-partynacht', when: PARTYNACHT },
  { dialogue: 'daria-a2-bruch', when: einmal('daria-a2-bruch', A2_CHAOS) },
  { dialogue: 'daria-a2-aria', when: einmal('daria-a2-aria', { all: [A2_FREI, ARIA_GECHIPPT] }) },
  { dialogue: 'daria-a2-party', when: einmal('daria-a2-party', A2_PARTY) },
];

/** Vor den allgemeinen Herz-Gesprächen: wiederkehrende Gespräche der Phase. */
export const DARIA_TALK_POOL: TalkDef[] = [
  { dialogue: 'daria-a2-tag', when: A2_OFFEN },
  { dialogue: 'daria-a2-nervoes', when: A2_PARTY },
  { dialogue: 'daria-nachspiel-tag', when: NACHSPIEL },
];

/** Vor die Akt-1-Einträge: Partynacht im Nest, Master-Modus drinnen, Nachspiel samstags am Meer. */
export const DARIA_SCHEDULE_23: ScheduleEntry[] = [
  { when: PARTYNACHT, place: { map: 'das-nest', at: 'karte-der-stadt' } },
  { slot: ['abend', 'nacht'], when: MASTER, place: { map: 'das-nest', at: 'karte-der-stadt' } },
  { slot: 'tag', days: ['sa'], when: KINDER_MEER, place: { map: 'das-meer', at: 'strand' } },
];

const dialogues = dialogs(
  // ------------------------------------------------------------------------------------------- Herz-Ereignis 8
  dlg('dlg-he-daria-8', [
    node('start', [N('Am Botenstand drängen sich Leute. Jemand flucht, jemand lacht, und mittendrin hört man Darias Stimme, eine Oktave höher als sonst.')], {
      choices: [
        { text: '(Hingehen.)', when: { notFlag: 'epilog' }, next: 'a' },
        { text: '(Hingehen.)', when: { flag: 'epilog' }, next: 'a-nachspiel', id: 'hingehen-nachspiel' },
      ],
    }),
    node('a-nachspiel', [
      N('Neben dem Botenstand hat jemand einen Klapptisch aufgebaut. Darauf ein Schild: „ALTGERÄTE-ANKAUF · SOFORT BARGELD · AUCH ABGESCHALTETE CHIPS“. Dahinter sitzt Ripper und lächelt wie ein Kredithai im Urlaub.'),
      N('Vor ihm ein Junge, vielleicht neun, mit einem Hörimplantat in der Faust. Fips aus der Rohrsiedlung. Hinter ihm eine Schlange bis zum Kran: Leute mit toten Chips in Tüten, die einfach nur Geld für den Meer-Bus wollen.'),
      L('ripper', 'Fünfzehn Credits, Kleiner. Dafür kriegt deine Oma ein Busticket ans Meer. Hören muss man da nix, da rauscht’s eh nur.'),
    ], { next: 'a-rest' }),
    node('a', [
      N('Neben dem Botenstand hat jemand einen Klapptisch aufgebaut. Darauf ein Schild in Quantum-Lila: „ALTGERÄTE-ANKAUF · TAUSCH GEGEN CHROME 10 · OFFIZIELLER PARTNER“. Dahinter sitzt Ripper und lächelt wie ein Kredithai im Urlaub.'),
      N('Vor ihm ein Junge, vielleicht neun, mit einem Hörimplantat in der Faust. Fips aus der Rohrsiedlung. Hinter ihm eine Schlange bis zum Kran.'),
      L('ripper', 'Fünfzehn Credits, Kleiner. Plus Gutschein. Mit Chrome 10 hört deine Oma wieder alles. Und sie gehorcht – äh, gehört. Sie gehört dazu. Zur Zukunft.'),
    ], { next: 'a-rest' }),
    node('a-rest', [
      L(D, 'Fips. Steck das weg.', 'wut'),
      L('ripper', 'Daria, Schätzchen. Geh spielen. Die Erwachsenen machen Geschäfte.'),
      L(D, 'Ich spiel nicht. Ich verhandle. Das ist ein Kessler-Hörer. Der ist hundert wert, mindestens. Und Fipsis Oma braucht ihn, nicht dein Ersatzteilregal.', 'signatur'),
      L('ripper', 'Wer hat dir denn das Rechnen beigebracht?'),
      L(D, 'Die Straße. Dieselbe wie dir. Nur hab ich nicht vergessen, wie’s ist, auf der anderen Seite vom Tresen zu stehen.'),
      N('Sie wirft dir einen schnellen Blick zu. Keinen Hilferuf. Eher eine Frage: Bleibst du stehen?'),
    ], {
      choices: [
        {
          text: '(Neben Daria treten.) „Hundert. Oder die ganze Unterstadt erfährt, für wen du einsammelst.“',
          check: chk('he-daria-8-ripper', 'strasse', 6, ['einschuechtern', 'verhandeln']),
          next: 'stark',
        },
        {
          text: '(Das Implantat ansehen.) „Kessler, Baujahr 79, Seriennummer mit K. Die baut keiner mehr. Das ist ein Sammlerstück, du Geier.“',
          check: chk('he-daria-8-technik', 'technik', 5, ['implantat', 'gutachten']),
          next: 'gutachten',
        },
        {
          text: '(Zur Schlange drehen.) „Leute! Hand hoch, wer Ripper schon mal was unter Wert verkauft hat!“',
          check: chk('he-daria-8-menge', 'ausstrahlung', 5, ['ueberreden', 'menge']),
          next: 'menge',
        },
        { text: '„Steht auf Freyas Preistafel, Ripper. Hundertzehn. Du hast unterschrieben.“', tag: '[Preistafel]', when: PREISTAFEL, next: 'tafel' },
        { text: '„Ripper. Du hast mir mal einen Milchzahn für zwei Credits abgekauft. Ich war sieben.“', tag: '[Gosse]', when: GOSSE, next: 'gosse' },
        { text: '„Ich zahl die Differenz. Hier, fünfzig. Gib dem Jungen sein Ding zurück.“', requires: { credits: 50 }, effects: [{ credits: -50 }], next: 'zahlen' },
        { text: '(Nichts sagen. Daria machen lassen.)', next: 'allein' },
      ],
    }),
    node('stark', [
      N('Ripper schaut dich an. Dann Daria. Dann die Schlange, die plötzlich sehr interessiert guckt.'),
      L('ripper', '… Achtzig. Und keiner erzählt’s rum. Ich hab einen Ruf.'),
      L(D, 'Hast du. Einen beschissenen. Achtzig ist gut. Gib her, Fips kriegt das Geld, du kriegst nix.', 'freude'),
    ], { effects: [herz(D, 60), herz('ripper', -20), { rep: 'unterstadt', delta: 5 }], next: 'drohung' }),
    node('gutachten', [
      N('Du hältst das Implantat ins Licht. Auf der Rückseite, winzig: ein K und eine Krone. Kessler-Medizintechnik, 2079. Die Firma gibt es nicht mehr. Die Hörer gibt es kaum noch.'),
      L('ripper', 'Woher weißt du so was? Das steht in keinem Katalog.', 'ueberrascht'),
      L(D, 'Hundert. Und jetzt nimmt Fips sein Gerät wieder mit, weil seine Oma es braucht. Die hundert waren nur, damit du weißt, was du nicht kriegst.', 'signatur'),
    ], { effects: [herz(D, 60), { rep: 'unterstadt', delta: 5 }], next: 'drohung' }),
    node('menge', [
      N('Erst hebt eine Hand sich. Dann drei. Dann die ganze Schlange, auch Wett-Willi, der wahrscheinlich nur mitmacht, weil alle mitmachen.'),
      N('Jemand ruft „Geier!“. Jemand anderes wirft eine Pfandflasche. Sie trifft Rippers Schild, und die Pappe knickt mitten durch.'),
      L('ripper', 'Schon gut! Schon gut! Ankauf geschlossen! Wegen … Inventur!', 'wut'),
      L(D, 'Hast du das gehört? Die haben alle die Hand gehoben. Alle. Ich dachte, ich bin die Einzige, die sich das traut.', 'ueberrascht'),
    ], { effects: [herz(D, 60), herz('ripper', -30), { rep: 'unterstadt', delta: 8 }], next: 'drohung' }),
    node('tafel', [
      N('Ripper dreht sich langsam um. An der Wand seiner Praxis hängt die Preistafel, Freyas Schönschrift, darunter seine eigene Unterschrift. Daneben ein Stempel mit einer Waage.'),
      L('ripper', 'Das war eine Laune. Ich war gerührt. Ich hatte Fieber.'),
      L(D, 'Unterschrift ist Unterschrift. Paragraf eins. Hundertzehn, Ripper. Freya kriegt sonst einen Anfall, und du willst Freya nicht mit Anfall.', 'signatur'),
      L('ripper', '… Nein. Will ich nicht.'),
    ], { effects: [herz(D, 50), herz('freya', 20), { rep: 'unterstadt', delta: 5 }], next: 'drohung' }),
    node('gosse', [
      L('ripper', 'Das … das war ein guter Zahn. Ich hab ihn noch. In einem Glas. Neben dem Kühlschrank.', 'verlegen'),
      L(D, 'Du hast seinen ZAHN gekauft? Du bist ja noch ekliger, als ich dachte. Und ich dachte schon viel.', 'wut'),
      N('Die Schlange lacht. Ripper wird rot unter seinem Monokel. Er schiebt Fips siebzig Credits hin und das Implantat gleich hinterher.'),
      L('ripper', 'Behalt das Ding. Und erzähl die Zahngeschichte nicht weiter.'),
    ], { effects: [herz(D, 50), herz('ripper', -10)], next: 'drohung' }),
    node('zahlen', [
      N('Du legst fünfzig Credits auf den Klapptisch. Ripper sieht sie an, als wären sie vergiftet.'),
      L(D, 'Nee. Nee, nee, nee. Das ist lieb, aber das ist falsch. Wenn du zahlst, lernt der Geier nur, dass irgendwer immer zahlt.', 'besorgt'),
      L(D, 'Fips kriegt dein Geld. Als Geschenk. Und Ripper kriegt das Implantat nicht. Als Lektion. Beides gleichzeitig. Ich bin effizient.', 'signatur'),
    ], { effects: [herz(D, 50), { rep: 'unterstadt', delta: 3 }], next: 'drohung' }),
    node('allein', [
      N('Daria hält Rippers Blick. Zehn Sekunden. Zwanzig. Irgendwer in der Schlange hustet. Fips hält die Luft an.'),
      L('ripper', '… Fünfzig. Weil du mich an jemanden erinnerst. Und der war auch so eine Nervensäge.'),
      L(D, 'Fünfzig. Und der Nächste kriegt auch fünfzig. Und der Übernächste. Abgemacht ist abgemacht.', 'signatur'),
      N('Sie sagt es zu Ripper, aber sie sieht dich an. Du bist stehen geblieben. Mehr wollte sie gar nicht.'),
    ], { effects: [herz(D, 80)], next: 'drohung' }),
    node('drohung', [
      N('Ripper klappt seinen Tisch zusammen. Als er an Daria vorbeigeht, beugt er sich runter.'),
      L('ripper', 'Pass auf, Kleine. Die Zeiten ändern sich dauernd in dieser Stadt. Wer allein dasteht, fällt um. Du brauchst Freunde. Große.'),
      L(D, 'Hab ich.', 'signatur'),
      N('Sie zeigt nicht auf dich. Muss sie auch nicht.'),
    ], {
      choices: [
        { text: '„Hat sie. Und die sind nachtragend, Ripper.“', effects: [herz(D, 20), herz('ripper', -10)], next: 'fips' },
        { text: '„Verpiss dich einfach, Ripper.“', effects: [herz(D, 10)], next: 'fips' },
        { text: '(Schweigen. Daria das letzte Wort lassen.)', next: 'letztes-wort' },
      ],
    }),
    node('letztes-wort', [
      L(D, 'Und ich bin selbst groß. Innen. Innen bin ich ungefähr zwei Meter.', 'freude'),
    ], { effects: [herz(D, 15)], next: 'fips' }),
    node('fips', [
      N('Fips hält noch etwas in der Hand: einen glänzenden Gutschein. „Chrome 10 – Ihr Upgrade zum Glück. Jetzt gratis.“'),
      N('Fips: „Der gilt doch noch, oder? Da steht gratis drauf …“'),
      L(D, 'Gratis ist das teuerste Wort in der ganzen Stadt. Frag meinen Vertrag. Da steht’s in Paragraf vier.'),
    ], {
      choices: [
        { text: '„Gib ihn mir. Ich kenn jemanden, der so was sammelt.“', effects: [{ give: 'chrome-10-gutschein' }], next: 'ende' },
        { text: '„Zerreiß ihn. Langsam. Das macht Spaß.“', next: 'zerreissen' },
      ],
    }),
    node('zerreissen', [
      N('Fips zerreißt den Gutschein. Erst in zwei, dann in vier, dann in so viele, dass es aussieht wie lila Schnee. Daria applaudiert. Die halbe Schlange auch.'),
    ], { effects: [herz(D, 5)], next: 'ende' }),
    node('ende', [
      N('Als alle weg sind, setzt Daria sich auf ihre Obstkiste. Ihre Knie zittern. Sie hält sie mit beiden Händen fest.'),
      L(D, 'Hast du das gesehen? Hast du das gesehen?! Mir zittern die Beine. Nicht weitersagen. Ich hab einen Ruf.', 'freude'),
      L(D, 'Weißt du, warum ich keine Angst hatte? Doch, ich hatte Angst. Aber ich wusste, wenn’s schiefgeht, stehst du da. Das ist neu. Das muss ich noch in die Bücher eintragen.', 'zaertlich'),
    ], { effects: [{ setFlag: 'daria_gegen_ripper' }] }),
  ]),

  // ------------------------------------------------------------------------------------------- Herz-Ereignis 10
  dlg('dlg-he-daria-10', [
    node('a', [
      N('Morgens im Nest. Auf der Eins!-Kiste brennt eine Kerze in einer Dose, daneben drei Dampfnudeln und ein Kartendeck. Freya hält ein Klemmbrett, Jakko hält die Luft an, Daria hält etwas hinter dem Rücken.'),
      N('Die Karte der Stadt an der Wand ist gewachsen. Lila Striche: Drohnenrouten. Kleine Glitzersterne: „Leute, die Master sagen (oder gesagt haben)“. Ein dickes Kreuz über dem Quantum-Campus, daneben: „DA WAR DIE NACHT“.'),
      L(D, 'Ruhe. Das ist offiziell. Freya, Protokoll.', 'signatur'),
      L('freya', 'Sitzung eröffnet. Anwesend: alle. Abwesend: Captain Kuschel, entschuldigt. Tagesordnungspunkt eins: Aufnahme.'),
      L(D, 'Hiermit beantrage ich, dass {name} Mitglied der Nest-Bande wird. Nicht Kundschaft. Nicht Ehrenmischer. Bande.'),
      L('jakko', 'Dafür! Ich bin dafür! Ich bin für alles, wo es danach Essen gibt!', 'freude'),
      L('freya', 'Satzung Paragraf sieben: Wer in die Bande will, muss eine Prüfung ablegen. Steht da. Hab ich gestern geschrieben.'),
    ], {
      choices: [
        { text: '(Eine Runde Eins! gegen alle drei. Gewinnen ist egal, Aufgeben nicht.)', next: 'eins' },
        {
          text: '„Bandenschwur? Den kann ich. Hand aufs Herz, Fuß auf die Kiste, Dampfnudel in den Mund.“',
          check: chk('he-daria-10-schwur', 'strasse', 5, ['gosse', 'brauch']),
          next: 'schwur',
        },
        { text: '„Ich hab keine Ahnung, wie so was geht. Zeigt’s mir.“', next: 'zeigen' },
        { text: '„Ich war schon mal auf so einer Karte. Vor zehn Jahren. Mit Kreide.“', tag: '[Gosse]', when: GOSSE, next: 'gosse' },
        { text: '„Kurierinnen-Ehrenwort: Ich liefer immer. Auch mich selbst. Pünktlich.“', tag: '[Vex]', when: VEX, next: 'vex' },
      ],
    }),
    node('eins', [
      N('Ihr spielt. Jakko legt Karten nach Farbe ab, die ihm gefallen. Freya zitiert nach jedem Zug die Regel. Daria zieht dich gnadenlos ab und grinst dabei, als hätte sie Weihnachten erfunden.'),
    ], {
      effects: [{
        minigame: 'akt-eins', level: 3, key: 'eins-bande', label: 'Eins! – Aufnahmeprüfung',
        win: [herz(D, 10), { message: 'Daria: „Glück. Pures Glück. Bestanden. Revanche nächsten Sonntag!“' }],
        lose: [herz(D, 10), { message: 'Daria: „Verloren, aber nicht gejammert. Bestanden. Das ist die eigentliche Prüfung.“' }],
      }],
      next: 'aufnahme',
    }),
    node('schwur', [
      N('Hand aufs Herz, Fuß auf die Kiste, Dampfnudel in den Mund. Du nuschelst den Schwur, den jedes Gossenkind kennt: „Keiner bleibt liegen, keiner verrät, keiner frisst allein.“'),
      L(D, 'Woher kennst du den? Den kennen nur … oh. OH. Du bist ja eine von uns. Schon die ganze Zeit.', 'ueberrascht'),
      L('jakko', 'Darf ich auch eine Dampfnudel in den Mund? Für den Schwur? Nur zur Sicherheit?'),
    ], { effects: [herz(D, 20)], next: 'aufnahme' }),
    node('zeigen', [
      L(D, 'Okay. Pass auf. Hand aufs Herz. Nicht da, das ist der Bauch. Höher. Fuß auf die Kiste. Und jetzt sag: „Keiner bleibt liegen, keiner verrät, keiner frisst allein.“', 'signatur'),
      N('Du sagst es. Jakko sagt es mit. Freya schreibt es mit. Daria hält dabei so still, als würde sie es zum ersten Mal hören.'),
      L(D, 'Gut. Bisschen schief. Aber ehrlich schief. Das zählt mehr.'),
    ], { next: 'aufnahme' }),
    node('gosse', [
      N('Du tippst auf eine Ecke der Karte. Unter Darias Filzstift schimmert noch etwas durch: ein alter Kreidestrich an der Wand, längst halb weggewaschen. Ein Pfeil, ein Kreis, ein Name.'),
      L(D, 'Das … das war schon da, als wir eingezogen sind. Ich hab immer gedacht, das hat ein Geist gemalt.', 'ueberrascht'),
      L(D, 'Du warst der Geist. Mann. Dann bist du gar nicht neu in der Bande. Dann bist du die Gründung.', 'zaertlich'),
    ], { effects: [herz(D, 20), { setFlag: 'daria_kreidegeist' }], next: 'aufnahme' }),
    node('vex', [
      L(D, 'Pünktlich? Du? Du bist gestern zwei Stunden zu spät zum Eins! gekommen, weil du „nur kurz“ übers Dach wolltest.', 'signatur'),
      L(D, 'Okay. Zählt trotzdem. Kartell ist Kartell. Ab heute bist du die schnelle Abteilung der Bande.', 'freude'),
    ], { effects: [herz(D, 15)], next: 'aufnahme' }),
    node('aufnahme', [
      L('freya', 'Prüfung bestanden. Einstimmig. Captain Kuschel hat sich enthalten, weil er nicht da ist.'),
      N('Daria holt die Hand hinter dem Rücken hervor. Ein Blechdeckel, mit einem Nagel durchgeschlagen, damit man ihn an eine Schnur fädeln kann. Darauf mit Nagellack: ein D, ein F, ein J. Und, ganz klein dazwischen, ein vierter Buchstabe.'),
      L(D, 'Das Bandenabzeichen. Wer das trägt, kriegt überall in der Unterstadt Hilfe von uns. Gratis. Das ist das Einzige, was bei mir gratis ist. Merk dir das.', 'freude'),
      L(D, 'Und jetzt musst du was auf die Karte malen. Jedes Mitglied malt einen Ort. Ich hab das Nest gemalt. Freya das Gericht. Jakko … eine Dampfnudel. Die ist kein Ort, aber er hat geweint.'),
    ], {
      choices: [
        { text: '(Das Crew-Quartier einzeichnen.) „Wenn hier was brennt: Da wohne ich. Da ist immer Platz.“', next: 'quartier' },
        { text: '(Ganz an den Rand malen, über die Karte hinaus, eine Welle.) „Das Meer.“', next: 'meer' },
        { text: '(Ein Fragezeichen über dem Quantum-Spire wegradieren und ein Ausrufezeichen hinmalen.) „Da gehen wir noch hin. Und wir kommen zurück.“', when: { notFlag: 'epilog' }, next: 'turm' },
        { text: '(Über den Quantum-Spire einen dicken grünen Haken malen.) „Erledigt.“', when: { flag: 'epilog' }, next: 'haken' },
      ],
    }),
    node('quartier', [
      L(D, 'Grüner Punkt. Dick. Mit Herz drum. Und wenn Hunter fragt, warum drei Kinder vor seiner Tür sitzen: Du hast es versprochen. Schriftlich. Freya hat’s protokolliert.', 'freude'),
    ], { effects: [herz(D, 20), { setFlag: 'nest_kennt_quartier' }], next: 'schluss' }),
    node('meer', [
      L(D, 'Das ist nicht auf der Karte. Das ist auf der Wand.', 'ueberrascht'),
      L(D, '… Dann muss die Karte eben größer werden. Ich besorg Flyer. Viele Flyer.', 'zaertlich'),
    ], { effects: [herz(D, 20), { setFlag: 'daria_karte_meer' }], next: 'schluss' }),
    node('turm', [
      L(D, 'Ihr geht da wieder rein? Da, wo die Nacht war?', 'besorgt'),
      L(D, 'Okay. Dann mal ich das Nest größer. Damit ihr wisst, wo ihr hinmüsst, wenn ihr rauskommt. Und ihr kommt raus. Das ist ein Vertrag.', 'signatur'),
    ], { effects: [herz(D, 20), { setFlag: 'daria_karte_turm' }], next: 'schluss' }),
    node('haken', [
      L(D, 'Erledigt. Mit Haken. Das ist das Schönste, was je auf dieser Karte war. Schöner als Jakkos Dampfnudel. Sag’s ihm nicht.', 'zaertlich'),
    ], { effects: [herz(D, 20), { setFlag: 'daria_karte_turm' }], next: 'schluss' }),
    node('schluss', [
      N('Freya stempelt das Protokoll. Jakko verteilt die Dampfnudeln, alle drei, und dann noch eine vierte, die er irgendwo in seiner Jacke hatte.'),
      L('jakko', 'Jetzt dürfen wir endlich essen! Ich hab die ganze Zeremonie lang an Dampfnudeln gedacht! Und an die Bande! Aber hauptsächlich an Dampfnudeln!', 'freude'),
      L(D, 'Revanche nächsten Sonntag. Für immer. Das ist auch ein Vertrag.', 'signatur'),
    ], {
      choices: [
        { text: '„Das Dach hält übrigens.“', when: DACH_DICHT, next: 'dach' },
        { text: '„Für immer, Chefin.“' },
      ],
    }),
    node('dach', [
      N('Daria guckt hoch. Keine Tropfen. Kein Eimer. Nur das Flicken aus Blech und Teer, das ihr zusammen draufgemacht habt.'),
      L(D, 'Ja. Hält. Ist das Erste in meinem Leben, das hält. Also, das Zweite.', 'zaertlich'),
    ]),
  ]),

  // ------------------------------------------------------------------------------------------- Akt 2
  dlg('daria-a2-bruch', [
    node('a', [
      N('Daria sitzt auf der Obstkiste und malt etwas auf einen Flyer. Lila Striche, viele davon.'),
      L(D, 'Da bist du. Gut. Ich hab schon gedacht, ich muss dich auf der Karte durchstreichen.', 'besorgt'),
      L(D, 'Die ganze Unterstadt redet über die Nacht am Campus. Keiner weiß was, alle wissen alles. Seitdem fliegen die Quantum-Drohnen so tief, dass Jakko eine mit dem Kochlöffel erwischt hat.'),
      L(D, 'Und wo ist die Laute? Aria? Die hat mir Armdrücken versprochen. Und die Kleine mit den Kronkorken, Nyra. Die war doch immer dabei.'),
    ], {
      effects: [{ markSeen: 'daria-a2-bruch' }],
      choices: [
        { text: '„Nyra ist noch im Turm. Und Aria … die haben ihr was in den Kopf gesteckt.“', next: 'wahrheit' },
        { text: '„Die sind beschäftigt. Erwachsenenkram.“', next: 'luege' },
        { text: '„Ich weiß es nicht, Daria. Ehrlich nicht.“', next: 'unklar' },
      ],
    }),
    node('wahrheit', [
      N('Daria legt den Stift weg. Sie sagt eine Weile nichts. Bei Daria ist eine Weile ungefähr vier Sekunden, aber es fühlt sich länger an.'),
      L(D, 'Okay. Okay. Dann ändern wir den Plan. Wir sind überall. Kinder sieht keiner. Wenn irgendwo was Lila rumfliegt oder einer „Master“ sagt, weißt du’s als Erste.', 'signatur'),
      L(D, 'Kostet nix. Ausnahmsweise. Sag’s nicht weiter.'),
    ], { effects: [herz(D, 20), { setFlag: 'kinder_augen_offen' }] }),
    node('luege', [
      L(D, 'Erwachsenenkram heißt immer: Es ist schlimm, und keiner will’s sagen. Ich bin nicht blöd. Ich bin zehn. Das ist fast elf.', 'wut'),
      L(D, 'Wenn du’s irgendwann sagen willst, ich bin hier. Die Kiste läuft nicht weg.'),
    ]),
    node('unklar', [
      L(D, 'Dann ist das ehrlich. Ehrlich ist gut. Ehrlich und scheiße, aber gut.', 'trauer'),
      L(D, 'Wir halten die Augen offen. Wenn wir was sehen, kriegst du’s. Per Kinderkurier. Express.'),
    ], { effects: [herz(D, 10), { setFlag: 'kinder_augen_offen' }] }),
  ]),

  dlg('daria-a2-aria', [
    node('a', [
      N('Daria hüpft auf und ab, was sie sonst nie tut, weil es unseriös aussieht.'),
      L(D, 'Aria war hier! Sie hat Jakko hochgehoben wie einen Sack Kartoffeln und mich gefragt, ob ich immer noch Angst vor ihr hab. Hab ich nicht. Hatte ich nie. Ein bisschen.', 'freude'),
      L(D, 'Und Dante ist jetzt bei euch? DANTE? Der verliert beim Eins! gegen ein Kissen. Ich hab’s getestet. Das Kissen hatte nur drei Karten.'),
    ], {
      effects: [{ markSeen: 'daria-a2-aria' }],
      choices: [
        { text: '„Dante ist ein Genie. Nur nicht beim Eins!.“', next: 'genie' },
        { text: '„Ohne Dante wäre Aria jetzt Konfetti.“', next: 'konfetti' },
      ],
    }),
    node('genie', [L(D, 'Genie und Wahnsinn. Hat er selbst gesagt. Ich hab’s auf die Karte geschrieben. Über die Werkstatt. In Klein, damit er nicht eingebildet wird.', 'signatur')]),
    node('konfetti', [
      L(D, 'Die Mülltonne in der Gasse ist noch verbeult. Jakko sagt, das war ein Feuerwerk. Freya sagt, das war Sachbeschädigung. Ich sag: Das war knapp.', 'besorgt'),
      L(D, 'Pass auf die Laute auf. Sie passt auf alle auf, aber auf sie passt keiner auf. Das ist ein Fehler in der Rechnung.'),
    ], { effects: [herz(D, 10)] }),
  ]),

  dlg('daria-a2-tag', [
    node('a', [
      N('Am Botenstand hängt ein neues Schild: „DROHNENWARNDIENST · 2× PFEIFEN = LILA AM HIMMEL · 3× PFEIFEN = RENNEN“.'),
      L(D, 'Neues Geschäftsfeld. Die Leute zahlen dafür, dass wir pfeifen. Das ist das beste Geschäft, das ich je hatte. Pfeifen kostet nix.', 'signatur'),
    ], {
      choices: [
        { text: '„Was hört man so auf der Straße?“', next: 'geruechte' },
        { text: '„Wie viele sagen inzwischen ‚Master‘?“', next: 'master' },
        { text: '„Hast du von Nyra was gehört?“', when: { not: NYRA_BEFREIT }, next: 'nyra' },
        {
          text: '„Die Drohnen verlieren manchmal Teile, oder? Habt ihr welche gesammelt?“', tag: '[Daria ♥8]',
          requires: { hearts: D, min: 8 }, once: true, id: 'daria-chipschrott', next: 'schrott',
        },
        { text: '„Bis später, Chefin.“', effects: [herz(D, 5)] },
      ],
    }),
    node('geruechte', [
      L(D, 'Der Bäcker am Bahnhof sagt „Danke, Master“ zu seiner Brezel. Wett-Willi wettet nicht mehr, weil Master sagt, Wetten ist ineffizient. Das ist das Unheimlichste, was ich je gehört hab.', 'besorgt'),
      L(D, 'Und Chrome 10 kriegst du jetzt überall hinterhergeworfen. Dienstags und donnerstags an Ständen. Gratis. Gratis! Merkst du was? Ich merk was.'),
    ]),
    node('master', [
      L(D, 'Ich führ eine Strichliste. Gestern siebzehn. Heute schon neun, und es ist noch nicht mal Mittag.', 'trauer'),
      L(D, 'Die Glitzersterne auf der Karte sind die. Die Karte sieht aus wie Weihnachten. Ich hasse Weihnachten jetzt.'),
    ]),
    node('nyra', [
      L(D, 'Nee. Aber Jakko hebt ihr eine Dampfnudel auf. Die ist schon hart wie ein Ziegel. Er sagt, er gibt sie ihr trotzdem. Als Beweis, dass wir gewartet haben.', 'trauer'),
      L(D, 'Holt sie da raus. Ich bezahl’s auch. Irgendwann. In Raten.'),
    ], { effects: [herz(D, 5)] }),
    node('schrott', [
      N('Daria guckt nach links, nach rechts, dann zieht sie eine Kiste unter dem Stand hervor. Darin: ein Haufen glitzernder Splitter, Leiterbahnen, ein halber Drohnenflügel.'),
      L(D, 'Fällt runter, wenn Jakko mit dem Kochlöffel trifft. Gestern dreimal. Das hier ist der beste. Da steht sogar „Chrome 10“ drauf. Klein. Wie ein Geständnis.', 'signatur'),
      L(D, 'Für dich gratis. Weil du Bande bist. Fast. Und weil Dante damit bestimmt was Gemeines bauen kann.'),
    ], { effects: [{ give: 'quantum-chip-schrott' }, herz(D, 10)] }),
  ]),

  dlg('daria-a2-party', [
    node('a', [
      L(D, 'Ich hab’s gehört. Releaseparty. Im Turm. Ihr geht da hin. Freiwillig. Mit Absicht.', 'besorgt'),
      L(D, 'Ich will mit. Kinder sind da nicht erlaubt, ich weiß. Ich bin ein Kind. Aber ich bin auch eine Geschäftsfrau. Geschäftsfrauen sind überall erlaubt.'),
    ], {
      effects: [{ markSeen: 'daria-a2-party' }],
      choices: [
        { text: '„Nein. Und das ist kein Verhandlungsangebot.“', next: 'nein' },
        { text: '„Ich brauch dich hier. Wenn wir nicht wiederkommen, muss jemand die Bande führen.“', next: 'fuehren' },
        {
          text: '„Du kannst was anderes tun: die ganze Unterstadt an dem Abend vor die Bildschirme kriegen. Damit alle sehen, was passiert.“',
          check: chk('daria-a2-party-plan', 'ausstrahlung', 6, ['ueberreden', 'plan']),
          next: 'zuschauer',
        },
      ],
    }),
    node('nein', [
      L(D, 'Pff. Okay. Aber ich hab’s gesagt, und du hast nein gesagt. Wenn’s schiefgeht, steht das im Protokoll.', 'wut'),
    ], { next: 'gluecksbringer' }),
    node('fuehren', [
      L(D, 'Ich FÜHRE die Bande. Schon immer. Das ist kein Auftrag, das ist eine Beleidigung.', 'wut'),
      L(D, '… Aber ich hab verstanden, was du meinst. Ihr kommt wieder. Das ist das Einzige, was ich will. Den Rest regel ich.', 'trauer'),
    ], { effects: [herz(D, 10)], next: 'gluecksbringer' }),
    node('zuschauer', [
      L(D, 'Alle vor die Bildschirme? Am Bahnhof, im High Voltage, bei Oma Volt? Damit, wenn die da oben was Fieses machen, die ganze Stadt zuguckt?', 'ueberrascht'),
      L(D, 'Das ist … das ist ein guter Plan. Das ist so gut, dass ich ihn mir gleich selbst ausgedacht hab. Gerade eben.', 'freude'),
    ], { effects: [herz(D, 20), { setFlag: 'kinder_zuschauer_organisiert' }], next: 'gluecksbringer' }),
    node('gluecksbringer', [
      N('Sie drückt dir einen Kronkorken in die Hand. Daria hat mit Edding „GLÜCK“ draufgeschrieben, das Ü-Pünktchen sind zwei kleine Herzen.'),
      L(D, 'Glücksbringer. Funktioniert einmal. Danach ist das Glück verbraucht, und du musst wieder selbst gut sein.', 'signatur'),
    ], {
      effects: [{
        checkBuff: { id: 'buff-daria-gluecksbringer', label: 'Darias Glücksbringer', value: 1, attribute: 'strasse', consumes: true },
      }],
    }),
  ]),

  dlg('daria-a2-nervoes', [
    node('a', [
      N('Daria hat die Karte der Stadt vom Nest mitgebracht und auf der Kiste ausgebreitet. Der Quantum-Turm ist inzwischen so oft umkringelt, dass das Papier ein Loch hat.'),
      L(D, 'Ich bin nicht nervös. Ich hab nur zwölfmal die Karte neu gemalt. Und Jakko hat aufgehört zu essen. Für eine Stunde. Das ist der Weltuntergang.', 'besorgt'),
    ], {
      choices: [
        { text: '„Wir haben einen Plan, Daria. Einen guten.“', next: 'plan' },
        { text: '„Ich bin auch nervös. Scheißnervös.“', next: 'ehrlich' },
        { text: '(Eine Runde Eins! zur Ablenkung.)', next: 'eins' },
      ],
    }),
    node('plan', [L(D, 'Hunters Pläne sind immer gut. Bis sie losgehen. Dann sind sie Dantes Problem.', 'signatur')]),
    node('ehrlich', [
      L(D, 'Echt? Du auch? … Gut. Dann sind wir zu zweit. Zu zweit ist Nervössein nur halb so schlimm. Mathematik.', 'zaertlich'),
    ], { effects: [herz(D, 10)] }),
    node('eins', [N('Daria mischt, ohne zu fragen. Ihre Hände zittern kein bisschen. Beim Eins! nie.')], {
      effects: [{
        minigame: 'akt-eins', level: 3, key: 'eins-daria', label: 'Eins! gegen die Nervosität',
        win: [herz(D, 10), { message: 'Daria: „Na gut. Du darfst gewinnen. Heute. Weil morgen wichtig ist.“' }],
        lose: [herz(D, 10), { message: 'Daria: „Siehste. Alles normal. Ich gewinne. Die Welt ist in Ordnung.“' }],
      }],
    }),
  ]),

  // ------------------------------------------------------------------------------------------- Akt 3
  dlg('daria-partynacht', [
    node('a', [
      N('Im Nest flackert ein alter Fernseher, den Gustav mit Draht und Hoffnung geflickt hat. NX-1 zeigt die Releaseparty: Gold, Glas, Sybella mit einem Lächeln wie eine Klinge.'),
      L(D, 'Babette hat gesagt, heute bleiben alle drin. Wir bleiben drin. Wir gucken nur. Wir gucken sehr hart.', 'besorgt'),
      L(D, 'Collin hat vorhin „Master“ gesagt, mitten im Satz. Freya hat „Einspruch“ geschrien. Zum Fernseher. Jakko hat geweint, aber nur, weil das Popcorn alle war.'),
      L(D, 'Kommt ihr heil zurück? Das ist keine Frage. Das ist eine Bestellung.', 'signatur'),
    ], { effects: [herz(D, 5)] }),
  ]),

  // ------------------------------------------------------------------------------------------- Nachspiel
  dlg('daria-nachspiel', [
    node('a', [
      N('Daria sitzt auf der Kiste und tut so, als hätte sie nicht auf dich gewartet. Auf der Kiste stehen vier Becher. Einer davon ist voll.'),
      L(D, 'Da bist du ja. Wurde auch Zeit. Wir haben dir einen Becher hingestellt. Der ist kalt geworden. Dreimal.', 'wut'),
      L(D, 'Weißt du, was in der Nacht los war? Die Bildschirme sind ausgegangen. ALLE. Jakko hat gedacht, das ist das Ende der Welt, und hat vorsichtshalber den ganzen Vorrat gegessen.', 'freude'),
    ], {
      effects: [{ markSeen: 'daria-nachspiel' }, herz(D, 20)],
      choices: [
        { text: '„Wir waren am Meer, Daria.“', when: ENDE_MEER, next: 'meer' },
        { text: '„Nexus ist jetzt … nett. Glaube ich.“', when: ENDE_NEXUS, next: 'nexus' },
        { text: '„Wie geht’s der Bande?“', next: 'bande' },
      ],
    }),
    node('meer', [
      L(D, 'AM MEER? Ohne uns? Das ist Vertragsbruch! Paragraf zwölf: Wer ans Meer fährt, nimmt die Bande mit!', 'wut'),
      L(D, 'Paragraf zwölf hab ich gerade erfunden. Gilt aber rückwirkend.'),
    ], {
      choices: [
        { text: '„Samstag. Bus um sechs. Ihr drei kommt mit.“', effects: [{ setFlag: 'kinder_meer_dabei' }, herz(D, 30), herz('freya', 20), herz('jakko', 20)], next: 'samstag' },
        { text: '„Irgendwann, versprochen.“', next: 'irgendwann' },
      ],
    }),
    node('samstag', [
      L(D, 'Samstag. SAMSTAG. Ich muss Badesachen klauen. Kaufen. Ich meine kaufen. Organisieren.', 'freude'),
      L(D, 'Und wenn das Meer nicht so groß ist, wie Nyra immer erzählt, will ich mein Geld zurück.'),
    ], { next: 'bande' }),
    node('irgendwann', [L(D, 'Irgendwann ist kein Datum. Ich schreib’s trotzdem auf. In Rot.', 'signatur')], { next: 'bande' }),
    node('nexus', [
      L(D, 'Die KI hat heute Morgen am Bahnhofslautsprecher „Guten Morgen, Daria“ gesagt. Mit Namen! Ich hab ihr eine Rechnung geschickt. Für Namensnutzung.', 'signatur'),
      L(D, 'Sie hat bezahlt. Sofort. Mit Entschuldigung. Ich trau ihr kein Stück. Aber sie zahlt pünktlich, das muss man ihr lassen.'),
    ], {
      choices: [
        { text: '„Samstag fahren wir ans Meer. Kommt ihr mit?“', effects: [{ setFlag: 'kinder_meer_dabei' }, herz(D, 30), herz('freya', 20), herz('jakko', 20)], next: 'samstag' },
        { text: '„Und sonst?“', next: 'bande' },
      ],
    }),
    node('bande', [
      L(D, 'Wir machen jetzt ein Fundbüro. Hier, am Stand. Wer was verliert, kommt zu uns. Wer was findet, auch. Die Leute haben in der Nacht so viel verloren, Chips, Brillen, ihren Verstand.', 'signatur'),
      L(D, 'Ripper war der erste Kunde. Der hat sein Gewissen verloren. Haben wir nicht gefunden. Wir suchen weiter, aber ich mach mir keine Hoffnung.'),
    ]),
  ]),

  dlg('daria-nachspiel-tag', [
    node('a', [
      N('Über dem Botenstand hängt jetzt ein zweites Pappschild: „FUNDBÜRO DER NEST-BANDE · Verloren? Gefunden? Wir nehmen beides. Gegen Gebühr.“'),
      L(D, 'Kundschaft! Bande-Kundschaft! Für dich gibt’s Bandenpreis. Der ist wie der normale Preis, aber ich sag „Bitte“.', 'freude'),
    ], {
      choices: [
        { text: '„Was hast du heute im Fundbüro?“', next: 'fundbuero' },
        { text: '„Wie war das Meer, Chefin?“', when: { flag: 'kinder_meer_dabei' }, next: 'meer' },
        { text: '„Wie ist die Stadt so, ohne Bildschirme?“', when: ENDE_MEER, next: 'bildschirme' },
        { text: '„Und die neue Nexus?“', when: ENDE_NEXUS, next: 'nexus' },
        { text: '(Eine Runde Eins!.)', next: 'eins' },
        { text: '„Bis später.“', effects: [herz(D, 5)] },
      ],
    }),
    node('fundbuero', [
      L(D, 'Das Fundbüro hat seine eigene Theke. Da drüben. Mit Klingel. Die Klingel ist gefunden. Wir wissen nicht, wem sie gehört. Jetzt gehört sie dem Fundbüro.', 'signatur'),
    ]),
    node('meer', [
      L(D, 'Groß. Zu groß. Nass. Viel zu nass. Ich hab dreimal Wasser geschluckt und einmal einen Fisch. Ich glaube, der Fisch war schon tot. Hoffentlich.', 'freude'),
      L(D, 'Jakko will da wohnen. Freya will einen Strandparagrafen. Ich will einen Bootsverleih. Das Meer ist eine Goldgrube, und keiner kassiert.'),
    ]),
    node('bildschirme', [
      L(D, 'Komisch. Leise. Die Leute gucken sich an statt die Werbung. Manche gucken ganz verwirrt, als hätten sie vergessen, wie Gesichter gehen.', 'besorgt'),
      L(D, 'Der Bäcker hat wieder geflucht. Richtig laut. Ich hab geklatscht. Freya hat kassiert.'),
    ]),
    node('nexus', [
      L(D, 'Sie schickt mir jeden Morgen den Wetterbericht. Ich hab sie nicht drum gebeten. Er stimmt aber immer. Das ist unheimlich und praktisch. Wie Freya.', 'signatur'),
      L(D, 'Nicht alle trauen ihr. Oma Volt hat ihr Radio umgedreht, damit es sie nicht ansieht. Radios sehen nicht. Sag ihr das nicht.'),
    ]),
    node('eins', [N('Daria mischt. Du siehst, dass sie sich ein Plus Vier unten ins Deck legt. Du sagst nichts. Bande ist Bande.')], {
      effects: [{
        minigame: 'akt-eins', level: 3, key: 'eins-daria', label: 'Eins! gegen Daria',
        win: [herz(D, 10), { message: 'Daria: „Glück. Pures Glück. Revanche nächsten Sonntag!“' }],
        lose: [herz(D, 10), { message: 'Daria: „Bande-Rabatt gibt’s beim Eins! nicht. Nur beim Fundbüro.“' }],
      }],
    }),
  ]),

  dlg('kinder-fundbuero', [
    node('a', [
      N('Eine Theke aus zwei Obstkisten, eine gefundene Klingel, ein Regal voller Kram mit Zetteln dran: „Gefunden am Bahnhof, 3:12 Uhr, riecht nach Kummer“. Freya führt das Eingangsbuch, Jakko bewacht das Essbare.'),
      L(D, 'Willkommen im Fundbüro der Nest-Bande. Heute im Angebot: Sachen. Für Bande-Mitglieder gibt’s alles zum Selbstkostenpreis. Plus Gebühr.', 'signatur'),
    ], {
      choices: [
        {
          text: '„Die Euromünze da. Was willst du dafür?“ (15 Credits)', when: { weekday: ['mo', 'do'] },
          requires: { credits: 15 }, effects: [{ credits: -15 }, { give: 'alte-euromuenze' }, herz(D, 5)], next: 'gekauft',
        },
        {
          text: '„Das Kartendeck. Ist das vollständig?“ (10 Credits)', when: { weekday: ['di', 'fr'] },
          requires: { credits: 10 }, effects: [{ credits: -10 }, { give: 'kartendeck' }, herz(D, 5)], next: 'deck',
        },
        {
          text: '„Der Murmelbeutel da.“ (10 Credits)', when: { weekday: ['mi', 'sa', 'so'] },
          requires: { credits: 10 }, effects: [{ credits: -10 }, { give: 'murmelbeutel' }, herz(D, 5)], next: 'gekauft',
        },
        {
          text: '(Eine rostige Dose abgeben.) „Hab ich gefunden. Wem auch immer die gehört, er ist besser ohne.“',
          requires: { item: 'rostige-dose' }, effects: [{ take: 'rostige-dose' }, { credits: 3 }, herz('freya', 5)], next: 'dose',
        },
        { text: '„Ich guck nur.“' },
      ],
    }),
    node('gekauft', [L(D, 'Verkauft! Freya, eintragen. Jakko, Finger weg, das ist nicht essbar.', 'freude')]),
    node('deck', [L(D, 'Vollständig. Fast. Ein Plus Vier fehlt. Das hat Wett-Willi im Ärmel. Den Ärmel haben wir nicht gefunden.', 'signatur')]),
    node('dose', [
      L('freya', 'Eingang: eine Dose, rostig, Besitzer unbekannt, vermutlich verdient. Finderlohn: drei Credits. Steht in der Fundordnung.', 'signatur'),
    ]),
  ]),

  dlg('daria-meer', [
    node('a', [
      N('Daria sitzt im Sand, eine geliehene Taucherbrille auf der Stirn, und baut eine Burg. Die Burg hat einen Botenstand, ein Fundbüro und eine Mauer mit der Aufschrift „PRIVAT“.'),
      L(D, 'Das ist Darias Burg. Eintritt fünf Muscheln. Für Bande frei. Für Möwen verboten. Die Möwen haben schon dreimal eingebrochen.', 'freude'),
    ], {
      choices: [
        { text: '„Eine schöne Burg, Chefin.“', effects: [herz(D, 10)], next: 'burg' },
        { text: '„Hast du schon das Wasser probiert?“', next: 'wasser' },
      ],
    }),
    node('burg', [L(D, 'Ich weiß. Ich hab einen Turm für dich gebaut. Der ist schief. Wie du. Aber er hält.', 'zaertlich')]),
    node('wasser', [L(D, 'Probiert, ja. Salzig. Eklig. Großartig. Ich geh nicht nochmal rein. Gleich. In fünf Minuten. Dann geh ich nicht nochmal rein.', 'signatur')]),
  ]),

  dlg('daria-master', [
    node('a', [
      N('Daria sieht dich kommen und steht auf. Hinter ihr, an der Wand des Botenstands, hängt ein Flyer: dein Gesicht, mit Edding umrandet. Daneben ein Totenkopf. Ein dicker.'),
      L(D, 'Für dich ist geschlossen. Fundbüro, Botendienst, alles. Wir arbeiten nicht für Master.', 'wut'),
      L(D, 'Wir haben dich mal gemocht. Das war ein Fehler. Wir machen keine Fehler zweimal. Hab ich ins Buch geschrieben, mit Datum.'),
    ], {
      choices: [
        { text: '„Daria, hör zu …“', next: 'zuhoeren' },
        { text: '(Das Bandenabzeichen ablegen und auf die Kiste legen.)', when: { item: 'bandenabzeichen' }, next: 'abzeichen' },
        { text: '(Gehen.)' },
      ],
    }),
    node('zuhoeren', [
      L(D, 'Nein. DU hörst zu. Die Drohnen sagen jetzt deinen Namen. Jeden Morgen. „Guten Morgen, Unterstadt. Master wünscht einen produktiven Tag.“ Das bist du. Das ist deine Stimme in meinem Kopf, wenn ich aufwache.', 'trauer'),
      L(D, 'Wenn du wirklich noch irgendwo drin bist, dann weißt du, wo das Meer ist. Und wo die Crew ist. Wir wissen’s alle. Nur du nicht.'),
    ]),
    node('abzeichen', [
      N('Daria sieht das Abzeichen an. Sie nimmt es nicht. Sie schiebt es mit dem Finger zurück, bis zur Kante der Kiste.'),
      L(D, 'Behalt’s. Das ist kein Geschenk mehr. Das ist eine Erinnerung. Daran, was du warst.', 'trauer'),
    ]),
  ]),

  dlg('daria-3b', [
    node('a', [
      N('Der Flyer mit dem Totenkopf hängt noch am Botenstand. Jemand hat ihn wegradiert, so fest, dass das Papier dünn geworden ist. Man sieht ihn trotzdem noch ein bisschen.'),
      L(D, 'Du bist zurück. Also richtig zurück. Ohne Turm.', 'besorgt'),
      L(D, 'Ich hab den Totenkopf wegradiert. Fast. Der Rest bleibt. Damit wir’s nicht vergessen. Du auch nicht.'),
    ], {
      effects: [{ markSeen: 'daria-3b' }],
      choices: [
        { text: '„Ich hab Scheiße gebaut, Daria. Richtig große.“', next: 'scheisse' },
        { text: '„Der Rest soll bleiben. Ich will’s auch nicht vergessen.“', next: 'bleiben' },
      ],
    }),
    node('scheisse', [
      L(D, 'Ja. Hast du. Die größte, die ich je gesehen hab. Und ich hab Jakko gesehen, wie er einen Dampfkorb angezündet hat.', 'wut'),
      L(D, 'Aber du bist zurückgekommen. Die meisten kommen nicht zurück. Paragraf null sagt, ich darf Erwachsenen nicht glauben. Ich mach eine Ausnahme. Eine. Verbrauch sie nicht.', 'zaertlich'),
    ], { effects: [herz(D, 60)] }),
    node('bleiben', [
      L(D, 'Gut. Dann sind wir uns einig. Das ist das Erste seit Wochen.', 'trauer'),
      L(D, 'Komm Sonntag zum Eins!. Wenn du verlierst, bist du wieder Bande. Wenn du gewinnst … dann auch. Aber dann ärger ich mich.', 'signatur'),
    ], { effects: [herz(D, 60)] }),
  ]),
);

export const part: ContentPart = {
  dialogues,
  mapAdditions: {
    schrottmarkt: {
      hotspots: [{
        id: 'kinder-fundbuero', at: [480, 470], radius: 40, label: 'Fundbüro der Nest-Bande', kind: 'use',
        when: { all: [NACHSPIEL, { time: ['morgen', 'tag'] }] }, dialogue: 'kinder-fundbuero',
      }],
    },
  },
};
