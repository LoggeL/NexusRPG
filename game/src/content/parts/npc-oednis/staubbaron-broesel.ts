// Staubbaron Brösel – Wasserhändler zu Wucherpreisen an der Staubstraße (world.md §6.3 side-glasherz, §6.7
// kopfgeld-staubbaron-broesel; act23.json npcSchedules). Gegenspieler ohne Herzsystem (maxHearts 1, keine Herz-Ereignisse).
// Das Kopfgeld selbst (Hotspot, Wege, Kampf) und gc-138 (Ei abschwatzen) bauen Kopfgeld- bzw. Quest-Pakete.
import type { ContentPart } from '../../part';
import type { Condition, DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, erz, flag, geschenke, gespraech, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_oednis';

const ID = 'staubbaron-broesel';
const B = sprecher(ID);
const Z = zurueck('Noch was, Brösel.', 'Verschluck dich an deinem Wasser.');

const GLASHERZ_LAEUFT: Condition = { quest: 'side-glasherz', state: 'active' };
const KOPFGELD: Condition = { job: 'kopfgeld-staubbaron-broesel' };
const HEUTE = 'heute_broesel_wasser';
const GESTELLT: Condition = { any: [{ flag: 'kg_staubbaron_broesel_gestellt' }, { flag: 'kg_staubbaron_broesel_erledigt' }] };

const choices: DialogueChoice[] = [
  {
    text: 'Einen Becher Wasser kaufen. (25 Cr)', when: { notFlag: HEUTE }, next: 'kauf',
    effects: [{ credits: -25 }, { heal: 15 }, flag(HEUTE)],
  },
  {
    text: '„Fünfundzwanzig? In der Stadt kostet das einen.“ Runterhandeln.', tag: '[Straße 5]', when: { notFlag: HEUTE },
    check: pruefung('broesel-feilschen', 'strasse', 5, ['feilschen']), next: 'gehandelt',
    effects: [{ credits: -8 }, { heal: 15 }, flag(HEUTE)],
  },
  {
    text: 'Ihm den Becher aus der Hand nehmen und selbst einschenken.', tag: '[Körper 6]', when: { notFlag: HEUTE },
    check: pruefung('broesel-einschuechtern', 'koerper', 6, ['einschuechtern']), next: 'genommen',
    effects: [{ heal: 15 }, flag(HEUTE), { rep: 'aussiedler', delta: 1 }],
  },
  { text: 'Woher hast du das ganze Wasser?', next: 'herkunft' },
  { text: 'Warum „Staubbaron“?', next: 'titel' },
  { text: '„Hast du zufällig ein Skorpion-Ei gesehen? Groß, durchsichtig, wütende Mutter?“', when: GLASHERZ_LAEUFT, next: 'ei' },
  { text: '„Auf dich ist ein Kopfgeld ausgesetzt, Brösel.“', when: KOPFGELD, next: 'kopfgeld' },
  { text: 'Verschluck dich an deinem Wasser.' },
];

const nodes: DialogueNode[] = [
  knoten('kauf', [
    erz('Brösel schenkt einen Becher ein. Halb voll. Er hält ihn gegen das Licht, gießt einen Schluck zurück und reicht ihn dir.'),
    B('Bitte sehr. Bergquellwasser. Aus einem Berg. Irgendwo. Trink langsam, es ist teuer.', 'signatur'),
  ]),
  knoten('gehandelt', [
    B('Acht? Acht! Du ruinierst mich! Ich hab Kinder! Ich hab keine Kinder, aber ich könnte welche haben, und die müssten hungern!', 'wut'),
    erz('Er schenkt trotzdem ein. Voll. Du siehst, wie es ihn innerlich zerreißt.'),
  ]),
  knoten('genommen', [
    erz('Du nimmst den Becher, die Kanne und schenkst dir selbst ein. Bis zum Rand. Brösel öffnet den Mund, sieht deine Arme und schließt ihn wieder.'),
    B('Das … war eine Spende. Genau. Eine großzügige Spende von Brösel an die Durstigen. Schreib das auf. Irgendwo. Wo es keiner liest.'),
  ]),
  knoten('herkunft', [
    B('Geschäftsgeheimnis. Ich sag nur so viel: Es ist sauber, es ist nass und es ist meins. Seit ich die Leitung vom alten Pumpenhaus umgeleitet hab. Ups. Hab ich nichts gesagt.', 'ueberrascht'),
    B('Der Brunnen der Aussiedler? Der ist halt alt. Brunnen gehen kaputt. Ganz von allein. Manchmal mit ein bisschen Hilfe von niemandem.'),
  ], { choices: Z }),
  knoten('titel', [
    B('Weil ich der Herr über den Staub bin! Jedes Korn hier draußen dürstet. Und wer stillt den Durst? Brösel. Gegen eine kleine Gebühr. Eine angemessene Gebühr. Eine marktübliche Gebühr. Ich bin der Markt.', 'signatur'),
    ich('Du bist ein Wucherer mit Hut.'),
    B('Ein Wucherer mit sehr gutem Hut. Echtes Kunstleder.'),
  ], { choices: Z }),
  knoten('ei', [
    B('Ein Ei? Ich? Pff. Ich handle mit Wasser, nicht mit Eiern. Eier sind schmutzig. Eier sind unter meiner Würde.', 'besorgt'),
    erz('Seine linke Hand wandert zur Hosentasche, in der eine Glasdünen-Karte steckt. Mit einem Kreuz drauf. Er bemerkt deinen Blick und steckt sie tiefer.'),
    B('Aber falls … rein theoretisch … jemand so ein Ei hätte … dann wäre das sicher ein Sammlerstück. Mit Sammlerpreis. Nur so gesagt.'),
  ], { choices: Z, effects: [flag('broesel_ei_verraten')] }),
  knoten('kopfgeld', [
    B('Kopfgeld? Auf mich? Auf einen ehrlichen Geschäftsmann? Wer zahlt denn so was? Die Aussiedler? Die haben doch gar kein Geld! Weil sie alles mir geben!', 'wut'),
    B('Hör zu, Freund. Wir können das wie Erwachsene regeln. Du kriegst Wasser umsonst. Ein Leben lang. Na gut, eine Woche. Na gut, einen Becher.'),
  ], { choices: Z }),
];

const M: Menue = { zeile: B('Noch was? Reden macht durstig. Und Durst macht mich reich.'), choices, nodes };

const T = {
  erstes: gespraech('broesel-tag-erstes', [
    erz('Unter einem Sonnenschirm mit Fransen steht ein kleiner, schwitzender Mann in einem viel zu großen Mantel, mit einem Hut aus glänzendem Kunstleder. Vor ihm ein Tisch mit Wasserkanistern, ein Preisschild: „Wasser – Tagespreis“. Der Tagespreis ist durchgestrichen und dreimal höher neu geschrieben.'),
    B('Durst? Natürlich hast du Durst. Alle haben Durst. Willkommen beim Staubbaron! Brösel mein Name, Wasser mein Spiel, Gewinn mein Hobby.', 'signatur'),
  ], M),
  standard: gespraech('broesel-tag-standard', [B('Wasser! Frisches Wasser! Nasser als nass! Billiger als … nein, nicht billiger. Aber nasser!')], M),
  glasherz: gespraech('broesel-tag-glasherz', [
    erz('Brösel zuckt zusammen, als er dich kommen sieht, und stellt schnell einen Kanister vor eine Kiste mit Luftlöchern. Aus der Kiste klirrt es leise.'),
    B('Ah! Kundschaft! Keine Kiste. Da ist keine Kiste. Wasser?', 'besorgt'),
  ], M),
  frieden: gespraech('broesel-tag-frieden', [
    B('Dieser Friedensvertrag ist eine Katastrophe! Die Falken verlangen keinen Zoll mehr, die Aussiedler teilen ihr Wasser, und die Leute sind nicht mehr verzweifelt genug für meine Preise!', 'wut'),
    B('Verzweiflung war mein Geschäftsmodell! Was soll ich jetzt verkaufen? Hoffnung? Die gibt’s schon umsonst. Bei Rudi. Mit Pfannkuchen.'),
  ], M),
};

const broesel = weltfigur({
  id: ID,
  name: 'Staubbaron Brösel',
  unknownName: 'Wasserhändler mit Kunstlederhut',
  portrait: ID,
  sprite: 'passant-schrotti-walk',
  faction: 'aussiedler',
  maxHearts: 1,
  bio: 'Verkauft Wasser zu Wucherpreisen an der Staubstraße und hat dafür die Leitung vom alten Pumpenhaus umgeleitet. Kunstlederhut, zu großer Mantel, kein Gewissen. Kopfgeld Stufe 3.',
  gifts: geschenke({
    loves: ['kassenbuch', 'alte-euromuenze', 'goldknauf-replik'],
    likes: ['edelbrause', 'sonnenbrille-gold'],
    dislikes: ['wasserfilter', 'samenbombe'],
    hates: ['handschellen', 'beglichener-schuldschein'],
  }),
  schedule: [
    // Gestellt oder abgeliefert (Flags wie quest-pers-jobs/_kopfgeld.ts mit key 'staubbaron-broesel'): weg.
    weg('*', { when: GESTELLT }),
    ort('T', 'glasduenen', 'broesel-versteck', { when: { all: [GLASHERZ_LAEUFT, { notFlag: 'glasherz_ei_zurueck' }] } }),
    ort('T', 'staubstrasse', 'broesel-wasserstand'),
    weg('*'),
  ],
  talk: [
    rede('broesel-tag-erstes', nichtGetroffen(ID)),
    rede('broesel-tag-glasherz', { all: [GLASHERZ_LAEUFT, { notFlag: 'glasherz_ei_zurueck' }] }),
    rede('broesel-tag-frieden', { quest: 'side-oednis-frieden', state: 'done' }),
    rede('broesel-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: broesel },
  dialogues: sammle(T.erstes, T.standard, T.glasherz, T.frieden),
};
