// side-alte-gewohnheiten · „Alte Gewohnheiten“ (world.md §6.2 Nr. 50). Raven, glasarkaden + chrome-penthouse, N,
// nach main-1-auf-raven, Raven in der Party. Die Karten glasarkaden/chrome-penthouse liefern alle Wege und Flags
// (gc-143 Aufzug, gc-142 Wäscheschacht, gc-144 Albert, leckerli-schraube für Bijou, Seidentücher, Drohnenkampf);
// diese Datei liefert Quest, Start, Kiki-Weg ([Kiki ♥4] Schwebetaxi aufs Dach), Schritt-Flags und den Abschluss.
// Abschluss: nichts mitgenommen → Raven ♥ +60, Seidentuch → Raven ♥ +20. Meldung news-alte-gewohnheiten liegt in world/nachrichten.
// Raben-Motiv für side-wand-der-freiheit: dort über done(side-alte-gewohnheiten) freigeschaltet.
import type { ContentPart } from '../../part';
import type { Condition, DialogueDef, QuestDef } from '../../../modules/contracts';
import { ARIA_ROM, NOT_VEX, VEX, VEXARIA_ROM, active, all, ch, dlg, done, flag, hearts, inactive, l, n, noFlag, node, not, p, set } from './_q';

const Q = 'side-alte-gewohnheiten';
const RA = 'raven';
const KI = 'kiki-karbon';
const LIEFERHOF = 'alte-gewohnheiten-im-lieferhof';
const OBEN = 'alte-gewohnheiten-im-penthouse';
const GETARNT = 'alte-gewohnheiten-getarnt';
const GEMALT = 'alte-gewohnheiten-rabe-gemalt';
const RAUS = 'alte-gewohnheiten-entkommen';
const TUCH = 'alte-gewohnheiten-tuch';
const FERTIG = 'alte-gewohnheiten-besprochen';
const MIT_RAVEN: Condition = { companion: RA };
const NACHT: Condition = { time: 'nacht' };
const EINBRUCH_BEREIT = all(active(Q), NACHT, MIT_RAVEN);

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Alte Gewohnheiten',
  summary: 'Raven will wissen, ob sie eingerostet ist. Ein Einbruch ins Penthouse der Chrome-Schwestern, ohne etwas zu stehlen. Nur ein Rabe auf dem Spiegel.',
  giver: RA,
  act: 1,
  steps: [
    {
      id: 'lieferhof', text: 'Geh nachts mit Raven über den Lieferanteneingang am Stufenplatz in den Lieferhof der Glasarkaden.',
      done: flag(LIEFERHOF), marker: { map: 'glasarkaden', at: [1250, 880] },
    },
    {
      id: 'hinauf', text: 'Rauf ins Penthouse: Lastenaufzug, Wäscheschacht oder Kikis Schwebetaxi aufs Dach.',
      done: flag(OBEN), marker: { map: 'glasarkaden', at: [1440, 790] },
    },
    {
      id: 'rabe', text: 'Lass Raven ihren Raben auf Seraphinas Spiegel malen. Bijou darf nicht aufwachen.',
      done: flag(GEMALT), marker: { map: 'chrome-penthouse', at: [500, 318] },
    },
    {
      id: 'drohnen', text: 'Die Wachdrohnen haben euch gesehen. Durchbrechen und weg.', optional: true,
      done: { won: 'enc-penthouse-drohnen' },
      effects: [set('fahndung_1'), { message: 'Fahndung +1: Die Penthouse-Drohnen haben dein Gesicht gespeichert. In Großaufnahme.' }],
    },
    {
      id: 'raus', text: 'Raus, bevor Portier Albert seine Runde dreht – zurück in den Lieferhof.',
      when: flag(GEMALT), done: flag(RAUS), marker: { map: 'glasarkaden', at: [1250, 880] },
    },
    {
      id: 'abschluss', text: 'Red mit Raven über die Nacht.',
      when: flag(RAUS), done: flag(FERTIG), marker: { map: 'glasarkaden', at: [1250, 880] },
    },
  ],
  reward: { xp: 200, effects: [set('wand_motiv_raven_frei')] },
};

// ---------------------------------------------------------------------------------------------- Start

const start: DialogueDef = dlg('alte-gewohnheiten-start', [
  node('start', [
    n('Raven sitzt am Ende der Bar und dreht ein leeres Glas. Mit der anderen Hand rollt sie einen Dietrich über die Fingerknöchel, vor und zurück, ohne hinzusehen.'),
    l(RA, 'Sag mal. Findest du, dass ich eingerostet bin?', 'neutral'),
  ], {
    choices: [
      ch('„Du hast mich auf dem Schrottmarkt fast zerlegt. Nein.“', 'test'),
      ch('„Ein bisschen. Du hast heute zweimal die Tür benutzt.“', 'test-frech'),
      ch('„Keine Zeit für so was.“', 'spaeter'),
    ],
  }),
  node('test-frech', [
    l(RA, 'Freches Stück. Genau deshalb frag ich dich.', 'freude'),
  ], { next: 'test' }),
  node('test', [
    l(RA, 'Ich will wissen, ob ich es noch kann. Nicht für Geld. Nicht für Blade. Einfach so. Ein Einbruch, bei dem nichts fehlt.', 'signatur'),
    l(RA, 'Das Penthouse der Chrome-Schwestern. Siebenundvierzig Stockwerke über dem Glaspark. Portier, Wachdrohnen, ein Roboterpudel mit Schleife. Und Seraphinas Spiegel, so groß wie meine alte Zelle.', 'neutral'),
    l(RA, 'Ich mal einen Raben drauf. Mit schwarzem Lippenstift. Klein. Sie wird ihn sehen, wenn sie sich die Wimpern klebt, und eine Woche nicht mehr schlafen.', 'freude'),
    l(RA, 'Nachts. Über den Lieferanteneingang der Feinkost am Stufenplatz, da braucht man kein Drehkreuz. Du kommst mit. Ich brauch jemanden, der mir sagt, ob ich gut war.', 'neutral'),
  ], {
    choices: [
      ch('„Ich bin dabei. Was ziehe ich an?“', 'ja'),
      ch('„Gib mir ein, zwei Tage.“', 'spaeter'),
    ],
  }),
  node('ja', [
    l(RA, 'Schwarz. Weiche Sohlen. Und ein Gesicht, als würdest du Rosen liefern.', 'signatur'),
    l(RA, 'Hol mich ab, wenn es dunkel ist. Ohne mich gehst du da nicht rein. Mit mir kommst du vielleicht sogar wieder raus.', 'freude'),
  ], { effects: [{ startQuest: Q }] }),
  node('spaeter', [
    l(RA, 'Sicher. Ich bin ja nur eine Meisterdiebin, die sich langweilt. Was soll schon passieren.', 'neutral'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Kiki (Weg ohne Check)

const kiki: DialogueDef = dlg('alte-gewohnheiten-kiki', [
  node('start', [
    n('Du funkst Kiki an. Drei Minuten später schiebt sich ein Schwebetaxi lautlos über die Lieferhofmauer, alle Lichter aus. Nur das Radio spielt, ganz leise, Synthpop.'),
    l(KI, 'Süße! Ein Nachtflug aufs Chrome-Penthouse, ohne Flugplan, mit einer gesuchten Einbrecherin an Bord. Das ist das Romantischste, was mich je jemand gefragt hat.', 'freude'),
    l(RA, 'Ich bin nicht gesucht. Ich bin auf Bewährung.', 'neutral'),
    l(KI, 'Das sagen sie alle. Anschnallen. Wenn ich „jetzt“ sage, springt ihr. Wenn ich „Mist“ sage, springt ihr auch.', 'signatur'),
  ], {
    choices: [
      ch('Einsteigen.', 'flug'),
      ch('„Doch nicht. Wir nehmen einen anderen Weg.“'),
    ],
  }),
  node('flug', [
    n('Die Stadt kippt unter euch weg. Neon, Nebel, siebenundvierzig Stockwerke Glas. Kiki setzt das Taxi so sanft auf die Dachterrasse, dass nicht einmal die Bonsai wackeln.'),
    l(KI, 'Ich warte nicht. Ich war nie hier. Ruft mich nicht an, außer es ist lustig.', 'freude'),
  ], {
    effects: [set(GETARNT), set('alte-gewohnheiten-kiki'), { travel: 'chrome-penthouse', entry: 'dach', minutes: 10 }],
  }),
]);

// ---------------------------------------------------------------------------------------------- Abschluss

const abschluss: DialogueDef = dlg('alte-gewohnheiten-abschluss', [
  node('start', [
    n('Raven lehnt an einem Müllcontainer, als wäre er ein Barhocker. Sie wischt sich den Lippenstift vom Daumen. Ihre Augen glänzen.'),
    l(RA, 'Und? Sag es ehrlich. Bin ich eingerostet?', 'neutral'),
  ], {
    choices: [
      ch('„Du warst ein Geist. Ich hab dich zweimal verloren, und ich stand direkt neben dir.“', 'lob'),
      ch('„Der Pudel hat geschnarcht wie ein Laubbläser, und du bist trotzdem nicht zusammengezuckt. Nicht übel.“', 'lob'),
      ch('„Ehrlich? Du hast gekichert, als du den Schnabel gemalt hast.“', 'kichern'),
    ],
  }),
  node('kichern', [
    l(RA, 'Ich kichere nicht. Ich habe einen sehr leisen, sehr professionellen Atem gemacht.', 'verlegen'),
  ], { next: 'lob' }),
  node('lob', [
    l(RA, 'Gut. Gut. Ich hatte Angst, dass Blade mir das auch genommen hat.', 'trauer'),
  ], {
    choices: [
      ch('„Und? Nichts mitgenommen?“', 'sauber', { when: noFlag(TUCH) }),
      ch('„Und das Seidentuch in meiner Tasche?“', 'tuch', { when: flag(TUCH) }),
    ],
  }),
  node('sauber', [
    l(RA, 'Profis klauen nicht, wenn sie nur üben.', 'signatur'),
    l(RA, 'Das war das Beste daran. Siebenundvierzig Stockwerke voller Zeug, das mehr kostet als die ganze Unterstadt, und ich hab nur einen Raben dagelassen. Das ist kein Diebstahl. Das ist eine Unterschrift.', 'freude'),
  ], { effects: [{ relation: RA, delta: 60 }], next: 'nachsatz' }),
  node('tuch', [
    l(RA, 'Na gut. Ein bisschen üben.', 'neutral'),
    l(RA, 'Ich hab gesehen, wie du es eingesteckt hast. Du hast dabei die Zunge rausgestreckt. Das macht man nicht. Nie. Merk dir das.', 'signatur'),
  ], { effects: [{ relation: RA, delta: 20 }], next: 'nachsatz' }),
  node('nachsatz', [
    l(RA, 'Lass uns gehen. Bevor Albert seine Lieblingsrosen im Keller nicht findet und auf dumme Gedanken kommt.', 'freude'),
  ], {
    choices: [
      ch('„Nächstes Mal nehmen wir Zöpfe mit.“', 'vex-aria', { when: VEXARIA_ROM }),
      ch('„Erzählst du Aria davon?“', 'aria', { when: all(NOT_VEX, ARIA_ROM) }),
      ch('Gehen.', 'ende'),
    ],
  }),
  node('vex-aria', [
    l(RA, 'Aria? Die kann nicht schleichen. Die tritt Türen ein, und dann entschuldigt sie sich bei der Tür.', 'freude'),
    l(RA, 'Aber sie würde dir dabei zusehen, wie du durch einen Wäscheschacht kriechst. Mit einem Gesicht, als hätte sie dich am liebsten gleich da drin festgehalten. Ich hab gesehen, wie sie dich anschaut, Postbotin.', 'signatur'),
    p('Wie schaut sie mich denn an?', 'verlegen'),
    l(RA, 'Wie ich den Spiegel. Als wollte sie was draufschreiben, das nicht mehr abgeht.', 'zaertlich'),
  ], { next: 'ende' }),
  node('aria', [
    l(RA, 'Ich nicht. Du schon. Sie wird so tun, als wäre sie sauer, weil du ohne sie los bist. Und dann will sie jedes Detail hören. Zweimal.', 'freude'),
  ], { next: 'ende' }),
  node('ende', [
    n('Ihr geht über den Lieferanteneingang hinaus. Hinter euch, siebenundvierzig Stockwerke höher, sitzt ein kleiner schwarzer Rabe auf einem Spiegel und wartet auf den Morgen.'),
  ], { effects: [set(FERTIG)] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [start.id]: start, [kiki.id]: kiki, [abschluss.id]: abschluss },
  mapAdditions: {
    'high-voltage': {
      hotspots: [
        {
          id: 'alte-gewohnheiten-raven', at: 'bar-hocker', label: 'Raven', kind: 'talk', dialogue: start.id,
          when: all(inactive(Q), done('main-1-auf-raven'), { time: ['abend', 'nacht'] }),
        },
        {
          id: 'alte-gewohnheiten-raven-nachher', at: 'bar-hocker', label: 'Raven: über den Einbruch reden', kind: 'talk', dialogue: abschluss.id,
          when: all(active(Q), flag(RAUS), noFlag(FERTIG)),
        },
      ],
    },
    glasarkaden: {
      hotspots: [
        {
          id: 'alte-gewohnheiten-kiki', at: 'lieferhof', label: 'Kiki anfunken: Schwebetaxi aufs Dach', kind: 'use', dialogue: kiki.id,
          when: all(EINBRUCH_BEREIT, hearts(KI, 4), noFlag(GETARNT), noFlag(OBEN)),
        },
        {
          id: 'alte-gewohnheiten-ohne-raven', at: 'lieferhof', label: 'Lieferhof', kind: 'look',
          when: all(active(Q), noFlag(OBEN), not(EINBRUCH_BEREIT)),
          lines: [n('Der Lastenaufzug summt, die Feinkost-Rampe ist dunkel. Allein und bei Licht ist das hier nur ein Hinterhof. Raven wollte nachts, und sie wollte dabei sein.')],
        },
        {
          id: 'alte-gewohnheiten-abschluss', at: 'lieferhof', label: 'Raven', kind: 'talk', dialogue: abschluss.id,
          when: all(active(Q), flag(RAUS), noFlag(FERTIG)),
        },
      ],
      onEnter: [
        {
          id: 'alte-gewohnheiten-lieferhof', once: true, when: all(EINBRUCH_BEREIT, noFlag(LIEFERHOF)),
          effects: [set(LIEFERHOF), { message: 'Raven zieht die Kapuze hoch. „Ab hier keine Witze mehr. Okay, wenige.“' }],
        },
      ],
    },
    'chrome-penthouse': {
      onEnter: [
        { id: 'alte-gewohnheiten-oben', once: true, when: all(active(Q), noFlag(OBEN)), effects: [set(OBEN), set(LIEFERHOF)] },
      ],
    },
  },
};

// VEX bleibt für weitere Vex-Varianten importiert.
void VEX;
