// Vex Schrapnell (als Figur der Welt) in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil:
// vex-schrapnell.ts holt die Phasen von hier. Alles nur, wenn man NICHT Vex spielt. Nur Freundschaft.
// Herz-Ereignisse 8/10 (act2) bleiben in vex-schrapnell.ts.
import type { Condition } from '../../../modules/contracts';
import { type Menue, NICHT_VEX, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, NYRA_WEG, alle,
  erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'vex-schrapnell';
const V = sprecher(ID);
const KAS = sprecher('narrator');
const Z = [{ text: 'Noch was, Chefin.', next: 'menue' }, { text: 'Ich roll dann mal.' }];

export function akt23(M0: Menue): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'quantum', 'Liefern die Kuriere jetzt auch für Quantum?', 'v23-quantum', alle(NICHT_VEX, AKT2_NUR)),
  ], [
    knoten('v23-quantum', [
      V('Die wollten uns kaufen. Alle. Komplett. „Logistikpartner“. Mit Chip für jeden Kurier, damit wir die Routen „optimiert“ fahren.', 'wut'),
      V('Ich hab gesagt, wir sind nicht zu kaufen. Dann hab ich gefragt, wie viel. Dann hab ich nein gesagt. Die Reihenfolge war wichtig.', 'signatur'),
      V('Rotz-Rolf hat unterschrieben. Fährt jetzt mit Chip. Schnurgerade. Hält an jeder roten Ampel. Ein Schrapnell, der an Ampeln hält. Kas würde kotzen.', 'trauer'),
    ], { choices: Z }),
  ]);

  const v = (c: Condition): Condition => alle(NICHT_VEX, c);
  return phasen(ID, 'vex-23', M, [
    {
      id: 'master', when: v(MASTER), ohneMenue: true,
      gruss: [
        erz('Vex sitzt auf der Dachkante und schaut nicht runter. Nicht zu dir. Die Nagelpistole liegt neben ihr. Geladen.'),
        V('Kas hat gesagt, wer anhält, wird geschnappt. Du bist nicht angehalten. Du bist abgebogen. Ins Büro. Mit Aussicht.', 'wut'),
        V('Die Kuriere haben deinen Namen von jeder Dachkante gekratzt. Mit Schraubenziehern. Verpiss dich von meinem Dach.'),
      ],
    },
    {
      id: 'ende-3b', when: v(ENDE_3B), einmal: true,
      gruss: [
        V('Na. Doch noch angekommen.', 'neutral'),
        V('Hab Kanal 4 offen gelassen. Die ganze Zeit. Nicht weil ich wusste, dass du zurückkommst. Weil ich’s nicht wusste.', 'trauer'),
        V('War nicht komplett scheiße, dass du wieder da bist. Und jetzt halt die Fresse, bevor ich’s mir anders überleg.', 'freude'),
      ],
    },
    {
      id: 'ende-nexus', when: v(ENDE_NEXUS), einmal: true,
      gruss: [
        V('Die neue KI hat auf Kanal 4 gefunkt. MEINEM Kanal. „Darf ich mitlaufen?“ Ich hab gesagt: Du hast keine Beine.', 'wut'),
        V('Sie hat gesagt, sie kann die Ampeln für uns grün schalten. Ich hab’s mir überlegt. Ich hab ja gesagt. Kas hätte auch ja gesagt. Kas hat Ampeln gehasst.', 'signatur'),
      ],
    },
    {
      id: 'ende-meer', when: v(ENDE_MEER), einmal: true,
      gruss: [
        V('Ihr wart am Meer. Hab’s Kas erzählt. Kanal 9. Ja, ich red mit ’ner Schleife. Halt die Fresse.', 'signatur'),
        KAS('„Schrapnell eins an alle: Nicht anhalten. Nicht umdrehen. Wir sehen uns im Ziel.“'),
        V('Hat er nicht gewusst, dass es eins gibt. Ein Ziel, mein ich. Mit Wasser dran. Jetzt weiß ich’s für ihn mit.', 'trauer'),
      ],
    },
    {
      id: 'epilog', when: v(EPILOG_FREI), taeglich: true,
      gruss: [V('Na, Frischfleisch. Die Dächer gehören wieder uns. Keine Drohnen, keine Logistikpartner, keine Chips. Nur Tauben und Rotz-Rolf.', 'freude')],
      plausch: [V('Rolf hat seinen Chip los und rennt wieder. Schief, laut, über jede rote Ampel. Er hat geheult, als er das erste Mal gefallen ist. Vor Freude. Idiot.')],
    },
    {
      id: 'akt3', when: v(AKT3_NACHT),
      gruss: [
        erz('Vex steht auf der Dachkante über der Neon-Gasse, das Funkgerät am Ohr. Unter ihr die Gasse, über ihr die Oberstadt, die glitzert wie ein Gebiss.'),
        V('Kanal 4 ist die ganze Nacht offen. Alle Kuriere sind auf den Dächern. Wenn ihr da oben runtermüsst: Wir kennen jeden Weg. Auch die, die keine sind.', 'signatur'),
        V('Und wenn einer von denen da oben dir was tut, find ich ihn. Ich bin schnell. Ich treff. Und ich red nicht beim Schießen.'),
      ],
    },
    {
      id: 'nyra', when: v(NYRA_WEG), einmal: true,
      gruss: [
        V('Eure Kleine sitzt im Turm, hör ich. Die mit den Bildschirmen.', 'besorgt'),
        V('Ich bin letzte Nacht bis zum Lüftungsschacht im zwölften Stock gekommen. Weiter nicht. Kameras. Aber ich weiß jetzt, wo der Schacht hinführt. Frag, wenn du’s brauchst.'),
      ],
    },
    {
      id: 'aria', when: v(ARIA_GECHIPPT), einmal: true,
      gruss: [
        V('Aria. Die dumme Kuh hat sich erwischen lassen.', 'wut'),
        V('…'),
        V('Hol sie raus. Wenn du Beine brauchst, Kanal 4. Wenn du jemanden brauchst, der was kaputtschießt, auch Kanal 4. Ich bin da.', 'trauer'),
      ],
    },
    {
      id: 'akt2', when: v(AKT2_NUR), taeglich: true,
      gruss: [V('Na, Frischfleisch. Hast du die Nachrichten gesehen? Einbruch im Campus. Die halbe Stadt sucht die Täter. Ich such sie nicht. Ich weiß ja, wo sie stehen.', 'signatur')],
      plausch: [V('Über den Dächern fliegen jetzt Drohnen. Tief. Ich hab zwei mit der Nagelpistole runtergeholt. Eine dritte ist freiwillig gelandet. Die hat Angst vor mir. Gut so.')],
    },
  ]);
}
