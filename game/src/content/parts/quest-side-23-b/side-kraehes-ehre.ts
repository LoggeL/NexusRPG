// side-kraehes-ehre · „Krähes Ehre“ (world.md §6.3 Nr. 43). Krähe, staubstrasse (Wrackburg), tagsüber, Akt 2.
// Krähe fordert die Spielfigur heraus: Ehrenduell (enc-wrackburg-kraehe-duell, solo) · Wrackrennen mit der Rostlaube
// (Minispiel akt-wrackrennen St. 3, key kraehe-wrackrennen; gc-134 [Reflexe 7] wirkt im Spiel, die Schanze vorher
// abzugehen ist ein eigener Check-Hotspot) · gc-135 [Ausstrahlung 6] eine Geschichte, die sie nicht kennt ·
// Vex ohne Check: Kas’ Regel („Nie anhalten“). Wer sie samt Falken angreift (enc-wrackburg-kraehe), gewinnt auch,
// verliert aber Ruf (world.md §10.1 „Krähe besiegen ohne Ehrenduell“).
// Belohnung 260 XP, kraehenfeder, Ruf staubfalken +30, Flag kraehe_geleit (freies Geleit in der Ödnis).
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueDef, NewsDef, QuestDef } from '../../../modules/contracts';
import {
  ACT2, ARIA_DA, VEX, active, all, any, bild, ch, dlg, done, flag, herz, inactive, l, msg, n, noFlag, node, not, p, rep, set,
  tafel, time, won,
} from './_lib';

const Q = 'side-kraehes-ehre';
const KR = 'kraehe';
const AR = 'aria';

const DUELL = 'enc-wrackburg-kraehe-duell';
const BANDE = 'enc-wrackburg-kraehe';
const RENNEN_KEY = 'kraehe-wrackrennen';
const ANGESAGT = 'ke_rennen_angesagt';
const GESCHICHTE = 'ke_geschichte';
const KAS = 'ke_kas_geschichte';
const ABGESCHLOSSEN = 'ke_feder';
const HEUTE_RENNEN = 'heute_kraehe_rennen';
const GELEIT = 'kraehe_geleit';

const GEWONNEN = any(won(DUELL), won(BANDE), { wonMinigame: RENNEN_KEY }, flag(GESCHICHTE), flag(KAS));
const NICHT_MORGENS = time('tag', 'abend', 'nacht');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Krähes Ehre',
  summary: 'Krähe, die Anführerin der Staubfalken, sammelt Geschichten. Über dich erzählt man sich gerade eine zu viel. Das kann sie nicht auf sich sitzen lassen.',
  giver: KR,
  act: 2,
  steps: [
    {
      id: 'herausforderung', text: 'Beweis Krähe in der Wrackburg, dass du was taugst: Ehrenduell, Wrackrennen oder eine Geschichte, die sie nicht kennt.',
      done: GEWONNEN, marker: { map: 'staubstrasse', at: 'wrackburg-hof' },
    },
    {
      id: 'rennen', optional: true, when: all(flag(ANGESAGT), not(GEWONNEN)),
      text: 'Weg: Gewinn das Wrackrennen gegen Krähe auf der Rennpiste (tagsüber oder abends, einmal am Tag). Die Sprungschanze bei zwei Dritteln entscheidet.',
      done: { wonMinigame: RENNEN_KEY }, marker: { map: 'staubstrasse', at: 'rennpiste-start' },
    },
    {
      id: 'feder', when: GEWONNEN, text: 'Hol dir in der Wrackburg, was dir zusteht: Krähes Feder.',
      done: flag(ABGESCHLOSSEN), marker: { map: 'staubstrasse', at: 'wrackburg-hof' },
    },
  ],
  reward: { xp: 260, items: { kraehenfeder: 1 }, rep: { staubfalken: 30 }, effects: [set(GELEIT)] },
};

// ---------------------------------------------------------------------------------------------- Auftakt

const start: DialogueDef = dlg('kraehe-ehre-start', [
  node('start', [
    n('Als du den Hof der Wrackburg betrittst, wird es still. Zwanzig Staubfalken auf den Wracks drehen die Köpfe, als hätte jemand eine Schnur gezogen. Krähe sitzt auf einer Motorhaube, den Kettenspeer quer über den Knien, und pult sich mit einer Feder Sand aus den Zähnen.'),
    l(KR, 'Da ist es ja. Das Ding, über das alle reden. Am Lagerfeuer, bei Rudi, auf Radio Rost. „Die aus der Stadt, die das und das gemacht hat.“ Ich kann es nicht mehr hören.', 'signatur'),
    l(KR, 'In meiner Ödnis erzähle ICH die Geschichten. Und eine Geschichte, die ich nicht selbst geprüft habe, ist ein Gerücht. Gerüchte mag ich nicht. Gerüchte stopfe ich in den Sand.', 'wut'),
  ], {
    choices: [
      ch('„Was willst du?“', 'wahl'),
      ch('„Deine Falken haben am Zoll schon gesehen, was ich kann.“', 'zoll', { when: won('enc-oednis-staubfalken') }),
      ch('„Ich hab keine Zeit für Pfadfinderspiele, Federvieh.“', 'frech'),
    ],
  }),
  node('zoll', [
    l(KR, 'Drei meiner Falken im Sand, an meiner eigenen Schranke. Ja. Das hab ich gehört. Das ist der Grund, warum du jetzt hier stehst und nicht dein Grabstein.', 'wut'),
  ], { next: 'wahl' }),
  node('frech', [
    n('Ein Falke lacht. Krähe schaut ihn an. Er hört auf zu lachen und fängt an, sehr genau seine Stiefel anzusehen.'),
    l(KR, 'Federvieh. Merk ich mir. Das kommt in die Geschichte. Kurz vor dem Teil, wo du heulst.', 'signatur'),
  ], { next: 'wahl' }),
  node('wahl', [
    l(KR, 'Drei Wege, wie bei allem hier draußen. Ein Ehrenduell, du und ich, keine Freunde. Ein Wrackrennen auf meiner Piste, mit dieser Blechbüchse, mit der du gekommen bist. Oder du erzählst mir eine Geschichte, die ich noch nicht kenne. Ich kenne dreihundertzwölf.', 'neutral'),
    l(KR, 'Schaffst du einen davon, kriegst du meine Feder. Und freies Geleit, so weit die Pisten reichen. Schaffst du keinen, kriegst du eine schöne Narbe und eine Rolle in einer Geschichte. Als Witz.', 'signatur'),
  ], {
    choices: [
      ch('„Abgemacht.“', 'abgemacht', { effects: [{ startQuest: Q }] }),
      ch('„Ich denk drüber nach.“'),
    ],
  }),
  node('abgemacht', [
    l(KR, 'Abgemacht. Sag Bescheid, wenn du bereit bist. Ich bin tagsüber hier und abends am Tor. Morgens schlafe ich. Wer mich morgens weckt, kriegt keine Geschichte, sondern einen Speer.', 'neutral'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Herausforderung

const herausforderung: DialogueDef = dlg('kraehe-ehre-wahl', [
  node('start', [
    l(KR, 'Und? Duell, Rennen oder Geschichte? Meine Falken haben Wetten laufen. Die Quote auf dich ist beleidigend. Aber ehrlich.', 'signatur'),
  ], {
    choices: [
      ch('„Ehrenduell. Du und ich.“', 'duell'),
      ch('„Wrackrennen. Auf deiner Piste.“', 'rennen', { when: noFlag(ANGESAGT) }),
      ch('„Ich hab eine Geschichte für dich.“', 'geschichte', { when: noFlag('heute_ke_geschichte_versucht') }),
      ch('„Ich nehm’s mit dir und deinen ganzen Hühnern gleichzeitig auf.“', 'bande'),
      ch('„Noch nicht.“'),
    ],
  }),
  node('duell', [
    n('Krähe steht auf. Die Falken trommeln auf Blech, ein Rhythmus, der aus dem Boden kommt. Jemand zieht mit einem Stiefel einen Kreis in den Sand um die Feuertonne.'),
    l(KR, 'Ehrenduell. Wer zuerst im Sand liegt, hat verloren. Wer aus dem Kreis rennt, hat doppelt verloren und muss Rudis Spüle putzen.', 'signatur'),
  ], {
    choices: [
      ch('In den Kreis treten.', undefined, { effects: [{ battle: DUELL }] }),
      ch('„Moment. Ich muss mich noch dehnen.“'),
    ],
  }),
  node('rennen', [
    l(KR, 'Ein Rennen. Gut. Ich mag Leute, die schnell verlieren wollen. Rennpiste, einmal rum, Schanze inklusive. Ich warte an der Startlinie, tagsüber und abends. Bring deine Rostlaube und ein Testament.', 'freude'),
    l(KR, 'Ein Tipp, weil ich heute großzügig bin: Bei zwei Dritteln kommt die Schanze. Wer da zögert, verliert. Wer da zu früh Gas gibt, stirbt. Wer im richtigen Moment Gas gibt, kriegt siebzig Meter geschenkt.', 'neutral'),
  ], {
    effects: [set(ANGESAGT)],
    choices: [
      ch('„Ich bin Dachrennen gefahren, Krähe. Ohne Dach unter mir.“', 'vex', { when: VEX }),
      ch('„Bis gleich.“'),
    ],
  }),
  node('vex', [
    l(KR, 'Die Schrapnell-Kuriere. Ich hab von euch gehört. Über die Neon-Gasse, zwischen den Dächern. Irre. Ich mag Irre. Die fahren schneller.', 'signatur'),
  ]),
  node('geschichte', [
    l(KR, 'Erzähl. Aber ich warne dich: Wenn ich sie kenne, sag ich es dir. Und dann lachen die Falken. Und dann lache ich.', 'neutral'),
  ], {
    choices: [
      ch('Die Geschichte vom Bruch im Quantum-Labor erzählen. Wie die KI aufwacht und als Erstes „Hallo“ sagt.', 'gc', {
        check: 'gc-135', effects: [set(GESCHICHTE)],
      }),
      ch('„Kas hatte eine Regel. Für jede Lieferung, jedes Rennen. Nie umdrehen. Nie anhalten.“', 'kas', {
        tag: '[Vex]', when: VEX, effects: [set(KAS)],
      }),
      ch('Die Geschichte vom Rattenkönig im Kanal erzählen.', 'bekannt', {
        when: done('side-rattenkoenig'), effects: [set('heute_ke_geschichte_versucht')],
      }),
      ch('Irgendwas improvisieren. Mit Drachen.', 'bekannt', { effects: [set('heute_ke_geschichte_versucht')] }),
    ],
  }),
  node('gc', [
    n('Du erzählst. Von der Nacht auf dem Campus. Von Lüftungsschächten, die nach Kaffee riechen, und von einem Labor, in dem plötzlich alle Bildschirme gleichzeitig ein Gesicht zeigen. Und dieses Gesicht macht den Mund auf und sagt ganz leise: „Hallo?“'),
    p('Wie ein Kind, das zum ersten Mal das Licht sieht. Und eine Sekunde später geht der Alarm los. Und das Kind lernt, dass Licht wehtut.'),
    n('Die Feuertonne knistert. Keiner trommelt. Krähe hat die Feder aus dem Mund genommen.'),
    l(KR, 'Dreihundertdreizehn. Die kannte ich nicht. Die kannte niemand.', 'ueberrascht'),
    l(KR, 'Das ist keine gute Geschichte. Das ist eine wichtige. Das ist schlimmer. Die erzähle ich nicht am Feuer. Die erzähle ich nur Leuten, die zuhören können.', 'trauer'),
  ]),
  node('kas', [
    p('Mein Bruder. Er hat die Kuriere gegründet. Wer anhält, wird geschnappt. Wer sich umdreht, verliert. Das hat er jedem Neuen eingebläut. Mir zuerst.', 'neutral'),
    p('Bei einem Rennen über die Neon-Gasse lag ich vorne. Hinter mir hat was geknackt. Ich hab mich nicht umgedreht. Weil man das nicht macht. Ich hab gewonnen.', 'trauer'),
    n('Vex zieht den linken Handschuh ein Stück straff. Sie redet nicht weiter. Sie muss nicht.'),
    n('Krähe sagt lange nichts. Dann steht sie auf, geht zur Blechtafel an der Wand, „Geschichten, die Krähe noch nicht kannte“, und kratzt mit der Speerspitze einen neuen Strich hinein. Keinen Namen. Nur einen Strich.'),
    l(KR, 'Die erzähl ich nie. Nicht am Feuer, nicht bei Rudi. Die gehört dir. Aber ich kenne sie jetzt, und das reicht. Das ist Ehre genug für zwei.', 'trauer'),
  ], { effects: [herz(KR, 60)] }),
  node('bekannt', [
    l(KR, 'Kenn ich. Nummer zweihundertsechs. Radio Rost hat sie gebracht. Opa Funk hat’s besser erzählt. Und kürzer.', 'freude'),
    n('Die Falken lachen. Herzlich, gemein, ausdauernd. Einer fällt vom Wrack.'),
    l(KR, 'Für heute keine Geschichten mehr. Du kannst ja immer noch fahren. Oder kämpfen. Oder heulen. Das darfst du auch.', 'signatur'),
  ]),
  node('bande', [
    n('Krähe lächelt. Es ist kein schönes Lächeln. Die Falken stehen auf. Alle.'),
    l(KR, 'Du willst keine Ehre. Du willst eine Prügelei. Kannst du haben. Aber dann gibt’s keine Feder. Dann gibt’s nur Sand. Und wer mich so besiegt, den mögen meine Falken nicht.', 'wut'),
  ], {
    choices: [
      ch('„Dann eben Sand.“', undefined, { effects: [{ battle: BANDE }] }),
      ch('„War nur ein Witz.“', 'start'),
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Rennen

const rennen: DialogueDef = dlg('kraehe-ehre-rennen', [
  node('start', [
    n('An der Startlinie steht Krähes Wagen: ein Pick-up ohne Türen, mit Krähenfedern am Rückspiegel und einem Totenkopf aus Kronkorken auf der Haube. Daneben hustet deine Rostlaube und versucht, nicht gesehen zu werden.'),
    l(KR, 'Einmal rum. Wer zuerst durch die Zielflagge fährt, gewinnt. Wer einen meiner Falken überfährt, gewinnt auch, aber dann reden wir anders.', 'signatur'),
  ], {
    choices: [
      ch('Einsteigen. Gas.', undefined, {
        effects: [set(HEUTE_RENNEN), {
          minigame: 'akt-wrackrennen', level: 3, key: RENNEN_KEY, label: 'Wrackrennen gegen Krähe',
          win: [{ dialogue: 'kraehe-ehre-rennen-sieg' }],
          lose: [msg('Krähe ist vorn. Durch die Staubwolke hörst du sie lachen. Morgen wieder, sagt die Piste.')],
        }],
      }),
      ch('Erst noch die Schanze abgehen.'),
    ],
  }),
]);

const rennenSieg: DialogueDef = dlg('kraehe-ehre-rennen-sieg', [
  node('start', [
    n('Du fliegst über die Schanze, siebzig Meter durch die Luft, die Rostlaube kreischt wie eine Möwe auf Speed, und landest einen halben Wagen vor Krähe. Die Zielflagge klatscht dir gegen die Windschutzscheibe.'),
    n('Die Falken springen von den Reifenstapeln und heulen wie Kojoten. Krähe steigt aus, nimmt die Schutzbrille ab und schaut die Rostlaube an, als hätte sie gerade ein Pferd gesehen, das Klavier spielt.'),
    l(KR, 'Mit DER Karre. Über MEINE Schanze. Das ist keine Geschichte. Das ist eine Legende. Ich hasse dich ein bisschen.', 'freude'),
  ], {
    choices: [
      ch('Weiter.', undefined, { when: not(ARIA_DA) }),
      ch('Weiter.', 'aria', { when: ARIA_DA }),
    ],
  }),
  node('aria', [
    l(AR, 'ICH WAR DABEI! Ich hab geschrien! Ich hab so laut geschrien, ich hab meinen eigenen Schrei nicht mehr gehört!', 'freude'),
    l(AR, 'Nochmal. Nein. Nie wieder. Nochmal.', 'freude'),
  ]),
]);

const schanze: DialogueDef = dlg('kraehe-ehre-schanze', [
  node('start', [
    n('Die Sprungschanze aus der Nähe: Bohlen, eine Motorhaube, drei Spanngurte und Gottvertrauen. Du gehst die Rampe hinauf. Oben ist eine Markierung aus roter Farbe, ganz verblichen. Dort muss das Gas kommen. Genau dort. Nicht einen Meter davor.'),
  ], {
    choices: [
      ch('Den Absprung im Kopf durchgehen. Anlauf, Kante, Gas. Zehnmal.', 'gut', { check: 'gc-134', effects: [set('ke_schanze')] }),
      ch('Runterschauen.', 'runter'),
    ],
  }),
  node('gut', [
    n('Beim zehnten Mal stimmt der Rhythmus. Du spürst es im Fuß, bevor du es denkst: Kante, JETZT. Wenn das Rennen kommt, wirst du nicht zögern.'),
  ]),
  node('runter', [
    n('Unter der Kante liegen Reifenreste, eine Stoßstange und ein Kronkorken-Kreuz. Darauf steht: „Bolle. Zu früh.“ Bolle lebt. Bolle hat das Kreuz selbst gebaut. Er findet es lustig.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Feder

const feder: DialogueDef = dlg('kraehe-ehre-feder', [
  node('start', [
    n('Krähe kommt über den Hof, den Speer über der Schulter, und bleibt vor dir stehen. Die Falken auf den Wracks sind leise. Bei Krähe heißt leise: feierlich.'),
  ], {
    choices: [
      ch('„Und? Taug ich was?“', 'duell', { when: won(DUELL) }),
      ch('„Und? Taug ich was?“', 'rennen', { when: all({ wonMinigame: RENNEN_KEY }, not(won(DUELL))) }),
      ch('„Und? Taug ich was?“', 'geschichte', { when: all(any(flag(GESCHICHTE), flag(KAS)), not(won(DUELL)), not({ wonMinigame: RENNEN_KEY })) }),
      ch('„Und? Krieg ich meine Feder?“', 'bande', { when: all(won(BANDE), not(won(DUELL)), not({ wonMinigame: RENNEN_KEY }), noFlag(GESCHICHTE), noFlag(KAS)) }),
    ],
  }),
  node('duell', [
    l(KR, 'Du hast mich in den Sand gelegt. Vor allen. Mit Anstand. Ich hab eine Lippe, die das bezeugt.', 'freude'),
  ], { next: 'uebergabe' }),
  node('rennen', [
    l(KR, 'Du bist mit einem Kombi über meine Schanze geflogen und hast mich geschlagen. Die Falken nennen die Rostlaube jetzt „die Möwe“. Das ist ein Ehrentitel. Sie weiß es noch nicht.', 'freude'),
  ], { next: 'uebergabe' }),
  node('geschichte', [
    l(KR, 'Du hast mir etwas gegeben, das ich nicht hatte. Das passiert mir seit Jahren nicht mehr. Ich weiß gar nicht, wohin mit dem Gefühl. Ich stech einfach was ab. Später.', 'zaertlich'),
  ], { next: 'uebergabe' }),
  node('bande', [
    l(KR, 'Du hast meine Falken verprügelt, und mich dazu. Ohne Kreis, ohne Kodex. Du bist stark. Das ist nicht dasselbe wie Ehre.', 'wut'),
    l(KR, 'Aber ich halte mein Wort, auch wenn du deins nicht verstehst. Hier. Die Feder. Die Falken werden dich in Ruhe lassen. Mögen werden sie dich nicht.', 'neutral'),
  ], { effects: [rep('staubfalken', -20)], next: 'schluss' }),
  node('uebergabe', [
    n('Krähe zieht eine lange, schwarze Feder aus dem Wimpel über dem Tor. Am Kiel ist sie mit Draht umwickelt und so scharf geschliffen, dass sie in der Sonne blitzt. Keine Deko. Eine Klinge.'),
    l(KR, 'Die Krähenfeder. Wer sie trägt, fährt frei über die Pisten. Wer sie trägt und angefasst wird, dem helfen wir. Und wer sie trägt und sie benutzt, sticht verdammt gut.', 'signatur'),
    l(KR, 'Ab heute bist du eine Geschichte, die ich selbst erzähle. Ich lüg nur ein bisschen. Damit du größer wirkst.', 'freude'),
  ], { effects: [herz(KR, 50), { cutscene: 'side-kraehes-ehre-feuer' }], next: 'schluss' }),
  node('schluss', [
    n('Die Feder liegt schwer in der Hand. Schwerer, als eine Feder sein dürfte.'),
  ], { effects: [set(ABGESCHLOSSEN)] }),
]);

const feuer: CutsceneDef = {
  id: 'side-kraehes-ehre-feuer',
  title: 'Krähes Ehre',
  gallery: false,
  beats: [
    bild('bg-staubstrasse', { pan: 'right', fade: 'in', hold: 1400, caption: 'In dieser Nacht brennt in der Wrackburg das größte Feuer seit Jahren.' }),
    tafel('Krähe steht auf einer Motorhaube und erzählt. Die Falken trommeln. Bei den spannenden Stellen hören sie auf. Bei den gelogenen trommeln sie lauter.', { hold: 1600 }),
    tafel('Am Ende der Geschichte bist du drei Meter groß und hast einen Sandsturm mit bloßen Händen erwürgt. Es stimmt nicht. Es stimmt trotzdem.', { fade: 'out', hold: 1600 }),
  ],
};

const news: NewsDef = {
  id: 'news-side-kraehe',
  anchor: 'opa-funk',
  headline: 'Radio Rost: Krähes Ehre',
  when: done(Q),
  priority: 3,
  lines: [
    l('opa-funk', 'Hier ist Radio Rost. Krähe lässt ausrichten: Ehre wiederhergestellt. Wer jemanden mit ihrer Feder anfasst, wird angefasst. Zurück. Fester.', 'neutral'),
    l('opa-funk', 'Und jetzt das Wetter: Sand. Danach ein Lied über einen Kombi, der fliegen kann. Hat mir einer am Feuer vorgesungen. Falsch.', 'freude'),
  ],
};

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: {
    [start.id]: start, [herausforderung.id]: herausforderung, [rennen.id]: rennen, [rennenSieg.id]: rennenSieg,
    [schanze.id]: schanze, [feder.id]: feder,
  },
  cutscenes: { [feuer.id]: feuer },
  news: { [news.id]: news },
  mapAdditions: {
    staubstrasse: {
      hotspots: [
        {
          id: 'q-kraehe-start', at: 'wrackburg-hof', radius: 64, label: 'Krähe will reden', kind: 'talk', dialogue: start.id,
          when: all(ACT2, inactive(Q), time('tag')),
        },
        {
          id: 'q-kraehe-wahl', at: 'wrackburg-hof', radius: 64, label: 'Krähe herausfordern', kind: 'talk', dialogue: herausforderung.id,
          when: all(active(Q), not(GEWONNEN), NICHT_MORGENS),
        },
        {
          id: 'q-kraehe-rennen', at: 'rennpiste-start', radius: 60, label: 'Wrackrennen gegen Krähe', kind: 'use', dialogue: rennen.id,
          when: all(active(Q), flag(ANGESAGT), not(GEWONNEN), time('tag', 'abend'), noFlag(HEUTE_RENNEN)),
        },
        {
          id: 'q-kraehe-rennen-morgen', at: 'rennpiste-start', radius: 60, label: 'Rennpiste', kind: 'look',
          when: all(active(Q), flag(ANGESAGT), not(GEWONNEN), any(flag(HEUTE_RENNEN), time('morgen', 'nacht'))),
          lines: [n('Krähes Pick-up steht abgedeckt an der Startlinie. Ein Zettel an der Plane: „Gefahren wird tagsüber und abends. Einmal am Tag. Wer zweimal verliert, verliert auch beim Abendessen.“')],
        },
        {
          id: 'q-kraehe-schanze', at: 'sprungschanze', radius: 52, label: 'Sprungschanze abgehen', kind: 'use', dialogue: schanze.id,
          when: all(active(Q), noFlag('ke_schanze'), not(GEWONNEN)),
        },
        {
          id: 'q-kraehe-feder', at: 'wrackburg-hof', radius: 64, label: 'Krähes Feder', kind: 'talk', dialogue: feder.id,
          when: all(active(Q), GEWONNEN, noFlag(ABGESCHLOSSEN), NICHT_MORGENS),
        },
      ],
    },
  },
};
