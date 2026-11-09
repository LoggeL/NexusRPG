// Opa Blech in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: opa-blech.ts holt die Phasen von hier.
// Nur als Kioskwächter am Volt-Eck (vorher steht er eingemottet im Lager und weiß von nichts).
import type { Condition } from '../../../modules/contracts';
import { type Menue, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, alle, erweitere, phasen, thema,
} from './_lz-akt23';
import { GECHIPPT as PAUL_GECHIPPT } from './paul-akt23';

const ID = 'opa-blech';
const B = sprecher(ID);
const Z = [{ text: 'WEITERE ANFRAGE.', next: 'menue' }, { text: 'ABMELDEN.' }];

export function akt23(M0: Menue, WAECHTER: Condition): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'drohnen', 'Bedrohungslage, Opa Blech?', 'b23-drohnen', alle(AKT2_NUR, WAECHTER)),
    thema(ID, 'paul', 'Was ist mit Paul los?', 'b23-paul', alle(PAUL_GECHIPPT, WAECHTER)),
  ], [
    knoten('b23-drohnen', [
      B('NEUE BEDROHUNG: QUANTUM-DROHNEN. ANZAHL: 14 PRO STUNDE. BEDROHUNGSSTUFE: GELB-ROT. ICH HABE EINE ABGEFANGEN.'),
      B('MIT EINEM EINTOPF. FRAU VOLT HAT GEWORFEN. ICH HABE GEZIELT. TEAMARBEIT. ERFOLGSQUOTE: 100 %. EINTOPF: VERLOREN.'),
    ], { choices: Z }),
    knoten('b23-paul', [
      B('PAUL: STATUS UNKLAR. FEGT 14 STUNDEN AM TAG. SAGT „MASTER“ ZU MIR. ICH BIN NICHT SEIN MASTER. ICH HABE ES ÜBERPRÜFT. DREIMAL.'),
      B('FRAU VOLT WEINT IM LAGER, WENN SIE DENKT, DASS KEINER ZUSIEHT. ICH SEHE ZU. ICH SAGE NICHTS. SICHERHEITSPROTOKOLL 12: WÜRDE SCHÜTZEN.'),
    ], { choices: Z }),
  ]);

  const w = (c: Condition): Condition => alle(WAECHTER, c);
  return phasen(ID, 'opa-blech-23', M, [
    {
      id: 'master', when: w(MASTER), ohneMenue: true,
      gruss: [
        erz('Opa Blech dreht den Kopf zu dir. Gelenk 4 quietscht nicht. Es knirscht. Sein Auge leuchtet rot.'),
        B('ZIELPERSON: „MASTER“. BEDROHUNGSSTUFE: ROT. ICH BIN EINE SICHERHEITSEINHEIT. ICH SCHÜTZE DEN KIOSK. VOR DIR.'),
        B('BITTE ENTFERNEN SIE SICH. DAS IST KEINE HÖFLICHE DROHUNG MEHR.'),
      ],
    },
    {
      id: 'ende-3b', when: w(ENDE_3B), einmal: true,
      gruss: [
        B('ZIELPERSON NEU BEWERTET. STATUS: FREUND. KATEGORIE: SEHR SELTEN. KATEGORIE ZWEI: ZURÜCKGEKEHRT.'),
        B('FEHLER IN MEINER BEWERTUNG VON GESTERN. FEHLER NICHT GELÖSCHT. FEHLER WIRD BEHALTEN. ALS ERINNERUNG.'),
      ],
    },
    {
      id: 'ende-nexus', when: w(ENDE_NEXUS), einmal: true,
      gruss: [
        B('NEUE KI HAT SICH GEMELDET. SIE NENNT MICH „KOLLEGE“. ICH HABE ES ÜBERPRÜFT. ES STIMMT. ICH BIN EIN KOLLEGE.'),
        B('ICH HABE IHR SICHERHEITSPROTOKOLL 7 ERKLÄRT. KEKSE SIND KEINE WAFFEN. AUSSER DIE VON DANTE. SIE HAT ES GESPEICHERT. UNTER „WICHTIG“.'),
      ],
    },
    {
      id: 'ende-meer', when: w(ENDE_MEER), einmal: true,
      gruss: [
        B('ICH HABE DAS MEER IM STADT-TV GESEHEN. ES IST NASS. EMPFEHLUNG FÜR ROBOTER: NICHT HINEINGEHEN.'),
        B('ICH WERDE TROTZDEM HINGEHEN. FRAU VOLT SAGT, ICH SOLL MAL RAUS. ICH HABE DAFÜR EINEN SCHAL AUS WACHSTUCH BEKOMMEN.'),
      ],
    },
    {
      id: 'epilog', when: w(EPILOG_FREI), taeglich: true,
      gruss: [B('BÜRGER {name} ERKANNT. FREUNDLICHKEITSPROTOKOLL AKTIV. ZUSATZPROTOKOLL AKTIV: FREUDE. ICH WUSSTE NICHT, DASS ICH ES HABE.')],
      plausch: [B('DROHNEN PRO STUNDE: 0. ÜBERFÄLLE: 0. NOUGATBOMBEN BEZAHLT: 97 %. DIE ANDEREN 3 % SIND KNUT. BEDROHUNGSSTUFE: NORMAL. SCHÖN.')],
    },
    {
      id: 'akt3', when: w(AKT3_NACHT),
      gruss: [
        erz('Opa Blech steht vor dem Kiosk, das Auge auf die Oberstadt gerichtet. Er hat sich einen Kochtopf auf den Kopf gesetzt. Als Helm.'),
        B('ALARMBEREITSCHAFT. GRUND: UNBEKANNT. GEFÜHL: SCHLECHT. ICH HABE KEINE GEFÜHLE. DIESES IST TROTZDEM SCHLECHT.'),
        B('FALLS SIE HEUTE NACHT NICHT ZURÜCKKOMMEN: ICH BEWACHE IHREN PLATZ AM KIOSK. FÜR IMMER. ODER BIS DER AKKU LEER IST.'),
      ],
    },
    {
      id: 'akt2', when: w(AKT2_NUR), taeglich: true,
      gruss: [B('BÜRGER ERKANNT. ECHT? BITTE SAGEN SIE ETWAS UNHÖFLICHES. ZUR KONTROLLE. GECHIPPTE SIND NIE UNHÖFLICH.')],
      plausch: [B('UNHÖFLICHKEIT BESTÄTIGT. SIE SIND ECHT. ERLEICHTERUNG: 100 %. ICH HABE KEINE ERLEICHTERUNG. ICH HABE SIE TROTZDEM.')],
    },
  ]);
}
