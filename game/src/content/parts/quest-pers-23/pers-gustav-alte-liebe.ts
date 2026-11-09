// pers-gustav-alte-liebe · „Die alte Liebe“ (world.md §6.5, Gustav ♥8, Akt 2). Ersetzt den Platzhalter aus integration/luecken.ts.
// Start: he-opa-gustav-8 (npc-kinder-alte/opa-gustav.ts). Gustav gibt den Brief (Schrottmarkt oder Oldie-Ecke im HV),
// Elsa sitzt am Aussiedlerhof. Wege zu Elsas Ja: `[Ausstrahlung 5]`, Werkstatt reparieren (`[Technik 6]`, Werkbank-Minispiel,
// drei Schrott-Ersatzteile, oder ohne Check einen ganzen Tag mitschrauben). Dann Gustav holen, abends Oldie-Tanz am Lagerfeuer.
import type { QuestDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import {
  L, N, active, all, any, bye, byId, c, cc, chk, cut, dlg, ding, flag, give, item, karten, msg, node, noFlag, noItem, not,
  rede, rel, schritt, set, spiel, stelle, szene, tafel, tage, take, time, zeit,
} from './_lib';

const Q = 'pers-gustav-alte-liebe';
const G = 'opa-gustav';
const E = 'elsa';
const BRIEF = 'p23-gustavs-brief';
const AKTIV = active(Q);
const JA = flag('gal_elsa_ja');
const KOMMT = flag('gal_gustav_kommt');

const quest: QuestDef = {
  id: Q, kind: 'personal', act: 2, giver: G,
  title: 'Die alte Liebe',
  summary: 'Gustav hat siebzehn Seiten an Elsa geschrieben, fünfzehn durchgestrichen. Sie lebt draußen am Aussiedlerhof und schraubt an allem, was sich nicht wehrt. Bring ihr den Brief. Und bring ihn dazu, selbst zu kommen.',
  steps: [
    schritt('brief', 'Hol Gustavs Brief ab (Schrottmarkt; freitagabends Oldie-Ecke im High Voltage).', any(item(BRIEF), JA), ['schrottmarkt', 'schrottkram-stand']),
    schritt('elsa', 'Bring Elsa den Brief (Aussiedlerhof, Werkstatt, morgens und tagsüber).', JA, ['aussiedlerhof', 'elsas-werkstatt'], { when: any(item(BRIEF), JA) }),
    schritt('gustav', 'Sag Gustav, dass Elsa ihn sehen will.', KOMMT, ['schrottmarkt', 'wohnwagen'], { when: JA }),
    schritt('tanz', 'Abends am Aussiedlerhof: Gustav sitzt auf der Bank. Bring die beiden ans Lagerfeuer.', 'gal_getanzt', ['aussiedlerhof', 'gustav-bank'], { when: KOMMT }),
  ],
  reward: { xp: 300, credits: 0, relations: { [G]: 150, [E]: 80 }, rep: { aussiedler: 10 } },
};

const brief = ding(BRIEF, 'Gustavs Brief', 'Siebzehn Seiten Kranführer-Handschrift, fünfzehn davon durchgestrichen. Auf den letzten zwei steht „Hallo“ und darunter, sehr klein: „Der Kran heißt immer noch wie du.“', 'zeitung-papier');

// ------------------------------------------------------------------------------------------- Gustav (Brief und Bescheid)
const gustav = dlg('p23-gal-gustav', [
  node('start', [
    L(G, 'Da bist du ja. Ich hab ihn. Den Brief. Er ist … er ist nicht gut. Aber er ist ehrlich. Und er riecht nach Kranöl, das kann ich nicht ändern.', 'verlegen'),
  ], {
    choices: [
      c('Den Brief nehmen.', 'brief', { when: all(noItem(BRIEF), not(JA)), effects: [give(BRIEF)] }),
      c('„Elsa will dich sehen. Heute Abend, am Lagerfeuer.“', 'bescheid', { when: all(JA, not(KOMMT)) }),
      bye('Später.'),
    ],
  }),
  node('brief', [
    L(G, 'Aussiedlerhof. Draußen, hinter der Staubstraße. Sie hat damals gesagt: „Gustav, ich geh dahin, wo was wächst.“ Ich hab gesagt: „Hier wächst Rost.“ Das war der dümmste Satz meines Lebens. Und ich hab viele gesagt.', 'trauer'),
    L(G, 'Wenn sie den Brief wegwirft … sag mir nicht, in welchen Eimer.'),
  ], { effects: [msg('Gustavs Brief eingesteckt. Er ist warm, weil Gustav ihn den ganzen Tag in der Brusttasche hatte.')] }),
  node('bescheid', [
    L(G, 'Heute? HEUTE? Ich hab nichts zum Anziehen! Ich hab ein Hemd! Das andere ist das Hemd von gestern!', 'ueberrascht'),
    L(G, 'Gut. Gut. Ich zieh das Hemd an. Und die Hose, die nicht nach Hydraulik riecht. Ich hab eine. Glaub ich. Ich nehm den Konvoi. Ich bin da, wenn die Sonne runtergeht.', 'freude'),
  ], { effects: [set('gal_gustav_kommt'), msg('Gustav kommt heute Abend zum Aussiedlerhof.')] }),
]);

// ------------------------------------------------------------------------------------------- Elsa
const elsa = dlg('p23-gal-elsa', [
  node('start', [
    N('Elsas Werkstatt ist ein Wellblechschuppen voller Dinge, die halb repariert sind und halb vergessen. Vom Dach tropft es auf eine Werkbank, unter der Werkbank steht ein Eimer, der Eimer ist voll. Elsa, weißes Haar unter einer Schweißerbrille, sieht den Umschlag und erkennt die Schrift.'),
    L(E, 'Nein. Nein, nein. Das ist Gustavs Gekrakel. Der Mann schreibt wie ein Kran, der Lesen gelernt hat.', 'ueberrascht'),
    N('Sie liest. Lange. Bei Seite siebzehn lacht sie einmal, kurz und wütend. Dann setzt sie die Brille ab und wischt sie an der Schürze, obwohl die Brille nicht schmutzig ist.'),
    L(E, '„Der Kran heißt immer noch wie du.“ Dieser alte Idiot. Vierzig Jahre und dann das. Und ich hab hier ein Dach, das leckt, eine Pumpe, die hustet, und keine Zeit für alte Idioten.', 'trauer'),
  ], {
    choices: [
      cc('„Er hat dich nie vergessen, Elsa. Er hat einen Kran nach dir benannt. Wer macht so was?“', 'ja', chk('gal-reden', 'ausstrahlung', 5, ['ueberreden', 'gefuehl'])),
      c('„Dann flicken wir zuerst dein Dach. Danach hast du Zeit.“', 'werkstatt'),
      c('„Er traut sich nicht selbst. Ich soll ihm sagen, ob du lachst oder weinst.“', 'lachen'),
      bye('„Denk drüber nach. Ich komm wieder.“'),
    ],
  }),
  node('lachen', [L(E, 'Ich lach. Und ich wein. Sag ihm beides. Oder nein. Sag ihm gar nichts, der soll gefälligst selbst fragen. … Aber erst, wenn das Dach dicht ist. Ich lass ihn nicht in einen Schuppen, in den es reinregnet.', 'verlegen')], { next: 'werkstatt' }),
  node('werkstatt', [
    L(E, 'Das Dach, die Pumpe, das Solarsegel. Alles auf einmal kaputt, wie bei Männern über achtzig. Wenn du mir hilfst, hab ich heute Abend Zeit. Für Feuer. Für sonst nix.', 'neutral'),
  ], {
    choices: [
      cc('Pumpe zerlegen, Dichtung tauschen, Solarsegel neu spannen.', 'repariert', chk('gal-werkstatt', 'technik', 6, ['reparieren'])),
      c('An der Werkbank die Pumpe zusammensetzen.', undefined, {
        tag: '[Werkbank]',
        effects: [spiel('akt-werkbank', 2, 'p23-gal-werkbank', 'Elsas Pumpe', [set('gal_repariert'), set('gal_elsa_ja'), rel(E, 30),
          msg('Die Pumpe läuft. Elsa sieht aus, als würde sie dich gleich adoptieren.')], [msg('Die Dichtung springt raus. Elsa: „Nochmal. Ich hab Zeit. Gustav auch, der wartet seit vierzig Jahren.“')])],
      }),
      c('Drei Schrott-Ersatzteile auf die Werkbank legen.', 'teile', { when: item('schrott-ersatzteil', 3), effects: [take('schrott-ersatzteil', 3)] }),
      c('Ärmel hoch. Den ganzen Tag mitschrauben, schleppen, fluchen.', 'tag', { effects: [zeit(360)] }),
      bye('„Ich hol Werkzeug.“'),
    ],
  }),
  node('teile', [N('Elsa wühlt durch die Teile, sortiert, wirft zwei weg, behält eins und baut damit die Pumpe neu, schneller, als du „Dichtungsring“ sagen kannst.')], { next: 'repariert' }),
  node('tag', [
    N('Sechs Stunden. Wellblech hoch aufs Dach, Nieten, Teer, Daumen. Elsa flucht in einem Dialekt, den es seit der Flut nicht mehr gibt. Du lernst drei neue Schimpfwörter und wie man eine Pumpe mit einem Löffel entlüftet.'),
  ], { next: 'repariert' }),
  node('repariert', [
    N('Es tropft nicht mehr. Der Eimer unter der Werkbank bleibt leer. Elsa starrt ihn an, als hätte er sie betrogen.'),
  ], { effects: [set('gal_repariert'), rel(E, 30)], next: 'ja' }),
  node('ja', [
    L(E, 'Na gut. Sag ihm, er soll kommen. Heute Abend, zum Lagerfeuer. Er soll das Hemd anziehen, das nicht nach Hydraulik riecht. Er hat eins. Hatte er jedenfalls mal.', 'zaertlich'),
    L(E, 'Und sag ihm … nein. Das sag ich ihm selbst.'),
  ], { effects: [set('gal_elsa_ja'), take(BRIEF), msg('Elsa will Gustav sehen. Sag ihm Bescheid.')] }),
]);

// ------------------------------------------------------------------------------------------- Abend am Hof
const abend = dlg('p23-gal-abend', [
  node('start', [
    N('Gustav sitzt auf der Bank vor dem Hof, das Hemd zugeknöpft bis oben, die Hände auf den Knien. Er hat eine Kassette mitgebracht. Und einen Kassettenrekorder, der älter ist als die Flutmauer.'),
    L(G, 'Ich trau mich nicht. Ich bin vierzig Jahre Kran gefahren, sechzig Meter hoch, bei Sturm. Und ich trau mich nicht zwanzig Meter zu einem Lagerfeuer.', 'besorgt'),
  ], {
    choices: [
      c('„Komm. Ich geh mit.“', 'feuer'),
      cc('„Du hast deinen Kran nach ihr benannt. Das hier ist einfacher.“', 'feuer', chk('gal-mut', 'ausstrahlung', 4, ['ermutigen'])),
      c('Die Kassette einlegen und auf Play drücken. Den Rest macht die Musik.', 'feuer'),
    ],
  }),
  node('feuer', [
    N('Elsa steht am Feuer, die Schweißerbrille in der Hand, als wüsste sie nicht, wohin mit ihr. Gustav bleibt zwei Meter vor ihr stehen. Keiner sagt was. Der Ziegenroboter meckert. Irgendwer lacht.'),
    L(E, 'Du bist alt geworden.', 'neutral'),
    L(G, 'Du nicht.', 'verlegen'),
    L(E, 'Lügner. Leg die Kassette ein.', 'freude'),
  ], {
    choices: [
      c('Mit den beiden tanzen. Erst er, dann sie, dann alle.', undefined, {
        tag: '[Tanzen]',
        effects: [spiel('akt-tanz', 2, 'p23-gal-tanz', 'Oldie-Tanz am Lagerfeuer',
          [rel(G, 20), rel(E, 20), cut('p23-gal-tanz'), set('gal_getanzt')], [cut('p23-gal-tanz'), set('gal_getanzt')])],
      }),
      c('Zurücktreten und zusehen.', undefined, { effects: [cut('p23-gal-tanz'), set('gal_getanzt')] }),
    ],
  }),
]);

const tanz = szene('p23-gal-tanz', 'Der letzte Zug nach Grün', [
  tafel('Aussiedlerhof, Lagerfeuer. Aus dem Kassettenrekorder kratzt „Der letzte Zug nach Grün“, 2034.', [
    N('Gustav tanzt wie ein Kran: langsam, präzise, mit sehr viel Vorwarnung. Elsa tanzt wie ein Schweißbrenner. Sie treffen sich irgendwo in der Mitte.'),
  ]),
  tafel('Die Aussiedler klatschen im Takt. Der Ziegenroboter dreht sich um sich selbst. Marla hält eine Laterne hoch, damit keiner ins Feuer tritt.', [
    L(E, 'Du trittst mir auf den Fuß.'),
    L(G, 'Seit vierzig Jahren. Ich hab geübt.'),
  ]),
  tafel('Als das Lied zu Ende ist, spult Gustav zurück. Keiner beschwert sich.', [
    L(G, '{name}. Danke. Das Zimmer über der Werkstatt hat ein Fenster. Man sieht von da keinen Kran. Ist mir egal.', 'zaertlich'),
  ], 1800),
], [set('gustav_elsa_zusammen'), msg('Gustav und Elsa sind wieder ein Paar. Freitags gibt es jetzt Oldies am Lagerfeuer.')]);

const doro = dlg('p23-gal-doro', [
  node('start', [
    L('konvoi-doro', 'Elsa? Weißes Haar, schweißt alles, flucht wie ein Hafenarbeiter? Hinterm Hofladen, die Werkstatt mit dem Eimer drunter. Sag ihr, die Kiste Nieten kommt nächste Woche. Sag ihr nicht, dass ich sie vergessen hab.', 'neutral'),
  ]),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  items: { [BRIEF]: brief },
  dialogues: byId(gustav, elsa, abend, doro),
  cutscenes: { [tanz.id]: tanz },
  mapAdditions: karten([
    ['schrottmarkt', rede('p23-gal-gustav-stand', 'schrottkram-stand', 'Gustav: Der Brief an Elsa', gustav.id,
      all(AKTIV, any(all(noItem(BRIEF), not(JA)), all(JA, not(KOMMT))), time('morgen', 'tag')))],
    ['schrottmarkt', rede('p23-gal-gustav-wohnwagen', 'wohnwagen', 'Gustav: Der Brief an Elsa', gustav.id,
      all(AKTIV, any(all(noItem(BRIEF), not(JA)), all(JA, not(KOMMT))), time('abend', 'nacht'), not(tage('fr'))))],
    ['high-voltage', rede('p23-gal-gustav-hv', 'oldie-ecke', 'Gustav: Der Brief an Elsa', gustav.id,
      all(AKTIV, any(all(noItem(BRIEF), not(JA)), all(JA, not(KOMMT))), time('abend'), tage('fr')))],
    ['staubstrasse', rede('p23-gal-doro', 'konvoi-halt', 'Konvoi-Doro nach Elsa fragen', doro.id, all(AKTIV, item(BRIEF)))],
    ['aussiedlerhof', rede('p23-gal-elsa', 'elsas-werkstatt', 'Elsa den Brief geben', elsa.id,
      all(AKTIV, item(BRIEF), noFlag('gal_elsa_ja'), time('morgen', 'tag')))],
    ['aussiedlerhof', stelle('p23-gal-gustav-bank', G, 'gustav-bank', abend.id, all(AKTIV, KOMMT, noFlag('gal_getanzt'), time('abend', 'nacht'))), 'npc'],
  ]),
};
