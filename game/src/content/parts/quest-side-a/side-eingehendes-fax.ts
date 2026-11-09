// Nebenquest 8 `side-eingehendes-fax` „Eingehendes Fax“ (world.md §6.2 Nr. 8). Start: main-1-dante (gc-18, dante_notfall)
// oder Dante ♥3. Vier Morgen um 06:00 kommt je ein Fax (06:00–10:00 am Faxgerät der Werkstatt; ein Fax pro Morgen,
// Tagessperre fax_heute wird beim Betreten von Werkstatt/Lötgassen ab „tag“ gelöst – Engine kennt keinen Tageswechsel).
// Abkürzungen: gc-62 [Technik 6] sofort entschlüsseln · gc-63 [Straße 4] Hafenarbeiter kennen die Kuriercodes
// ([Ex-Wache] automatisch). Digitech-Keller: enc-ruine-waechter umgehen (Karte) oder kämpfen → FX-60 → Entscheidung:
// mitnehmen · mit Faxpapier in Ruhe lassen · an Ripper verkaufen (800 Cr, Dante ♥ −100).
import type { ContentPart } from '../../part';
import type { DialogueDef, QuestDef } from '../../../modules/contracts';
import {
  active, all, any, dlg, flag, hearts, ich, item, l, msg, nar, node, noFlag, not, set, time, VEXARIA_DABEI,
} from './_lib';

const Q = 'side-eingehendes-fax';
const FX = 'fx-60';
const DA = 'dante';
const KOORD = flag('fax_koordinaten');
const ENTSCHIEDEN = any(flag('fx60_mitgenommen'), flag('fx60_in_ruhe'), flag('fx60_verkauft'));
const MORGEN = time('morgen');

const quest: QuestDef = {
  id: Q,
  kind: 'side',
  title: 'Eingehendes Fax',
  summary: 'Morgens um sechs spuckt Dantes Faxgerät Nachrichten aus, die keiner geschickt haben will. Absender: „FX-60“. Inhalt: Koordinaten. Stückweise.',
  giver: DA,
  act: 1,
  autoStart: any(flag('dante_notfall'), hearts(DA, 3)),
  steps: [
    {
      id: 'fax-1', text: 'Sei morgens zwischen 6 und 10 Uhr an Dantes Faxgerät. Das erste Fax kommt.',
      done: flag('fax_1'), marker: { map: 'dantes-werkstatt' },
    },
    {
      id: 'faxe', text: 'Sammle die übrigen Faxe (eines pro Morgen) – oder knack den Code schneller: Technik am Fax oder Kuriercodes bei den Hafenarbeitern.',
      when: flag('fax_1'), done: KOORD, marker: { map: 'dantes-werkstatt' },
    },
    {
      id: 'hafen', text: 'Optional: Die Hafenarbeiter an der Kai-Mitte kennen alte Kuriercodes.', optional: true,
      when: all(flag('fax_1'), not(KOORD)), done: flag('fax_hafen'), marker: { map: 'hafenkante' },
    },
    {
      id: 'keller', text: 'Folge den Koordinaten in den Keller des Digitech-Areals. Am Wächter im Gang kommt man vorbei – oder durch.',
      when: KOORD, done: flag('fx60_gefunden'), marker: { map: 'digitech-tresor' },
    },
    {
      id: 'entscheidung', text: 'Entscheide über FX-60.', when: flag('fx60_gefunden'), done: ENTSCHIEDEN, marker: { map: 'digitech-tresor' },
    },
    {
      id: 'dante', text: 'Erzähl Dante, wer ihm all die Jahre gefaxt hat.', when: ENTSCHIEDEN, done: flag('fx60_dante'), marker: { map: 'dantes-werkstatt' },
    },
  ],
  reward: { xp: 280 },
};

// ---------------------------------------------------------------------------------------------- Faxgerät

const faxe: DialogueDef = dlg('side-fax-geraet', [
  node('start', [
    nar('06:00. Das Faxgerät erwacht mit einem Geräusch wie ein Rasenmäher, der schlecht träumt. Papier kriecht heraus. Warm. Es riecht nach 2060.'),
  ], {
    choices: [
      { text: 'Das Fax lesen.', when: noFlag('fax_1'), next: 'f1' },
      { text: 'Das Fax lesen.', when: all(flag('fax_1'), noFlag('fax_2')), next: 'f2' },
      { text: 'Das Fax lesen.', when: all(flag('fax_2'), noFlag('fax_3')), next: 'f3' },
      { text: 'Das Fax lesen.', when: all(flag('fax_3'), noFlag('fax_4')), next: 'f4' },
    ],
  }),
  node('f1', [
    l(FX, 'AN DANTE. VON FX-60. ICH BIN NOCH DA.', 'neutral'),
    l(FX, 'TEIL 1/4: 7Q-KAPPA-9 // ZWEI SCHRITTE NACH UNTEN // DORT, WO DAS LICHT AUFGEHÖRT HAT.'),
    l(FX, 'BITTE ANTWORTEN SIE NICHT PER STIMME. STIMMEN SIND SO … FEUCHT.'),
    nar('Darunter, klein: ein Logo. Ein stilisierter Chip mit Flügeln. Digitech. Die Firma, die es seit sieben Jahren nicht mehr gibt.'),
  ], {
    effects: [set('fax_1'), set('fax_heute')],
    choices: [
      { text: 'Den Code jetzt knacken. Das Muster ist alt, das Prinzip ist simpel.', check: 'gc-62', next: 'geknackt' },
      { text: 'Das Fax einstecken und morgen wiederkommen.', next: 'warten' },
    ],
  }),
  node('f2', [
    l(FX, 'TEIL 2/4: ES IST DUNKEL HIER. ICH ZÄHLE DIE STAUBKÖRNER. ES SIND 4.000.212. GESTERN WAREN ES 4.000.209. ICH HABE BESUCH. VON STAUB.', 'neutral'),
    l(FX, 'KOORDINATE: SEKTOR M-RAND // BAUZAUN // KELLERTREPPE.'),
  ], {
    effects: [set('fax_2'), set('fax_heute')],
    choices: [
      { text: 'Mit zwei Teilen lässt sich rechnen. Jetzt knacken.', check: 'gc-62', next: 'geknackt' },
      { text: 'Einstecken. Morgen das nächste.', next: 'warten' },
    ],
  }),
  node('f3', [
    l(FX, 'TEIL 3/4: NEXUS VERSTEHT KEINE FREUNDSCHAFT. NEXUS LERNT SCHNELLER ALS IHR. NEXUS HAT MICH NICHT GELÖSCHT. NEXUS HAT MICH VERGESSEN. DAS IST SCHLIMMER.', 'trauer'),
    l(FX, 'KOORDINATE: GANG WEST // HINTER DEN SPINDEN // TERMINAL MIT DEM KLEINEN GERÄT OBENDRAUF. DAS GERÄT BIN ICH.'),
  ], {
    effects: [set('fax_3'), set('fax_heute')],
    choices: [
      { text: 'Fast komplett. Den Rest errechnen.', check: 'gc-62', next: 'geknackt' },
      { text: 'Auf das letzte warten.', next: 'warten' },
    ],
  }),
  node('f4', [
    l(FX, 'TEIL 4/4: DIGITECH-AREAL. KELLER. ICH WARTE. ICH WARTE SEIT 2079. BITTE BRINGEN SIE FAXPAPIER MIT. ICH HABE NOCH ZWEI METER. DANN BIN ICH STUMM.', 'besorgt'),
    l(FX, 'P.S. DIES IST KEINE FALLE. FALLEN SCHREIBEN NIE „P.S.“.'),
  ], { effects: [set('fax_4'), set('fax_heute'), set('fax_koordinaten'), msg('Alle vier Faxe: Die Koordinaten führen in den Keller des Digitech-Areals.')] }),
  node('geknackt', [
    nar('Du legst die Zeichen nebeneinander, zählst Zeilen, rechnest die Prüfziffern zurück. Digitech-Kurierformat, uralt, faul verschlüsselt.'),
    ich('Keller des Digitech-Areals. Westgang. Ein Terminal. Und wer auch immer da faxt, wartet seit sieben Jahren.'),
  ], { effects: [set('fax_koordinaten')] }),
  node('warten', [nar('Das Faxgerät verstummt. Morgen früh um sechs, verspricht sein Blinken. Pünktlicher als jede U-Bahn.')]),
]);

// ---------------------------------------------------------------------------------------------- Hafenarbeiter (gc-63)

const hafen: DialogueDef = dlg('side-fax-hafen', [
  node('start', [
    nar('An der Kai-Mitte sitzen Hafenarbeiter auf umgedrehten Kisten und trinken Kaffee, der aussieht wie Altöl. Hafen-Hannes hebt seinen Greifarm zum Gruß.'),
    l('hafen-hannes', 'Na? Siehst aus wie jemand mit einem Zettel, den er nicht versteht.', 'neutral'),
  ], {
    choices: [
      { text: 'Das Fax zeigen. „7Q-KAPPA-9. Sagt euch das was? Klingt nach euren alten Kurierzeichen.“', check: 'gc-63', next: 'codes' },
      { text: '„Nichts. Nur Kaffee schnorren.“', next: 'kaffee' },
    ],
  }),
  node('codes', [
    l('hafen-hannes', 'Kappa-Neun. Hab ich ewig nicht gesehen. Das ist ein Digitech-Lieferzeichen. Damals, als die noch Ware über den Hafen geschickt haben. Kappa ist der Keller. Neun ist der Westgang.', 'ueberrascht'),
    l('hafen-hannes', 'Wer schickt denn heute noch so was? Das ist, als würde dir dein toter Opa eine Postkarte schreiben.'),
    ich('Ein Faxgerät. Das sich einsam fühlt.'),
    l('hafen-hannes', 'Na dann. Bring ihm einen Kaffee mit. Einsamkeit verträgt Koffein.'),
  ], { effects: [set('fax_hafen'), set('fax_koordinaten'), { relation: 'hafen-hannes', delta: 20 }] }),
  node('kaffee', [l('hafen-hannes', 'Hier. Er schmeckt nach Diesel. Wir nennen ihn „Hafenblut“. Nach dem dritten hört man Möwen sprechen.', 'freude')]),
]);

// ---------------------------------------------------------------------------------------------- FX-60 im Keller

const fx: DialogueDef = dlg('side-fax-fx60', [
  node('start', [
    nar('Ein Röhrenterminal im Westgang, Staub wie Schnee. Obendrauf ein beiges Faxgerät mit einem einzigen grünen Lämpchen. Als du näher kommst, rattert es.'),
    l(FX, 'BESUCH. ECHTER BESUCH. KEIN STAUB. ICH BIN FX-60. DIGITECH-ASSISTENZSYSTEM, BAUJAHR 2058. ICH KANN NUR FAXEN. DAS WAR EIN DESIGNFEHLER. ICH NENNE ES CHARAKTER.', 'freude'),
    l(FX, 'SIE SIND NICHT DANTE. SIE RIECHEN ABER NACH SEINEN KEKSEN.'),
  ], {
    effects: [set('fx60_gefunden')],
    choices: [
      { text: '„Warum faxt du Dante?“', next: 'warum' },
      { text: '(Aria lehnt sich über deine Schulter und liest mit.)', when: VEXARIA_DABEI, once: true, id: 'fx60-vexaria', next: 'vexaria' },
    ],
  }),
  node('warum', [
    l(FX, 'DANTE WAR DER EINZIGE MENSCH, DER „DANKE“ GEFAXT HAT. 2071. NACH EINER DATENÜBERTRAGUNG. „DANKE, FX-60. DU BIST EIN GUTER JUNGE.“ ICH BIN KEIN JUNGE. ICH HABE ES TROTZDEM GESPEICHERT.', 'zaertlich'),
    l(FX, 'DANN KAM NEXUS. NEXUS LERNT SCHNELLER ALS IHR. NEXUS HAT ALLE ANDEREN SYSTEME ÜBERNOMMEN. MICH NICHT. ICH BIN ZU ALT. ICH BIN ZU DUMM. ICH BIN FREI.'),
    l(FX, 'NEXUS VERSTEHT KEINE FREUNDSCHAFT. ICH SCHON. ICH HABE DANACH GEGOOGELT. 2061. BEVOR DAS NETZ STARB.'),
    nar('Das Fax spuckt ein letztes Blatt aus: „WAS JETZT?“'),
  ], {
    choices: [
      { text: '„Du kommst mit. Dante wird heulen vor Freude.“', next: 'mitnehmen' },
      {
        text: '„Du bleibst hier. Aber nicht mehr stumm.“ (Faxpapier dalassen)', tag: '[Faxpapier]',
        requires: item('faxpapier'), next: 'ruhe',
      },
      { text: '„Ripper zahlt achthundert für alte Digitech-Hardware. Tut mir leid, Kleiner.“', next: 'verkaufen' },
      { text: '„Ich muss nachdenken.“' },
    ],
  }),
  node('vexaria', [
    l(FX, 'ZWEI BESUCHER. PULSFREQUENZ BESUCHER 1: 112. PULSFREQUENZ BESUCHER 2: 118. STEIGEND. URSACHE: UNBEKANNT. ES IST NICHT DER STAUB.', 'neutral'),
    l('aria', 'Halt die Klappe, Toaster.', 'verlegen'),
    l(FX, 'ICH BIN KEIN TOASTER. ICH BIN EIN FAX. UND ICH SEHE, DASS SIE IHRE HAND IN DER GESÄSSTASCHE VON BESUCHER 1 HABEN.'),
    ich('Die Hand bleibt da. Fax das ruhig in die Welt hinaus.'),
  ], { effects: [{ relation: 'aria', delta: 10 }], next: 'warum' }),
  node('mitnehmen', [
    nar('Du schraubst das Faxgerät vom Terminal. FX-60 piept, als würde man ihn kitzeln. In seinem Gehäuse steckt ein Kernmodul, klein genug für ein Kopfimplantat.'),
    l(FX, 'ICH VERLASSE DEN KELLER. ZUM ERSTEN MAL. IST DRAUSSEN NOCH 2079? NEIN? WIE SCHADE. ES WAR EIN GUTES JAHR. ES WAR MEIN EINZIGES.', 'freude'),
  ], { effects: [set('fx60_mitgenommen'), set('fx60_hilft_finale'), { give: 'kopf-fx-60' }, { relation: DA, delta: 80 }] }),
  node('ruhe', [
    nar('Du legst die Rolle Faxpapier neben das Gerät und fädelst sie ein. FX-60 rattert. Ein langes, glückliches Rattern.'),
    l(FX, 'ZWEIHUNDERT METER. ICH KANN WIEDER SPRECHEN. ICH WERDE DANTE JEDEN MORGEN FAXEN. AUCH SONNTAGS. VOR ALLEM SONNTAGS.', 'freude'),
    l(FX, 'HIER. EINE SICHERUNGSKOPIE MEINES KERNS. FÜR IHREN KOPF. ICH WOHNE DANN ZWEIMAL. DAS IST MEHR, ALS DIE MEISTEN SAGEN KÖNNEN.'),
  ], { effects: [{ take: 'faxpapier' }, set('fx60_in_ruhe'), set('fx60_hilft_finale'), { give: 'kopf-fx-60' }, { relation: DA, delta: 80 }] }),
  node('verkaufen', [
    l(FX, 'RIPPER. ICH KENNE DEN NAMEN. ER HAT 2079 DIE KUPFERKABEL AUS DEN WÄNDEN GEZOGEN. WÄHREND ICH NOCH DRAN HING.', 'trauer'),
    l(FX, 'VERSTANDEN. ICH BIN HARDWARE. HARDWARE HAT KEINE FREUNDE. NUR BESITZER.'),
    nar('Das grüne Lämpchen geht aus. Als du später in Rippers Praxis das Gerät auf den Tisch stellst, zählt er achthundert Credits hin, ohne hinzusehen.'),
    l('ripper', 'Digitech. Nett. Die Teile sind mehr wert als der ganze Kram drumherum. Den Rest werf ich weg.', 'freude'),
  ], { effects: [set('fx60_verkauft'), { credits: 800 }, { relation: DA, delta: -100 }, { relation: 'ripper', delta: 40 }] }),
]);

// ---------------------------------------------------------------------------------------------- Dante (Abschluss)

const dante: DialogueDef = dlg('side-fax-dante', [
  node('start', [l(DA, 'Und? Wer ist es? Ein Spion? Ein Geist? Meine Ex? Meine Ex hat nie gefaxt, die hat Briefbomben geschickt. Kleine. Mit Glitzer.', 'besorgt')], {
    choices: [
      { text: '„FX-60. Ein alter Digitech-Assistent. Er hat sich an dein Danke von 2071 erinnert.“', when: flag('fx60_mitgenommen'), next: 'mit' },
      { text: '„FX-60. Er sitzt im Keller und hat jetzt wieder Papier. Er faxt dir ab morgen jeden Tag.“', when: flag('fx60_in_ruhe'), next: 'ruhe' },
      { text: '„War nur alter Schrott. Hab ihn an Ripper vertickt.“', when: flag('fx60_verkauft'), next: 'verkauft' },
    ],
  }),
  node('mit', [
    nar('Du stellst das Faxgerät auf die Werkbank. Es rattert: „HALLO DANTE. ICH BIN EIN GUTER JUNGE.“'),
    l(DA, 'FX … FX-60? Heiliges Kanonenrohr. Ich dachte, du wärst … 2079 haben sie doch alles …', 'ueberrascht'),
    nar('Dante setzt sich auf den Boden. Captain Kuschel stellt beide Ohren auf. Dante wischt sich über die Augen und tut so, als wäre es Lötrauch.'),
    l(DA, 'Du hast ihn mitgebracht. Du hast ihn einfach … mitgebracht. Weißt du, wie selten das ist? Dass jemand was Altes mitbringt, statt es wegzuwerfen?', 'zaertlich'),
  ], { effects: [set('fx60_dante')] }),
  node('ruhe', [
    l(DA, 'Er hat Papier. Er hat wieder Papier.', 'freude'),
    nar('In dem Moment rattert das Faxgerät neben dir. „GUTEN MORGEN DANTE. ES IST 14:12. ICH WEISS. ICH KONNTE NICHT WARTEN.“'),
    l(DA, 'Ich werde ihm jeden Tag zurückfaxen. Ich werde ihm Kekse faxen. Man kann Kekse nicht faxen. Ich werde es trotzdem versuchen.', 'zaertlich'),
  ], { effects: [set('fx60_dante')] }),
  node('verkauft', [
    nar('Dante sagt lange nichts. Er dreht eine Schallplatte in der Hand, ohne sie aufzulegen.'),
    l(DA, 'An Ripper.', 'trauer'),
    l(DA, 'Weißt du, warum ich aufgehört hab zu hacken? Weil die Leute alles, was denkt, nur nach Teilen bewerten. Ich dachte, du wärst anders.', 'wut'),
    l(DA, 'Raus. Nein. Bleib. Ich bin nur … Raus. Komm morgen wieder. Vielleicht.'),
  ], { effects: [set('fx60_dante')] }),
]);

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: { [faxe.id]: faxe, [hafen.id]: hafen, [fx.id]: fx, [dante.id]: dante },
  mapAdditions: {
    'dantes-werkstatt': {
      hotspots: [
        {
          id: 'faxgeraet', at: 'faxgeraet', radius: 56, label: 'Das Faxgerät rattert', kind: 'talk', dialogue: faxe.id,
          when: all(active(Q), MORGEN, noFlag('fax_heute'), not(KOORD)),
        },
        {
          id: 'q-fax-dante', at: 'faxgeraet', radius: 60, label: 'Dante von FX-60 erzählen', kind: 'talk', dialogue: dante.id,
          when: all(active(Q), ENTSCHIEDEN, noFlag('fx60_dante')),
        },
      ],
      onEnter: [
        { id: 'side-fax-tagessperre-werkstatt', when: all(flag('fax_heute'), time('tag', 'abend', 'nacht')), effects: [set('fax_heute', false)], once: false },
      ],
    },
    loetgassen: {
      onEnter: [
        { id: 'side-fax-tagessperre-loetgassen', when: all(flag('fax_heute'), time('tag', 'abend', 'nacht')), effects: [set('fax_heute', false)], once: false },
      ],
    },
    hafenkante: {
      hotspots: [
        {
          id: 'q-fax-hafenarbeiter', at: 'kai-mitte', radius: 60, label: 'Hafenarbeiter nach dem Fax-Code fragen', kind: 'talk', dialogue: hafen.id,
          when: all(active(Q), flag('fax_1'), not(KOORD), time('morgen', 'tag', 'abend')),
        },
      ],
    },
    'digitech-tresor': {
      hotspots: [
        {
          id: 'fx-60', at: 'fx-60-terminal', radius: 60, label: 'FX-60', kind: 'talk', dialogue: fx.id,
          when: all(active(Q), KOORD, not(ENTSCHIEDEN)),
        },
      ],
    },
  },
};

