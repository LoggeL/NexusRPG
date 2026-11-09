// Hauptquest `main-1-dexter` · „Dexter zahlt immer“ (world.md §5.2): Schrottmarkt, Halde.
// Auslöser: `main-1-probezeit` erledigt (Hunter schickt dich mit Vega und Aria). Ablauf:
//   Treffpunkt Schrottmarkt (Vega + Aria kommen in die Party) → Wachdrohnen (gc-45, schleichen, [Dachläuferin], Kampf
//   enc-schrott-drohnen) → Dexter: gc-09 (500), gc-10 (800, Vega ♥ +40), gc-11 Ölfass (800, Rabatt), Gutscheine annehmen
//   (side-chrome-10), Kampf enc-schrott-dexter, nachts durchs Fenster (akt-schloss) → Abrechnung bei Hunter: gc-12 (20 %).
// Belohnung: 120 XP, 80 Cr plus Anteil (0–160), dexters-schraubschluessel, Vega und Aria als Begleiterinnen.
import type { Condition, DialogueNode, Effect } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { L, N, VEX, NICHT_VEX, node } from './_dsl';

const Q = 'main-1-dexter';
const AKTIV: Condition = { quest: Q, state: 'active' };
const DROHNEN_WEG: Condition = { questStep: Q, step: 'drohnen' };
const GELD_DA: Condition = { any: [{ flag: 'dexter_geld' }, { won: 'enc-schrott-dexter' }] };
const GELD_OFFEN: Condition = { all: [AKTIV, DROHNEN_WEG, { not: GELD_DA }] };

const geld = (betrag: 500 | 800, extra: Effect[] = []): Effect[] => [
  { setFlag: 'dexter_geld' }, { setFlag: betrag === 500 ? 'dexter_geld_500' : 'dexter_geld_800' }, ...extra,
];

/**
 * Das Verhandlungsgespräch mit Dexter (Knoten mit Präfix), gebraucht tagsüber an der Bürotür und nachts nach dem Wecken.
 * `einstieg` ist der Knoten, der zuerst kommt; alle Wege enden in `<p>ende` bzw. im Kampf.
 */
function verhandlung(p: string): DialogueNode[] {
  return [
    node(`${p}start`, [
      L('dexter', 'Ich zahle immer! Immer! Irgendwann! Das ist praktisch dasselbe wie jetzt, nur später!', 'besorgt'),
      L('dexter', 'Guckt euch doch um. Ich hab nichts. Ich bin ein armer Schrotthändler mit einer Drohnenallergie und einem schlechten Rücken.'),
      L('aria', 'Du hast gleich einen schlechten Rest-Körper, wenn du nicht zahlst.', 'wut'),
      L('vega', 'Achthundert, Dexter. Wir haben Zeit. Du nicht.'),
    ], {
      choices: [
        { check: 'gc-09', text: 'Den Schrottwürfel vom Stapel wuchten und auf seinen Schreibtisch knallen.', next: `${p}wuerfel` },
        { check: 'gc-10', text: '„Darf ich mal an dein Terminal? Wer so jammert, hat ein Nebenkonto.“', next: `${p}konto` },
        { check: 'gc-11', text: '„Das Ölfass in der Ecke klingt verdammt hohl, Dexter.“', next: `${p}oelfass` },
        { text: '„Zeig mir diese Gutscheine. Vielleicht sind die ja wirklich was wert.“', next: `${p}gutscheine` },
        { text: '„Genug gejammert.“ Die Fäuste sprechen lassen.', next: `${p}kampf` },
      ],
    }),
    node(`${p}wuerfel`, [
      N('Ein Würfel aus gepresstem Schrott, so groß wie ein Kühlschrank für Zwerge. Du hebst ihn an, die Halde stöhnt mit, und du knallst ihn auf Dexters Schreibtisch. Der Schreibtisch gibt auf. Die Kaffeetasse auch.'),
      L('dexter', 'MEIN SCHREIBTISCH! Der war antik! Der war von 2071!', 'ueberrascht'),
      L('aria', 'Der Würfel ist von heute. Willst du noch einen?', 'freude'),
      L('dexter', 'Fünfhundert! Fünfhundert, mehr hab ich nicht, ich schwör’s bei meiner Drohne Hildegard!'),
      L('vega', 'Er lügt nicht. Er schwitzt nur. Fünfhundert ist, was er hat.'),
    ], { effects: geld(500), next: `${p}ende` }),
    node(`${p}konto`, [
      N('Dexters Terminal ist ein Haufen Kabel mit Bildschirm. Das Passwort klebt auf einem Zettel am Monitor: „NICHT DAS PASSWORT“. Es ist das Passwort.'),
      N('Hauptkonto: 3 Credits. Darunter ein Ordner namens „Steuer“. Darin ein Konto namens „Notgroschen Dexter (GEHEIM!!)“: 1 140 Credits.'),
      L('vega', 'Achthundert davon. Die Zahlen lügen nicht. Dexter schon.', 'freude'),
      L('dexter', 'Das ist … das war für schlechte Zeiten!', 'besorgt'),
      L('aria', 'Glückwunsch. Die sind jetzt.'),
    ], { effects: geld(800, [{ relation: 'vega', delta: 40 }]), next: `${p}ende` }),
    node(`${p}oelfass`, [
      N('Du klopfst gegen das Fass. Bong. Bong. Bonk. Der dritte Ton ist zu kurz. Doppelter Boden. Darunter, in Plastik eingeschweißt: ein Bündel Credits und eine Liste mit Spitznamen von Gläubigern.'),
      L('dexter', 'Woher weißt du von dem Fass? Das Fass weiß nicht mal ICH!', 'ueberrascht'),
      L('aria', 'Hunter steht als „Der Sonnenbrillenmann“ drauf. Und ich als „Bitte nicht“. Süß.', 'signatur'),
      L('dexter', 'Okay! Okay. Achthundert. Und für dich ab jetzt Freundschaftspreis an meinem Stand. Weil du so … gründlich bist.'),
    ], { effects: geld(800, [{ setFlag: 'dexter_rabatt' }, { relation: 'dexter', delta: 20 }]), next: `${p}ende` }),
    node(`${p}gutscheine`, [
      L('dexter', 'Endlich! Endlich jemand mit Weitblick! Das sind Chrome-10-Gutscheine! Jeder einzelne ist ein Upgrade zum Glück! Steht drauf!', 'freude'),
      N('Er drückt dir einen Stapel glänzender Zettel in die Hand. Das Quantum-Logo ist leicht verrutscht. Auf der Rückseite steht: „Gedruckt in den Lötgassen“.'),
      L('vega', 'Quantum druckt nicht in den Lötgassen.'),
      L('aria', 'Das ist Altpapier mit Selbstbewusstsein.'),
      L('dexter', 'Gutschein-Gerd hat gesagt, die steigen im Wert! Ich hab dafür meine Ersparnisse … also, die Hälfte … also, das Meiste …'),
    ], {
      choices: [
        {
          text: '„Gut. Wir nehmen die Gutscheine. Und dann finden wir raus, wer die druckt.“', next: `${p}gutscheine-ja`,
          effects: [{ setFlag: 'dexter_geld' }, { setFlag: 'dexter_gutscheine' }, { give: 'chrome-10-gutschein', qty: 3 }, { relation: 'dexter', delta: 40 }],
        },
        { text: '„Vergiss es. Hunter will Credits.“', next: `${p}start` },
      ],
    }),
    node(`${p}gutscheine-ja`, [
      L('dexter', 'Du glaubst mir? Du glaubst mir! Niemand glaubt mir! Nicht mal meine Drohnen!', 'freude'),
      L('aria', 'Hunter wird dich umbringen. Und dann mich. Und dann noch mal dich, zur Sicherheit.'),
      L('vega', 'Gutschein-Gerd steht am Schrottmarkt. Wenn die Dinger gefälscht sind, schuldet uns Gerd was. Nicht Dexter.'),
    ], { effects: [{ startQuest: 'side-chrome-10' }], next: `${p}ende` }),
    node(`${p}kampf`, [
      L('dexter', 'Gewalt? Ihr wollt GEWALT? Dann … dann hol ich meine Leute! JUNGS! Kundengespräch! Bringt die Zangen mit!', 'besorgt'),
      N('Aus dem Wellblech klettern zwei Zerleger mit Zangen, die eindeutig mehr für Hälse als für Schrauben gedacht sind.'),
    ], { effects: [{ battle: 'enc-schrott-dexter' }] }),
    node(`${p}ende`, [
      L('vega', 'Erledigt. Zurück zu Hunter.'),
      L('aria', 'Ich trag das Geld. Ich trag immer das Geld. Mich überfällt keiner.'),
    ]),
  ];
}

export const part: ContentPart = {
  quests: {
    [Q]: {
      id: Q,
      kind: 'main',
      title: 'Dexter zahlt immer',
      summary: 'Dexter schuldet Hunter 1 200 Credits. Vierhundert hat er gezahlt, den Rest in „Chrome 10“-Gutscheinen. Du holst mit Vega und Aria die übrigen achthundert, auf der Halde des Schrottmarkts.',
      giver: 'hunter',
      act: 1,
      autoStart: { quest: 'main-1-probezeit', state: 'done' },
      steps: [
        {
          id: 'treffpunkt',
          text: 'Triff Vega und Aria auf dem Schrottmarkt.',
          done: { flag: 'dexter_trupp' },
          marker: { map: 'schrottmarkt', at: 'von-neon-gasse' },
        },
        {
          id: 'drohnen',
          text: 'Komm an Dexters Wachdrohnen auf der Halde vorbei.',
          when: { flag: 'dexter_trupp' },
          done: { any: [{ flag: 'dexter_drohnen_freundlich' }, { flag: 'dexter_drohnen_umgangen' }, { won: 'enc-schrott-drohnen' }] },
          marker: { map: 'schrottmarkt', at: 'halde' },
        },
        {
          id: 'geld',
          text: 'Treib Dexters Restschuld ein: achthundert Credits. Tagsüber an seiner Bürotür, nachts schläft er.',
          when: DROHNEN_WEG,
          done: GELD_DA,
          marker: { map: 'schrottmarkt', at: 'dexter-buero' },
        },
        {
          id: 'hunter',
          text: 'Bring Hunter das Geld ins High Voltage.',
          when: { questStep: Q, step: 'geld' },
          done: { flag: 'dexter_abgerechnet' },
          marker: { map: 'high-voltage', at: 'tresen-ende' },
        },
      ],
      reward: {
        xp: 120,
        credits: 80,
        items: { 'dexters-schraubschluessel': 1 },
        effects: [{ recruit: 'vega' }, { recruit: 'aria' }],
      },
    },
  },

  phone: {
    'ph-hunter-dexter': {
      id: 'ph-hunter-dexter',
      from: 'hunter',
      text: 'Dexter. Halde. Achthundert. Vega und Aria warten am Schrottmarkt. Lass dich nicht mit Gutscheinen abspeisen.',
      auto: { all: [AKTIV, { dayAtLeast: 2 }, { notFlag: 'dexter_trupp' }] },
    },
    'ph-aria-dexter': {
      id: 'ph-aria-dexter',
      from: 'aria',
      text: 'Gut gemacht, Neuling. Nächstes Mal schlag ich zuerst. Und du zahlst die Limo.',
      auto: { all: [{ quest: Q, state: 'done' }, NICHT_VEX] },
      replies: [{ text: 'Abgemacht.' }, { text: 'Du hast doch gar nicht geschlagen.', effects: [{ relation: 'aria', delta: 10 }] }],
    },
    'ph-aria-dexter-vex': {
      id: 'ph-aria-dexter-vex',
      from: 'aria',
      text: 'Postbotin. Morgen Armdrücken im HV. Verliererin zahlt die Limo. Und sag deinem Ripper-Arm, er soll nicht heulen.',
      auto: { all: [{ quest: Q, state: 'done' }, VEX] },
      replies: [
        { text: 'Bring Taschentücher mit, Zöpfe.', effects: [{ relation: 'aria', delta: 10 }] },
        { text: 'Ich zahl keine Limo. Ich gewinn.' },
      ],
    },
  },

  dialogues: {
    'main-1-dexter-treffpunkt': {
      id: 'main-1-dexter-treffpunkt',
      start: 'start',
      nodes: [
        node('start', [
          N('Zwischen den Wellblechständen lehnt Vega an einem Laternenmast und schält eine Orange, als hätte sie alle Zeit der Welt. Aria lässt den Baseballschläger über die Schulter wippen.'),
          L('vega', 'Da bist du. Die Halde ist hinten, zweihundertdreißig Meter. Dexters Büro ist das Wellblech mit der Satellitenschüssel aus einer Bratpfanne.'),
          L('aria', 'Und davor fliegen seine Wachdrohnen rum. Selbstgebaut. Die eine hat mal versucht, mich zu küssen. Ich hab sie ausgeknockt.', 'signatur'),
        ], {
          effects: [{ setFlag: 'dexter_trupp' }],
          choices: [
            { id: 't-normal', text: '„Dann los.“', when: NICHT_VEX, next: 'los' },
            { id: 't-vex', text: '„Dann los, ihr zwei.“', when: VEX, next: 'vex' },
          ],
        }),
        node('vex', [
          L('aria', 'Na, Postbotin? Hunter schickt dich als Aufpasserin, oder was?', 'signatur'),
          L('player', 'Hunter schickt mich, damit einer zählen kann.', 'neutral'),
          L('aria', 'Ich kann zählen. Bis eins. Dann schlag ich zu.'),
          L('player', 'Siehst du. Deshalb bin ich da.'),
          L('aria', 'Pass auf, dass dein Ratenarm nicht abfällt, wenn’s ernst wird. Ich heb ihn nicht für dich auf.'),
          L('player', 'Würdest du doch. Du würdest ihn an die Wand hängen. Neben dein Bandposter.'),
          L('aria', '… Halt die Klappe, Postbotin.', 'ueberrascht'),
          L('vega', 'Ladies. Halde. Zweihundertdreißig Meter. Bitte.'),
        ], { effects: [{ relation: 'aria', delta: 10 }], next: 'los' }),
        node('los', [
          N('Vega und Aria schließen sich dir an. Mit dem Telefon kannst du sie später auch rufen.'),
        ], { next: 'vega' }),
        // Getrennte Knoten: Lehnt `recruit` ab (Bedingung der Figur), bleibt der Rest der Szene unberührt.
        node('vega', [L('vega', 'Ich geh vorn. Ich seh weiter als ihr.')], { effects: [{ recruit: 'vega' }], next: 'aria' }),
        node('aria', [L('aria', 'Und ich geh da, wo’s kracht.', 'freude')], { effects: [{ recruit: 'aria' }] }),
      ],
    },

    'main-1-dexter-drohnen': {
      id: 'main-1-dexter-drohnen',
      start: 'start',
      nodes: [
        node('start', [
          N('Über den Schrottbergen surren drei zusammengeschweißte Drohnen. Auf einer steht mit Edding „BITTE NICHT TRETEN“, auf der zweiten „HILDEGARD“, auf der dritten nichts, die wirkt am gefährlichsten.'),
          L('vega', 'Drei Ziele, keine Deckung, null Hirn. Ihre Programmierung ist von Dexter. Also auch kein Hirn.'),
        ], {
          choices: [
            { check: 'gc-45', text: 'Die Steuerplatine der nächsten Drohne anzapfen und auf Begrüßungsmodus stellen.', next: 'begruessung' },
            {
              tag: '[Dachläuferin]', when: { perk: 'dachlaeuferin' },
              text: 'Über den Kranausleger und die Schrottberge laufen, oben, wo keine Drohne hinschaut.', next: 'dach',
            },
            { text: 'Hinter den Kühlschrankbergen vorbeischleichen.', next: 'schleichen' },
            { text: '„Zerlegen wir die Dinger.“', next: 'kampf' },
          ],
        }),
        node('begruessung', [
          N('Ein Deckel, zwei Kabel, ein Kontakt, den Dexter mit Kaugummi isoliert hat. Die Drohne zuckt, dreht sich einmal um sich selbst und fängt an, mit blechernem Akkordeon „Herzlich willkommen“ zu spielen.'),
          N('Die anderen beiden schließen sich an. Ein Drohnenchor. Sie begleiten euch bis zur Bürotür und werfen Konfetti aus Isolierband.'),
          L('aria', 'Ich hasse es. Ich liebe es. Ich hasse es, dass ich es liebe.', 'freude'),
        ], { effects: [{ setFlag: 'dexter_drohnen_freundlich' }] }),
        node('dach', [
          N('Kranausleger, Containerdach, ein Kühlschrank, der unter dir nachgibt, ein Sprung auf das Wellblech. Unten gucken drei Drohnen ins Leere.'),
          L('aria', 'Angeberin.', 'signatur'),
          L('vega', 'Elf Meter, ohne Sicherung. Sauber.'),
        ], { effects: [{ setFlag: 'dexter_drohnen_umgangen' }] }),
        node('schleichen', [
          N('Vega zeigt mit zwei Fingern: links, hinter den Kühlschrankberg, dann im Schatten des Wohnwagens. Aria trägt den Schläger so leise, wie man einen Schläger tragen kann.'),
          N('Einmal piept eine Drohne. Aria hält ihr eine alte Radkappe vor die Linse. Die Drohne entschuldigt sich und fliegt weiter.'),
          L('vega', 'Durch. Leise ist auch eine Art, laut zu sein.'),
        ], { effects: [{ setFlag: 'dexter_drohnen_umgangen' }, { advanceTime: 20 }] }),
        node('kampf', [
          L('aria', 'Ich nehm alle drei. Ihr dürft zugucken.', 'freude'),
          L('vega', 'Ich nehm die linke.'),
        ], { effects: [{ battle: 'enc-schrott-drohnen' }] }),
      ],
    },

    'main-1-dexter-tuer': {
      id: 'main-1-dexter-tuer',
      start: 'start',
      nodes: [
        node('start', [
          N('Dexters Wellblechbüro. Eine Satellitenschüssel aus einer Bratpfanne, ein Schild „Heute geschlossen“, das seit Jahren dort hängt, und dahinter hektisches Rascheln.'),
        ], {
          choices: [
            { id: 'd-morgen', text: 'Anklopfen.', when: { time: 'morgen' }, next: 'morgen' },
            { id: 'd-tag', text: 'Anklopfen.', when: { time: ['tag', 'abend'] }, next: 'tag' },
          ],
        }),
        node('morgen', [
          N('Keine Antwort. Das Büro ist leer, der Kaffee noch warm.'),
          L('aria', 'Der versteckt sich wieder. Hinter dem Kühlschrankberg. Ich riech seine Angst. Die riecht nach Dosenravioli.', 'signatur'),
          N('Aria marschiert los und kommt mit Dexter am Kragen zurück. Er hält eine Gabel in der Hand.'),
        ], { next: 'v-start' }),
        node('tag', [
          N('Die Tür geht einen Spalt auf. Ein Auge, eine Augenbraue, eine Schweißperle.'),
          L('dexter', 'Hier wohnt niemand! Hier ist nur … ein sehr armer Mann, der gerade nicht da ist!', 'besorgt'),
          L('aria', 'Mach auf, Dexter, oder ich mach auf. Mit dem Schläger. Durch die Wand.'),
          N('Die Tür geht auf.'),
        ], { next: 'v-start' }),
        ...verhandlung('v-'),
      ],
    },

    'main-1-dexter-nachts': {
      id: 'main-1-dexter-nachts',
      start: 'start',
      nodes: [
        node('start', [
          N('Nacht auf der Halde. Aus Dexters Büro schnarcht es wie ein Kompressor mit Schnupfen. Das Fenster hat einen Riegel, der noch älter ist als der Schreibtisch.'),
          L('vega', 'Er schläft. Das Geld ist drin. Irgendwo. Matratze, würde ich sagen. Dexter ist ein Matratzentyp.'),
          L('aria', 'Oder wir wecken ihn. Ich weck gern Leute.'),
        ], {
          choices: [
            {
              text: 'Leise den Fensterriegel knacken.', next: 'riegel',
              effects: [{
                minigame: 'akt-schloss', level: 1, key: 'dexter-fenster', label: 'Dexters Fensterriegel',
                win: [...geld(800), { setFlag: 'dexter_heimlich' }, { message: 'Unter der Matratze: achthundert Credits und ein Teddy mit Zahnspange. Den Teddy lasst ihr da.' }],
                lose: [{ message: 'Der Riegel klemmt. Dexter grunzt im Schlaf: „Hildegard … nicht die Rechnung …“ Versuch es noch mal oder weck ihn.' }],
              }],
            },
            { text: 'Gegen die Tür hämmern und ihn wecken.', next: 'wecken' },
            { text: '„Wir kommen tagsüber wieder.“' },
          ],
        }),
        node('riegel', [N('Du setzt den Dietrich an. Aria hält die Luft an. Vega zählt die Schnarcher.')]),
        node('wecken', [
          N('Aria hämmert. Drinnen fällt etwas um, dann jemand. Die Tür geht auf: Dexter im Schlafanzug mit Schraubenschlüssel-Muster.'),
          L('dexter', 'Es ist mitten in der Nacht! Ich hab Ruhezeiten! Steht im Schild!', 'ueberrascht'),
        ], { next: 'n-start' }),
        ...verhandlung('n-'),
      ],
    },

    'main-1-dexter-abrechnung': {
      id: 'main-1-dexter-abrechnung',
      start: 'start',
      nodes: [
        node('start', [
          N('Hunter winkt dich ran. Aria knallt das Ergebnis der Halde auf den Tresen, als wäre es eine Trophäe.'),
          L('hunter', 'Und?'),
        ], {
          choices: [
            { id: 'a-gutschein', text: 'Die Gutscheine auf den Tresen legen.', when: { flag: 'dexter_gutscheine' }, next: 'gutscheine' },
            { id: 'a-500', text: 'Fünfhundert auf den Tresen legen.', when: { all: [{ flag: 'dexter_geld_500' }, { notFlag: 'dexter_gutscheine' }] }, next: 'fuenfhundert' },
            { id: 'a-800', text: 'Achthundert auf den Tresen legen.', when: { all: [{ notFlag: 'dexter_geld_500' }, { notFlag: 'dexter_gutscheine' }] }, next: 'achthundert' },
          ],
        }),
        node('achthundert', [
          N('Hunter zählt. Zweimal. Beim zweiten Mal schneller, das ist bei ihm ein Lächeln.'),
          L('hunter', 'Achthundert. Auf den Punkt. Dexter ist schuldenfrei. Bei mir. Bei allen anderen bestimmt nicht.', 'freude'),
          L('vega', 'Wir waren gut.'),
          L('aria', 'Ich war besser.'),
          L('hunter', 'Schulden muss man immer begleichen. Und Anteile muss man immer verteilen. Zehn Prozent für dich, Neuling.'),
        ], {
          effects: [{ setFlag: 'dexter_schuldenfrei' }],
          choices: [
            {
              check: 'gc-12', text: '„Zwanzig. Für jeden von uns. Vega hat gezählt, Aria hat geschleppt, ich hab’s rausgeholt.“', next: 'anteil-gross',
              effects: [{ credits: 160 }, { relation: 'vega', delta: 20 }, { relation: 'aria', delta: 20 }, { setFlag: 'dexter_anteil_zwanzig' }],
            },
            { text: '„Zehn Prozent sind fair.“', next: 'ende', effects: [{ credits: 80 }] },
          ],
        }),
        node('fuenfhundert', [
          N('Hunter zählt. Einmal. Er zählt nicht ein zweites Mal, das ist bei ihm ein Seufzer.'),
          L('hunter', 'Fünfhundert. Besser als nichts. Schlechter als achthundert. Dexter bleibt mir dreihundert schuldig, und das weiß er.'),
          L('aria', 'Er hat seinen Schreibtisch verloren. Das war ein schöner Moment.', 'freude'),
          L('hunter', 'Zehn Prozent für dich.'),
        ], {
          choices: [
            {
              check: 'gc-12', text: '„Zwanzig für jeden. Wir haben ihm den Schreibtisch zertrümmert, das war Präzisionsarbeit.“', next: 'anteil-gross',
              effects: [{ credits: 100 }, { relation: 'vega', delta: 20 }, { relation: 'aria', delta: 20 }, { setFlag: 'dexter_anteil_zwanzig' }],
            },
            { text: '„Zehn Prozent. Passt.“', next: 'ende', effects: [{ credits: 50 }] },
          ],
        }),
        node('gutscheine', [
          N('Hunter sieht die Gutscheine an. Dann dich. Dann wieder die Gutscheine. Seine Sonnenbrille rutscht ein Stück, als wolle sie das nicht sehen.'),
          L('hunter', 'Papier. Du bringst mir Papier.', 'wut'),
          L('vega', 'Gefälschtes Papier. Gedruckt in den Lötgassen. Wer das druckt, schuldet uns mehr als Dexter.'),
          L('hunter', '… Gutschein-Gerd. Natürlich. Na gut. Wenn du ihm das Handwerk legst, ist Dexters Schuld erledigt. Bis dahin: kein Anteil.'),
        ], { effects: [{ relation: 'hunter', delta: -20 }], next: 'ende' }),
        node('anteil-gross', [
          L('hunter', '… Zwanzig für jeden. Du verhandelst wie meine Mutter. Die hat auch immer gewonnen.'),
          L('aria', 'Zwanzig Prozent! Ich kauf mir ein Kabelbrand-Shirt. Ein altes. Die neuen haben keine Seele.', 'freude'),
          L('vega', 'Danke.'),
        ], { next: 'ende' }),
        node('ende', [
          L('hunter', 'Dexter hat dir übrigens was mitgegeben. Als Friedensangebot. Er hat geweint, als er’s abgegeben hat.'),
          N('Ein schwerer Schraubschlüssel mit Isolierband am Griff und eingeritztem Namen: DEXTER. Darunter, kleiner: „ZURÜCKGEBEN“.'),
          L('hunter', 'Vega, Aria. Ihr zwei bleibt bei Neuling. Wer zusammen kassiert, kämpft auch zusammen.'),
        ], {
          effects: [{ setFlag: 'dexter_abgerechnet' }],
          choices: [
            { id: 'e-normal', text: '„Danke, Hunter.“', when: NICHT_VEX, next: 'schluss' },
            { id: 'e-vex', text: '„Danke, Hunter.“', when: VEX, next: 'schluss-vex' },
          ],
        }),
        node('schluss', [
          L('aria', 'Nicht schlecht für den ersten Tag, Neuling. Beim nächsten Mal lass ich dich auch mal zuschlagen.', 'freude'),
          L('vega', 'Sie meint: Willkommen.'),
        ]),
        node('schluss-vex', [
          L('aria', 'War nicht komplett scheiße, Postbotin.', 'signatur'),
          L('player', 'Klaust du jetzt meine Sprüche, Zöpfe?', 'neutral'),
          L('aria', 'Ich klau alles, was nicht festgeschraubt ist. Und deinen Arm schraub ich ab, wenn du frech wirst.'),
          L('player', 'Versuch’s doch.'),
          L('aria', '… Irgendwann. Wenn du nicht damit rechnest.', 'signatur'),
          L('vega', 'Sie meint: Willkommen. Beide meinen das. Keine von beiden sagt es.'),
        ]),
      ],
    },
  },

  mapAdditions: {
    schrottmarkt: {
      onEnter: [{
        id: 'dexter-treffpunkt', once: false,
        when: { all: [AKTIV, { notFlag: 'dexter_trupp' }] },
        dialogue: 'main-1-dexter-treffpunkt',
      }],
      hotspots: [
        {
          id: 'dexter-drohnen', at: 'halde', label: 'Dexters Wachdrohnen', kind: 'talk', dialogue: 'main-1-dexter-drohnen',
          when: { all: [AKTIV, { flag: 'dexter_trupp' }] },
          hideWhen: DROHNEN_WEG,
        },
        {
          id: 'dexter-buero-tuer', at: 'dexter-buero', label: 'An Dexters Bürotür hämmern', kind: 'talk', dialogue: 'main-1-dexter-tuer',
          when: { all: [GELD_OFFEN, { time: ['morgen', 'tag', 'abend'] }] },
        },
        {
          id: 'dexter-buero-fenster', at: 'dexter-buero', label: 'Dexters Bürofenster', kind: 'talk', dialogue: 'main-1-dexter-nachts',
          when: { all: [GELD_OFFEN, { time: 'nacht' }] },
        },
      ],
    },
    'high-voltage': {
      onEnter: [{
        id: 'dexter-abrechnung', once: false,
        when: { all: [AKTIV, GELD_DA, { notFlag: 'dexter_abgerechnet' }] },
        dialogue: 'main-1-dexter-abrechnung',
      }],
    },
    'hv-hinterzimmer': {
      onEnter: [{
        id: 'dexter-abrechnung', once: false,
        when: { all: [AKTIV, GELD_DA, { notFlag: 'dexter_abgerechnet' }] },
        dialogue: 'main-1-dexter-abrechnung',
      }],
    },
  },
};
