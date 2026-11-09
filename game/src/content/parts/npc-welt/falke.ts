// Falke – Quantum-Scharfschütze an der Hafenkante, Vegas Rivale (world.md §4.5). In pers-vega-adlerauge
// (quest-side-b) hat er Vegas Zielfernrohr; die Quest bringt eigene Hotspots am Kran und am Wohnwagen mit.
import type { ContentPart } from '../../part';
import type { DialogueChoice, DialogueNode } from '../../../modules/contracts';
import {
  type Menue, dialog, erz, flag, geschenke, gespraech, herz, ich, knoten, nichtGetroffen, ort, pruefung, rede, sammle,
  sprecher, weg, weltfigur, zurueck,
} from './_welt';

const ID = 'falke';
const QUEST = 'pers-vega-adlerauge';
const F = sprecher(ID);
const Z = zurueck('Noch was, Falke.', 'Ziel verfehlt. Ich geh.');

const choices: DialogueChoice[] = [
  { text: 'Was machst du da oben auf dem Kran?', next: 'kran' },
  { text: 'Kennst du Vega?', once: true, id: 'f-vega', next: 'vega' },
  { text: '„Du hast Vegas Zielfernrohr. Gib’s her.“', when: { quest: QUEST, state: 'active' }, next: 'fernrohr' },
  {
    text: 'Eine Runde am Schießstand gegen dich.', tag: '[Schießstand]', next: 'stand',
    effects: [{
      minigame: 'akt-schiessstand', level: 2, key: 'falke-schiessstand', label: 'Schießstand gegen Falke',
      win: [herz(ID, 15), { xp: 25 }, { message: 'Falke: „Glückstreffer. Zehnmal hintereinander. Statistisch auffällig.“' }],
      lose: [{ message: 'Falke: „Du hast den Wind ignoriert. Der Wind ignoriert dich nicht.“' }],
    }],
  },
  { text: 'Ziel verfehlt. Ich geh.' },
];

const nodes: DialogueNode[] = [
  knoten('kran', [
    F('Ich bewache das Quantum-Depot. Offiziell. Inoffiziell zähle ich Möwen. Siebenhundertzwölf. Eine hinkt.'),
    F('Ich hab seit drei Jahren keinen Schuss abgegeben. Quantum bezahlt mich fürs Bedrohlich-Aussehen. Ich sehe sehr bedrohlich aus. Ich übe vor dem Spiegel.'),
  ], { choices: Z }),
  knoten('vega', [
    F('Vega. Ja. Wir waren zusammen in der Ausbildung. Ich war Zweiter. Ich war immer Zweiter. Hinter ihr.'),
    F('Sie hat mal eine Fliege auf dreihundert Meter getroffen. Ich hab eine Fliege auf dreihundert Meter verfehlt. Die Fliege hat gelacht. Ich hab es gesehen. Mit Zielfernrohr.'),
  ], { choices: Z }),
  knoten('fernrohr', [
    F('„Gib’s her“? So läuft das nicht. Das Fernrohr hab ich ehrlich gewonnen. In einer Wette. Die ich manipuliert habe. Aber gewonnen.'),
    F('Wenn sie es will, soll sie es sich holen. Wie eine Schützin. Nicht wie eine, die Freunde schickt.'),
  ], { choices: Z }),
  knoten('stand', [F('Zehn Ziele. Wind von links. Und denk dran: Ich treffe nicht immer. Nur fast immer. Fast ist bei mir eine Maßeinheit.')]),
];

const M: Menue = { zeile: F('Noch was? Sprich schnell. Ein Ziel wartet nicht. Außer Möwen. Möwen warten immer.'), choices, nodes };

const T = {
  rivale: dialog('falke-tag-rivale', [knoten('start', [F('Du bist im Fadenkreuz.'), F('Ich schieß nicht. Aber ich guck. Lange. Hau ab.')])]),
  erstes: gespraech('falke-tag-erstes', [
    erz('Ganz oben auf dem Kranausleger liegt jemand auf dem Bauch, ein Gewehr wie eine Lanze neben sich. Als du die Leiter hochkommst, dreht er nur den Kopf. Quantum-Uniform, Augenimplantat, Kaugummi.'),
    F('Falke. Quantum-Sicherheit, Abteilung Hafen, Unterabteilung Kran. Ich bin die Unterabteilung. Was willst du?'),
  ], M),
  wohnwagen: gespraech('falke-tag-wohnwagen', [
    erz('Ein kleiner Wohnwagen hinter dem Depot. Aus dem Fenster leuchtet ein Fernseher, auf dem eine Kochsendung läuft. Falke sitzt im Bademantel davor und isst Nudeln.'),
    F('Feierabend. Ich bin nicht im Dienst. Ich bin nicht bedrohlich. Ich hab einen Bademantel mit Enten an. Sag es keinem.'),
  ], M),
  besiegt: gespraech('falke-tag-besiegt', [F('Vega hat ihr Fernrohr wieder. Na und? Ich hab noch meins. Es ist schlechter. Ich bin auch schlechter. Das passt dann.')], M),
  standard: gespraech('falke-tag-standard', [F('Du schon wieder. Ich hab dich vor zehn Minuten kommen sehen. Ich sehe alles. Das ist mein einziges Talent.')], M),
};

/** ♥2: Falke verfehlt etwas, das er nicht verfehlen darf. */
const he2 = dialog('he-falke-2', [
  knoten('start', [
    erz('Falke liegt auf dem Kran, das Gewehr im Anschlag. Unten am Depot rennt ein Junge mit einer Kiste Quantum-Riegel davon. Falke zielt. Er schießt nicht. Er zielt weiter.'),
    F('Wenn ich nicht schieße, krieg ich Ärger. Wenn ich schieße, krieg ich ein schlechtes Gewissen. Ich hasse diesen Job. Sag was.'),
  ], {
    choices: [
      { text: '„Schieß daneben. Ganz knapp. Das sieht wenigstens nach Arbeit aus.“', next: 'daneben' },
      { text: '„Melde, dass die Kiste verdorben war. Quantum glaubt jeden Unsinn.“', tag: '[Straße 4]', check: pruefung('he-falke-2-meldung', 'strasse', 4, ['bluff']), next: 'meldung' },
      { text: 'Dem Jungen hinterherlaufen und die Kiste zurückholen.', tag: '[Reflexe 4]', check: pruefung('he-falke-2-jagd', 'reflexe', 4, ['flucht']), next: 'jagd' },
    ],
  }),
  knoten('daneben', [erz('Ein Knall. Ein Mülleimer drei Meter neben dem Jungen fällt um. Der Junge rennt schneller. Falke lädt nach. Er lächelt.'), F('Verfehlt. Steht so im Bericht. Ich hab noch nie so gern verfehlt.')], { next: 'ende', effects: [herz(ID, 40), { xp: 30 }] }),
  knoten('meldung', [F('„Verdorbene Ware, sofort vernichtet.“ … Die haben „Danke für Ihre Aufmerksamkeit“ zurückgeschrieben. Mit Smiley. Quantum hat Smileys.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }] }),
  knoten('jagd', [erz('Du holst den Jungen an der Ecke ein. Er gibt dir die Kiste. Du gibst ihm drei Riegel. Er läuft weiter. Falke sieht alles. Er sagt nichts. Das ist bei ihm Zustimmung.')], { next: 'ende', effects: [herz(ID, 45), { xp: 40 }, { rep: 'unterstadt', delta: 1 }] }),
  knoten('ende', [F('Du bist kein schlechter Mensch. Das ist in meiner Branche fast eine Beleidigung. Aber ich mein’s nett.')], { effects: [flag('falke_respekt')] }),
]);

/** ♥4: Falke will gegen Vega gewinnen – einmal. */
const he4 = dialog('he-falke-4', [
  knoten('start', [
    erz('Abend im Wohnwagen. Falke putzt sein Gewehr. An der Wand hängt ein altes Foto: zwei junge Schützen, eine Frau mit Goldmedaille vorne, er dahinter, mit Silber.'),
    F('Weißt du, warum ich das Fernrohr genommen hab? Nicht, weil ich es brauche. Weil sie dann mal zu mir kommen muss. Statt ich zu ihr.'),
    F('Zwölf Jahre bin ich ihr hinterhergelaufen. Ich will einmal, dass sie mir hinterherläuft. Das ist kleinlich. Ich weiß.'),
  ], {
    choices: [
      { text: '„Sag ihr das. Nicht mit einem Gewehr. Mit Worten.“', tag: '[Ausstrahlung 5]', check: pruefung('he-falke-4-reden', 'ausstrahlung', 5, ['ueberreden']), next: 'reden' },
      { text: '„Zweiter hinter der Besten ist kein schlechter Platz.“', next: 'zweiter' },
      { text: '„Du bist ein armseliger Wichser, weißt du das?“', next: 'wichser' },
    ],
  }),
  knoten('reden', [F('Mit Worten. Ich hab noch nie mit Worten getroffen.'), erz('Er schreibt etwas auf einen Zettel und klebt ihn an das Foto: „Revanche. Ehrlich. Ohne Wette.“')], { next: 'ende', effects: [herz(ID, 60), flag('falke_revanche')] }),
  knoten('zweiter', [F('… Kein schlechter Platz. Hm. Auf dem Podest steht man trotzdem. Nur einen Kopf tiefer.'), F('Ich hab nie das Podest angeguckt. Immer nur sie.')], { next: 'ende', effects: [herz(ID, 50)] }),
  knoten('wichser', [F('Ja. Weiß ich.'), erz('Er lacht. Zum ersten Mal richtig.'), F('Endlich sagt’s mal einer. Danke. Ehrlich.')], { next: 'ende', effects: [herz(ID, 45)] }),
  knoten('ende', [
    ich('Was machst du, wenn du sie irgendwann schlägst?'),
    F('Weinen. Wahrscheinlich. Und dann hör ich auf. Ich wollte nie schießen. Ich wollte nur besser sein als irgendwer.'),
  ], { effects: [{ xp: 60 }] }),
]);

const falke = weltfigur({
  id: ID,
  name: 'Falke',
  unknownName: 'Schütze auf dem Kran',
  faction: 'quantum',
  bio: 'Quantum-Scharfschütze, bewacht vom Kranausleger das Depot an der Hafenkante. Ewiger Zweiter hinter Vega, seit der gemeinsamen Ausbildung. Zählt Möwen. Bademantel mit Enten.',
  gifts: geschenke({
    loves: ['zielfernrohr-linse', 'klingenpolitur', 'sternkarte'],
    likes: ['synth-kaffee', 'chips-tuete', 'kartendeck', 'algen-chips'],
    dislikes: ['glitzerschrott', 'poster-hv'],
    hates: ['magnet-stoerer', 'kanalschlamm'],
  }),
  schedule: [ort('T', 'hafenkante', 'falke-kran'), ort('N', 'hafenkante', 'falkes-wohnwagen'), weg('M,A')],
  heartEvents: [
    { id: 'he-falke-2', hearts: 2, map: 'hafenkante', time: 'tag', dialogue: 'he-falke-2' },
    { id: 'he-falke-4', hearts: 4, map: 'hafenkante', time: 'nacht', when: { seen: 'he-falke-2' }, dialogue: 'he-falke-4' },
  ],
  talk: [
    rede('falke-tag-rivale', { rival: ID }),
    rede('falke-tag-erstes', nichtGetroffen(ID)),
    rede('falke-tag-besiegt', { quest: QUEST, state: 'done' }),
    rede('falke-tag-wohnwagen', { time: 'nacht' }),
    rede('falke-tag-standard'),
  ],
});

export const part: ContentPart = {
  npcs: { [ID]: falke },
  dialogues: sammle(T.rivale, T.erstes, T.wohnwagen, T.besiegt, T.standard, he2, he4),
};
