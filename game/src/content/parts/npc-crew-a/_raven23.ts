// Raven in Akt 2, Akt 3 und im Nachspiel (world.md §4.2, §4.7 Paar-Strang, §5.3–5.5).
// Kein eigener Inhaltsteil: raven.ts baut daraus Tagesgespräche, Tagesablauf und Telefon zusammen.
// In der Partynacht ist Raven gechippt (Anker 4), bis main-3-gedankenkontrolle `raven_zurueck` setzt.
import type { Condition, DialogueDef, PhoneMessageDef, ScheduleEntry, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2, COUNTDOWN_DONE, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER, NUR_AKT2, NYRA_WEG, PARTY_GEPLANT,
  PARTYNACHT, RUHIG, erz, flag, herz, knoten, neu, ohne, rede, sprecher, tagesgespraech, und,
} from './_helfer';

const R = sprecher('raven');

const BRUCH_DONE: Condition = { quest: 'main-2-bruch', state: 'done' };
const thema = (id: string, when: Condition) => ({ id, flagName: `raven_${id.replace(/^raven-/, '').replace(/-/g, '_')}`, when });

export function raven23(M: Menue): { dialogues: DialogueDef[]; talkFirst: TalkDef[]; talk: TalkDef[]; talkLate: TalkDef[] } {
  // ------------------------------------------------------------------------------------------ Master-Modus
  const master = tagesgespraech('raven-tag-master',
    [
      R('Du teilst auch nicht gerne.', 'wut'),
      R('Ich hab sieben Jahre an einem Rohr gehangen, weil einer wie du oben stehen wollte. Ich häng nicht noch mal. Nicht an dir.'),
    ],
    [R('Weißt du, was das Schlimmste ist? Ich hab dir den Rücken zugedreht. Ich hab dir mein Messer gegeben. Billige Lüge, alles. Und ich hab sie gekauft.', 'trauer')],
    {
      choices: [
        { text: '„Raven. Drei kurz, zwei lang.“', next: 'klopfen', when: { quest: 'side-zweite-chance', state: 'active' }, once: true, id: 'master-klopfen' },
        { text: 'Gehen.' },
      ],
      nodes: [
        knoten('klopfen', [
          erz('Du klopfst auf das Geländer. Drei kurz, zwei lang. Raven sieht dich lange an. Sie klopft nicht zurück. Aber sie geht auch nicht weg.'),
          R('Noch da? … Weiß ich nicht. Frag mich, wenn du den Schreibtisch da oben abgefackelt hast.', 'trauer'),
        ], { effects: [flag('raven_zweite_chance_gehoert')] }),
      ],
    },
    { plauschText: '„Raven, hör mir zu.“' });

  // ------------------------------------------------------------------------------------------ Partynacht
  const gechippt = tagesgespraech('raven-tag-gechippt',
    [
      erz('Raven trägt ein schwarzes Kleid mit sehr vielen Taschen. Sie lächelt. Raven lächelt nicht. Raven lächelt jetzt.'),
      R('Guten Abend. Willkommen im Himmelsgarten. Darf ich Ihnen einen Chip anbieten? Es ist eine ausgezeichnete Entscheidung.', 'freude'),
    ],
    [
      R('Ich fühle mich sehr gut. Ich fühle mich ausgeglichen. Ich fühle mich … ', 'neutral'),
      erz('Ihre linke Hand zuckt. Zum Handgelenk. Dahin, wo sieben Jahre lang eine Handschelle war.'),
      R('… Ich fühle mich sehr gut.'),
    ],
    {
      choices: [
        { text: 'An ihr Glas klopfen. Drei kurz, zwei lang.', next: 'klopfen', once: true, id: 'gechippt-klopfen' },
        { text: '„Halt durch, Raven. Wir holen dich.“' },
      ],
      nodes: [
        knoten('klopfen', [
          erz('Klirr-klirr-klirr. Klirr. Klirr. Ihre Augen flackern. Eine Sekunde lang ist da Raven, ganz hinten, hinter Glas.'),
          R('… Noch … da?', 'besorgt'),
          erz('Dann ist das Lächeln wieder da, glatt wie Lack.'),
          R('Darf ich Ihnen noch etwas bringen, Master?', 'freude'),
        ], { effects: [flag('raven_gechippt_geklopft')] }),
      ],
    },
    { plauschText: '„Raven. Ich bin’s.“' });

  // ------------------------------------------------------------------------------------------ Nachspiel
  const ep = {
    meer: thema('raven-ep-meer', und(EPILOG_FREI, ENDE_MEER)),
    nexus: thema('raven-ep-nexus', und(EPILOG_FREI, ENDE_NEXUS)),
    dreiB: thema('raven-ep-3b', und(EPILOG_FREI, { flag: 'ende_doch_noch_meer' })),
    rohr: thema('raven-ep-rohr', und(EPILOG_FREI, { flag: 'blade_angekettet' })),
    gefasst: thema('raven-ep-gefasst', und(EPILOG_FREI, { flag: 'blade_gefasst' }, { notFlag: 'blade_angekettet' })),
    weg: thema('raven-ep-weg', und(EPILOG_FREI, { flag: 'blade_entkommen' })),
    paar: thema('raven-ep-paar', und(EPILOG_FREI, { any: [{ quest: 'pers-wingman-sonnenuntergang', state: 'done' }, { flag: 'dante_raven_am_meer' }] })),
  };
  const epD = {
    meer: tagesgespraech(ep.meer.id,
      [
        R('Ich hab sie gefunden. Die Farbe.', 'freude'),
        R('Weißt du noch, auf dem Dach? „Sag mir eine Farbe. Eine richtige.“ Das Meer hat keine. Das Meer hat alle. Gleichzeitig. Ich hab eine halbe Stunde draufgeguckt und vergessen zu blinzeln.'),
      ],
      [R('Ich bin ins Wasser gegangen. Mit Stiefeln. Aria hat gelacht, bis sie umgefallen ist. Mir egal. Sieben Jahre Grau, und dann das. Da zieht man keine Stiefel aus.', 'signatur')],
      M, { effects: [flag(ep.meer.flagName), herz('raven', 20)] }),
    nexus: tagesgespraech(ep.nexus.id,
      [
        R('Die KI sagt „bitte“. Sie sagt „danke“. Und sie weiß, wo jeder in dieser Stadt schläft.', 'wut'),
        R('Ich trau keinem Toaster, der höflich ist. Hab ich ihr gesagt. Sie hat gesagt: „Das verstehe ich, Raven. Soll ich dir einen Kaffee machen?“'),
      ],
      [R('… Der Kaffee war gut. Das macht es schlimmer.', 'signatur')],
      M, { effects: [flag(ep.nexus.flagName)] }),
    dreiB: tagesgespraech(ep.dreiB.id,
      [
        R('Du teilst ja doch.', 'freude'),
        R('Hätte nicht gedacht, dass ich das noch mal sag. Ich hab Hunter dagegen wetten lassen. Er hat verloren. Ich hab gewonnen. Wir sind beide froh.'),
      ],
      [R('Wenn du noch mal so einen Schreibtisch siehst, lauf. Ich lauf mit. In die andere Richtung.', 'signatur')],
      M, { effects: [flag(ep.dreiB.flagName), herz('raven', 30)] }),
    rohr: tagesgespraech(ep.rohr.id,
      [
        R('Ich hab ihn ans Rohr gekettet. Blade. Mit seinem eigenen Trick.', 'signatur'),
        R('Ich dachte, ich fühl mich dann besser. Hab ich nicht. Nur fertig. Fertig ist auch was. Fertig ist eigentlich ziemlich viel.'),
      ],
      [R('Er hat „Bitte“ gesagt. Blade. „Bitte.“ Ich hab drei Stunden gewartet, bis die Wache kam. So lange wie er damals. Gerecht ist gerecht.', 'wut')],
      M, { effects: [flag(ep.rohr.flagName), herz('raven', 20)] }),
    gefasst: tagesgespraech(ep.gefasst.id,
      [R('Blade sitzt. Eisenhof. Zelle vierzehn ist frei geworden. Gerda hat gefragt, ob er nett ist. Ich hab gesagt, er ist gutaussehend. Das ist nicht dasselbe.', 'signatur')],
      [R('Ich geh ihn nicht besuchen. Vielleicht irgendwann. Mit Kaffee. Damit er riecht, was draußen ist.', 'trauer')],
      M, { effects: [flag(ep.gefasst.flagName)] }),
    weg: tagesgespraech(ep.weg.id,
      [
        R('Er ist weg. Er kommt wieder.', 'wut'),
        R('Ich hab das Fenster offen gelassen. Jede Nacht. Wenn er kommt, will ich ihn hören.'),
      ],
      [R('Du hast ihn laufen lassen. Ich versteh’s. Ich vergess es nicht. Beides gleichzeitig. Das kann ich gut, das hab ich im Knast gelernt.', 'trauer')],
      M, { effects: [flag(ep.weg.flagName)] }),
    paar: tagesgespraech(ep.paar.id,
      [
        R('Er redet beim Küssen. Ich hab’s ihm nicht abgewöhnt.', 'verlegen'),
        R('Will ich auch nicht. Wenn er still ist, mach ich mir Sorgen.'),
      ],
      [
        R('Sieben Jahre Fotos im Schrank. Jetzt hängen sie an der Wand. In der Werkstatt. Mit Rahmen. Er hat Rahmen gelötet.', 'freude'),
        R('Wenn du das irgendwem erzählst, hol ich mir das Messer zurück. Und zwar mit Schwung.', 'signatur'),
      ],
      M, { effects: [flag(ep.paar.flagName), herz('raven', 20)] }),
    strand: tagesgespraech('raven-tag-strand',
      [R('Hier lauf ich. Kein Kreis. Keine zwölf Schritte. Nur geradeaus, bis das Wasser kommt.', 'freude')],
      [R('Wenn die Sonne untergeht, setz ich mich hin und zähl die Farben. Bin noch nie fertig geworden. Das ist der Plan.', 'zaertlich')],
      M),
  };

  // ------------------------------------------------------------------------------------------ Akt 2 und Akt 3
  const t = {
    nyra: thema('raven-a2-nyra', und(AKT2, BRUCH_DONE, NYRA_WEG)),
    ariaChip: thema('raven-a2-aria-chip', und(AKT2, { flag: 'aria_gechippt' }, { not: COUNTDOWN_DONE })),
    ariaZurueck: thema('raven-a2-aria-zurueck', und(AKT2, COUNTDOWN_DONE, { flag: 'aria_gechippt' })),
    krise: thema('raven-a2-krise', und(AKT2, { quest: 'main-2-krisensitzung', state: ['active', 'done'] })),
    dante: thema('raven-a2-dante', und(AKT2, COUNTDOWN_DONE)),
    chip: thema('raven-a2-chip', und(NUR_AKT2, BRUCH_DONE)),
    drohnen: thema('raven-a2-drohnen', und(NUR_AKT2, BRUCH_DONE)),
    chrome: thema('raven-a2-chrome', und(NUR_AKT2, BRUCH_DONE)),
    vorbereitung: thema('raven-a3-vorbereitung', und(NUR_AKT2, PARTY_GEPLANT)),
    nerven: thema('raven-a3-nerven', und(NUR_AKT2, { flag: 'party_bereit' })),
  };
  const a2 = {
    nyra: tagesgespraech(t.nyra.id,
      [
        R('Wir haben sie dagelassen.', 'trauer'),
        R('Ich weiß, wie sich das anfühlt. Von der anderen Seite. Wenn die Tür zugeht und die Schritte leiser werden und man noch eine Weile glaubt, dass einer zurückkommt.'),
      ],
      [
        R('Drei Stunden. So lange glaubt man das. Danach glaubt man gar nichts mehr.', 'wut'),
        R('Nyra kriegt keine drei Stunden. Nyra kriegt uns. Und wenn ich dafür jede Lüftung im Tower auf Knien abkriechen muss.'),
      ],
      M, { effects: [flag(t.nyra.flagName), herz('raven', 20)] }),
    ariaChip: tagesgespraech(t.ariaChip.id,
      [
        R('Aria hat sich bei mir bedankt. Für „die hervorragende Zusammenarbeit“.', 'besorgt'),
        R('Aria hat in ihrem ganzen Leben noch nie „hervorragend“ gesagt. Sie hat mal „geil“ zu einem Sonnenuntergang gesagt. Das war das Höchste.'),
      ],
      [R('Wir holen sie zurück. Ich weiß nicht wie. Dante weiß wie. Dante weiß immer wie, er will’s nur nie.', 'wut')],
      M, { effects: [flag(t.ariaChip.flagName)] }),
    ariaZurueck: tagesgespraech(t.ariaZurueck.id,
      [
        R('Aria hat mich heute „blöde Kuh“ genannt. Weil ich ihr den letzten Keks weggegessen hab.', 'freude'),
        R('Ich hab mich noch nie so gefreut, beleidigt zu werden.'),
      ],
      [R('Sie schläft schlecht. Ich hör sie nachts. Ich sag nichts. Ich setz mich nur vor ihre Tür. Das reicht manchmal.', 'besorgt')],
      M, { effects: [flag(t.ariaZurueck.flagName)] }),
    krise: tagesgespraech(t.krise.id,
      [
        R('Ich hab Hunter angebrüllt. Er hat zurückgebrüllt. Bruno hat die Tür zugemacht.', 'wut'),
        R('Ödnis. Ziegen. Weglaufen. Das hat er vorgeschlagen. Der Mann, der mir sieben Jahre lang Grüße ausrichten ließ, statt mal eine Karte zu schreiben.'),
      ],
      [R('Dann hat er mir einen Kaffee gemacht. So streiten wir. Laut, und dann Kaffee. Funktioniert seit zwölf Jahren.', 'signatur')],
      M, { effects: [flag(t.krise.flagName)] }),
    dante: tagesgespraech(t.dante.id,
      [
        R('Er ist jetzt jeden Tag da. Dante. Im Club, in der Werkstatt, im Funk.', 'besorgt'),
        R('Er redet. Ich hör zu. Das ist neu. Früher hab ich weggehört. Jetzt hör ich zu und tu so, als würd ich weghören.'),
      ],
      [R('Er hat mir heute einen Keks hingelegt. Ohne was zu sagen. Dante. Ohne was zu sagen. Ich hab ihn in die Jacke gesteckt. Er ist noch da. Der Keks.', 'verlegen')],
      M, { effects: [flag(t.dante.flagName), herz('raven', 10)] }),
    chip: tagesgespraech(t.chip.id,
      [
        R('Höflich. Alle. Der Typ am Markt mit den drei Geldbörsen hat sie zurückgegeben. Alle drei. Mit Entschuldigung.', 'besorgt'),
        R('So war’s im Eisenhof nach der Medikamentenausgabe. Alle nett. Alle leer.'),
      ],
      [R('Wenn mir einer einen Chip anbietet, brech ich ihm die Finger. Einzeln. Damit er Zeit hat, drüber nachzudenken.', 'wut')],
      M, { effects: [flag(t.chip.flagName)] }),
    drohnen: tagesgespraech(t.drohnen.id,
      [
        R('Ich hab einer Quantum-Drohne den Propeller abgebrochen. Sie hat mich gescannt. Ohne zu fragen.', 'signatur'),
        R('Sie hat sich entschuldigt. Im Fallen. „Entschuldigen Sie die Störung.“ Dann ist sie in den Kanal geplumpst.'),
      ],
      [R('Die zählen, wer wo schläft. Ich schlaf auf dem Dach. Soll sie zählen. Ich zähl zurück.', 'wut')],
      M, { effects: [flag(t.drohnen.flagName)] }),
    chrome: tagesgespraech(t.chrome.id,
      [R('„Chrome 10“. Zehn Prozent Rabatt auf deinen freien Willen. Steht an jeder Wand. In Pink.', 'wut')],
      [R('Seraphinas Gesicht auf jedem Plakat. Ich hab ihr letzten Monat einen Raben auf den Spiegel gemalt. Ich hätte ein Gesicht malen sollen. Ein ehrliches.', 'signatur')],
      M, { effects: [flag(t.chrome.flagName)] }),
    vorbereitung: tagesgespraech(t.vorbereitung.id,
      [
        R('Gina will mir ein Kleid anziehen. Ein Kleid.', 'wut'),
        R('Ich hab gesagt: Nur, wenn’s Taschen hat. Für Messer. Sie hat gesagt: „Schätzchen, das ist Haute Couture.“ Ich hab gesagt: „Dann eben Haute Couture mit Taschen.“'),
      ],
      [R('Sie näht jetzt Taschen. Sechs. Ich mag sie. Erzähl’s ihr nicht.', 'signatur')],
      M, { effects: [flag(t.vorbereitung.flagName)] }),
    nerven: tagesgespraech(t.nerven.id,
      [
        R('Ich hab ein komisches Gefühl. Wie vor Digitech. Alles passt, alles ist geplant, und irgendwo lächelt einer.', 'besorgt'),
        R('Wenn ich da oben komisch werde, wenn ich nett werde, wenn ich „Master“ sag …'),
      ],
      [
        R('Dann klopf. Drei kurz, zwei lang. Und hör nicht auf, bis ich zurückklopf.', 'trauer'),
        R('Versprich’s. Nein. Nicht versprechen. Mach’s einfach.'),
      ],
      M, { effects: [flag(t.nerven.flagName), flag('raven_klopfzeichen_abgemacht'), herz('raven', 10)] }),
    abend: tagesgespraech('raven-tag-akt2',
      [R('Setz dich. Die Stadt ist leiser geworden. Nicht ruhiger. Leiser. Das ist ein Unterschied.', 'besorgt')],
      [R('Im Eisenhof wusste man, wer die Wärter sind. Hier draußen tragen sie jetzt einen Chip und sagen „Guten Morgen“. Ich vermiss die Uniformen.', 'signatur')],
      M),
  };

  const nachThema = (x: { id: string; flagName: string; when: Condition }): TalkDef => rede(x.id, und(x.when, ohne(x.flagName)));

  return {
    dialogues: [
      master, gechippt,
      epD.meer, epD.nexus, epD.dreiB, epD.rohr, epD.gefasst, epD.weg, epD.paar, epD.strand,
      a2.nyra, a2.ariaChip, a2.ariaZurueck, a2.krise, a2.dante, a2.chip, a2.drohnen, a2.chrome, a2.vorbereitung, a2.nerven, a2.abend,
    ],
    talkFirst: [
      rede('raven-tag-master', MASTER),
      rede('raven-tag-gechippt', und(PARTYNACHT, { notFlag: 'raven_zurueck' })),
    ],
    talk: [
      nachThema(ep.dreiB), nachThema(ep.meer), nachThema(ep.nexus), nachThema(ep.rohr), nachThema(ep.gefasst), nachThema(ep.weg), nachThema(ep.paar),
      rede('raven-tag-strand', und(EPILOG_FREI, { flag: 'meer_offen' }, { weekday: ['sa', 'so'] }, { time: 'abend' })),
      nachThema(t.nyra), nachThema(t.ariaChip), nachThema(t.ariaZurueck), nachThema(t.krise), nachThema(t.dante),
      nachThema(t.chip), nachThema(t.drohnen), nachThema(t.chrome), nachThema(t.vorbereitung), nachThema(t.nerven),
    ],
    talkLate: [
      rede('raven-tag-akt2', und(NUR_AKT2, BRUCH_DONE, { time: ['abend', 'nacht'] })),
    ],
  };
}

export const RAVEN_PLAN_23: ScheduleEntry[] = [
  { when: und(PARTYNACHT, { notFlag: 'raven_zurueck' }), place: { map: 'himmelsgarten', at: 'partysaal' } },
  { when: PARTYNACHT, place: 'away' },
  { slot: 'abend', days: ['sa', 'so'], when: und(EPILOG_FREI, { flag: 'meer_offen' }), place: { map: 'das-meer', at: 'strand' } },
  // he-raven-8: Digitech-Tresor, am Rohr.
  { slot: ['tag', 'abend'], when: und(RUHIG, { hearts: 'raven', min: 8 }, neu('he-raven-8')), place: { map: 'digitech-tresor', at: 'tresor-rohr' } },
];

export const RAVEN_TEL_23: Record<string, PhoneMessageDef> = {
  'tel-raven-tresor': {
    id: 'tel-raven-tresor', from: 'raven',
    text: 'Digitech-Tresor. Tagsüber oder abends. Ich muss da was zurücklassen. Allein schaff ich das nicht. Sag’s keinem.',
    auto: und(RUHIG, { hearts: 'raven', min: 8 }, neu('he-raven-8')),
  },
  'tel-raven-dach-10': {
    id: 'tel-raven-dach-10', from: 'raven',
    text: 'Dach. Heute Nacht. Ich hab was für dich. Und eine Frage. Die Frage ist schlimmer.',
    auto: und(RUHIG, { hearts: 'raven', min: 10 }, { seen: 'he-raven-8' }, neu('he-raven-10')),
  },
};
