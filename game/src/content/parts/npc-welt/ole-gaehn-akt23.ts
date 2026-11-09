// Ole Gähn in Akt 2, Akt 3 und im Nachspiel. Kein eigener Inhaltsteil: ole-gaehn.ts holt die Phasen von hier.
// Ohne den Brief an Gerda zeigt npc-oednis/folgen.ts in Akt 2 und 3 tagsüber eine feste Platzierung mit eigenem
// Gespräch (ole-akt2, „die Kabel singen“); diese Phasen greifen sonst (mit Brief, nachts, im Nachspiel).
import type { Condition } from '../../../modules/contracts';
import { type Menue, erz, knoten, sprecher } from './_welt';
import {
  type Akt23, AKT2_NUR, AKT3_NACHT, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, alle, erweitere, phasen, thema,
} from './_lz-akt23';

const ID = 'ole-gaehn';
const O = sprecher(ID);
const G = sprecher('gerda-gleis');
const BRIEF: Condition = { flag: 'gerda_brief_ole' };
const Z = [{ text: 'Ole. OLE. Noch was.', next: 'menue' }, { text: 'Schlaf weiter.' }];

export function akt23(M0: Menue): Akt23 {
  const M = erweitere(M0, [
    thema(ID, 'kabel', 'Hörst du die Kabel noch singen?', 'o23-kabel'),
  ], [
    knoten('o23-kabel', [
      O('Jede Nacht. Unter dem Areal. „Danke für Ihre Geduld.“ Immer wieder. Ich hab keine Geduld. Ich hab nur Müdigkeit. Und jetzt nicht mal mehr die.', 'besorgt'),
      O('Gerda sagt, ich soll mir Watte in die Ohren stopfen. Ich hab’s versucht. Die Watte hat angefangen zu summen. Das war vielleicht Einbildung. Vielleicht.'),
    ], { choices: Z }),
  ]);

  return phasen(ID, 'ole-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        erz('Ole liegt auf der Bank, die Mütze übers Gesicht gezogen. Er schnarcht. Als du näherkommst, schnarcht er lauter. Dann dreht er sich um. Mit dem Hintern zu dir.'),
        O('… Ich schlaf. Für dich schlaf ich für immer. Der Wachroboter Rudolf auch. Wir haben das abgesprochen.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [
        O('Du warst weg. Also nicht weg. Aber so ein bisschen wie ich. Wach, aber nicht da.', 'besorgt'),
        O('Willkommen zurück. Setz dich. Die Bank ist breit genug für zwei Leute, die zu spät ausgestiegen sind.'),
      ],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        O('Die Kabel singen jetzt ein anderes Lied. Leiser. Wie ein Wiegenlied. Die neue … die neue Stimme hat gefragt, ob es mich stört.', 'ueberrascht'),
        O('Ich hab gesagt: Nein. Ich hab sechsunddreißig Jahre schlecht geschlafen. Jetzt singt mir eine KI was vor. Das Leben ist komisch.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [
        O('Die Kabel sind still. Ganz still. Ich hab drei Tage durchgeschlafen. Hartlauf hat mich für tot erklärt und einen Kranz bestellt.', 'freude'),
        O('Den Kranz hab ich behalten. Ich schlaf jetzt drauf. Er riecht nach Tanne.'),
      ],
    },
    {
      id: 'epilog-gerda', when: alle(EPILOG_FREI, { flag: 'ole_gerda_bahnsteig' }), taeglich: true,
      gruss: [
        erz('Auf der Bank sitzen zwei. Ole, gekämmt. Daneben Gerda Gleis mit rotem Schal, links getragen. Sie lösen gemeinsam ein Kreuzworträtsel. Ole schläft dabei nicht ein.'),
        G('Elf senkrecht: „Pünktlich“. Neun Buchstaben.'),
        O('Das Wort kenn ich nicht.'),
      ],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [erz('Ole schläft. Er lächelt dabei. Ein Spatz sitzt auf seinem Besen und schläft auch.'), O('… Bin wach. Fast. Schön, dass du da bist.')],
      plausch: [O('Das Areal ist ruhig. Keine Drohnen, keine singenden Kabel, keine Wachkolosse. Nur ich. Ich bin der lauteste Teil hier. Das ist neu.')],
    },
    {
      id: 'akt3', when: alle(AKT3_NACHT, { time: 'nacht' }),
      gruss: [
        erz('Es ist mitten in der Nacht, und Ole sitzt aufrecht auf der Bank. Hellwach. Unter dem Areal brummt es, lauter als je zuvor.'),
        O('Hörst du das? Die singen heute alle. Gleichzeitig. Wie ein Chor, der nur ein Wort kann.', 'besorgt'),
        O('Wenn du da hingehst, wo das herkommt … mach’s aus. Ich will schlafen. Ich will einfach nur wieder schlafen.'),
      ],
    },
    {
      id: 'akt2-gerda', when: alle(AKT2_NUR, BRIEF), taeglich: true,
      gruss: [
        erz('Ole sitzt aufrecht. Er hat dunkle Ringe unter den Augen, aber er hat sich gekämmt. Neben ihm liegt eine Thermoskanne mit rotem Schal drumgewickelt.'),
        O('Gerda bringt mir jetzt Kaffee. Morgens. Damit ich nachts, wenn die Kabel singen, nicht allein wach bin. Sie sagt, Fundsachen muss man pflegen.', 'verlegen'),
      ],
      plausch: [O('Sie hat mir erzählt, dass die Leute im Fundbüro komisch geworden sind. Höflich. Ich hab gesagt: Wenn du je höflich wirst, Gerda, dann hau ich dir mit dem Besen auf den Chip. Sie hat gelacht.')],
    },
  ]);
}
