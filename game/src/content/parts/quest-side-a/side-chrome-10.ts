// Nebenquest 7 `side-chrome-10` „Chrome 10“ (world.md §6.2 Nr. 7). Dexter, Schrottmarkt, tagsüber.
// Start: main-1-dexter (Gutschein-Weg) oder Dexters Gejammer hier. Gutschein-Gerd verkauft „Chrome 10“ als Wertanlage
// → Beweise (Drucker im Hinterhof, Kassenterminal gc-60 [Technik 6], enttäuschte Kunden) → Gerd stellen:
// gc-61 [Körper 5] vor Publikum einschüchtern · [Collin ♥2] Live-Entlarvung (meinung +1) · Beweise vorlegen · Kampf
// enc-markt-gerd. Belohnung: 180 XP, bis 300 Cr, echter-chrome-10-code, Dexters Restschuld bei Hunter erledigt.
import type { ContentPart } from '../../part';
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, dlg, done, flag, hearts, ich, inactive, l, msg, nar, node, noFlag, not, set, time, tschuess, VEX } from './_lib';

const Q = 'side-chrome-10';
const G = 'gutschein-gerd';
const DX = 'dexter';
const BEWEIS = any(flag('gerd_beweis_drucker'), flag('gerd_beweis_kasse'), flag('gerd_beweis_kunden'));
const GESTELLT = any(flag('gerd_erledigt'), { won: 'enc-markt-gerd' });

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Chrome 10',
  summary: 'Dexter hat seine Ersparnisse in „Chrome 10“-Gutscheine gesteckt. Die steigen im Wert, sagt Gutschein-Gerd. Gerd sagt viel.',
  giver: DX,
  act: 1,
  steps: [
    {
      id: 'beweise', text: 'Sammle Beweise gegen Gutschein-Gerd: der Hinterhof hinter seinem Stand, sein Kassenterminal, seine Kunden.',
      done: BEWEIS, marker: { map: 'schrottmarkt' },
    },
    {
      id: 'stellen', text: 'Stell Gutschein-Gerd. Tagsüber an seinem Stand, abends im Hinterhof.',
      done: GESTELLT, marker: { map: 'schrottmarkt' },
      effects: [{ give: 'echter-chrome-10-code' }],
    },
    {
      id: 'dexter', text: 'Bring Dexter die gute Nachricht. Und den echten Code.',
      when: GESTELLT, done: flag('chrome10_dexter'), marker: { map: 'schrottmarkt' },
    },
  ],
  reward: {
    xp: 180,
    relations: { dexter: 60 },
    effects: [set('dexter_schuld_erledigt'), set('chrome10_markenpiraterie'), msg('Dexters Restschuld bei Hunter ist beglichen. Hunter hat gelächelt. Kurz. Es sah schmerzhaft aus.')],
  },
};

// ---------------------------------------------------------------------------------------------- Dexter

const dexter: DialogueDef = dlg('side-chrome10-dexter', [
  node('start', [
    nar('Dexter sitzt vor seinem Wellblechbüro und fächelt sich mit einem Stapel Gutscheine Luft zu. Auf jedem prangt „CHROME 10 – 10 % AUF ALLES!“.'),
    l(DX, 'Die steigen im Wert. Die STEIGEN. Gerd sagt, in einem Jahr sind die das Doppelte wert. Oder das Dreifache. Er war sich nicht ganz sicher, aber er war sehr überzeugend.', 'besorgt'),
  ], {
    choices: [
      { text: '„Dexter. Das ist Altpapier mit Selbstbewusstsein.“', when: inactive(Q), next: 'auftrag' },
      { text: '„Gerd ist erledigt. Hier: ein echter Code.“', when: all(active(Q), GESTELLT), next: 'ende' },
      { text: '„Ich bin dran.“', when: all(active(Q), not(GESTELLT)), next: 'warten' },
      tschuess('„Viel Glück mit der Wertanlage.“'),
    ],
  }),
  node('auftrag', [
    l(DX, 'Altpapier? Mit … oh nein. Oh nein. Oh nein nein nein.', 'trauer'),
    nar('Dexter hält einen Gutschein gegen das Licht. Das Hologramm ist mit Kugelschreiber gemalt. Unten steht: „Gedruckt in den Lötgassen“.'),
    l(DX, 'Ich schulde Hunter noch Geld. Ich hab ihm gesagt, das hier ist meine Altersvorsorge. Er hat gelacht. Hunter lacht nie. Das hätte mich warnen sollen.', 'trauer'),
    l(DX, 'Bitte. Gerd steht da hinten, zwischen den Ständen. Hol mir mein Geld zurück. Oder wenigstens meine Würde. Mein Geld wäre mir lieber.'),
  ], { effects: [{ startQuest: Q }] }),
  node('warten', [l(DX, 'Ich halte durch. Ich hab drei Gutscheine gegessen, um Kosten zu sparen. Die schmecken nach Druckerpatrone.', 'besorgt')]),
  node('ende', [
    nar('Du drückst Dexter den echten Code in die Hand. Er starrt darauf, als wäre es ein Lottoschein. Dann rennt er in sein Büro, kommt mit einem Taschenrechner zurück und rechnet.'),
    l(DX, 'Wenn ich den an Ripper verkaufe … und das Geld von Gerd … und Hunter gebe … Ich bin schuldenfrei. SCHULDENFREI!', 'freude'),
    l(DX, 'Ich war noch nie schuldenfrei! Wie fühlt man sich da? Muss ich jetzt erwachsen werden?', 'ueberrascht'),
  ], {
    choices: [
      { text: '„Ja.“', next: 'schluss' },
      { text: '„Nein. Du bist Dexter.“', next: 'schluss' },
      { text: '[Vex] „Kauf dir einen Helm. Erwachsene tragen Helme.“', when: VEX, next: 'schluss' },
    ],
  }),
  node('schluss', [l(DX, 'Ich zahl immer! Irgendwann! …Heute! Heute war irgendwann!', 'freude')], { effects: [set('chrome10_dexter')] }),
]);

// ---------------------------------------------------------------------------------------------- Beweise

const kunden: DialogueDef = dlg('side-chrome10-kunden', [
  node('start', [
    nar('Zwischen den Ständen steht ein Grüppchen Leute mit bunten Gutscheinen in der Hand. Ein Rentner mit Hörgerät, eine Frau mit drei Kindern, ein Rostzahn, der aussieht, als hätte er geweint.'),
    l('frau-klingel', 'Hundert Credits hab ich bezahlt! Für zehn Prozent auf alles! Ich hab’s im Quantum-Laden probiert, da haben sie mich ausgelacht! Mein Radio hat auch gelacht!', 'wut'),
    nar('Ihr Hörimplantat spielt dazu leise einen Schlager. Er heißt „Du hast mich belogen (Club Mix)“.'),
  ], {
    choices: [
      { text: '„Wer will mit mir zu Gerd und sein Geld zurück?“', next: 'mob' },
      tschuess('„Tut mir leid für euch.“'),
    ],
  }),
  node('mob', [
    l('frau-klingel', 'Ich! Und der hier! Und der! Der Rostzahn auch, der weint nur wegen der Zwiebeln!', 'freude'),
    nar('Du hast jetzt Zeugen. Und ein Publikum. Gerd wird sich freuen.'),
  ], { effects: [set('gerd_beweis_kunden'), { rep: 'unterstadt', delta: 2 }] }),
]);

// ---------------------------------------------------------------------------------------------- Gerd stellen

const gerd: DialogueDef = dlg('side-chrome10-gerd', [
  node('start', [
    nar('Gutschein-Gerd: Glitzersakko, Zahnweißlächeln, ein Bauchladen voller Gutscheine. Er riecht nach Parfüm und nach Druckertinte.'),
    l(G, 'Chrome 10! Die Wertanlage der Zukunft! Zehn Prozent auf alles, bald zwanzig, bald dreißig! Wer jetzt kauft, kauft Zeit! Wer wartet, wartet umsonst!', 'freude'),
  ], {
    choices: [
      { text: '„Deine Gutscheine sind Fälschungen, Gerd. Und du weißt es.“', next: 'stellen' },
      tschuess('(Weitergehen.)'),
    ],
  }),
  node('stellen', [
    l(G, 'Fälschungen? Das ist … Rufmord! Das ist … Geschäftsschädigung! Haben Sie Beweise, Schätzchen?', 'wut'),
  ], {
    choices: [
      {
        text: 'Dich vor ihm aufbauen. Laut, damit der halbe Markt zuhört. „Gerd. Du gibst den Leuten jetzt ihr Geld zurück. Sonst gebe ich dir was zurück. Ins Gesicht.“',
        check: 'gc-61', next: 'eingeschuechtert',
      },
      {
        text: '„Collin! Kamera an!“', tag: '[Collin ♥2]', requires: hearts('collin-charleston', 2), next: 'collin',
      },
      { text: '„Ich hab deinen Drucker gesehen. Im Hinterhof. Die Tinte ist noch feucht.“', when: flag('gerd_beweis_drucker'), next: 'beweis' },
      { text: '„Ich hab deine Käuferliste. Und dein Geld.“', when: flag('gerd_beweis_kasse'), next: 'beweis' },
      { text: '„Die Leute hier hinter mir. Frag sie selbst.“', when: flag('gerd_beweis_kunden'), next: 'beweis' },
      { text: '„Keine Beweise. Nur Fäuste.“', next: 'kampf' },
      tschuess('„Noch nicht.“'),
    ],
  }),
  node('eingeschuechtert', [
    nar('Du sagst es nicht laut. Du sagst es so, dass jeder es hört. Der Fischhändler hört auf zu schuppen. Ein Kind lässt seinen Kreisel fallen.'),
    l(G, 'Ich … wir können über alles reden. Wir sind doch Geschäftsleute. Hier, das sind … Rückzahlungen. Für alle. Mit Zinsen. Kleinen Zinsen. Symbolischen.', 'besorgt'),
    nar('Gerd stopft dir einen Umschlag in die Hand und verteilt den Rest seiner Kasse mit zitternden Fingern an die Leute.'),
    l(G, 'Und das hier … das ist ein echter Code. Für den Notfall. Mein Notfall ist jetzt.'),
  ], { effects: [{ credits: 150 }, set('gerd_erledigt'), { rep: 'unterstadt', delta: 5 }] }),
  node('collin', [
    nar('Wie gerufen biegt Collin Charleston um die Ecke, Kameramann im Schlepptau, Frisur im Wind.'),
    l('collin-charleston', 'Live! Exklusiv! Unglaublich! Hier am Schrottmarkt: der Mann, der die Zukunft druckt! Gerd, sagen Sie unseren Zuschauern: Was ist echt an „Chrome 10“?', 'freude'),
    l(G, 'Die … die Farbe?', 'besorgt'),
    l('collin-charleston', 'Die FARBE! Sie haben es gehört! Bleiben Sie dran, nach der Werbung: Wie man einem Betrüger seine Glitzerjacke auszieht!'),
    nar('Gerd flieht, lässt Bauchladen und Kasse zurück. Die Leute bedienen sich bei ihren Rückzahlungen. Ein echter Code liegt zwischen den Fälschungen.'),
  ], { effects: [{ credits: 100 }, set('gerd_erledigt'), set('meinung_plus_chrome10'), { relation: 'collin-charleston', delta: 30 }] }),
  node('beweis', [
    l(G, 'Na gut. Na GUT. Ein bisschen gefälscht. Aber nur ein bisschen! Die Idee war echt!', 'trauer'),
    l(G, 'Hier. Das ist ein echter Code, für meinen privaten Gebrauch. Und das hier ist für Dexter. Sag ihm, ich war nie hier. Ich bin jetzt in der Ödnis. Da gibt es keine Gutscheine. Nur Sand.'),
  ], { effects: [{ credits: 100 }, set('gerd_erledigt')] }),
  node('kampf', [
    l(G, 'Securitaaaas! Kundenbindung! KUNDENBINDUNG!', 'wut'),
    nar('Zwei Gestalten in viel zu engen Anzügen tauchen hinter dem Stand auf. Einer hat einen Schlagstock, der andere einen Stapel Gutscheine, mit dem er dich sehr ernst ansieht.'),
  ], { effects: [{ battle: 'enc-markt-gerd' }] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [dexter.id]: dexter, [kunden.id]: kunden, [gerd.id]: gerd },
  mapAdditions: {
    schrottmarkt: {
      hotspots: [
        {
          id: 'q-chrome10-dexter', at: 'dexter-buero', radius: 60, label: 'Dexter und die Wertanlage', kind: 'talk', dialogue: dexter.id,
          when: all(done('main-1-dexter'), noFlag('chrome10_dexter'), any(inactive(Q), active(Q)), time('tag', 'abend', 'nacht')),
        },
        {
          id: 'gerds-drucker', at: 'gerds-hinterhof', radius: 56, label: 'Drucker im Hinterhof', kind: 'look', once: true,
          when: active(Q), hideWhen: flag('gerd_beweis_drucker'),
          lines: [
            nar('Hinter Gerds Stand, unter einer Plane: ein Farbdrucker, der heiß läuft. Daneben Stapel frischer Gutscheine, eine Schablone mit Quantum-Logo und eine Kaffeetasse mit „BESTER CHEF“.'),
            ich('„Wertanlage“. Frisch aus dem Drucker. Noch warm.'),
          ],
          effects: [set('gerd_beweis_drucker')],
        },
        {
          id: 'gerds-kasse', at: 'gerds-hinterhof', radius: 56, label: 'Gerds Kassenterminal', kind: 'check', check: 'gc-60',
          when: active(Q), hideWhen: any(flag('gerd_beweis_kasse'), GESTELLT),
          lines: [nar('Ein Kassenterminal mit abgeklebtem Display, Passwort-Zettel: „NICHT 1234“.')],
          altText: 'Das Terminal ist besser gesichert als Gerds Gewissen. Andere Beweise: der Drucker unter der Plane, die geprellten Kunden am Markt.',
          effects: [
            set('gerd_beweis_kasse'), { credits: 150 },
            msg('Käuferliste geknackt: 47 Namen, 3200 Credits. 150 davon liegen als „Bearbeitungsgebühr“ jetzt bei dir. Den Rest verteilst du nach der Liste. Fast den ganzen Rest.'),
          ],
        },
        {
          id: 'q-chrome10-kunden', at: 'marktplatz-mitte', radius: 60, label: 'Geprellte Gutscheinkunden', kind: 'talk', dialogue: kunden.id,
          when: all(active(Q), noFlag('gerd_beweis_kunden'), not(GESTELLT), time('tag')),
        },
        {
          id: 'q-chrome10-gerd', at: 'gerds-stand', radius: 60, label: 'Gutschein-Gerd stellen', kind: 'talk', dialogue: gerd.id,
          when: all(active(Q), not(GESTELLT), time('tag')),
        },
        {
          id: 'q-chrome10-gerd-abends', at: 'gerds-hinterhof', radius: 60, label: 'Gutschein-Gerd im Hinterhof stellen', kind: 'talk', dialogue: gerd.id,
          when: all(active(Q), not(GESTELLT), time('abend')),
        },
      ],
    },
  },
};
