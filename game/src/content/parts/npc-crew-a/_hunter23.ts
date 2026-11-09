// Hunter in Akt 2, Akt 3 und im Nachspiel (world.md §4.2, §4.7 „Nach Ladenschluss“, §5.3–5.5, §6.4).
// Kein eigener Inhaltsteil: hunter.ts baut daraus Tagesgespräche, Tagesablauf und Telefon zusammen.
// Themen: Nyra weg, Aria gechippt/zurück, Chip-Panik, Quantum-Drohnen, „Chrome 10“, Krisensitzung, Party-Nerven,
// Partynacht, Enden (ende_meer, ende_neue_nexus, ende_master, ende_doch_noch_meer), Strandclub, Master-Modus.
import type { Condition, DialogueDef, PhoneMessageDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2, COUNTDOWN_DONE, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, NUR_AKT2, NYRA_WEG, PARTY_GEPLANT,
  PARTYNACHT, RUHIG, erz, flag, herz, knoten, neu, ohne, rede, sprecher, tagesgespraech, und,
} from './_helfer';

const H = sprecher('hunter');
const BK = sprecher('barkeeper');

const BRUCH_DONE: Condition = { quest: 'main-2-bruch', state: 'done' };
const STRANDCLUB_LAEUFT: Condition = { quest: 'side-strandclub', state: 'active' };
const STRANDCLUB_FERTIG: Condition = { quest: 'side-strandclub', state: 'done' };

/** Einmaliges Themengespräch: Talk-Bedingung + Flag, das es danach abschaltet. */
const thema = (id: string, when: Condition) => ({ id, flagName: `hunter_${id.replace(/^hunter-/, '').replace(/-/g, '_')}`, when });

export function hunter23(M: Menue): { dialogues: DialogueDef[]; talkFirst: TalkDef[]; talk: TalkDef[]; talkLate: TalkDef[] } {
  // ------------------------------------------------------------------------------------------ Master-Modus (Ende 3)
  const MASTER_MENUE: Menue = {
    choices: [
      { text: '„Ich weiß, was ich getan hab.“', next: 'weiss', when: { quest: 'side-zweite-chance', state: 'active' }, once: true, id: 'master-weiss' },
      { text: 'Gehen.' },
    ],
    nodes: [
      knoten('weiss', [
        H('Weißt du nicht. Wüsstest du’s, wärst du nicht mit dem Aufzug hier runtergekommen, sondern zu Fuß. Auf Knien.', 'wut'),
        H('… Der Platz im Wagen ist noch frei. Ich hab’s gesagt, ich halt mich dran. Verdien ihn dir. Nicht bei mir. Bei allen.', 'trauer'),
      ], { effects: [flag('hunter_zweite_chance_gehoert')] }),
    ],
  };
  const master = tagesgespraech('hunter-tag-master',
    [
      H('Master. Was darf’s sein? Ach nee, warte. Hier wird nicht bedient. Nicht du.', 'wut'),
      H('Ich hab drei Jahre gesessen wegen einem, der nicht teilen wollte. Und jetzt steht der nächste an meinem Tresen und trägt dein Gesicht.'),
    ],
    [
      H('Weißt du, was der Unterschied zwischen dir und Blade ist? Blade hatte wenigstens Stil. Du hast nur seinen Schreibtisch.', 'wut'),
      BK('Er hat dein Glas weggeräumt. Das Glas. Das, das er sonst für dich poliert hat. Er hat es in die Spüle gelegt und nicht mehr angeguckt.'),
    ],
    MASTER_MENUE, { plauschText: '„Hunter. Bitte.“' });

  // ------------------------------------------------------------------------------------------ Partynacht (Akt 3)
  const partynacht = tagesgespraech('hunter-tag-partynacht',
    [
      H('Nicht stehen bleiben. Nicht winken. Champagner halten, nicht trinken. Wir sind Gäste. Reiche Gäste. Reiche Gäste gucken gelangweilt.', 'signatur'),
      H('Ich trag einen Anzug, der mehr gekostet hat als mein erster Monat Miete. Wenn ich da Rotwein drauf krieg, bring ich jemanden um. Leise. Mit Stil.'),
    ],
    [
      H('Siehst du das Buffet? Die Garnelen sind aus dem Drucker. Die Garnelen sind aus dem DRUCKER. Ich hab in drei Jahren Knast echteres Essen gekriegt.', 'wut'),
      H('Und Raven … Raven steht da drüben und lächelt Leute an. Raven lächelt nie Leute an. Wir holen sie da raus. Heute. Das ist die einzige Rechnung, die heute zählt.', 'besorgt'),
    ],
    { choices: [{ text: 'Weiter.' }], nodes: [] }, { plauschText: 'Wie läuft’s, Boss?' });
  const partynachtDanach = tagesgespraech('hunter-tag-partynacht-raven',
    [H('Sie ist wieder da. Raven. Mit Kopfschmerzen und schlechter Laune. Gott sei Dank. Schlechte Laune heißt, sie ist sie selbst.', 'freude')],
    [H('Jetzt der Rest. Blade, der Kern, die ganze verdammte Stadt. Ein Schritt nach dem anderen. Wie beim Kassenbuch.', 'signatur')],
    { choices: [{ text: 'Weiter.' }], nodes: [] });

  // ------------------------------------------------------------------------------------------ Nachspiel
  const epMeer = thema('hunter-ep-meer', und(EPILOG_FREI, ENDE_MEER));
  const epNexus = thema('hunter-ep-nexus', und(EPILOG_FREI, ENDE_NEXUS));
  const ep3b = thema('hunter-ep-3b', und(EPILOG_FREI, { flag: 'ende_doch_noch_meer' }));
  const epBlade = thema('hunter-ep-blade', und(EPILOG_FREI, { any: [{ flag: 'blade_gefasst' }, { flag: 'blade_angekettet' }] }));
  const epBladeWeg = thema('hunter-ep-blade-weg', und(EPILOG_FREI, { flag: 'blade_entkommen' }));
  const epClub = thema('hunter-ep-club', und(EPILOG_FREI, STRANDCLUB_FERTIG));

  const ep = {
    meer: tagesgespraech(epMeer.id,
      [
        H('{name}. Komm her. Setz dich. Das ist der Hocker, den ich sonst keinem geb.', 'freude'),
        H('Wir waren da. Am Meer. Ich hab Sand an Stellen, von denen ich nicht wusste, dass ich sie hab. Ich hab Salz im Ohr. Ich bin der glücklichste Mann von Noxius, und wenn du das weitererzählst, streit ich’s ab.'),
      ],
      [
        H('Weißt du, was ich da gemacht hab, als ihr alle ins Wasser gerannt seid? Gerechnet. Was ein Liegestuhl kostet. Was ein Drink am Strand kostet. Was ein Shuttle kostet.', 'signatur'),
        H('Und dann hab ich aufgehört zu rechnen. Zum ersten Mal seit dem Eisenhof. Hat zwanzig Minuten gehalten. Bester Urlaub meines Lebens.', 'freude'),
      ],
      M, { effects: [flag(epMeer.flagName), herz('hunter', 20)] }),
    nexus: tagesgespraech(epNexus.id,
      [
        H('Die KI. Nexus. Macht jetzt meine Buchhaltung. Freiwillig. Sie hat gefragt. Sie hat „bitte“ gesagt.', 'besorgt'),
        H('Fehlerfrei. Drei Jahre Kassenbuch, und die findet in vier Sekunden Rippers Bierdeckel-Schulden von 2083. Ich hab sie gehasst. Dann hab ich ihr ein Trinkgeld gegeben. Wohin auch immer eine KI Trinkgeld steckt.'),
      ],
      [
        H('Nicht jeder hier traut ihr. Bruno spricht nicht mit dem Kassenterminal. Der Barkeeper hat es mit einem Tuch zugedeckt, „damit es nachts schläft“.'),
        H('Ich trau ihr so weit, wie ich den Tresen werfen kann. Aber sie hat aufgehört, Leute „Master“ zu nennen. Das ist mehr, als manche Menschen schaffen.', 'signatur'),
      ],
      M, { effects: [flag(epNexus.flagName), herz('hunter', 20)] }),
    dreiB: tagesgespraech(ep3b.id,
      [
        H('Der Platz im Wagen. Du hast ihn dir verdient. Knapp. Sehr knapp. Mit Zinsen.', 'signatur'),
        H('Ich hab nicht dran geglaubt. Raven hat dran geglaubt. Die Kinder haben Wetten abgeschlossen. Ich hab dagegen gewettet und vierzig Credits verloren. Das waren die besten vierzig Credits meines Lebens.', 'freude'),
      ],
      [H('Schulden muss man immer begleichen. Du hast deine beglichen. Bei allen. Das ist mehr, als Blade je geschafft hat.', 'trauer')],
      M, { effects: [flag(ep3b.flagName), herz('hunter', 30)] }),
    blade: tagesgespraech(epBlade.id,
      [
        H('Ich war im Eisenhof. Besucherraum. Panzerglas. Blade auf der anderen Seite, im orangen Overall. Orange steht ihm nicht.', 'signatur'),
        H('Ich hab ihm eine Nougatbombe mitgebracht. Er hat sie angesehen wie ein Gericht, das man nicht bestellt hat. Dann hat er sie gegessen. Dann hat er geheult.'),
      ],
      [
        H('Ich auch. Aber vor Lachen. Sieben Jahre, und am Ende sitzt er da und isst Kindheit aus Papier.', 'freude'),
        H('Ich hab ihm nicht verziehen. Ich hab ihm nur nichts mehr geschuldet. Das ist ein Unterschied. Ein großer.'),
      ],
      M, { effects: [flag(epBlade.flagName), herz('hunter', 20)] }),
    bladeWeg: tagesgespraech(epBladeWeg.id,
      [
        H('Blade ist weg. Gleiter, Champagner, Goldknauf. Irgendwo draußen. Ich hör nachts Rotoren, die nicht da sind.', 'besorgt'),
        H('Raven sagt, der kommt wieder. Ich sag: Soll er. Diesmal steht nicht eine am Rohr. Diesmal stehen wir alle am Tresen. Und ich schenk ihm nichts ein.', 'wut'),
      ],
      [H('Ein Mann, der wegläuft, hat schon verloren. Er weiß es nur noch nicht. Das ist die einzige Rechnung, die ich gern offen lass.', 'signatur')],
      M, { effects: [flag(epBladeWeg.flagName)] }),
    club: tagesgespraech(epClub.id,
      [
        H('Ein Club. Am Meer. Mit Bar. Mit Liegestühlen. Mit Gästen, die von SELBST kommen. Ich hab heute Morgen den Sand gefegt. Den Sand! Vor einem Strandclub! Weißt du, wie sinnlos das ist?', 'freude'),
        H('Ich hab nicht aufgehört zu grinsen. Der Barkeeper sagt, ich seh aus wie ein Haifisch mit Kontoauszug.'),
      ],
      [H('Teilhaber, Neuling. Du und ich. Und Nebelhorn, der verlangt seinen Anteil in Rum. Das ist das erste Geschäft meines Lebens, bei dem ich keinem was schulde.', 'zaertlich')],
      M, { effects: [flag(epClub.flagName), herz('hunter', 30)] }),
    strand: tagesgespraech('hunter-tag-strandclub',
      [
        H('Bretter. Nägel. Dexter liefert „fast neue“ Balken, die nach Hafenbecken riechen. Die Staubfalken wollen Pacht. Nebelhorn will mitreden. Ich will Ruhe.', 'besorgt'),
        H('Bloß, wer kommt diesen weiten Weg hierher gefahren? … Alle. Alle kommen. Wenn wir’s richtig machen.', 'signatur'),
      ],
      [H('Barfuß im Sand stehen und Bestellungen aufnehmen. Hab ich mir so vorgestellt. Hab nicht mit den Krabben gerechnet. Die Krabben zahlen nicht.', 'wut')],
      M),
    abend: tagesgespraech('hunter-tag-nachspiel',
      [H('{name}. Der Laden ist voll, die Stadt ist frei, und keiner sagt „Master“. Setz dich. Erste Runde geht auf … nein. Zahlen. Aber ich lächle dabei.', 'freude')],
      [
        H('Die Leute reden wieder. Laut. Über Unsinn. Über Fußball, über Ripper, über die U-Bahn, die plötzlich pünktlich ist. Weißt du, wie schön Unsinn klingt, wenn man ihn ein paar Wochen nicht gehört hat?'),
        H('Ich hab früher immer gedacht, Frieden ist, wenn keiner was schuldet. Ist es nicht. Frieden ist, wenn’s egal ist.', 'signatur'),
      ],
      M),
  };

  // ------------------------------------------------------------------------------------------ Akt 2 und Akt 3
  const t = {
    nyra: thema('hunter-a2-nyra', und(AKT2, BRUCH_DONE, NYRA_WEG)),
    ariaChip: thema('hunter-a2-aria-chip', und(AKT2, { flag: 'aria_gechippt' }, { not: COUNTDOWN_DONE })),
    ariaZurueck: thema('hunter-a2-aria-zurueck', und(AKT2, COUNTDOWN_DONE, { flag: 'aria_gechippt' })),
    ariaEntkommen: thema('hunter-a2-aria-entkommen', und(AKT2, BRUCH_DONE, { flag: 'aria_entkommen' })),
    krise: thema('hunter-a2-krise', { quest: 'main-2-krisensitzung', state: 'active' }),
    dante: thema('hunter-a2-dante', und(AKT2, COUNTDOWN_DONE)),
    chip: thema('hunter-a2-chip', und(NUR_AKT2, BRUCH_DONE)),
    drohnen: thema('hunter-a2-drohnen', und(NUR_AKT2, BRUCH_DONE)),
    chrome: thema('hunter-a2-chrome', und(NUR_AKT2, BRUCH_DONE)),
    vorbereitung: thema('hunter-a3-vorbereitung', und(NUR_AKT2, PARTY_GEPLANT)),
    nerven: thema('hunter-a3-nerven', und(NUR_AKT2, { flag: 'party_bereit' })),
  };

  const a2 = {
    nyra: tagesgespraech(t.nyra.id,
      [
        H('Wir haben sie dagelassen.', 'trauer'),
        H('Ich hab „Rückzug“ gerufen. Ich. Und sie hat genickt, als hätte ich ihr gerade das Wetter vorgelesen. Die knackt Quantum-Firewalls im Schlaf, und dann nickt sie, als wär’s nichts.'),
      ],
      [
        H('Weißt du, warum ich Blade nie verziehen hab? Nicht wegen dem Knast. Wegen dem Rohr. Wegen dem Moment, in dem man einen von uns zurücklässt.', 'wut'),
        H('Und jetzt hab ich’s selbst gemacht. Ich hol sie zurück. Und wenn ich dafür den ganzen verdammten Tower Stockwerk für Stockwerk auseinanderschrauben muss.'),
      ],
      M, { effects: [flag(t.nyra.flagName), herz('hunter', 20)] }),
    ariaChip: tagesgespraech(t.ariaChip.id,
      [
        H('Aria hat mich „Kunde“ genannt. Kunde! Sie hat gelächelt und gesagt, ihr Zerberster sei „jetzt optimal ausgelastet“.', 'besorgt'),
        H('Ich hab drei Jahre gesessen und zwei Pleiten überlebt. Das da war das Schlimmste, was ich je gehört hab.'),
      ],
      [H('Dante. Wir brauchen Dante. Ich weiß, dass er nein sagt. Er sagt immer nein. Dann sagen wir’s lauter.', 'wut')],
      M, { effects: [flag(t.ariaChip.flagName)] }),
    ariaZurueck: tagesgespraech(t.ariaZurueck.id,
      [
        H('Sie ist wach. Aria. Hat als Erstes Dante „Arschloch“ genannt und als Zweites mir gegen das Schienbein getreten.', 'freude'),
        H('Ich hab noch nie so gern geblutet.'),
      ],
      [H('Sie redet nicht drüber. Was sie gesehen hat, als der Chip drin war. Lass sie. Wenn sie reden will, redet sie. Laut. Mit Schläger.', 'besorgt')],
      M, { effects: [flag(t.ariaZurueck.flagName), herz('hunter', 10)] }),
    ariaEntkommen: tagesgespraech(t.ariaEntkommen.id,
      [
        H('Aria ist raus. Ohne Chip. Weil einer von uns schneller war als Quantum. Das passiert nicht oft. Schreib dir den Tag auf.', 'freude'),
        H('Aber einer hat ihn gekriegt. Den Chip. Irgendein armer Hund ohne Namen. Ich krieg den Gedanken nicht aus dem Kassenbuch.', 'besorgt'),
      ],
      [H('Man kann nicht alle retten, sagen die Leute. Die Leute sind Idioten. Man muss es wenigstens versuchen.', 'signatur')],
      M, { effects: [flag(t.ariaEntkommen.flagName)] }),
    krise: tagesgespraech(t.krise.id,
      [
        H('Siehst du das? Aussiedlerhof. Brunnen. Ziegen. Drei Hektar Staub für zweitausend Credits. Das ist ein guter Preis. Ein sehr guter Preis für einen Mann, der aufgibt.', 'trauer'),
        H('Mein Vater ist bis zur Staubstraße gekommen. Ich schaff’s vielleicht bis zur Wrackburg. Fortschritt.'),
      ],
      [
        H('Sag nichts. Ich weiß, was du sagen willst. Raven hat’s schon gesagt. Lauter.', 'wut'),
        H('Komm ins Hinterzimmer, wenn du einen Plan hast. Einen, der nicht mit „wir sterben alle“ endet. Ich hab nur Prospekte.'),
      ],
      M, { effects: [flag(t.krise.flagName)] }),
    dante: tagesgespraech(t.dante.id,
      [
        H('Dante ist zurück. Im Dienst. Mit Lötkolben. Der ganze Laden riecht nach Keksen und verbranntem Kabel.', 'signatur'),
        H('Ich hasse es. Ich liebe es. Sag ihm keins von beiden.'),
      ],
      [
        H('Sieben Jahre hab ich mir überlegt, was ich ihm sage, wenn er wieder dabei ist. Ich hab „Hm“ gesagt. Er hat „Hm“ gesagt. Wir haben uns verstanden.', 'freude'),
        H('Männer. Wir sind einfach gebaut. Wie Tresen. Viel Holz, wenig Schubladen.'),
      ],
      M, { effects: [flag(t.dante.flagName), herz('hunter', 10)] }),
    chip: tagesgespraech(t.chip.id,
      [
        H('Neue Hausregel. Hängt an der Tür. Bruno hat sie selbst geschrieben, man sieht’s an der Rechtschreibung.', 'signatur'),
        erz('Auf dem Schild an der Tür steht: „WER HIER MASTER SAGT ZAHLT DOPPELT. WER ES ZWEIMAL SAGT FLIEGT.“'),
        H('Gestern hat einer am Tresen gesagt: „Das ist eine ausgezeichnete Entscheidung, Master.“ Zu seinem Bier. Zu seinem BIER, {name}.'),
      ],
      [
        H('Die Hälfte der Stammgäste ist plötzlich höflich. Höflich! Ripper hat sich bedankt. Ich hab ihn sofort untersuchen lassen. Er hat keinen Chip, er hatte nur einen guten Tag. Das war fast schlimmer.', 'besorgt'),
        H('Die Chips sind billig, und Billiges hat einen Haken. Immer. Ich hab das im Knast gelernt, beim Zahnpasta-Tausch.'),
      ],
      M, { effects: [flag(t.chip.flagName)] }),
    drohnen: tagesgespraech(t.drohnen.id,
      [
        H('Eine Quantum-Drohne hat heute versucht, bei mir einen Drink zu bestellen. Mit Kundenkarte.', 'wut'),
        H('Ich hab ihr einen Neon-Limo ins Gebläse gekippt. Sie hat sich bedankt und ist rückwärts gegen die Leuchtreklame geflogen. Eins zu null für die Gastronomie.'),
      ],
      [H('Die Dinger zählen Leute. Wer wann wo trinkt. Ich zähl auch, aber ich zähl Credits. Das ist ehrlich. Die zählen Seelen.', 'besorgt')],
      M, { effects: [flag(t.drohnen.flagName)] }),
    chrome: tagesgespraech(t.chrome.id,
      [
        H('„Chrome 10“. Zehn Prozent auf alles, wenn du einen Chip trägst. Dexter hat mir seine Schulden in „Chrome 10“-Gutscheinen bezahlt. Und jetzt sind die plötzlich was wert.', 'wut'),
        H('Ich hab einen Haufen Gutscheine und null Lust, sie einzulösen. Das ist das erste Mal, dass ich Geld verbrennen will.'),
      ],
      [H('Wer Rabatt aufs Denken kriegt, zahlt am Ende mit dem Kopf. Schreib’s an die Tafel. Groß.', 'signatur')],
      M, { effects: [flag(t.chrome.flagName)] }),
    vorbereitung: tagesgespraech(t.vorbereitung.id,
      [
        H('Releaseparty. Himmelsgarten. Oberstadt. Wir. In Anzügen.', 'besorgt'),
        H('Geht da nicht in diesen Lumpen hin. Ich mein’s ernst. Gina macht Outfits, Fräulein Pixel macht Ausweise, und du machst ein Gesicht, als hättest du schon mal Kaviar gegessen.', 'signatur'),
      ],
      [
        H('Drei Sachen müssen sitzen, mindestens. Klamotten, Papiere, Gästeliste, ein Wagen, der Turmplan, Dantes Blocker. Such dir was aus. Aber such.'),
        H('Ich hab eine Krawatte gekauft. Ich hab noch nie eine Krawatte gekauft. Sie würgt mich. Das ist wahrscheinlich der Sinn der Sache.', 'verlegen'),
      ],
      M, { effects: [flag(t.vorbereitung.flagName)] }),
    nerven: tagesgespraech(t.nerven.id,
      [
        H('Ich hab seit drei Nächten nicht geschlafen. Ich hab alle Gläser poliert. Zweimal. Ich hab den Barkeeper poliert. Er war nicht begeistert.', 'besorgt'),
        H('Vor sieben Jahren war ich vor einem Bruch nie nervös. Weißt du, warum? Weil ich nichts zu verlieren hatte.'),
      ],
      [
        H('Jetzt hab ich einen Laden. Und euch. Das ist verdammt viel zu verlieren für einen Mann mit Krawatte.', 'trauer'),
        H('Morgen Abend. Pünktlich. Wer zu spät kommt, kriegt keinen Champagner. Wer zu früh kommt, hilft Dante beim Anzug. Glaub mir, du willst pünktlich sein.', 'signatur'),
      ],
      M, { effects: [flag(t.nerven.flagName), herz('hunter', 10)] }),
    abend: tagesgespraech('hunter-tag-akt2-abend',
      [H('Halb so viele Gäste wie letzten Monat. Die andere Hälfte sitzt zu Hause und lässt sich von ihrem Chip erzählen, wie schön es draußen ist.', 'besorgt')],
      [
        H('Aber die, die kommen, kommen richtig. Laut, durstig, unhöflich. Ich hab nie so viel Unhöflichkeit vermisst.', 'freude'),
        H('Ich lass das Licht brennen. Jeden Abend. Damit man sieht, dass hier noch einer ohne Chip hinterm Tresen steht.'),
      ],
      M),
  };

  const dialogues: DialogueDef[] = [
    master, partynacht, partynachtDanach,
    ep.meer, ep.nexus, ep.dreiB, ep.blade, ep.bladeWeg, ep.club, ep.strand, ep.abend,
    a2.nyra, a2.ariaChip, a2.ariaZurueck, a2.ariaEntkommen, a2.krise, a2.dante, a2.chip, a2.drohnen, a2.chrome,
    a2.vorbereitung, a2.nerven, a2.abend,
  ];

  const nachThema = (x: { id: string; flagName: string; when: Condition }): TalkDef => rede(x.id, und(x.when, ohne(x.flagName)));

  return {
    dialogues,
    // Vor allem anderen: Master-Modus, Partynacht.
    talkFirst: [
      rede('hunter-tag-master', MASTER),
      rede('hunter-tag-partynacht-raven', und(PARTYNACHT, { flag: 'raven_zurueck' })),
      rede('hunter-tag-partynacht', PARTYNACHT),
    ],
    // Nach den einmaligen Kommentaren: Nachspiel und Akt-2-Themen.
    talk: [
      nachThema(ep3b), nachThema(epMeer), nachThema(epNexus), nachThema(epBlade), nachThema(epBladeWeg), nachThema(epClub),
      rede('hunter-tag-strandclub', und(EPILOG_FREI, STRANDCLUB_LAEUFT, { weekday: ['fr', 'sa', 'so'] }, { time: ['tag', 'abend'] })),
      nachThema(t.nyra), nachThema(t.ariaChip), nachThema(t.ariaEntkommen), nachThema(t.ariaZurueck), nachThema(t.krise),
      nachThema(t.dante), nachThema(t.chip), nachThema(t.drohnen), nachThema(t.chrome), nachThema(t.vorbereitung), nachThema(t.nerven),
    ],
    // Nach den Wochentags-Sonderfällen, vor den allgemeinen Akt-1-Gesprächen.
    talkLate: [
      rede('hunter-tag-nachspiel', und(EPILOG_FREI, { time: ['abend', 'nacht'] })),
      rede('hunter-tag-akt2-abend', und(NUR_AKT2, BRUCH_DONE, { time: ['abend', 'nacht'] })),
    ],
  };
}

/** Tagesablauf Akt 2/3/Nachspiel (act23.json npcSchedules.hunter, vorangestellt) plus Herz-Ereignis-Orte. */
export const HUNTER_PLAN_23: ScheduleEntry[] = [
  { when: PARTYNACHT, place: { map: 'himmelsgarten', at: 'vip-lounge' } },
  { slot: ['tag', 'abend'], days: ['fr', 'sa', 'so'], when: und(EPILOG_FREI, STRANDCLUB_LAEUFT), place: { map: 'das-meer', at: 'strandclub' } },
  { slot: 'nacht', days: ['fr', 'sa'], when: und(EPILOG_FREI, STRANDCLUB_FERTIG), place: { map: 'das-meer', at: 'lagerfeuer' } },
  { slot: 'morgen', days: ['so'], when: und(EPILOG_FREI, { flag: 'meer_offen' }), place: { map: 'das-meer', at: 'hunter-liegestuhl' } },
  { slot: 'tag', when: { quest: 'main-2-krisensitzung', state: 'active' }, place: { map: 'hv-hinterzimmer', at: 'sofa' } },
  // Date bei Babette (Romanze, rom-hunter-date): abends an der Garküche, nicht am Ruhetag.
  {
    slot: 'abend', days: ['di', 'mi', 'do', 'fr', 'sa', 'so'],
    when: und({ flag: 'hunter_date_geplant' }, neu('rom-hunter-date')), place: { map: 'schrottmarkt', at: 'garkueche-hocker' },
  },
  // he-hunter-8: Fotowand im Hinterzimmer nach Ladenschluss.
  { slot: 'nacht', when: und(RUHIG, { hearts: 'hunter', min: 8 }, neu('he-hunter-8')), place: { map: 'hv-hinterzimmer', at: 'fotowand' } },
];

export const HUNTER_TEL_23: Record<string, PhoneMessageDef> = {
  'tel-hunter-fotowand': {
    id: 'tel-hunter-fotowand', from: 'hunter',
    text: 'Nach Ladenschluss. Hinterzimmer. Bring nichts mit. Ich hab was, das ich dir zeigen muss, bevor ich’s mir anders überleg.',
    auto: und(RUHIG, { hearts: 'hunter', min: 8 }, neu('he-hunter-8')),
  },
  'tel-hunter-toast': {
    id: 'tel-hunter-toast', from: 'hunter',
    text: 'Heute Nacht. High Voltage. Zieh was an, das nicht nach Kanal riecht. Und sei pünktlich. Es geht um dich.',
    auto: und(RUHIG, { hearts: 'hunter', min: 10 }, { seen: 'he-hunter-8' }, neu('he-hunter-10')),
  },
  'tel-hunter-date': {
    id: 'tel-hunter-date', from: 'hunter',
    text: 'Babettes Garküche. Abends. Nicht montags, da hat sie zu und ich keine Nerven. Ich reservier. Babette reserviert nicht, aber ich bin Hunter.',
    auto: und({ flag: 'hunter_date_geplant' }, neu('rom-hunter-date')),
    replies: [{ text: 'Ich komm. Pünktlich.' }, { text: 'Trägst du das rosa Hemd?', effects: [flag('hunter_date_rosa')] }],
  },
};
