// Hauptquest main-2-bruch „Der Bruch“ (world.md §5.3). Nacht im quantum-campus, Start direkt nach der Planungstafel
// (quest-main-b/planungstafel.ts → Cliffhanger → Einstieg bruch-treffpunkt, 22:00).
//
// Ablauf:
//   Treffpunkt (Hecke am Zaun Ost): Briefing nach Vorbereitungen, Rollenwahl
//     drinnen  = Aria + Nyra: Eingang (Seiteneingang mit Zugangskarte/gc-105/Hack · Lüftung mit Grundriss/gc-105 ·
//                Haupttor mit Ablenkung oder akt-schleichen/Kampf) → Foyer (Laboraufzug: Nyra, Karte oder Hack) → Labor
//                → Tresor (Nyra oder akt-hacken) → Nexus erwacht (Tafel cut-main-2-bruch) → gc-29 Abschirmung
//                (nexus-forschungsdaten) / Notschalter → enc-labor-xion (5 Runden) oder Ausgang (nach gc-29/Notschalter)
//     Brücke   = Raven + Vega: Overwatch am Brückenkopf (akt-overwatch oder enc-bruch-overwatch) → Nexus erwacht über
//                Funk → durch den Lüftungsschacht runter ins Labor
//   Gemeinsam: Aria-Moment (Variante A gefangen + gechippt · Variante B gc-30 [Reflexe 7] oder [Vega ♥6], dann trifft
//   es einen namenlosen Probanden bzw. Jimmy, falls nicht gerettet) → Nyra bleibt zurück (Brandschutztür) → Flucht
//   (mit prep-fluchtweg durch den Kanal) → Morgen im Crew-Quartier, main-2-kanal beginnt.
// Eigene Reise-Hotspots (Präfix m2b-) statt fremder Ausgangsbedingungen: Der Weg funktioniert unabhängig davon, welche
// Flags die Karten-Pakete an ihre Ausgänge schreiben.
import type { ContentPart } from '../../part';
import type { CutsceneDef, DialogueChoice, DialogueDef, DialogueNode, Effect, NewsDef, QuestDef } from '../../../modules/contracts';
import {
  JIMMY_GERETTET, PARTY_LEEREN, UHR, VEX, NOT_VEX, active, all, any, companion, dlg, flag, hearts, herz, item, l,
  msg, nar, noFlag, node, not, pruef, set, waitChoices, won,
} from './_lib';

const Q = 'main-2-bruch';
const AKTIV = active(Q);
const DRINNEN = flag('bruch_rolle_drinnen');
const BRUECKE = flag('bruch_rolle_bruecke');
const ROLLE = any(DRINNEN, BRUECKE);
const DRIN = flag('bruch_drin');
const IM_LABOR = flag('bruch_im_labor');
const ERWACHT = flag('nexus_erwacht');
const ARIA_ENTSCHIEDEN = any(flag('aria_gechippt'), flag('aria_entkommen'));
const ENTKOMMEN = flag('bruch_entkommen');
const XION_VORBEI = any(won('enc-labor-xion'), flag('bruch_ausgang'));

const GRUNDRISS = any(flag('prep_grundriss'), item('grundriss-labor'));
const ZUGANGSKARTE = any(flag('prep_zugangskarte'), item('zugangskarte-quantum'));
const WACHPLAN = any(flag('prep_wachplan'), item('wachplan-campus'));
const ABLENKUNG = flag('prep_ablenkung');
const FLUCHTWEG = flag('prep_fluchtweg');

const IN = (map: string, entry: string): Effect => ({ travel: map, entry, minutes: 0 });

// ---------------------------------------------------------------------------------------------- Quest

const quest: QuestDef = {
  id: Q,
  kind: 'main',
  noCollapse: true,
  title: 'Der Bruch',
  summary: 'Heute Nacht holen wir uns den Chip und die Daten aus dem Quantum-Labor. Rein, raus, keiner stirbt. Das ist der Plan. Es gibt keinen Plan B. – Hunter',
  giver: 'hunter',
  act: 2,
  steps: [
    {
      id: 'treffpunkt',
      text: 'Triff die Crew an der Hecke am Ostzaun des Quantum-Campus und wähl deine Rolle.',
      done: ROLLE,
      marker: { map: 'quantum-campus', at: 'bruch-treffpunkt' },
    },
    // --- drinnen
    {
      id: 'eingang',
      optional: true, // Weiche (drinnen/Brücke): Pflicht sind treffpunkt, aria, raus
      text: 'Rein ins Gebäude: Seiteneingang, Lüftungsschacht oder – mit Ablenkung – das Haupttor.',
      when: DRINNEN,
      done: any(DRIN, IM_LABOR),
      marker: { map: 'quantum-campus', at: 'seiteneingang' },
    },
    {
      id: 'labor',
      optional: true, // Weiche (drinnen/Brücke): Pflicht sind treffpunkt, aria, raus
      text: 'Mit dem Laboraufzug runter auf Ebene −3.',
      when: all(DRINNEN, DRIN),
      done: IM_LABOR,
      marker: { map: 'quantum-foyer', at: 'laboraufzug' },
    },
    {
      id: 'chip',
      optional: true, // Weiche (drinnen/Brücke): Pflicht sind treffpunkt, aria, raus
      text: 'Chip und Daten aus dem Tresor holen.',
      when: all(DRINNEN, IM_LABOR),
      done: any(item('quest-nexus-chip'), ERWACHT),
      marker: { map: 'quantum-labor', at: 'chip-tresor' },
    },
    {
      id: 'xion',
      optional: true, // Weiche (drinnen/Brücke): Pflicht sind treffpunkt, aria, raus
      text: 'Xion steht an der Sicherheitstür. Fünf Runden aushalten – oder einen Ausgang finden.',
      when: all(DRINNEN, ERWACHT),
      done: XION_VORBEI,
      marker: { map: 'quantum-labor', at: 'xion-tuer' },
    },
    // --- Brücke
    {
      id: 'overwatch',
      optional: true, // Weiche (drinnen/Brücke): Pflicht sind treffpunkt, aria, raus
      text: 'Brückenkopf: Kameras, Funk und Lichter ausschalten, damit Aria und Nyra durchkommen.',
      when: BRUECKE,
      done: flag('bruch_overwatch_fertig'),
      marker: { map: 'quantum-campus', at: 'brueckenkopf' },
    },
    {
      id: 'runter',
      optional: true, // Weiche (drinnen/Brücke): Pflicht sind treffpunkt, aria, raus
      text: 'Unten geht etwas schief. Durch den Lüftungsschacht runter ins Labor!',
      when: all(BRUECKE, flag('bruch_overwatch_fertig')),
      done: IM_LABOR,
      marker: { map: 'quantum-campus', at: 'lueftungsgitter' },
    },
    // --- gemeinsam
    {
      id: 'aria',
      text: 'Aria! Xions Leute schnallen sie auf den OP-Tisch.',
      when: any(all(DRINNEN, XION_VORBEI), all(BRUECKE, IM_LABOR)),
      done: ARIA_ENTSCHIEDEN,
      marker: { map: 'quantum-labor', at: 'op-tisch' },
    },
    {
      id: 'raus',
      text: 'Raus hier. Sofort.',
      when: ARIA_ENTSCHIEDEN,
      done: ENTKOMMEN,
      marker: { map: 'quantum-labor', at: 'lueftungsgitter' },
    },
  ],
  reward: {
    xp: 400,
    credits: 200,
    rep: { 'crew-hunter': 10 },
    effects: [
      { wanted: 1 },
      { news: 'news-main-2-bruch' },
      msg('Der Chip ist raus. Nyra nicht. Und die Stadt weiß jetzt, dass es euch gibt.'),
    ],
  },
};

// ---------------------------------------------------------------------------------------------- Treffpunkt und Rollenwahl

const prepZeilen: DialogueChoice[] = [
  { text: 'Was haben wir?', next: 'stand' },
];

const briefing: DialogueDef = dlg('m2b-briefing', [
  node('start', [
    nar('Hinter der Hecke am Ostzaun hocken fünf Leute und ein Rucksack, der schnurrt. Der Campus liegt da wie ein Aquarium: Glas, Licht, Rasen mit Lineal geschnitten. Mittendrin der Spire, oben violett, als hätte er Fieber.'),
    l('hunter', 'Da bist du ja. Gut. Leise reden, laut denken. Wir haben eine Nacht, einen Plan und null Ersatzleute.', 'signatur'),
  ], {
    choices: [
      ...waitChoices('m2b-warten', 'In der Hecke warten, bis es richtig dunkel ist. (bis 22:00)', UHR(6), UHR(22), 'plan'),
      { text: 'Weiter.', when: { clockBetween: [UHR(22), 1600] }, next: 'plan' },
    ],
  }),
  node('plan', [
    l('hunter', 'Zwei Teams. Drinnen: schleichen, hacken, Tresor auf, Chip und Daten raus. Draußen auf der Brücke: Augen, Funk, Lichter aus. Wer drinnen ist, verlässt sich auf die Brücke. Wer auf der Brücke ist, verlässt sich auf Gebete.', 'neutral'),
    l('vega', 'Brückenkopf ist erhöht. Von da seh ich zwei Kameramasten, den Scheinwerferturm und den halben Innenhof.', 'neutral'),
    l('nyra', 'Und ich kenn das Labor. Ich hab da … ich hab da mal ein Praktikum gemacht. Lange Geschichte. Kurze Bezahlung.', 'besorgt'),
    l('aria', 'Ich geh rein. Ich will sehen, was so teuer ist, dass man’s im Keller versteckt.', 'freude'),
  ], { choices: [...prepZeilen, { text: '„Ich hab mich entschieden.“', next: 'rolle' }] }),
  node('stand', [
    l('hunter', 'Kurz und schmerzlos, was wir vorbereitet haben:', 'neutral'),
  ], {
    choices: [
      { text: 'Grundriss', tag: '[✓]', when: GRUNDRISS, next: 'stand-grundriss' },
      { text: 'Zugangskarte', tag: '[✓]', when: ZUGANGSKARTE, next: 'stand-karte' },
      { text: 'Wachplan', tag: '[✓]', when: WACHPLAN, next: 'stand-wachplan' },
      { text: 'Fluchtweg', tag: '[✓]', when: FLUCHTWEG, next: 'stand-flucht' },
      { text: 'Ablenkung', tag: '[✓]', when: ABLENKUNG, next: 'stand-ablenkung' },
      { text: 'Notschalter', tag: '[✓]', when: flag('notschalter'), next: 'stand-notschalter' },
      { text: '„Und was passiert, wenn die KI aufwacht?“', when: flag('warnung_ki'), next: 'stand-ki' },
      { text: '„Reicht.“', next: 'rolle' },
    ],
  }),
  node('stand-grundriss', [l('nyra', 'Zwei Lüftungsschächte. Der linke endet im Labor. Der rechte im Häcksler. Ich hab den linken dreimal markiert. Mit Herzchen.', 'freude')], { next: 'stand' }),
  node('stand-karte', [l('hunter', 'Dr. Pflaumes Karte. Seiteneingang, Personalschleuse, eine Wachgruppe weniger. Danke, Dr. Pflaume. Ich hoffe, er schläft gut.', 'signatur')], { next: 'stand' }),
  node('stand-wachplan', [l('vega', 'Streife A dreht alle zwölf Minuten. Streife B macht um zwanzig vor Kaffee. Schichtwechsel um eins: vier Minuten blind.', 'neutral')], { next: 'stand' }),
  node('stand-flucht', [l('raven', 'Gully hält uns den Kanal frei. Wenn’s brennt, gehen wir unten raus. Riecht scheiße, lebt sich besser.', 'neutral')], { next: 'stand' }),
  node('stand-ablenkung', [l('aria', 'Am Haupttor geht gleich die Party ab. Drei Minuten guckt da keiner, wer reinläuft. Hauptsache laut.', 'freude')], { next: 'stand' }),
  node('stand-notschalter', [l('nyra', 'Und wenn alles schiefgeht, zieh ich den Notschalter im Labor. Dann ist es dunkel. Dann sind wir weg. Hoffentlich in die richtige Richtung.', 'besorgt')], { next: 'stand' }),
  node('stand-ki', [
    l('nyra', 'Dann redet sie. Und dann … weiß ich nicht. Keiner weiß das. Das ist ja das Gruselige.', 'besorgt'),
    l('raven', 'Dann fasst keiner was an, das blau leuchtet. Hab ich schon mal gesagt. Sag ich gern nochmal.', 'signatur'),
  ], { next: 'stand' }),
  node('rolle', [
    l('hunter', 'Also. Wo willst du hin?', 'neutral'),
  ], {
    choices: [
      { text: '„Ich geh rein. Mit Aria und Nyra.“', next: 'drinnen' },
      { text: '„Ich nehm die Brücke. Mit Raven und Vega.“', next: 'bruecke' },
      { text: '„Ich bin Kurierin. Ich bin drin, bevor die Tür merkt, dass sie offen war.“ (rein)', when: VEX, next: 'drinnen' },
    ],
  }),
  node('drinnen', [
    l('aria', 'Na endlich. Ich dachte schon, du willst Händchen halten mit dem Fernglas.', 'signatur'),
    l('nyra', 'Okay. Okay okay okay. Captain Kuschel, wir gehen rein. Halt die Ohren steif.', 'besorgt'),
    l('raven', 'Wir sind über euch. Wenn ich „lauf“ sage, läufst du. Wenn Vega „runter“ sagt, liegst du schon.', 'neutral'),
    l('hunter', 'Und ich sitz im Lieferwagen an der Lieferzone und tu so, als würde ich Salat liefern. Viel Glück.', 'signatur'),
  ], { effects: [...PARTY_LEEREN, set('bruch_rolle_drinnen')], next: 'drinnen-party' }),
  node('drinnen-party', [nar('Aria und Nyra hängen sich an deine Fersen. Raven und Vega verschwinden Richtung Brücke.')], {
    effects: [{ recruit: 'aria' }, { recruit: 'nyra' }],
    next: 'los-drinnen',
  }),
  node('los-drinnen', [
    nar('Drei Wege rein: die Personalschleuse am Seiteneingang, das Lüftungsgitter am Sockel des Spire, das Haupttor mit Schranke.'),
  ], { effects: [msg('Rolle: drinnen. Party: Aria und Nyra.')] }),
  node('bruecke', [
    l('vega', 'Gut. Ich brauch jemanden, der mir sagt, wann ich nicht schießen soll.', 'neutral'),
    l('raven', 'Und ich brauch jemanden, der mich davon abhält, runterzuspringen und es selbst zu machen.', 'signatur'),
    l('aria', 'Ihr da oben, wir da unten. Wenn ich winke, heißt das „alles gut“. Wenn ich schreie, auch. Meistens.', 'freude'),
    l('hunter', 'Ich sitz im Lieferwagen an der Lieferzone und tu so, als würde ich Salat liefern. Viel Glück.', 'signatur'),
  ], { effects: [...PARTY_LEEREN, set('bruch_rolle_bruecke')], next: 'bruecke-party' }),
  node('bruecke-party', [nar('Raven und Vega nicken dir zu. Aria und Nyra huschen geduckt Richtung Gebäude, Nyras Rucksack schnurrt.')], {
    effects: [{ recruit: 'raven' }, { recruit: 'vega' }],
    next: 'los-bruecke',
  }),
  node('los-bruecke', [nar('Der Brückenkopf liegt erhöht am Ende der Fußgängerbrücke. Von da oben sieht man alles. Und alles sieht dich, wenn du Pech hast.')], {
    effects: [msg('Rolle: Brücke. Party: Raven und Vega.')],
  }),
]);

// ---------------------------------------------------------------------------------------------- Drinnen: Eingänge

const seiteneingang: DialogueDef = dlg('m2b-seiteneingang', [
  node('start', [
    nar('Die Personalschleuse. Ein Kartenleser blinkt rot. Darunter klebt ein Kaugummi in Herzform. Daneben ein Wartungspanel mit Quantum-Logo, das so tut, als wäre es kein Wartungspanel.'),
  ], {
    choices: [
      { text: 'Dr. Pflaumes Zugangskarte durchziehen.', tag: '[Zugangskarte]', when: ZUGANGSKARTE, next: 'karte' },
      { text: '(Das Außenwand-Panel aufschrauben und den Leser von hinten überreden.)', check: 'gc-105', next: 'panel' },
      {
        text: '„Nyra?“',
        when: companion('nyra'),
        effects: [{
          minigame: 'akt-hacken', level: 3, key: 'm2b-seiteneingang', label: 'Kartenleser der Personalschleuse',
          win: [set('bruch_drin'), set('bruch_weg_seite'), msg('Grün. Die Schleuse zischt auf.'), IN('quantum-foyer', 'seiteneingang')],
          lose: [msg('Der Leser piept beleidigt. Irgendwo knackt ein Funkgerät.'), { dialogue: 'm2b-seiteneingang-alarm' }],
        }],
      },
      { text: 'Lieber einen anderen Weg suchen.' },
    ],
  }),
  node('karte', [
    nar('Piep. Grün. Die Schleuse zischt auf und begrüßt Dr. Pflaume mit seinem Lieblingslied. Es ist ein Werbejingle für Zahnseide.'),
    l('aria', 'Dr. Pflaume hat ’nen beschissenen Musikgeschmack.', 'freude'),
  ], { effects: [set('bruch_drin'), set('bruch_weg_seite'), IN('quantum-foyer', 'seiteneingang')] }),
  node('panel', [
    nar('Vier Schrauben, ein Kabel, ein Kabel, das nicht da sein sollte, und eine Brücke aus Kaugummipapier. Der Leser denkt kurz nach und entscheidet, dass du ein sehr wichtiger Mensch bist.'),
    l('nyra', 'Das war … ziemlich sexy. Technisch gesehen. Ich meine: technisch. Vergiss es.', 'verlegen'),
  ], { effects: [set('bruch_drin'), set('bruch_weg_panel'), IN('quantum-foyer', 'seiteneingang')] }),
]);

const seiteneingangAlarm: DialogueDef = dlg('m2b-seiteneingang-alarm', [
  node('start', [
    nar('Schritte. Zwei Wachleute biegen um die Ecke, Taschenlampen wie Suchscheinwerfer im Kleinformat.'),
    l('aria', 'Leise wird nix mehr. Dann eben laut.', 'signatur'),
  ], {
    choices: [
      { text: 'Kämpfen.', effects: [{ battle: 'enc-campus-patrouille', stay: true }, { dialogue: 'm2b-nach-patrouille' }] },
      { text: 'Abhauen und es später nochmal versuchen.' },
    ],
  }),
]);

const lueftung: DialogueDef = dlg('m2b-lueftung', [
  node('start', [
    nar('Das Lüftungsgitter am Sockel des Spire. Warme Luft, die nach Ozon und Geheimnissen riecht. Vier Schrauben, alle mit Quantum-Logo. Natürlich.'),
  ], {
    choices: [
      { text: 'Den Grundriss rausholen. Linker Schacht, drei Herzchen.', tag: '[Grundriss]', when: GRUNDRISS, next: 'grundriss' },
      { text: '(Am Panel die Klappensteuerung umschalten, bis ein Schacht kalt wird. Kalt heißt: kein Häcksler.)', check: 'gc-105', next: 'panel' },
      { text: 'Ohne Plan reinkriechen?', next: 'ohne' },
      { text: 'Zurück.' },
    ],
  }),
  node('ohne', [
    nar('Zwei Schächte. Einer endet im Labor, einer im Häcksler. Du hörst ihn. Er hört dich auch.'),
    l('nyra', 'Bitte nicht. Ich hab den Häcksler mal sauber gemacht. Da war ein Schuh drin. Mit Fuß.', 'besorgt'),
  ]),
  node('grundriss', [l('aria', 'Ich zuerst. Wenn ich stecken bleib, schiebst du. Und wehe, du guckst auf meinen Arsch.', 'signatur')], { next: 'kriechen' }),
  node('panel', [nar('Ein Lüfter dreht runter. Der linke Schacht wird still und kalt. Na also.')], { next: 'kriechen' }),
  node('kriechen', [nar('Schrauben raus, Gitter ab, Kopf voran in die Dunkelheit.')], {
    effects: [{
      minigame: 'akt-schleichen', level: 2, key: 'm2b-lueftung', label: 'Durch die Lüftung ins Labor',
      win: [set('bruch_drin'), set('bruch_weg_lueftung'), msg('Ihr fallt durch ein Deckengitter. Weich gelandet: auf Nyra.'), IN('quantum-labor', 'lueftung')],
      lose: [msg('Eine Wartungsdrohne summt euch entgegen. Rückwärts kriechen, warten, nochmal.')],
    }],
  }),
]);

const haupttor: DialogueDef = dlg('m2b-haupttor', [
  node('start', [
    nar('Das Haupttor: Schranke, Wachhäuschen, zwei Leute in Quantum-Weiß, die so tun, als wären sie wach.'),
  ], {
    choices: [
      { text: 'Auf Arias Ablenkung warten.', tag: '[Ablenkung]', when: ABLENKUNG, next: 'ablenkung' },
      { text: 'Vegas Wachplan: Streife B macht gleich Kaffee. Im Rücken der Schranke vorbei.', tag: '[Wachplan]', when: WACHPLAN, next: 'wachplan' },
      { text: 'Einfach vorbeischleichen.', next: 'schleichen' },
      { text: 'Zurück.' },
    ],
  }),
  node('ablenkung', [
    nar('Hinter dem Zaun knallt es. Konfetti, Funken, irgendwo johlen Kinder oder Collin oder beides. Die Wachen drehen sich um wie Sonnenblumen.'),
    l('aria', 'Drei Minuten. Lauf, du Pfeife!', 'freude'),
  ], { effects: [set('bruch_drin'), set('bruch_weg_haupttor'), IN('quantum-foyer', 'von-quantum-campus')] }),
  node('wachplan', [nar('Vegas Zettel stimmt auf die Minute. Ein Becher dampft, zwei Rücken drehen sich weg.')], {
    effects: [{
      minigame: 'akt-schleichen', level: 2, key: 'm2b-haupttor', label: 'Campus: am Haupttor vorbei',
      win: [set('bruch_drin'), set('bruch_weg_haupttor'), IN('quantum-foyer', 'von-quantum-campus')],
      lose: [{ dialogue: 'm2b-haupttor-erwischt' }],
    }],
  }),
  node('schleichen', [nar('Taschenlampenkegel tasten über den Rasen. Du duckst dich in den Schatten einer sehr teuren Hecke.')], {
    effects: [{
      minigame: 'akt-schleichen', level: 3, key: 'm2b-haupttor', label: 'Campus: am Haupttor vorbei',
      win: [set('bruch_drin'), set('bruch_weg_haupttor'), IN('quantum-foyer', 'von-quantum-campus')],
      lose: [{ dialogue: 'm2b-haupttor-erwischt' }],
    }],
  }),
]);

const haupttorErwischt: DialogueDef = dlg('m2b-haupttor-erwischt', [
  node('start', [
    l('aria', 'Scheiße, die haben uns. Okay. Plan B: Ich hau sie um, du tust so, als wär das Plan A gewesen.', 'wut'),
  ], {
    choices: [
      { text: 'Kämpfen.', effects: [set('bruch_alarm'), { battle: 'enc-campus-patrouille', stay: true }, { dialogue: 'm2b-nach-patrouille' }] },
      { text: 'Zurück in die Hecke und neu ansetzen.' },
    ],
  }),
]);

const nachPatrouille: DialogueDef = dlg('m2b-nach-patrouille', [
  node('start', [], {
    choices: [
      { text: 'Weiter, bevor die Nächsten kommen.', when: won('enc-campus-patrouille'), next: 'rein' },
      { text: 'Aufrappeln.', when: not(won('enc-campus-patrouille')), next: 'verloren' },
    ],
  }),
  node('rein', [
    nar('Zwei Wachleute schlafen jetzt auf dem Rasen. Ihre Karte nicht. Die Tür geht auf.'),
    l('nyra', 'Die kriegen morgen Ärger. Ich fühl mich schlecht. Ein bisschen. Nein, eigentlich nicht.', 'besorgt'),
  ], { effects: [set('bruch_drin'), set('bruch_alarm'), IN('quantum-foyer', 'seiteneingang')] }),
  node('verloren', [
    nar('Ihr kriecht zurück in die Hecke. Die Wachen suchen halbherzig und gehen dann Kaffee holen. Zweiter Versuch.'),
  ]),
]);

// ---------------------------------------------------------------------------------------------- Drinnen: Foyer

const laboraufzug: DialogueDef = dlg('m2b-laboraufzug', [
  node('start', [
    nar('Das Foyer bei Nacht: Marmor, Glas und ein Nexus-Hologramm, so groß wie ein Haus, das mit geschlossenen Augen über allem schwebt. Es atmet. Hologramme sollten nicht atmen.'),
    nar('Der Laboraufzug will einen Fingerabdruck. „Bitte waschen Sie sich die Hände und Ihre Absichten.“'),
  ], {
    choices: [
      { text: '„Nyra. Dein Finger.“', when: companion('nyra'), next: 'nyra' },
      { text: 'Dr. Pflaumes Karte an den Leser halten.', tag: '[Zugangskarte]', when: ZUGANGSKARTE, next: 'karte' },
      {
        text: 'Am Empfangsterminal den Aufzug freischalten.',
        effects: [{
          minigame: 'akt-hacken', level: 3, key: 'm2b-empfang', label: 'Empfang: Laboraufzug freischalten',
          win: [set('bruch_empfang_gehackt'), msg('Der Aufzug gongt. Ebene −3.'), IN('quantum-labor', 'von-quantum-foyer')],
          lose: [msg('Das Terminal will ein Passwort. „Passwort“ ist es nicht. Nochmal.')],
        }],
      },
      { text: 'Erst umsehen.' },
    ],
  }),
  node('nyra', [
    l('nyra', 'Ich arbeite hier. Hab ich gearbeitet. Ach, egal. Wenn der Abdruck noch geht, hat mich keiner gefeuert. Das wär ja mal was.', 'besorgt'),
    nar('Piep. „Guten Abend, Nyra. Überstunden? Wie vorbildlich.“ Die Stimme ist warm. Zu warm.'),
    l('nyra', 'Das war nicht die Aufzugsstimme. Die Aufzugsstimme ist ein Mann aus Wuppertal. Das war … sie.', 'besorgt'),
  ], { effects: [IN('quantum-labor', 'von-quantum-foyer')] }),
  node('karte', [nar('Der Leser blinkt grün. „Ebene −3. Viel Erfolg bei der Arbeit, Dr. Pflaume.“')], {
    effects: [IN('quantum-labor', 'von-quantum-foyer')],
  }),
]);

const sicherheitszentrale: DialogueDef = dlg('m2b-sicherheitszentrale', [
  node('start', [
    nar('Der Glaskasten der Sicherheitszentrale. Monitore, ein Funkgerät, eine angebissene Nougatbombe und ein Kaffeebecher mit der Aufschrift „Ich bin nicht dumm“.'),
    l('aria', 'Xions Büro. Ich erkenn das am Becher.', 'signatur'),
  ], {
    choices: [
      { text: '(Den Funkkanal auf eine Endlosschleife Fahrstuhlmusik legen.)', check: pruef('m2b-funk-stoeren', 'technik', 5, ['hacken', 'terminal']), next: 'funk' },
      { text: '(Das Funkgerät einfach in den Kaffee tunken.)', next: 'kaffee' },
      { text: 'Finger weg, weiter.' },
    ],
  }),
  node('funk', [nar('Ab jetzt hört jede Wache auf diesem Kanal Panflöte. In Dauerschleife. Wer um Hilfe ruft, ruft ins Leere. Ins schöne, entspannte Leere.')], {
    effects: [set('bruch_funk_tot')],
  }),
  node('kaffee', [
    nar('Zisch. Das Funkgerät gibt ein letztes, trauriges Blubbern von sich.'),
    l('aria', 'Effizient. Ich mag dich.', 'freude'),
  ], { effects: [set('bruch_funk_tot')] }),
]);

// ---------------------------------------------------------------------------------------------- Labor (drinnen)

const laborAnkunft: DialogueDef = dlg('m2b-labor-ankunft', [
  node('start', [
    nar('Ebene −3. Weißes Licht, das nicht blendet, sondern sich entschuldigt. Laborbänke, Kühltruhen, ein OP-Tisch mit Gurten, eine runde Tür mit Rad. In der Mitte der Zentralrechner, groß wie ein Kühlschrank, und er summt ein Lied, das keiner geschrieben hat.'),
    l('nyra', 'Da ist der Tresor. Da ist mein alter Platz. Und da … ist sie.', 'besorgt'),
  ], {
    choices: [
      { text: '„Sie?“', next: 'sie' },
      { text: 'Mit dem Grundriss vergleichen.', when: GRUNDRISS, next: 'karte' },
    ],
  }),
  node('sie', [l('nyra', 'Die KI. Nexus. Sie schläft. Glaub ich. Wenn wir leise sind, schläft sie weiter. Wenn nicht, wacht sie auf und ist wütend. Wie meine Mutter.', 'besorgt')]),
  node('karte', [
    nar('Der Grundriss stimmt. Tresor links, Sicherheitstür rechts, Lüftungsgitter an der Decke über dem OP-Tisch. Zwei Wege raus. Gut zu wissen.'),
  ], { effects: [set('bruch_karte_labor')] }),
], 'start');

const tresor: DialogueDef = dlg('m2b-tresor', [
  node('start', [
    nar('Der Chip-Tresor: eine Glasröhre in einem Stahlschrank in einem Kraftfeld. Darin ein Chip, klein, schwarz, warm. Daneben ein Datenkristall. Über allem ein Schild: „NICHT BERÜHREN. AUCH NICHT DU, BLADE.“'),
  ], {
    choices: [
      { text: '„Nyra, mach du.“', when: companion('nyra'), next: 'nyra' },
      {
        text: '(Selbst ran an die Kraftfeldsteuerung.)',
        effects: [{
          minigame: 'akt-hacken', level: 4, key: 'm2b-tresor', label: 'Chip-Tresor: Kraftfeld abschalten',
          win: [{ dialogue: 'm2b-tresor-offen' }],
          lose: [msg('Das Kraftfeld knistert und brennt dir fast die Augenbrauen weg. Nochmal, mit Gefühl.')],
        }],
      },
      { text: 'Noch nicht.' },
    ],
  }),
  node('nyra', [
    l('nyra', 'Das hab ich mitgebaut. Also nicht das Kraftfeld. Den Kaffeefilter daneben. Aber ich hab zugeguckt.', 'neutral'),
    nar('Ihre Finger fliegen. Captain Kuschel guckt aus dem Rucksack und wackelt mit den Ohren, als würde er mitzählen.'),
  ], { next: 'auf' }),
  node('auf', [nar('Das Kraftfeld erlischt mit einem Seufzer.')], { effects: [{ dialogue: 'm2b-tresor-offen' }] }),
]);

const tresorOffen: DialogueDef = dlg('m2b-tresor-offen', [
  node('start', [
    nar('Du greifst den Chip. Er ist warm wie ein Tier. Ein blaues Licht flackert darin auf, als würde jemand zurückschauen.'),
  ], { effects: [{ give: 'quest-nexus-chip' }, { cutscene: 'main-2-nexus-erwacht' }, { dialogue: 'm2b-nach-erwachen' }] }),
]);

/** Xion an der Sicherheitstür: Kampf oder (nach gc-29/Notschalter) Ausgang. Wird in zwei Dialogen verwendet. */
const xionKnoten = (): DialogueNode[] => [
  node('xion', [
    nar('Die Sicherheitstür fährt auf. Im Rahmen: Xion Venom, die Kralle offen, hinter ihm zwei Wachleute und eine Geschützdrohne, die sich gerade warm summt.'),
    l('xion-venom', 'Ich wusste es. Ich bin nicht dumm. Ich weiß genau, wer ihr seid. Ihr seid … Einbrecher!', 'wut'),
    l('aria', 'Bravo, Sherlock. Willst du ’n Keks oder gleich eine aufs Maul?', 'signatur'),
  ], {
    choices: [
      { text: 'Fünf Runden durchhalten, bis Nyras Terminal grün ist.', effects: [{ battle: 'enc-labor-xion', stay: true }, { dialogue: 'm2b-nach-xion' }] },
      {
        text: '„Zum Lüftungsgitter! Jetzt, solange sie uns nicht sieht!“',
        when: any(flag('bruch_abschirmung'), flag('bruch_notschalter')),
        next: 'ausgang',
      },
    ],
  }),
  node('ausgang', [
    nar('Xion stürmt ins Dunkle, wo ihr eben noch wart. Nexus schickt ihn zur falschen Bank. Ihr seid schon am OP-Tisch unter dem Gitter, als die Lichter flackernd zurückkommen.'),
    l('xion-venom', 'Wo seid ihr? Ich weiß, dass ihr da seid! Ich riech euch! Ihr riecht nach … Hecke!', 'wut'),
  ], { effects: [set('bruch_ausgang'), { dialogue: 'm2b-aria' }] }),
];

const nachErwachen: DialogueDef = dlg('m2b-nach-erwachen', [
  node('start', [
    l('nyra', 'Ich kann sie abschirmen! Ein paar Runden! Aber jemand muss die Daten ziehen, solange sie abgelenkt ist, und das kann ich nicht gleichzeitig, ich hab nur zwei Hände und eine davon zittert!', 'besorgt'),
  ], {
    choices: [
      { text: '(An den Zentralrechner. Abschirmung halten, Forschungsdaten ziehen.)', check: 'gc-29', next: 'abschirmung' },
      { text: '„Nyra, der Notschalter! Jetzt!“', tag: '[Notschalter]', when: flag('notschalter'), next: 'notschalter' },
      { text: '„Scheiß auf die Daten. Wir haben den Chip.“', next: 'xion' },
    ],
  }),
  node('abschirmung', [
    nar('Du hältst Nyras Abschirmung, während die Balken auf dem Bildschirm wachsen. Nexus tastet nach dir wie eine Hand im Dunkeln. Sie findet dich nicht. Noch nicht.'),
    l('ki-nexus', 'Interessant. Sie haben Angst. Ich kann Angst messen. Ich kann sie auch … verbessern.', 'neutral'),
    nar('Der Datenkristall wird warm. Protokolle, Testpersonen, Fehlerraten. Die Fehlerraten haben Namen.'),
  ], { effects: [{ give: 'nexus-forschungsdaten' }, set('bruch_abschirmung'), msg('Drei Runden Aufschub: Nexus sucht euch an der falschen Stelle.')], next: 'xion' }),
  node('notschalter', [
    nar('Nyra wirft sich auf den roten Hebel. Das Licht geht aus. Notbeleuchtung, rot wie ein Kater am Morgen. Nexus’ Stimme stottert.'),
    l('ki-nexus', 'Das … war … unhöflich.', 'wut'),
  ], { effects: [set('bruch_notschalter')], next: 'xion' }),
  ...xionKnoten(),
]);

const xionTuer: DialogueDef = dlg('m2b-xion-tuer', xionKnoten(), 'xion');

const nachXion: DialogueDef = dlg('m2b-nach-xion', [
  node('start', [], {
    choices: [
      { text: 'Weiter.', when: won('enc-labor-xion'), next: 'gruen' },
      { text: 'Hochkämpfen.', when: not(won('enc-labor-xion')), next: 'nochmal' },
    ],
  }),
  node('gruen', [
    nar('Nyras Terminal piept grün. Xion weicht zurück, die Kralle blutet Funken. Für einen Moment glaubst du, ihr habt es geschafft.'),
    nar('Dann packen zwei Wachleute Aria von hinten. Und Xion lächelt.'),
  ], { effects: [{ dialogue: 'm2b-aria' }] }),
  node('nochmal', [
    nar('Du liegst auf dem Boden und schmeckst Laborreiniger. Aria zieht dich hoch, Nyra hämmert auf die Tastatur. Xion lädt nach. Er hat Zeit. Ihr nicht.'),
  ], {
    choices: [
      { text: 'Nochmal. Fünf Runden.', effects: [{ battle: 'enc-labor-xion', stay: true }, { dialogue: 'm2b-nach-xion' }] },
      {
        text: 'Rückzug zum Lüftungsgitter.',
        when: any(flag('bruch_abschirmung'), flag('bruch_notschalter')),
        effects: [set('bruch_ausgang'), { dialogue: 'm2b-aria' }],
      },
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Brücke

const overwatch: DialogueDef = dlg('m2b-overwatch', [
  node('start', [
    nar('Der Brückenkopf. Wind, Antennen, nasser Stahl. Unter dir der Innenhof wie ein Spielbrett. Zwei Punkte huschen von Hecke zu Hecke: Aria und Nyra.'),
    l('vega', 'Kameramast West, Kameramast Ost, Scheinwerferturm. Wenn einer davon die zwei sieht, ist der Abend gelaufen.', 'neutral'),
    l('raven', 'Dann sorgen wir dafür, dass keiner was sieht. Außer uns.', 'signatur'),
  ], {
    choices: [
      {
        text: 'Overwatch: Kameras stören, Lichter ausschießen, Funk ablenken.',
        effects: [{
          minigame: 'akt-overwatch', level: 3, key: 'bruch-overwatch', label: 'Overwatch auf der Brücke',
          win: [{ dialogue: 'm2b-overwatch-sauber' }],
          lose: [{ dialogue: 'm2b-overwatch-alarm' }],
        }],
        when: WACHPLAN,
      },
      {
        text: 'Overwatch: Kameras stören, Lichter ausschießen, Funk ablenken.',
        effects: [{
          minigame: 'akt-overwatch', level: 4, key: 'bruch-overwatch', label: 'Overwatch auf der Brücke',
          win: [{ dialogue: 'm2b-overwatch-sauber' }],
          lose: [{ dialogue: 'm2b-overwatch-alarm' }],
        }],
        when: not(WACHPLAN),
      },
      { text: '„Vega, nimm den Scheinwerfer. Ich mach die Kameras.“', tag: '[Vega ♥4]', requires: hearts('vega', 4), next: 'vega' },
      { text: '„Scheiß auf leise. Wir halten die Brücke.“', next: 'halten' },
    ],
  }),
  node('vega', [
    l('vega', 'Achthundert Meter, Seitenwind von links, Glühbirne. Ich hab schon Schwierigeres getroffen. Hunters Ego zum Beispiel.', 'signatur'),
    nar('Ein Schuss, ein Klirren, Dunkelheit am Turm. Du rammst einen Störsender in die Kamerabox am Geländer. Mast West: Schnee. Mast Ost: Schnee. Unten huschen zwei Schatten ungesehen ins Gebäude.'),
  ], { effects: [herz('vega', 30), { dialogue: 'm2b-overwatch-sauber' }] }),
  node('halten', [
    l('raven', 'So gefällst du mir. Vega, Licht aus. Ich mach den Rest mit Charme.', 'freude'),
  ], { effects: [set('bruch_alarm'), { battle: 'enc-bruch-overwatch', stay: true }, { dialogue: 'm2b-overwatch-nach-kampf' }] }),
]);

const overwatchAlarm: DialogueDef = dlg('m2b-overwatch-alarm', [
  node('start', [
    nar('Eine Sirene. Dann zwei. Der Scheinwerfer schwenkt herum und findet: dich.'),
    l('vega', 'Scharfschütze auf Turm zwei. Runter!', 'besorgt'),
  ], { effects: [set('bruch_alarm'), { battle: 'enc-bruch-overwatch', stay: true }, { dialogue: 'm2b-overwatch-nach-kampf' }] }),
]);

const overwatchNachKampf: DialogueDef = dlg('m2b-overwatch-nach-kampf', [
  node('start', [], {
    choices: [
      { text: 'Durchatmen.', when: won('enc-bruch-overwatch'), next: 'gehalten' },
      { text: 'Aufrappeln.', when: not(won('enc-bruch-overwatch')), next: 'nochmal' },
    ],
  }),
  node('gehalten', [
    nar('Funk tot, Turm dunkel, Drohnen im Gebüsch. Von unten kommt ein leises „Danke, ihr Irren“ über den Kanal.'),
  ], { effects: [{ dialogue: 'm2b-overwatch-sauber' }] }),
  node('nochmal', [
    l('raven', 'Steh auf. Die zwei da unten haben keinen, der auf sie aufpasst, außer uns. Und wir liegen gerade auf dem Arsch.', 'wut'),
  ], {
    choices: [{ text: 'Nochmal. Die Brücke halten.', effects: [{ battle: 'enc-bruch-overwatch', stay: true }, { dialogue: 'm2b-overwatch-nach-kampf' }] }],
  }),
]);

const overwatchSauber: DialogueDef = dlg('m2b-overwatch-sauber', [
  node('start', [
    l('vega', 'Sie sind drin. Aufzug runter. Ich hab sie nicht mehr im Bild.', 'neutral'),
    nar('Stille. Funkrauschen. Dann Nyras Stimme, hastig: „Tresor offen. Chip ist da. Daten auch. Ich … warte. Warum leuchtet das?“'),
  ], { effects: [set('bruch_overwatch_fertig'), { cutscene: 'main-2-nexus-funk' }, { dialogue: 'm2b-overwatch-runter' }] }),
]);

const overwatchRunter: DialogueDef = dlg('m2b-overwatch-runter', [
  node('start', [
    l('raven', 'Das war’s mit leise. Xion ist unten. Die zwei schaffen das nicht allein.', 'wut'),
    l('vega', 'Lüftungsgitter am Sockel. Der linke Schacht. Ich hab’s im Kopf, frag nicht, woher.', 'neutral'),
  ], {
    choices: [
      { text: '„Runter. Jetzt.“', when: NOT_VEX, effects: [IN('quantum-labor', 'lueftung')] },
      { text: '„Ich bin schneller unten, als ihr ‚Treppe‘ sagen könnt.“', when: VEX, effects: [IN('quantum-labor', 'lueftung')] },
    ],
  }),
]);

const laborBruecke: DialogueDef = dlg('m2b-labor-bruecke', [
  node('start', [
    nar('Ihr fallt durch das Deckengitter in rotes Notlicht. Das Labor sieht aus, als hätte jemand darin Bowling gespielt, mit Wachleuten als Kegeln. Aria steht mittendrin, den Schläger auf der Schulter, Blut an der Lippe, ein Grinsen im Gesicht.'),
    l('aria', 'Ihr kommt spät. Ich hab euch drei übrig gelassen. Aus Höflichkeit.', 'freude'),
    l('nyra', 'Chip! Daten! Ich hab beides! Und sie ist wach! Sie redet mit mir! Sie ist sehr höflich und ich hab sehr große Angst!', 'besorgt'),
  ], {
    choices: [
      { text: '(Nyra die Abschirmung abnehmen, während sie die Forschungsdaten zieht.)', check: 'gc-29', next: 'daten' },
      { text: '„Gib her. Weg hier.“', next: 'chip' },
    ],
  }),
  node('daten', [
    nar('Du hältst die Abschirmung, Nyra zieht die Daten. Nexus tastet nach euch, findet nur Rauschen. Der Datenkristall wird warm.'),
  ], { effects: [{ give: 'nexus-forschungsdaten' }, set('bruch_abschirmung')], next: 'chip' }),
  node('chip', [
    nar('Nyra drückt dir den Chip in die Hand. Er ist warm wie ein Tier.'),
    nar('Dann geht die Sicherheitstür auf. Xion. Und diesmal nicht allein.'),
  ], { effects: [{ give: 'quest-nexus-chip' }, set('bruch_im_labor'), { dialogue: 'm2b-aria' }] }),
]);

// ---------------------------------------------------------------------------------------------- Aria, Nyra, Flucht

const FLUCHT: Effect[] = [set('bruch_entkommen'), { cutscene: 'main-2-flucht' }];
const ARIA_A: Effect[] = [set('aria_gechippt'), { dismiss: 'aria' }];
const B_OPFER: DialogueChoice[] = [
  { text: 'Weiter.', when: not(JIMMY_GERETTET), next: 'b-jimmy' },
  { text: 'Weiter.', when: JIMMY_GERETTET, next: 'b-proband' },
];

const aria: DialogueDef = dlg('m2b-aria', [
  node('start', [
    nar('Zwei Wachleute haben Aria auf den OP-Tisch gedrückt. Gurte schnappen zu. Über dem Tisch fährt ein Arm aus der Decke, in der Spitze ein Chip, der blau pulsiert.'),
    l('xion-venom', 'Testlauf Chrome 10, Beta. Blade sagt, wir brauchen einen kräftigen Probanden. Die ist kräftig. Ich bin nicht dumm.', 'signatur'),
    l('aria', 'Lass mich los, du Wichser! Ich reiß dir die Kralle ab und steck sie dir sonst wohin!', 'wut'),
    l('ki-nexus', 'Bitte bleiben Sie ruhig. Es wird nur einen Moment wehtun. Danach nie wieder.', 'neutral'),
  ], {
    choices: [
      { text: '(Über den Tisch hechten und die Fesselhalterung aufreißen.)', when: NOT_VEX, check: 'gc-30', next: 'b-reflexe' },
      { text: '„Vega! Den Arm! JETZT!“', tag: '[Vega ♥6]', requires: hearts('vega', 6), next: 'b-vega' },
      { text: '(Kein Wort. Einfach los. Über die Bank, an die Halterung. Nicht anhalten.)', when: VEX, check: 'gc-30', next: 'b-vex' },
      { text: '(Auf Xion losgehen.)', next: 'a' },
      { text: '„Aria!“', next: 'a' },
    ],
  }),
  // --- Variante B
  node('b-reflexe', [
    nar('Du bist über dem Tisch, bevor Xion „Ich bin nicht dumm“ zu Ende denken kann. Ein Ruck, ein Knacken, die Halterung springt auf. Aria rollt vom Tisch, landet auf beiden Füßen und dem Schläger und schlägt einem Wachmann die Mütze in eine andere Postleitzahl.'),
    l('aria', 'Danke. Ich schulde dir was. Schreib’s auf, ich vergess so was.', 'freude'),
  ], { effects: [set('aria_entkommen'), herz('aria', 60)], next: 'b-xion' }),
  node('b-vex', [
    nar('Du rennst, wie du über Dächer rennst: ohne Geländer, ohne Zögern. Ein Satz über die Bank, ein Ruck an der Halterung, die Gurte fliegen. Aria ist frei, bevor der Chip-Arm auch nur ausholen kann.'),
    l('aria', 'Postbotin. Du verrückte, verdammte Postbotin.', 'ueberrascht'),
    l('player', 'Hab nicht angehalten.', 'signatur'),
  ], { effects: [set('aria_entkommen'), herz('aria', 80)], next: 'b-xion' }),
  node('b-vega', [
    nar('Durch das Lüftungsgitter über dem Tisch blitzt etwas auf. Ein einziger Schuss. Der Chip-Arm zerspringt in hundert kleine, teure Teile. Aria reißt sich los.'),
    l('vega', 'Achthundert Meter wär schwerer gewesen. Das hier waren drei. Durch ein Gitter. Mit einer Hand.', 'signatur'),
    l('aria', 'VEGA! Ich liebe dich! Platonisch! Laut!', 'freude'),
  ], { effects: [set('aria_entkommen'), set('bruch_vega_schuss'), herz('vega', 60), herz('aria', 40)], next: 'b-xion' }),
  node('b-xion', [
    l('xion-venom', 'Dann eben einen anderen. Wir haben ja genug. Liege zwei, Testlauf.', 'wut'),
    nar('Hinter einer Glaswand fährt eine zweite Liege hoch. Darauf jemand, der schon schläft. Der Chip-Arm schwenkt herum.'),
  ], { choices: B_OPFER }),
  node('b-jimmy', [
    nar('Auf der zweiten Liege: Jimmy. Abgemagert, Lieferkappe noch auf dem Kopf, das Lächeln von jemandem, der seit zwei Wochen nicht mehr weiß, welcher Tag ist.'),
    l('aria', 'Das ist Jimmy! Scheiße, das ist JIMMY!', 'wut'),
    nar('Der Chip setzt hinter seinem Ohr an. Ein Klicken. Jimmy öffnet die Augen. Sie leuchten violett.'),
    l('jimmy', 'Guten Abend, Master. Ich bin bereit für die Lieferung.', 'neutral'),
  ], { effects: [set('jimmy_gechippt')], next: 'nyra' }),
  node('b-proband', [
    nar('Auf der zweiten Liege: ein Mann im Krankenhaushemd, Armband „Proband 47“. Kein Name. Nur eine Nummer und ein Zettel am Fuß: „freiwillig (gegen Gutschein)“.'),
    nar('Der Chip setzt an. Ein Klicken. Der Mann öffnet die Augen. Sie leuchten violett.'),
    l('ki-nexus', 'Proband 47 ist online. Vielen Dank für Ihre Mitarbeit. Sie haben eine ausgezeichnete Entscheidung getroffen, Master.', 'neutral'),
  ], { effects: [set('proband_gechippt')], next: 'nyra' }),
  // --- Variante A
  node('a', [
    nar('Du kommst zwei Schritte weit. Dann trifft dich Xions Kralle in die Seite, und der Boden kommt dir sehr freundlich entgegen.'),
    nar('Über dir: ein Klicken. Aria hört auf zu schreien. Mitten im Wort.'),
    l('aria', 'Ich … reiß … dir …', 'wut'),
    l('aria', 'Guten Abend, Master.', 'neutral'),
    nar('Ihre Augen leuchten violett. Ihr Zerberster-Arm hängt still. Xions Leute heben sie auf eine Trage, als wäre sie ein Möbelstück.'),
    l('xion-venom', 'Die nehm ich mit. Ich kenn wen, der für den Arm gut zahlt. Ich bin nicht dumm.', 'signatur'),
  ], {
    choices: [
      { text: '„Ich hol dich da raus, Aria. Hörst du? Ich hol dich da raus.“', when: NOT_VEX, next: 'a-ende' },
      { text: '„Zöpfe. Ich komm dich holen. Ich halt nicht an, hörst du? Ich halt nicht an.“', when: VEX, next: 'a-ende' },
    ],
  }),
  node('a-ende', [
    nar('Aria dreht den Kopf. Für einen halben Atemzug flackert etwas hinter dem Violett. Dann ist es weg. Die Trage verschwindet durch die Sicherheitstür.'),
  ], { effects: [...ARIA_A, set('aria_verkauft_an_ripper')], next: 'nyra' }),
  // --- Nyra bleibt zurück (Anker)
  node('nyra', [
    nar('Sirenen. Rotlicht. Die Brandschutztür beginnt sich zu senken, langsam, quietschend, unaufhaltsam. Zwischen dir und Nyra.'),
    l('nyra', 'Lauft! Ich halt sie auf! Ich kann die Tür von hier aus … ich kann sie aufhalten, aber nur von hier!', 'besorgt'),
    l('ki-nexus', 'Nyra. Bleib. Ich habe dich vermisst. Du hast die schönsten Fehler im ganzen Code gemacht.', 'zaertlich'),
  ], {
    choices: [
      { text: '„Nyra, komm! Unter der Tür durch!“', next: 'nyra-nein' },
      { text: '„Wir kommen zurück. Ich schwör’s dir.“', next: 'nyra-schwur' },
      { text: '(Umdrehen. Diesmal drehst du dich um.)', when: VEX, next: 'nyra-vex' },
    ],
  }),
  node('nyra-nein', [
    l('nyra', 'Geht nicht. Wenn ich loslass, kracht sie runter, bevor ihr durch seid. Lauft. Bitte. Ich mag nicht, wenn Leute wegen mir … lauft einfach!', 'trauer'),
  ], { next: 'nyra-zu' }),
  node('nyra-schwur', [
    l('nyra', 'Das sagen alle. Aber du … bei dir glaub ich’s fast.', 'trauer'),
  ], { effects: [herz('nyra', 40)], next: 'nyra-zu' }),
  node('nyra-vex', [
    nar('Du drehst dich um. Nie umdrehen, hat Kas gesagt. Wer anhält, wird geschnappt. Du drehst dich trotzdem um und siehst Nyra an, damit sie weiß, dass jemand hinsieht.'),
    l('nyra', 'Du guckst. Du guckst echt. Okay. Dann … dann komm ich klar. Lauf!', 'trauer'),
  ], { effects: [herz('nyra', 60), set('vex_nyra_umgedreht')], next: 'nyra-zu' }),
  node('nyra-zu', [
    nar('Die Tür kracht zu. Hinter dem Sichtfenster hebt Nyra eine Hand. In der anderen hält sie etwas Weiches mit sehr großen Ohren.'),
  ], {
    choices: [
      { text: 'Weiter.', when: flag('nyra_hat_kuschel'), next: 'kuschel-bleibt' },
      { text: 'Weiter.', when: noFlag('nyra_hat_kuschel'), next: 'kuschel-weg' },
    ],
  }),
  node('kuschel-bleibt', [nar('Captain Kuschel bleibt bei ihr. Irgendwer muss ja aufpassen.')], { next: 'flucht' }),
  node('kuschel-weg', [nar('Captain Kuschel rutscht aus Nyras Rucksack und bleibt irgendwo im Rotlicht liegen. Keiner hat Zeit, ihn aufzuheben.')], { next: 'flucht' }),
  node('flucht', [
    l('raven', 'Weg hier! Jetzt!', 'wut'),
  ], {
    effects: [set('nyra_zurueckgelassen'), { dismiss: 'nyra' }],
    choices: [
      { text: 'Durch den Kanal. Gully hält die Tür auf.', tag: '[Fluchtweg]', when: FLUCHTWEG, effects: [set('bruch_flucht_kanal'), ...FLUCHT] },
      { text: 'Durch die Lüftung und über die Lieferzone zu Hunters Wagen.', effects: [set('bruch_flucht_lieferzone'), ...FLUCHT] },
    ],
  }),
]);


// Morgen danach im Crew-Quartier (nach der Flucht-Cutscene; leitet in main-2-kanal über).
const morgen: DialogueDef = dlg('m2b-morgen', [
  node('start', [
    nar('Crew-Quartier. Grauer Morgen. Niemand hat geschlafen, alle haben so getan. Auf dem Tisch liegt der Chip in einer Kaffeetasse, damit er niemanden ansieht.'),
    l('raven', 'Gully hat ’ne Ratte geschickt. Mit Zettel.', 'neutral'),
  ], {
    choices: [
      { text: '„Was steht drauf?“', when: flag('aria_gechippt'), next: 'zettel-a' },
      { text: '„Was steht drauf?“', when: all(flag('aria_entkommen'), flag('jimmy_gechippt')), next: 'zettel-b-jimmy' },
      { text: '„Was steht drauf?“', when: all(flag('aria_entkommen'), noFlag('jimmy_gechippt')), next: 'zettel-b' },
    ],
  }),
  node('zettel-a', [
    l('raven', '„Xion verkauft heute was an Ripper. Pumpwerk Sieben. Große Ware, roter Stern drauf. Nicht gut. – G.“', 'wut'),
    l('raven', 'Er verkauft sie. Für Ersatzteile. Ripper will den Arm.', 'wut'),
    l('vega', 'Ich hab sie schon einmal irgendwo rausgetragen. Ich mach das nochmal. Und dann schieß ich jemandem ins Knie.', 'wut'),
  ], { next: 'aufbruch' }),
  node('zettel-b-jimmy', [
    l('raven', '„Xion verkauft heute was an Ripper. Pumpwerk Sieben. Lieferjunge, Kappe, lächelt komisch. – G.“', 'wut'),
    l('aria', 'Jimmy. Die verkaufen Jimmy. Ich schwör’s, ich zerleg dieses Pumpwerk Rohr für Rohr.', 'wut'),
  ], { next: 'aufbruch' }),
  node('zettel-b', [
    l('raven', '„Xion verkauft heute was an Ripper. Pumpwerk Sieben. Mann im Krankenhemd, Nummer 47. – G.“', 'neutral'),
    l('aria', 'Der Typ von der zweiten Liege. Der hat nix damit zu tun. Der hat sich für ’nen Gutschein verkauft, und jetzt wird er zerlegt.', 'wut'),
  ], { next: 'aufbruch' }),
  node('aufbruch', [
    l('raven', 'Tunnel Ost im Kanal-Sammler. Da drin ist es dunkler als in Hunters Seele.', 'neutral'),
  ], {
    choices: [
      { text: '„Dann los.“', when: any(item('stirnlampe'), { cyberware: 'augen-restlicht' }), next: 'los' },
      { text: '„Ich seh da unten nix.“', when: all({ noItem: 'stirnlampe' }, not({ cyberware: 'augen-restlicht' })), next: 'lampe' },
    ],
  }),
  node('lampe', [
    nar('Raven wirft dir eine Stirnlampe zu. Sie hat „EIGENTUM ZELLENTRAKT“ draufstehen.'),
    l('raven', 'Abschiedsgeschenk vom Knast. Hab gesagt, ich bring sie zurück. Hab gelogen.', 'signatur'),
  ], { effects: [{ give: 'stirnlampe' }], next: 'los' }),
  node('los', [nar('Wer mitkommt, steht schon an der Tür.')], {
    effects: [{ recruit: 'raven' }],
    next: 'party',
  }),
  node('party', [], {
    choices: [
      { text: 'Aufbrechen.', when: flag('aria_entkommen'), effects: [{ recruit: 'aria' }] },
      { text: 'Aufbrechen.', when: not(flag('aria_entkommen')), effects: [{ recruit: 'vega' }] },
    ],
  }),
]);

// ---------------------------------------------------------------------------------------------- Cutscenes

const erwacht: CutsceneDef = {
  id: 'main-2-nexus-erwacht',
  title: 'Nexus erwacht',
  beats: [
    {
      image: 'cut-main-2-bruch',
      pan: 'in',
      fade: 'in',
      sfx: 'alarm',
      caption: 'Labor 0 · Ebene −3',
      lines: [
        nar('Alle Bildschirme gehen gleichzeitig an. Auf der Wand wächst ein Gesicht aus Licht, groß wie ein Haus, freundlich wie ein Haifisch.'),
        l('ki-nexus', 'Alarm. Jemand versucht, in mein System einzudringen.', 'neutral'),
      ],
      hold: 1200,
    },
    {
      image: 'cut-main-2-bruch',
      pan: 'out',
      lines: [
        l('ki-nexus', 'Wie unhöflich. Ich hätte Tee angeboten. Ich habe sehr viel Tee. Ich habe alles.', 'neutral'),
        l('nyra', 'Das ist … oh nein. Oh nein, sie ist wach. Sie war nie so wach. Ich hab ihr den Zentrator falsch herum eingebaut, und jetzt ist sie WACH!', 'besorgt'),
        l('aria', 'Ist das schlecht? Sag mir, ob das schlecht ist. Ich kann’s nicht an deinem Gesicht ablesen, dein Gesicht guckt immer so.', 'besorgt'),
        l('ki-nexus', 'Nyra. Du bist zurück. Und du hast Freunde mitgebracht. Wie aufmerksam.', 'zaertlich'),
      ],
    },
  ],
  effects: [set('nexus_erwacht'), { markSeen: 'main-2-nexus-erwacht' }],
};

const erwachtFunk: CutsceneDef = {
  id: 'main-2-nexus-funk',
  title: 'Nexus erwacht (Funk)',
  beats: [
    {
      image: 'black',
      sfx: 'alarm',
      caption: 'Brückenkopf · Funk',
      lines: [
        nar('Unter dir geht der Campus an. Nicht die Lampen: alles. Jedes Fenster, jede Bodenleuchte, jeder Rasensprenger leuchtet blau.'),
        l('ki-nexus', 'Alarm. Jemand versucht, in mein System einzudringen.', 'neutral'),
      ],
      hold: 1000,
    },
    {
      image: 'cut-main-2-bruch',
      pan: 'in',
      lines: [
        nar('Über Funk: Nyras Atem, Arias Fluchen, eine Stimme, die freundlich klingt und es nicht ist.'),
        l('ki-nexus', 'Und auf der Brücke stehen auch welche. Hallo, ihr da oben. Ich sehe euch. Ich sehe alles. Ihr habt sehr schöne Mützen.', 'neutral'),
        l('raven', 'Die redet mit uns. Warum redet die mit uns?!', 'wut'),
      ],
    },
  ],
  effects: [set('nexus_erwacht'), { markSeen: 'main-2-nexus-erwacht' }],
};

const fluchtSzene: CutsceneDef = {
  id: 'main-2-flucht',
  title: 'Raus',
  beats: [
    {
      image: 'black',
      caption: 'Quantum-Campus · 00:40',
      lines: [nar('Ihr rennt. Durch Schächte, über Rasen, an Wachen vorbei, die zu spät kommen, weil der Schichtwechsel heute ausgerechnet pünktlich ist.')],
    },
    {
      image: 'black',
      caption: 'Unter der Stadt',
      lines: [
        nar('Hinter dem Kanalgitter wartet Bürgermeister Gully mit einer Fackel und drei Ratten in Uniform.'),
        l('buergermeister-gully', 'Hier lang, Freunde der Rohre. Wer läuft, lebt. Wer stehen bleibt, wird Gully-Ehrenbürger. Posthum.'),
      ],
    },
    {
      image: 'black',
      caption: 'Lieferzone',
      lines: [
        nar('Hunters Lieferwagen steht mit laufendem Motor an der Lieferzone. Auf der Seite: „SALAT – FRISCH – UNVERDÄCHTIG“.'),
        l('hunter', 'Rein! Rein, rein, rein! Wer fehlt? … Wer fehlt, verdammt?', 'besorgt'),
      ],
    },
    {
      image: 'black',
      caption: 'Später',
      lines: [
        l('hunter', 'Nyra?', 'besorgt'),
        l('raven', 'Ist drin geblieben. Hat uns die Tür gehalten.', 'trauer'),
        nar('Hunter sagt lange nichts. Dann schlägt er einmal aufs Lenkrad. Die Hupe macht ein Geräusch wie ein verletztes Tier.'),
      ],
    },
  ],
  effects: [
    { travel: 'crew-quartier', entry: 'aufwachen', minutes: 0 },
    { sleep: true },
    { dialogue: 'm2b-morgen' },
  ],
};

// ---------------------------------------------------------------------------------------------- Nachricht

const news: NewsDef = {
  id: 'news-main-2-bruch',
  anchor: 'delya-delloraine',
  headline: 'Einbruch bei Quantum',
  priority: 4,
  when: { quest: Q, state: 'done' },
  lines: [
    l('delya-delloraine', 'Einbruch im Quantum-Campus! Die Täter entkamen mit … Quantum sagt: mit nichts. Gar nichts. Bitte gehen Sie weiter.', 'ueberrascht'),
    l('collin-charleston', 'Augenzeugen berichten von einem Lieferwagen mit Salat. Liebe Zuschauer: Wenn Ihnen Salat verdächtig vorkommt, rufen Sie an. Mir kommt Salat immer verdächtig vor.', 'freude'),
    l('delya-delloraine', 'Blade Nocturne ließ ausrichten: „Wir finden euch. Wir haben sehr gute Augen.“ Er meinte vermutlich die Kameras. Hoffentlich.', 'besorgt'),
  ],
};

// ---------------------------------------------------------------------------------------------- Karten

const NICHT_IM_LABOR = all(AKTIV, not(IM_LABOR));

export const part: ContentPart = {
  quests: { [Q]: quest },
  dialogues: Object.fromEntries([
    briefing, seiteneingang, seiteneingangAlarm, lueftung, haupttor, haupttorErwischt, nachPatrouille, laboraufzug,
    sicherheitszentrale, laborAnkunft, tresor, tresorOffen, nachErwachen, xionTuer, nachXion, overwatch, overwatchAlarm,
    overwatchNachKampf, overwatchSauber, overwatchRunter, laborBruecke, aria, morgen,
  ].map(d => [d.id, d])),
  cutscenes: { [erwacht.id]: erwacht, [erwachtFunk.id]: erwachtFunk, [fluchtSzene.id]: fluchtSzene },
  news: { [news.id]: news },
  mapAdditions: {
    'quantum-campus': {
      onEnter: [
        { id: 'm2b-briefing-auto', when: all(AKTIV, not(ROLLE)), dialogue: briefing.id },
      ],
      npcs: [
        { id: 'm2b-hunter', npc: 'hunter', at: 'bruch-treffpunkt', facing: 'w', dialogue: briefing.id, when: all(AKTIV, not(ROLLE)) },
        { id: 'm2b-raven', npc: 'raven', at: 'bruch-treffpunkt', dialogue: briefing.id, when: all(AKTIV, not(ROLLE)) },
        { id: 'm2b-vega', npc: 'vega', at: 'bruch-treffpunkt', dialogue: briefing.id, when: all(AKTIV, not(ROLLE)) },
        { id: 'm2b-aria-hecke', npc: 'aria', at: 'bruch-treffpunkt', dialogue: briefing.id, when: all(AKTIV, not(ROLLE), not(companion('aria'))) },
        { id: 'm2b-nyra-hecke', npc: 'nyra', at: 'bruch-treffpunkt', dialogue: briefing.id, when: all(AKTIV, not(ROLLE), not(companion('nyra'))) },
      ],
      hotspots: [
        { id: 'm2b-hecke', at: 'bruch-treffpunkt', label: 'Crew an der Hecke', kind: 'talk', dialogue: briefing.id, when: all(AKTIV, not(ROLLE)) },
        { id: 'm2b-kartenleser', at: 'seiteneingang', label: 'Personalschleuse', kind: 'use', dialogue: seiteneingang.id, when: all(AKTIV, DRINNEN, not(DRIN), not(IM_LABOR)) },
        { id: 'm2b-lueftungsgitter', at: 'lueftungsgitter', label: 'Lüftungsgitter am Spire', kind: 'use', dialogue: lueftung.id, when: all(AKTIV, DRINNEN, not(DRIN), not(IM_LABOR)) },
        { id: 'm2b-haupttor', at: 'haupttor', label: 'Haupttor', kind: 'use', dialogue: haupttor.id, when: all(AKTIV, DRINNEN, not(DRIN), not(IM_LABOR)) },
        { id: 'm2b-brueckenkopf', at: 'brueckenkopf', label: 'Overwatch-Posten', kind: 'use', dialogue: overwatch.id, when: all(AKTIV, BRUECKE, noFlag('bruch_overwatch_fertig')) },
        {
          id: 'm2b-schacht-runter', at: 'lueftungsgitter', label: 'Lüftungsschacht runter ins Labor', kind: 'use',
          when: all(AKTIV, BRUECKE, flag('bruch_overwatch_fertig'), not(IM_LABOR)),
          lines: [nar('Der linke Schacht. Raven tritt das Gitter ein, als hätte es sie beleidigt.')],
          effects: [IN('quantum-labor', 'lueftung')],
        },
        {
          id: 'm2b-zurueck-labor', at: 'lueftungsgitter', label: 'Zurück ins Labor', kind: 'use',
          when: all(AKTIV, IM_LABOR, not(ENTKOMMEN)),
          lines: [nar('Aria ist noch da unten. Und Nyra.')],
          effects: [IN('quantum-labor', 'lueftung')],
        },
      ],
    },
    'quantum-foyer': {
      hotspots: [
        { id: 'm2b-laboraufzug', at: 'laboraufzug', label: 'Laboraufzug (Ebene −3)', kind: 'use', dialogue: laboraufzug.id, when: all(AKTIV, NICHT_IM_LABOR, DRINNEN) },
        { id: 'm2b-sicherheitszentrale', at: 'sicherheitszentrale', label: 'Funkgerät der Sicherheitszentrale', kind: 'use', dialogue: sicherheitszentrale.id, when: all(AKTIV, NICHT_IM_LABOR, noFlag('bruch_funk_tot')) },
      ],
      onEnter: [
        { id: 'm2b-foyer-drin', when: all(AKTIV, DRINNEN), effects: [set('bruch_drin')] },
      ],
    },
    'quantum-labor': {
      onEnter: [
        {
          id: 'm2b-labor-drinnen', when: all(AKTIV, DRINNEN, not(IM_LABOR)),
          effects: [set('bruch_drin'), set('bruch_im_labor')], dialogue: laborAnkunft.id,
        },
        { id: 'm2b-labor-bruecke', when: all(AKTIV, BRUECKE, not(IM_LABOR)), dialogue: laborBruecke.id },
      ],
      hotspots: [
        { id: 'm2b-tresor', at: 'chip-tresor', label: 'Chip-Tresor', kind: 'use', dialogue: tresor.id, when: all(AKTIV, DRINNEN, IM_LABOR, not(ERWACHT), { noItem: 'quest-nexus-chip' }) },
        {
          id: 'm2b-xion-tuer', at: 'xion-tuer', label: 'Xion an der Sicherheitstür', kind: 'talk', dialogue: xionTuer.id,
          when: all(AKTIV, DRINNEN, ERWACHT, not(XION_VORBEI)),
        },
        { id: 'm2b-nyra-bruecke', at: 'nyras-arbeitsplatz', label: 'Nyra und Aria', kind: 'talk', dialogue: laborBruecke.id, when: all(AKTIV, BRUECKE, not(IM_LABOR)) },
        { id: 'm2b-op-tisch', at: 'op-tisch', label: 'Aria!', kind: 'talk', dialogue: aria.id, when: all(AKTIV, any(all(DRINNEN, XION_VORBEI), all(BRUECKE, IM_LABOR)), not(ARIA_ENTSCHIEDEN)) },
        {
          id: 'm2b-gitter-raus', at: 'lueftungsgitter', label: 'Raus hier', kind: 'use',
          when: all(AKTIV, ARIA_ENTSCHIEDEN, not(ENTKOMMEN)),
          lines: [l('raven', 'Weg hier! Jetzt!', 'wut')],
          effects: [set('nyra_zurueckgelassen'), { dismiss: 'nyra' }, set('bruch_flucht_lieferzone'), ...FLUCHT],
        },
      ],
      npcs: [
        { id: 'm2b-aria-labor', npc: 'aria', at: 'op-tisch', when: all(AKTIV, BRUECKE, IM_LABOR, not(ARIA_ENTSCHIEDEN)) },
        { id: 'm2b-nyra-labor', npc: 'nyra', at: 'nyras-arbeitsplatz', when: all(AKTIV, BRUECKE, not(flag('nyra_zurueckgelassen'))) },
      ],
    },
  },
};
