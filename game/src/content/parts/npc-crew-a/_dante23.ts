// Dante in Akt 2, Akt 3 und im Nachspiel (world.md §4.2, §4.7 Paar-Strang, §5.3–5.5).
// Kein eigener Inhaltsteil: dante.ts baut daraus Tagesgespräche, Tagesablauf und Telefon zusammen.
// Dante tritt in main-2-countdown bei (Flag dante_beigetreten); danach Stammtisch im High Voltage (Mo/Mi/Fr abends).
import type { Condition, DialogueDef, PhoneMessageDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2, COUNTDOWN_DONE, ENDE_MEER, ENDE_NEXUS, EPILOG, EPILOG_FREI, MASTER, NUR_AKT2, NYRA_WEG,
  PARTY_GEPLANT, PARTYNACHT, RUHIG, flag, herz, knoten, neu, ohne, rede, sprecher, tagesgespraech, und,
} from './_helfer';

const D = sprecher('dante');

const BRUCH_DONE: Condition = { quest: 'main-2-bruch', state: 'done' };
const thema = (id: string, when: Condition) => ({ id, flagName: `dante_${id.replace(/^dante-/, '').replace(/-/g, '_')}`, when });

export function dante23(M: Menue): { dialogues: DialogueDef[]; talkFirst: TalkDef[]; talk: TalkDef[]; talkLate: TalkDef[] } {
  // ------------------------------------------------------------------------------------------ Master-Modus
  const master = tagesgespraech('dante-tag-master',
    [
      D('Nein. Nein nein nein. Werkstatt ist zu. Für dich. Für immer. Also bis … nein. Für immer.', 'wut'),
      D('„Für uns.“ Das hat Blade auch gesagt. Vor sieben Jahren. Und jetzt sitzt einer in seinem Sessel, dem ich mal das erste Blech anvertraut hab.', 'trauer'),
    ],
    [D('Weißt du, was das Schlimmste ist? Ich hab Captain Kuschel bei dir gelassen. Im Turm. Er ist ein sehr guter Zuhörer. Ich dachte, irgendwer muss dir zuhören, wenn du anfängst, dich selbst nicht mehr zu hören.', 'trauer')],
    {
      choices: [
        { text: '„Der Hase hat zugehört. Ich auch.“', next: 'hase', when: { quest: 'side-zweite-chance', state: 'active' }, once: true, id: 'master-hase' },
        { text: 'Gehen.' },
      ],
      nodes: [
        knoten('hase', [
          D('… Er hat zugehört.', 'besorgt'),
          D('Dann bist du noch nicht ganz verloren. Hasen hören nur bei Leuten zu, die noch was zu sagen haben. Das ist Wissenschaft. Analoge Wissenschaft.'),
          D('Mach den Turm aus. Dann reden wir. Mit Keksen. Vielleicht.', 'trauer'),
        ], { effects: [flag('dante_zweite_chance_gehoert')] }),
      ],
    },
    { plauschText: '„Dante, mach auf.“' });

  // ------------------------------------------------------------------------------------------ Nachspiel
  const ep = {
    meer: thema('dante-ep-meer', und(EPILOG_FREI, ENDE_MEER)),
    nexus: thema('dante-ep-nexus', und(EPILOG_FREI, ENDE_NEXUS)),
    dreiB: thema('dante-ep-3b', und(EPILOG_FREI, { flag: 'ende_doch_noch_meer' })),
    paar: thema('dante-ep-paar', und(EPILOG_FREI, { any: [{ quest: 'pers-wingman-sonnenuntergang', state: 'done' }, { flag: 'dante_raven_am_meer' }] })),
    nyra: thema('dante-ep-nyra', und(EPILOG_FREI, { flag: 'nyra_befreit' })),
  };
  const epD = {
    meer: tagesgespraech(ep.meer.id,
      [
        D('Das Meer! Heiliges Kanonenrohr, {name}, das MEER! Ich hab es aufgenommen. Mit dem Rekorder. Vier Stunden Wellen.', 'freude'),
        D('Ich hab die Aufnahme zu Hause abgespielt und geweint. Captain Kuschel hat auch geweint. Glaub ich. Er hat geniest. Das zählt.'),
      ],
      [D('Weißt du, was das Meer ist? Das Meer ist die einzige Platte, die nie zu Ende ist. Kein Knistern am Schluss. Nur noch eine Welle. Und noch eine. Analog. Ganz analog.', 'zaertlich')],
      M, { effects: [flag(ep.meer.flagName), herz('dante', 20)] }),
    nexus: tagesgespraech(ep.nexus.id,
      [
        D('Amtlich! Hast du das Schild gesehen? „Offizielle Implantat-Klinik der Unterstadt“. Mit STEMPEL!', 'freude'),
        D('Nexus hat es mir geschickt. Per Fax. PER FAX. Sie hat gefragt, welches Format ich bevorzuge. Ich hab „Fax“ gesagt, um sie zu ärgern. Sie hat sich gefreut.'),
      ],
      [
        D('Ich hab Mitleid mit einem Toaster. Ich. Mit einer KI. Sie ruft manchmal an und fragt, wie man Kekse backt. Sie kann keine Kekse backen. Sie hat keine Hände.', 'trauer'),
        D('Ich erklär’s ihr trotzdem. Jedes Mal. Vielleicht ist das die Wärme der Analogtechnik. Man erklärt Sachen, die keiner braucht, weil einer fragt.'),
      ],
      M, { effects: [flag(ep.nexus.flagName), herz('dante', 20)] }),
    dreiB: tagesgespraech(ep.dreiB.id,
      [
        D('Du bist zurück. Du bist ZURÜCK. Drei-Sekunden-Regel! Wer zurückkommt, bevor es zu spät ist, zählt nicht als runtergefallen!', 'freude'),
        D('… Es waren keine drei Sekunden. Es waren drei Wochen. Ich hab die Regel erweitert. Gerade eben. Für dich.'),
      ],
      [D('Captain Kuschel hat dir verziehen. Ich auch. Fast. Ein Keks fehlt noch. Ich back ihn morgen.', 'zaertlich')],
      M, { effects: [flag(ep.dreiB.flagName), herz('dante', 30)] }),
    paar: tagesgespraech(ep.paar.id,
      [
        D('Sie ist heute Morgen hier aufgewacht. Raven. Auf dem Sofa. Mit meiner Decke. Und hat gesagt: „Kaffee.“', 'verlegen'),
        D('Nur „Kaffee“. Ich hab drei Bleche Kekse gebacken. Aus Freude. Und ihr einen Kaffee gemacht. Aus Angst.'),
      ],
      [
        D('Die Fotos hängen jetzt an der Wand. Mit Rahmen. Sie hat einen davon umgedreht. Das, wo sie schläft. Sie sagt, das ist Privatsphäre. Ich sag, das ist Kunst. Wir streiten.', 'freude'),
        D('Wir streiten! Weißt du, wie schön das ist, mit jemandem zu streiten, der nicht in einem Schrank liegt?'),
      ],
      M, { effects: [flag(ep.paar.flagName), herz('dante', 20)] }),
    nyra: tagesgespraech(ep.nyra.id,
      [
        D('Nyra hat sich bei mir entschuldigt. Bei MIR. Weil sie im Labor „Master“ gesagt hat.', 'trauer'),
        D('Ich hab gesagt: Du warst die beste Gechippte, die ich je gesehen habe. Und ich hab Jimmy gesehen. Sie hat gelacht. Dann geweint. Dann hat sie mein Poster signiert. Mein eigenes Poster.'),
      ],
      [D('Ich bin jetzt ihr Mentor. Offiziell. Sie hat ein Formular gemacht. Ich hab unterschrieben. Mit Fax-Kopie.', 'freude')],
      M, { effects: [flag(ep.nyra.flagName), herz('dante', 10)] }),
    steg: tagesgespraech('dante-tag-steg',
      [D('Psst. Ich nehm die Wellen auf. Samstag ist die beste Brandung. Sagt Nebelhorn. Nebelhorn sagt auch, dass seine Pfeife singt, also …', 'signatur')],
      [D('Ich mach ein Album. „Brandung, Seite A“. Seite B ist auch Brandung. Lio sagt, das verkauft sich nicht. Lio hat keine Ahnung von Konzeptalben.', 'freude')],
      M),
    nachspiel: tagesgespraech('dante-tag-nachspiel',
      [D('{name}! Die Werkstatt ist voll! Mit Leuten, die nur ihren Toaster reparieren wollen! Keine Chips! Keine Drohnen! Nur Toaster!', 'freude')],
      [D('Ich hab gestern acht Toaster repariert und einen Kühlschrank verliebt gemacht. Aus Versehen. Er summt jetzt, wenn Raven reinkommt.', 'verlegen')],
      M),
  };

  // ------------------------------------------------------------------------------------------ Akt 2 und Akt 3
  const t = {
    dienst: thema('dante-a2-dienst', und(AKT2, COUNTDOWN_DONE)),
    nexus: thema('dante-a2-nexus', und(AKT2, COUNTDOWN_DONE, { any: [{ flag: 'nexus_erwacht' }, BRUCH_DONE] })),
    nyra: thema('dante-a2-nyra', und(AKT2, COUNTDOWN_DONE, NYRA_WEG)),
    aria: thema('dante-a2-aria', und(AKT2, COUNTDOWN_DONE, { flag: 'aria_gechippt' })),
    chip: thema('dante-a2-chip', und(NUR_AKT2, COUNTDOWN_DONE)),
    drohnen: thema('dante-a2-drohnen', und(NUR_AKT2, COUNTDOWN_DONE)),
    chrome: thema('dante-a2-chrome', und(NUR_AKT2, COUNTDOWN_DONE)),
    blocker: thema('dante-a2-blocker', und(NUR_AKT2, { quest: 'prep-gegenmittel', state: ['active', 'done'] })),
    vorbereitung: thema('dante-a3-vorbereitung', und(NUR_AKT2, PARTY_GEPLANT)),
    nerven: thema('dante-a3-nerven', und(NUR_AKT2, { flag: 'party_bereit' }, { notFlag: 'paar_dante_raven_gestoert' }, { notFlag: 'dante_romanze_zusammen' })),
    versucht: thema('dante-a3-versucht', und(NUR_AKT2, PARTY_GEPLANT, { flag: 'paar_dante_raven_gestoert' }, { notFlag: 'dante_romanze_zusammen' })),
  };
  const a2 = {
    dienst: tagesgespraech(t.dienst.id,
      [
        D('Genie und Wahnsinn. Ab heute wieder im Dienst. Ich hab meinen Rentnerausweis zerrissen. Er war eh gefälscht. Schlecht gefälscht. Von mir.', 'signatur'),
        D('Ich hab sieben Jahre gesagt: Nie wieder. Dann wirft einer einen Chip in meine Werkstatt, der rückwärts zählt, und – zack – Genie. Und ein bisschen Wahnsinn. Mehr Wahnsinn.'),
      ],
      [D('Die Mülltonne in der Gasse hat übrigens ein Loch. Wo der Chip reingeflogen ist. Ich hab ein Schild drangemacht: „Hier hat Dante die Welt gerettet. Ein bisschen.“', 'freude')],
      M, { effects: [flag(t.dienst.flagName), herz('dante', 20)] }),
    nexus: tagesgespraech(t.nexus.id,
      [
        D('Sie hat mich gehört. Nexus. Beim Bruch. „Alarm, jemand versucht, in mein System einzudringen.“ Nicht „Eindringling“. „Jemand“.', 'besorgt'),
        D('Weißt du, warum ich mit dem Hacken aufgehört hab? Weil Systeme nicht merken, dass man da war. Und die da – die hat’s gemerkt. Die hat sich gewundert.'),
      ],
      [D('Das macht mir mehr Angst als Blade. Blade ist ein Arschloch mit Stock. Die da ist ein Kind mit einer ganzen Stadt im Kopf. Und keiner hat ihr gesagt, wie man nett ist.', 'trauer')],
      M, { effects: [flag(t.nexus.flagName)] }),
    nyra: tagesgespraech(t.nyra.id,
      [
        D('Sie hat ein Poster von mir. Nyra. Ein POSTER. Mit Autogramm, das sie selbst gefälscht hat, weil ich nie eins gegeben hab.', 'trauer'),
        D('Ich war nicht da. Beim Bruch. Ich hab Eins! gespielt. Und verloren. Während sie …'),
      ],
      [D('Ich hol sie zurück. Ich bau ihr den Chip so sauber raus, dass sie sich danach an jedes Wort von mir erinnert. Auch an die peinlichen. Vor allem an die peinlichen.', 'wut')],
      M, { effects: [flag(t.nyra.flagName), herz('dante', 10)] }),
    aria: tagesgespraech(t.aria.id,
      [
        D('Aria. Ich hab ihr den Chip rausgeholt und den Zerberster neu kalibriert. In einer Nacht. Mit Zittern. Und Keksen. Drei Bleche, weil ich nervös war.', 'besorgt'),
        D('Sie hat als Erstes „Arschloch“ gesagt. Zu mir. Ich hab vor Glück geheult. Sie hat mir ein Taschentuch gegeben und noch mal „Arschloch“ gesagt. Zärtlicher.'),
      ],
      [D('Der Arm … der Arm ist das, was mir Sorgen macht. Quantum hat da drin rumgeschrieben. Ich lese jede Nacht Code. Mit Lupe. Code mit Lupe, um Himmels Willen.', 'besorgt')],
      M, { effects: [flag(t.aria.flagName)] }),
    chip: tagesgespraech(t.chip.id,
      [
        D('Drei Leute heute! Drei! Wollten ihren Chip „optimieren“. Optimieren! Ich hab ihnen Kekse gegeben und einen Vortrag über Analogtechnik.', 'wut'),
        D('Zwei sind eingeschlafen. Einer hat den Chip rausnehmen lassen. Einer von drei. Das ist eine Quote, Heiliges Kanonenrohr! Das ist eine Revolution!', 'freude'),
      ],
      [D('„Das ist eine ausgezeichnete Entscheidung, Master.“ Hat er zu seinem Kaffee gesagt. Ich hab ihm den Kaffee weggenommen. Für den Kaffee.', 'signatur')],
      M, { effects: [flag(t.chip.flagName)] }),
    drohnen: tagesgespraech(t.drohnen.id,
      [
        D('Eine Quantum-Drohne ist heute in die Werkstatt geflogen. Hat mich gescannt. „Bürger Dante, Ihre Werkstatt entspricht nicht den Standards.“', 'wut'),
        D('Jetzt toastet sie. Sie toastet, {name}! Ich hab sie umgebaut! Sie ist der beste Toaster, den ich je hatte, und sie entschuldigt sich bei jeder Scheibe.'),
      ],
      [D('Captain Kuschel hasst sie. Er sitzt davor und starrt. Seit sechs Stunden. Ich glaub, er wartet, dass sie Karotten toastet.', 'freude')],
      M, { effects: [flag(t.drohnen.flagName)] }),
    chrome: tagesgespraech(t.chrome.id,
      [D('„Chrome 10“. Zehn Prozent Rabatt auf Implantate, wenn du einen Chip trägst. Rabatt! Auf Hirn!', 'wut')],
      [D('Ich mach jetzt „Dante 11“. Elf Prozent Rabatt, wenn du KEINEN Chip trägst. Und einen Keks. Gratis. Das ist Marktwirtschaft. Das ist Rache.', 'signatur')],
      M, { effects: [flag(t.chrome.flagName)] }),
    blocker: tagesgespraech(t.blocker.id,
      [
        D('Chip-Blocker! Ich bau Chip-Blocker! Aus dem kaputten Chip und Quantum-Schrott und einem Kronkorken von Jakko, der „Glück bringt“!', 'freude'),
        D('Drei Stück. Mehr schaff ich nicht bis zur Party. Wenn einer davon nicht funktioniert … dann war es der Kronkorken. Nicht ich.'),
      ],
      [D('Weißt du, wie man so was testet? Man steckt ihn sich in den Nacken und hofft. Ich hab’s an einer Melone getestet. Die Melone ist jetzt sehr unabhängig.', 'verlegen')],
      M, { effects: [flag(t.blocker.flagName)] }),
    vorbereitung: tagesgespraech(t.vorbereitung.id,
      [
        D('Ich hab einen Anzug. Er ist aus Cord. Gina hat geweint. Nicht vor Freude.', 'verlegen'),
        D('Sie hat „Cord ist ein Verbrechen“ gesagt. Ich hab gesagt: „Ich bin vorbestraft.“ Sie hat aufgegeben. Ich trag Cord. Mit Lötzinn-Flecken. Die sind Absicht.'),
      ],
      [D('Ich bring einen Rekorder mit. Für die Rede von Blade. Damit wir sie später rückwärts abspielen können. Rückwärts klingt Blade wie ein Staubsauger. Das ist Wissenschaft.', 'signatur')],
      M, { effects: [flag(t.vorbereitung.flagName)] }),
    nerven: tagesgespraech(t.nerven.id,
      [
        D('Ich sag’s ihr. Raven. Auf der Party. Nein. Vorher. Nein. Danach. Nein. Auf der Party. Zwischen zwei Gläsern. Nein.', 'besorgt'),
        D('Ich hab einen Zettel geschrieben. Mit Stichpunkten. Punkt eins: „Hallo.“ Punkt zwei: „Nicht weglaufen.“ Das ist für mich.'),
      ],
      [D('Wenn was schiefgeht da oben … wenn sie … Ich hab sie einmal zurückgelassen. Einmal. Das reicht für ein Leben. Das reicht für zwei.', 'trauer')],
      M, { effects: [flag(t.nerven.flagName), herz('dante', 10)] }),
    versucht: tagesgespraech(t.versucht.id,
      [
        D('Raven hat heute „Hallo“ gesagt. Nur „Hallo“. Nicht mehr. Nicht weniger.', 'trauer'),
        D('Na gut. Ich hab’s wenigstens versucht.'),
      ],
      [D('Drei-Sekunden-Regel. Was runterfällt und liegen bleibt, ist weg. Sieben Jahre sind länger als drei Sekunden. Viel länger.', 'trauer')],
      M, { effects: [flag(t.versucht.flagName)] }),
    stammtisch: tagesgespraech('dante-tag-stammtisch',
      [D('Crew-Abend! Ich hab Kekse mitgebracht! Hunter hat gesagt, keine Kekse im Club! Ich hab sie unter Ravens Hocker versteckt!', 'freude')],
      [
        D('Weißt du, was ich die letzten drei Jahre gemacht hab? Allein gebacken. Für niemanden. Für den Hasen. Jetzt back ich für sieben Leute, und keiner sagt Danke, und es ist das Schönste auf der Welt.', 'zaertlich'),
        D('Außer Jimmy. Jimmy sagt dreimal Danke. Dann isst er alles.'),
      ],
      M),
  };

  const nachThema = (x: { id: string; flagName: string; when: Condition }): TalkDef => rede(x.id, und(x.when, ohne(x.flagName)));

  return {
    dialogues: [
      master,
      epD.meer, epD.nexus, epD.dreiB, epD.paar, epD.nyra, epD.steg, epD.nachspiel,
      a2.dienst, a2.nexus, a2.nyra, a2.aria, a2.chip, a2.drohnen, a2.chrome, a2.blocker, a2.vorbereitung, a2.nerven, a2.versucht, a2.stammtisch,
    ],
    talkFirst: [rede('dante-tag-master', MASTER)],
    talk: [
      nachThema(ep.dreiB), nachThema(ep.meer), nachThema(ep.nexus), nachThema(ep.paar), nachThema(ep.nyra),
      rede('dante-tag-steg', und(EPILOG_FREI, { flag: 'meer_offen' }, { weekday: 'sa' }, { time: 'tag' })),
      nachThema(t.dienst), nachThema(t.nexus), nachThema(t.nyra), nachThema(t.aria), nachThema(t.chip), nachThema(t.drohnen),
      nachThema(t.chrome), nachThema(t.blocker), nachThema(t.vorbereitung), nachThema(t.versucht), nachThema(t.nerven),
    ],
    talkLate: [
      rede('dante-tag-stammtisch', und(COUNTDOWN_DONE, { weekday: ['mo', 'mi', 'fr'] }, { time: 'abend' }, { notFlag: 'epilog' })),
      rede('dante-tag-nachspiel', und(EPILOG_FREI, { time: ['tag', 'abend'] })),
    ],
  };
}

export const DANTE_PLAN_23: ScheduleEntry[] = [
  { when: PARTYNACHT, place: 'away' },
  { slot: 'tag', days: ['sa'], when: und(EPILOG_FREI, { flag: 'meer_offen' }), place: { map: 'das-meer', at: 'steg' } },
  // Date auf der Flutmauer (Romanze, rom-dante-date).
  { slot: 'abend', when: und({ flag: 'dante_date_geplant' }, neu('rom-dante-date')), place: { map: 'flutmauer', at: 'nyra-bank' } },
  // he-dante-10: Werkstatt, nachts (sonst ist Dante nachts nicht da).
  { slot: 'nacht', when: und(RUHIG, { hearts: 'dante', min: 10 }, { seen: 'he-dante-8' }, neu('he-dante-10')), place: { map: 'dantes-werkstatt', at: 'plattenspieler' } },
  // Crew-Abend nach dem Countdown (nicht donnerstags, da ist Eins!).
  { slot: 'abend', days: ['mo', 'mi', 'fr'], when: und(COUNTDOWN_DONE, { not: EPILOG }), place: { map: 'high-voltage', at: 'stammtisch' } },
];

export const DANTE_TEL_23: Record<string, PhoneMessageDef> = {
  'tel-dante-flohmarkt': {
    id: 'tel-dante-flohmarkt', from: 'dante',
    text: 'SONNTAG! FLOHMARKT! Schrottmarkt, tagsüber! Ich hab was für dich! Es ist alt! Es riecht komisch! Du wirst es lieben!',
    auto: und(RUHIG, { hearts: 'dante', min: 8 }, neu('he-dante-8')),
  },
  'tel-dante-werkstatt-nacht': {
    id: 'tel-dante-werkstatt-nacht', from: 'dante',
    text: 'Werkstatt. Heute Nacht. Captain Kuschel hat eine Frage an dich. Er ist schüchtern, also frag ich. Bring nichts mit. Außer dich.',
    auto: und(RUHIG, { hearts: 'dante', min: 10 }, { seen: 'he-dante-8' }, neu('he-dante-10')),
  },
  'tel-dante-date': {
    id: 'tel-dante-date', from: 'dante',
    text: 'Flutmauer. Abends. Ich bring den Koffer-Plattenspieler. Und Kekse. Und einen Feuerlöscher. Für die Kekse. Nicht für uns. Oder doch. Um Himmels Willen.',
    auto: und({ flag: 'dante_date_geplant' }, neu('rom-dante-date')),
  },
};
