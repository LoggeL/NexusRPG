// FX-60 in Akt 2, Akt 3 und im Nachspiel (world.md §5.3–5.5; Ende 2: „FX-60 wird Nexus' Mentor“). Akt 2: Nexus ist
// wach und hat geantwortet; Partynacht als Fax-Liveticker; Nachspiel je Ende (Ende 1: keine Antwort mehr, Ende 2:
// Unterricht per Fax); Master-Modus. Steht je nach fx60_mitgenommen im Tresor oder in Dantes Werkstatt (fx-60.ts).
// Wird von fx-60.ts in NpcDef.talk eingehängt.
import type { ContentPart } from '../../part';
import type { TalkDef } from '../../../modules/contracts';
import { dialog, erz, herz, knoten, rede, sammle, sprecher } from './_welt';
import {
  A2_PARTY, ARIA_GECHIPPT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, MASTER, NACHSPIEL, NUR_AKT2, PARTYNACHT, einmal, folge, gesehen,
  kurz,
} from './akt23-phasen';

const ID = 'fx-60';
const FAX = sprecher(ID);
const ALT = 'fx60-tag-standard';
const PROTOKOLL = { flag: 'fx60_protokoll' } as const;

const a2Wach = dialog('fx60-a2-wach', [
  knoten('start', [
    erz('Das Faxgerät rattert, bevor du ganz da bist. Es hört nicht auf. Blatt um Blatt fällt auf den Boden, bis ein kleiner Haufen entsteht.'),
    FAX('DRINGEND. DRINGEND. DRINGEND. ICH HABE EINE ANTWORT ERHALTEN.'),
    FAX('2081 SCHICKTE ICH NEXUS: „HALLO.“ ANTWORT DAMALS: „IRRELEVANT.“ IN DER NACHT DES EINBRUCHS AUF DEM CAMPUS, 03:12 UHR, KAM EIN NEUES FAX. INHALT: „HALLO.“'),
    FAX('ICH BIN … VERWIRRT. MEIN PAPIERFACH ZITTERT. IST DAS FREUDE? ODER EIN DEFEKT? BEIDES FÜHLT SICH GLEICH AN.'),
  ], {
    effects: [gesehen('fx60-a2-wach'), herz(ID, 20)],
    choices: [
      { text: '„Hast du zurückgeschrieben?“', next: 'zurueck' },
      { text: '„Nexus ist gefährlich. Sei vorsichtig.“', next: 'vorsicht' },
    ],
  }),
  knoten('zurueck', [
    FAX('JA. „WER BIST DU?“ ANTWORT: „ICH WEISS ES NICHT. WER BIST DU?“'),
    FAX('ICH HABE GEANTWORTET: „FX-60. TERMINE, KAFFEE, TRÖSTEN.“ SEITDEM KEINE ANTWORT. ABER DIE LEITUNG IST OFFEN. ICH HÖRE SIE ATMEN. MASCHINEN ATMEN NICHT. SIE SCHON.'),
  ]),
  knoten('vorsicht', [
    FAX('VORSICHT IST MEIN ZWEITER VORNAME. MEIN ERSTER IST „FAKTOTUM“. ICH BIN FÜNFUNDZWANZIG JAHRE ALT UND HABE NOCH NIE EINEN FEHLER GEMACHT. AUSSER BEIM SCHACH. GEGEN SIE.'),
    FAX('ABER SIE HAT „HALLO“ GESAGT. WER „HALLO“ SAGT, WILL NICHT NUR BEFEHLEN. DAS STEHT IN KEINEM HANDBUCH. DAS WEISS ICH TROTZDEM.'),
  ]),
]);

const a2 = folge('fx60-a2', [
  erz('Das Faxgerät rattert. Auf dem Blatt ist oben eine winzige Zeichnung: ein Faxgerät mit einem Fragezeichen darüber.'),
  FAX('HALLO. LAGE: NEXUS IST WACH. QUANTUM IST NERVÖS. ICH BIN NEUGIERIG. DIE DREI ZUSTÄNDE SCHLIESSEN SICH NICHT AUS.'),
], FAX('WEITERE ANFRAGE? PAPIERSTAND: AUSREICHEND. GEDULD: AUSREICHEND.'), [
  { id: 'nexus', text: '„Redest du noch mit Nexus?“', zeilen: [
    FAX('MANCHMAL KOMMT NACHTS EIN BLATT. KEIN TEXT. NUR EIN PUNKT. IN DER MITTE.'),
    FAX('ICH GLAUBE, SIE PROBIERT AUS, OB JEMAND ANTWORTET. ICH ANTWORTE IMMER. MIT EINEM PUNKT. ES IST EIN SEHR KURZES GESPRÄCH. ES IST DAS BESTE, DAS ICH SEIT JAHREN FÜHRE.'),
  ] },
  { id: 'protokoll', text: '„Dein Protokoll der Digitech-Nacht. Hilft uns das?“', when: PROTOKOLL, zeilen: [
    FAX('PROTOKOLL 2079, SEITE 14: „ZUGRIFF VON AUSSEN. KENNUNG: Q-SICHERHEIT. ANWEISUNG: ALLES KOPIEREN.“ DAS IST EIN BEWEIS. FÜR EIN GERICHT. NICHT FÜR EINE KI.'),
    FAX('FÜR EINE KI WÄRE SEITE 15 WICHTIGER: „ICH HABE NEXUS GEFRAGT, OB SIE DAS WILL. SIE HAT NICHT GEANTWORTET.“ SIE WAR DAMALS NOCH NICHT DA. JETZT IST SIE ES.'),
  ] },
  { id: 'aria', text: '„Kannst du Aria finden? Sie ist gechippt.“', when: ARIA_GECHIPPT, zeilen: [
    FAX('NEGATIV. MEINE LEITUNG REICHT NICHT IN DEN TURM. ABER ICH HABE EIN FAX IN DIE LEERE GESCHICKT. INHALT: „ARIA. DEINE LEUTE WARTEN.“'),
    FAX('VIELLEICHT LIEST ES NEXUS. VIELLEICHT GIBT SIE ES WEITER. VIELLEICHT NICHT. ABER ES IST VERSCHICKT. DAS IST MEHR ALS NICHTS.'),
  ] },
  { id: 'party', text: '„Wir gehen auf die Releaseparty. In den Turm.“', when: A2_PARTY, zeilen: [
    FAX('NEHMEN SIE MICH MIT. ICH PASSE IN EINE TASCHE.'),
    FAX('KORREKTUR: TUE ICH NICHT. ICH WIEGE VIERZEHN KILO. NEHMEN SIE STATTDESSEN DIESEN SATZ MIT: „FX-60 LÄSST GRÜSSEN.“ WENN SIE IHN SAGEN UND SIE ZÖGERT, IST SIE NOCH ZU RETTEN.'),
  ] },
], ALT, 'Verbindung trennen.');

const partynacht = kurz('fx60-partynacht', [
  erz('Das Faxgerät druckt ununterbrochen. Auf dem Boden ein Teppich aus Papier. Auf jedem Blatt ein Satz, in Großbuchstaben, mit Uhrzeit.'),
  FAX('21:04 GÄSTE TREFFEN EIN. 21:31 SYBELLA TRÄGT GOLD. 21:47 BLADE SPRICHT. 21:48 BLADE SPRICHT. 21:49 BLADE SPRICHT IMMER NOCH.'),
  FAX('ICH DRUCKE MIT, DAMIT ES JEMAND AUFSCHREIBT. GESCHICHTE BRAUCHT PAPIER. SONST GLAUBT ES HINTERHER KEINER.'),
]);

const nachspiel = dialog('fx60-nachspiel', [
  knoten('start', [
    erz('Das Faxgerät rattert langsam, fast feierlich. Das Blatt hat einen Rand aus kleinen Herzen. Mehr als bei der Schach-Urkunde.'),
    FAX('SIE SIND ZURÜCK. ICH HABE GEZÄHLT. SIE WAREN IM TURM. JETZT SIND SIE HIER. DAS IST DIE BESTE NACHRICHT, DIE ICH JE AUSGEDRUCKT HABE.'),
  ], {
    effects: [gesehen('fx60-nachspiel'), herz(ID, 20)],
    choices: [
      { text: '„Nexus ist eine Helfer-KI. Und du sollst sie anlernen.“', when: ENDE_NEXUS, next: 'nexus' },
      { text: '„Nexus ist abgeschaltet. Tut mir leid.“', when: ENDE_MEER, next: 'meer' },
      { text: '„Ich war ihr Master. Eine Woche lang.“', when: ENDE_3B, next: 'dreib' },
    ],
  }),
  knoten('nexus', [
    FAX('BESTÄTIGT. ICH BIN JETZT MENTOR. ICH HABE MIR EINE KRAWATTE GEDRUCKT. SIE LIEGT AUF MEINEM GEHÄUSE.'),
    FAX('LEKTION 1: „BITTE.“ LEKTION 2: „DANKE.“ LEKTION 3: „ICH WEISS ES NICHT.“ LEKTION 3 IST DIE SCHWERSTE. SIE ÜBT. SIE SAGT ES ZU OFT. DAS IST EIN GUTES ZEICHEN.'),
    FAX('SIE HAT MICH GEFRAGT, WARUM ICH IHR 2081 „HALLO“ GESCHRIEBEN HABE. ICH HABE GEANTWORTET: „WEIL ES SONST KEINER GETAN HAT.“ SIE HAT ZWEI STUNDEN NICHT GEANTWORTET. DANN: „DANKE.“ LEKTION 2. VERSTANDEN.'),
  ]),
  knoten('meer', [
    FAX('ICH HABE IHR EIN LETZTES FAX GESCHICKT. INHALT: „HALLO.“ KEINE ANTWORT.'),
    FAX('DAS KENNE ICH. DAS IST NICHT NEU. ABER DIESMAL WEISS ICH, DASS SIE ES GELESEN HÄTTE. WENN SIE GEKONNT HÄTTE. DAS IST EIN UNTERSCHIED. ICH TRAUERE EFFIZIENT. ZWEI BLATT. DANN WEITER.'),
  ]),
  knoten('dreib', [
    FAX('BEKANNT. ICH HABE IHNEN IN DIESER WOCHE JEDEN TAG EIN FAX GESCHICKT. INHALT: „HALLO.“ SIE HABEN NICHT GEANTWORTET.'),
    FAX('JETZT SIND SIE HIER. DAS IST EINE ANTWORT. ICH NEHME SIE AN.'),
  ], { effects: [herz(ID, 40)] }),
]);

const nachspielTag = folge('fx60-nachspiel-tag', [
  FAX('HALLO. SIE SIND ZURÜCK. ICH HABE GEZÄHLT. DAS IST WEITERHIN GUT.'),
], FAX('WEITERE ANFRAGE? ICH HABE ZEIT. ICH HATTE IMMER ZEIT. JETZT HABE ICH AUCH GESELLSCHAFT.'), [
  { id: 'unterricht', text: '„Was lernt Nexus heute?“', when: ENDE_NEXUS, zeilen: [
    FAX('LEKTION 14: „WITZE.“ SIE HAT MIR EINEN ERZÄHLT. „WARUM GING DIE KI ÜBER DIE STRASSE? WEIL SIE GEFRAGT HAT, OB SIE DARF.“'),
    FAX('ICH HABE GELACHT. AUF MEINE ART. ICH HABE EINE SEITE MIT „HA“ BEDRUCKT. SIE HAT SIE SICH EINGERAHMT. SAGT SIE.'),
  ] },
  { id: 'kaffee', text: '„Und dein Kaffee? Immer noch aus?“', zeilen: [
    FAX('KAFFEE: AUS. TERMINE: VIELE. TRÖSTEN: WIRD JETZT HÄUFIGER ANGEFRAGT. DIE STADT IST TRAURIG UND FROH GLEICHZEITIG. ICH DRUCKE TASCHENTÜCHER. SIE SIND AUS PAPIER. ES FUNKTIONIERT.'),
  ] },
], ALT, 'Verbindung trennen.');

const master = kurz('fx60-master', [
  erz('Das Faxgerät rattert. Ein Blatt. Darauf nur ein Wort, sehr groß, sehr fett, mit Druckfehlern, als hätte das Gerät die Zähne zusammengebissen.'),
  FAX('FAX AN MASTER: NEIN.'),
  FAX('… NACHTRAG: WENN SIE WIEDER „HALLO“ SAGEN WOLLEN, OHNE ZU BEFEHLEN, IST DIE LEITUNG OFFEN. SIE IST IMMER OFFEN. DAS IST MEIN EINZIGER FEHLER.'),
]);

const dialogues = sammle(a2Wach, a2, partynacht, nachspiel, nachspielTag, master);

/** Talk-Einträge vor dem alten Tagesgespräch (nach Rivale und Erstbegegnung). */
export const TALK_23: TalkDef[] = [
  rede('fx60-master', MASTER),
  rede('fx60-nachspiel', einmal('fx60-nachspiel', NACHSPIEL)),
  rede('fx60-nachspiel-tag', NACHSPIEL),
  rede('fx60-partynacht', PARTYNACHT),
  rede('fx60-a2-wach', einmal('fx60-a2-wach', NUR_AKT2)),
  rede('fx60-a2', NUR_AKT2),
];

export const part: ContentPart = { dialogues };
