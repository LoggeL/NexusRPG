// Nebenquest 10 `side-live-dabei` „Live dabei“ (world.md §6.2 Nr. 10). Kameramann, Collin, Delya; Stufenplatz, tagsüber.
// Kameradrohne in der Brackbucht (flutmauer) abgestürzt → bergen: gc-65 [Körper 5] tauchen (Flag schmutzig),
// gc-66 [Technik 4] Notfallprotokoll, magnetangel (alle drei als Hotspots der Karte, Flag kameradrohne_geborgen),
// Kampf gegen das Robohund-Rudel enc-bucht-kameradrohne (hier) → Story liefern im NX-1-Studio (Redaktion, Hotspot
// story-pitch): erledigte Quests als Angebot oder „Riesenratte im Kanal!“.
// Belohnung: presseausweis (Drehkreuz Glasarkaden schon in Akt 1); prep-grundriss Weg 3 kostenlos und prep-ablenkung
// Weg 1 ohne Check prüfen selbst `quest done`.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueChoice, DialogueDef, QuestDef } from '../../../modules/contracts';
import { active, all, any, dlg, done, flag, ich, inactive, l, msg, nar, node, noFlag, not, set, time, tschuess, VEX, VEXARIA_DABEI } from './_lib';

const Q = 'side-live-dabei';
const K = 'kameramann';
const C = 'collin-charleston';
const DE = 'delya-delloraine';
const GEBORGEN = any(flag('kameradrohne_geborgen'), { won: 'enc-bucht-kameradrohne' });

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Live dabei',
  summary: 'Die Kameradrohne von NX-1 ist in die Brackbucht gestürzt. Ohne Drohne keine Sendung, ohne Sendung kein Collin. Und ohne Story kein Grund, die Drohne zu bergen.',
  giver: K,
  act: 1,
  steps: [
    {
      id: 'drohne', text: 'Birg die Kameradrohne aus dem Schlick der Brackbucht (Flutmauer). Robohunde haben sie zum Spielzeug erklärt.',
      done: GEBORGEN, marker: { map: 'flutmauer' },
    },
    {
      id: 'story', text: 'Liefer im NX-1-Studio (Stufenplatz) eine Story. Delya sitzt morgens in der Redaktion, Collin ist immer irgendwo.',
      when: GEBORGEN, done: flag('live_story_geliefert'), marker: { map: 'nx1-studio' },
    },
  ],
  reward: {
    xp: 160,
    credits: 150,
    items: { presseausweis: 1 },
    relations: { 'collin-charleston': 60, 'delya-delloraine': 60, kameramann: 100 },
    effects: [msg('Presseausweis! Am Drehkreuz zu den Glasarkaden nickt man dir ab jetzt zu. Leicht genervt, aber man nickt.')],
  },
};

// ---------------------------------------------------------------------------------------------- Auftakt am Stufenplatz

const auftakt: DialogueDef = dlg('side-live-dabei-auftakt', [
  node('start', [
    nar('Am Kamerakran steht ein Mann mit Helm und verspiegeltem Visier. Auf dem Visier läuft eine Laufschrift: „[ : ( ]“.'),
    l(K, '[DROHNE WEG]', 'trauer'),
    l(K, '[BRACKBUCHT]'),
    l(K, '[HILFE?]'),
  ], {
    choices: [
      { text: '„Deine Drohne ist in der Brackbucht abgestürzt?“', when: inactive(Q), next: 'collin' },
      { text: '„Ich bin dran.“', when: all(active(Q), not(GEBORGEN)), next: 'dran' },
      { text: '„Die Drohne ist wieder da. Jetzt fehlt nur die Story.“', when: all(active(Q), GEBORGEN), next: 'story-hinweis' },
      tschuess('„Viel Glück, Kumpel.“'),
    ],
  }),
  node('collin', [
    nar('Hinter dem Kran taucht Collin Charleston auf, Kaffeebecher in der Hand, Frisur unbeweglich wie ein Denkmal.'),
    l(C, 'Live! Exklusiv! Unglaublich! Unsere teuerste Drohne liegt im Schlamm! Die Versicherung zahlt nicht, weil die Versicherung bei NX-1 ich bin!', 'besorgt'),
    l(C, 'Hol sie raus, mein Freund, mein Held, mein Unbekannter! Und dann brauchen wir eine Story. Eine echte. Mit Herz! Mit Explosionen! Mit mir!', 'freude'),
    l(K, '[BITTE]'),
    l(K, '[ : ) ? ]'),
  ], {
    choices: [
      { text: '„Okay. Ich hol euer Spielzeug.“', next: 'zusage' },
      { text: '„Was springt dabei raus?“', next: 'lohn' },
    ],
  }),
  node('lohn', [
    l(C, 'Hundertfünfzig Credits! Und ein Presseausweis! Mit Foto! Mit dem kommst du am Drehkreuz in die Glasarkaden, ohne dass dich jemand fragt, warum du so … unterstädtisch aussiehst!', 'freude'),
  ], { next: 'zusage' }),
  node('zusage', [l(K, '[DANKE]', 'freude'), l(K, '[ROBOHUNDE. VORSICHT.]')], { effects: [{ startQuest: Q }] }),
  node('dran', [l(K, '[SCHLICK = TIEF]'), l(K, '[HUNDE = DOOF]')]),
  node('story-hinweis', [l(C, 'Ins Studio, ins Studio! Delya sitzt in der Redaktion und guckt ernst. Sie guckt immer ernst. Ich hab sie einmal lächeln sehen, da hat es geregnet.', 'freude')]),
]);

// ---------------------------------------------------------------------------------------------- Story liefern

const angebot = (text: string, wenn: ReturnType<typeof done>, next: string): DialogueChoice => ({ text, when: wenn, next });

const story: DialogueDef = dlg('side-live-dabei-story', [
  node('start', [
    nar('Die Redaktion: Bildschirme, kalter Kaffee, eine Pinnwand voller roter Fäden, die alle auf ein Foto von Quantum zeigen. Delya Delloraine tippt, ohne aufzusehen. Collin lehnt am Türrahmen.'),
    l(DE, 'Die Drohne lebt. Danke. Und jetzt die Frage, die ich jeden Tag stelle: Was ist die Geschichte?', 'neutral'),
    l(C, 'Etwas mit Gefühl! Etwas mit Action! Etwas, wo ich am Ende in die Kamera gucke und sage: „Das war Noxius. Bleiben Sie dran.“', 'freude'),
  ], {
    choices: [
      angebot('„Die U-Bahn ist pünktlich. Und ich weiß, wer sie sabotiert hat.“', done('side-uebliche-verspaetung'), 'bahn'),
      angebot('„Gutschein-Betrug am Schrottmarkt. Chrome-10-Fälschungen aus den Lötgassen.“', done('side-chrome-10'), 'gutschein'),
      angebot('„Gratis-Chips mit Virus. An Xions Werbestand. Ich hab einen Zeugen.“', done('side-jimmys-chip'), 'chips'),
      angebot('„Drei Straßenkinder gründen einen Botendienst. Ohne zu betteln.“', done('side-zehn-credits'), 'kinder'),
      { text: '„Riesenratte im Kanal! Groß wie ein Kleinwagen! Sie trägt eine Krone!“', next: 'ratte' },
      tschuess('„Ich überleg mir was.“'),
    ],
  }),
  node('bahn', [
    l(DE, 'Ein Taxiunternehmer, der die Bahn sabotiert, damit die Leute bei ihm einsteigen. Das ist … das ist tatsächlich eine Geschichte.', 'ueberrascht'),
    l(C, '„Der Mann, der die U-Bahn klaut!“ Ich hab die Schlagzeile schon! Ich hab sie schon immer gehabt! Ich wusste nur nicht, für wen!', 'freude'),
  ], { next: 'sendung' }),
  node('gutschein', [
    l(DE, 'Gefälschte Quantum-Gutscheine. In der Unterstadt gedruckt, als Wertanlage verkauft. Das zeigt, wie sehr die Leute an Chrome 10 glauben wollen.', 'besorgt'),
    l(DE, 'Ich nenne keine Namen. Aber ich nenne Zahlen. Dreitausendzweihundert Credits aus den Taschen von Leuten, die keine haben.'),
  ], { effects: [set('meinung_plus_live')], next: 'sendung' }),
  node('chips', [
    nar('Delya hört auf zu tippen. Zum ersten Mal sieht sie dich an.'),
    l(DE, 'Gratis-Chips. Mit Virus. Verteilt von Quantum-Personal.', 'ueberrascht'),
    l(DE, 'Das bringe ich nicht heute. Das bringe ich, wenn ich es beweisen kann. Aber ich vergesse es nicht. Hier ist meine Nummer. Für den Tag, an dem Sie mehr haben.', 'besorgt'),
    l(C, 'Und heute? Heute brauchen wir trotzdem was! Ich hab Sendezeit! Sendezeit ist wie Brot, sie wird hart!', 'besorgt'),
    l(DE, 'Heute bringen wir: „Unterstadt hilft sich selbst. Ein Mann wieder gesund.“ Ohne Namen. Mit Herz. Collin, du darfst weinen.'),
  ], { effects: [set('delya_spur_gratis_chips'), { relation: DE, delta: 30 }], next: 'sendung' }),
  node('kinder', [
    l(C, 'KINDER! Kinder sind Quote! Kinder mit Klemmbrett sind Rekordquote!', 'freude'),
    l(DE, 'Und es ist sogar wahr. Ich bin schockiert. Positiv.', 'freude'),
  ], { effects: [{ relation: 'daria', delta: 20 }], next: 'sendung' }),
  node('ratte', [
    l(C, 'Eine Ratte! Mit Krone! Groß wie ein Kleinwagen!', 'ueberrascht'),
    l(DE, 'Das ist eine Lüge.', 'neutral'),
    ich('Ich war noch nicht unten. Also ist es eine Vermutung.'),
    l(C, 'Eine VERMUTUNG! Die besten Geschichten sind Vermutungen! „Was lauert unter uns?“ Ich trag den Trenchcoat!', 'freude'),
    l(DE, 'Ich möchte bitte zu Protokoll geben, dass ich dagegen war. Seufzend.', 'trauer'),
  ], { effects: [set('geruecht_rattenkoenig')], next: 'sendung' }),
  node('sendung', [
    nar('Zwei Stunden später, Stufenplatz. Collin steht auf der Bühne, die Kameradrohne schwebt über ihm, leicht schief, mit Schlickrest am Rotor. Der Kameramann gibt Zeichen: „[LIVE]“.'),
    l(C, 'Guten Abend, Noxius! Hier ist Collin Charleston, und heute haben wir eine Geschichte, die SIE selbst geschrieben haben! Also nicht Sie. Jemand Bestimmtes. Winken!', 'freude'),
  ], {
    choices: [
      { text: 'In die Kamera winken.', next: 'ende' },
      { text: 'Der Kamera den Mittelfinger zeigen. Live.', next: 'finger' },
      { text: '[Vex] Den Kurierhelm aufsetzen und das Schrapnell-Zeichen machen. Werbung für die Crew.', when: VEX, next: 'vex' },
    ],
  }),
  node('finger', [
    l(C, 'Und das war … die authentische Stimme der Unterstadt! Ungeschnitten! Ungefiltert! Ungewaschen!', 'ueberrascht'),
    l(K, '[ : D ]'),
  ], { effects: [{ rep: 'unterstadt', delta: 3 }], next: 'ende' }),
  node('vex', [
    l(C, 'Die Schrapnell-Kuriere, meine Damen und Herren! Sie liefern, was andere nicht anfassen! Ich fasse das hier jetzt auch nicht an!', 'freude'),
    l(K, '[COOL]'),
  ], { next: 'ende' }),
  node('ende', [
    nar('Die Sendung läuft. Auf dem Stadt-TV am Schrottmarkt, im Bahnhof, im High Voltage. Irgendwo pfeift Hunter. Irgendwo lacht Aria. Irgendwo zählt Frau Takt die Sekunden.'),
    l(K, '[DANKE, FREUND]', 'zaertlich'),
  ], { effects: [set('live_story_geliefert'), { cutscene: 'side-live-dabei-sendung' }] }),
]);

const sendung: CutsceneDef = {
  id: 'side-live-dabei-sendung',
  title: 'Live dabei',
  beats: [
    { image: 'cut-side-live-dabei-sendung', caption: 'NX-1, Abendsendung. Ein Rotor schief, die Linse verschmiert, das Bild trotzdem scharf.', fade: 'in', hold: 1400 },
    { image: 'cut-side-live-dabei-sendung', caption: 'Zum ersten Mal seit Wochen zeigt das Stadt-TV etwas, das die Unterstadt selbst erlebt hat.', hold: 1500 },
    { image: 'cut-side-live-dabei-sendung', caption: 'Auf dem Visier des Kameramanns, ganz klein, in der Ecke: [ : ) ].', fade: 'out', hold: 1500 },
  ],
};

// ---------------------------------------------------------------------------------------------- Vex × Aria im Schlick

const schlick: DialogueDef = dlg('side-live-dabei-schlick', [
  node('start', [
    nar('Du kommst aus dem Schlick wie ein Sumpfwesen aus einem sehr billigen Film. Aria steht am Rand, die Arme verschränkt, und grinst.'),
    l('aria', 'Du riechst wie der Boden eines Fischkutters. Und du siehst aus, als hättest du dich mit einem Schlammmonster gepaart.', 'freude'),
    ich('Komm her und sag das noch mal.'),
    l('aria', 'Ich bin doch nicht bescheuert.', 'signatur'),
    nar('Sie kommt trotzdem her. Sie wischt dir mit dem Daumen den Schlick von der Unterlippe, langsam, viel langsamer als nötig. Ihr Blick bleibt da hängen.'),
    l('aria', 'Heute Abend duschst du. Lange. Und wenn du Glück hast, nicht allein.', 'zaertlich'),
  ], {
    choices: [
      { text: '„Ich hab immer Glück.“', next: 'glueck' },
      { text: 'Sie am Gürtel zu dir ziehen. Schlick hin oder her.', next: 'ziehen' },
    ],
  }),
  node('glueck', [l('aria', 'Nein. Du hast mich. Das ist besser.', 'verlegen')], { effects: [{ relation: 'aria', delta: 10 }] }),
  node('ziehen', [
    nar('Aria quiekt. Aria quiekt NIE. Dann klebt ihr Shirt an deinem, und sie flucht in deinen Mund, und es ist der schmutzigste Kuss der Unterstadt.'),
    l('aria', 'Du Arschloch. Das war mein gutes Shirt.', 'zaertlich'),
    ich('Dann zieh’s aus.'),
    l('aria', 'Später. Erst die Drohne. Dann … später.', 'verlegen'),
  ], { effects: [{ relation: 'aria', delta: 15 }] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [auftakt.id]: auftakt, [story.id]: story, [schlick.id]: schlick },
  cutscenes: { [sendung.id]: sendung },
  mapAdditions: {
    stufenplatz: {
      hotspots: [
        {
          id: 'q-live-dabei-kameramann', at: 'kamerakran', radius: 64, label: 'Kameramann mit traurigem Visier', kind: 'talk', dialogue: auftakt.id,
          when: all(any(inactive(Q), active(Q)), time('morgen', 'tag', 'abend')),
        },
      ],
    },
    flutmauer: {
      hotspots: [
        {
          id: 'q-live-dabei-schlick-aria', at: 'drohnenwrack', radius: 72, label: 'Aria wartet am Rand', kind: 'talk', dialogue: schlick.id, once: true,
          when: all(VEXARIA_DABEI, flag('schmutzig'), flag('kameradrohne_geborgen'), noFlag('live_story_geliefert')),
        },
      ],
      encounters: [
        {
          id: 'q-live-dabei-robohunde', encounter: 'enc-bucht-kameradrohne', at: 'schlickstrand', sprite: 'robohund-walk', radius: 56,
          when: all(active(Q), not(GEBORGEN)), once: true,
        },
      ],
    },
    'nx1-studio': {
      hotspots: [
        {
          id: 'story-pitch', at: 'redaktion', radius: 64, label: 'Story pitchen', kind: 'talk', dialogue: story.id,
          when: all(active(Q), GEBORGEN, noFlag('live_story_geliefert')),
        },
      ],
    },
  },
};
