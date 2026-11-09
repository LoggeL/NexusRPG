// Prolog `main-0-digitech` · „Vor sieben Jahren“ (world.md §5.1) plus Intro nach der Charaktererstellung.
// Gespielt wird Raven (Körper 6, Reflexe 6, Ausstrahlung 4, Technik 2, Straße 5): Der Effekt `standIn` (RAVEN_PROLOG)
// ersetzt die Spielfigur für den Prolog durch Ravens Werte, Namen, Laufblatt und Porträt, das HUD zeigt „Vor 7 Jahren“.
// Ende der Gerichtsszene: zurück zur eigenen Figur, Uhr auf 16:30 (`setClock`). Der Kartenleser `[Technik 4]` bleibt bewusst ausgegraut. Ablauf: Intro (START.cutscene) → digitech-areal
// „damals“ (Einstieg prolog-start, Funk) → Wachdrohne (schleichen oder enc-prolog-drohne) → Kellertreppe →
// digitech-tresor: Kartenleser (Dante öffnet) → Tresor (Blade, Chip, Handschellen) → Freeze/Gericht → Bahnhof Mitte.
import type { Condition } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { L, N, RAVEN_PROLOG, UHR, node } from './_dsl';

const Q = 'main-0-digitech';
const IM_PROLOG: Condition = { notFlag: 'prolog_done' };

/** Zurück in den Prolog, falls man ihn verlässt (Niederlage → Unterschlupf, falsche Richtung am Bauzaun). */
const zurueck = (id: string, text: string) => ({
  id,
  once: false,
  // Nur, wenn der Prolog wirklich lief (nicht bei ?map=-Sprüngen in ein frisches Spiel).
  when: { all: [IM_PROLOG, { seen: 'enter:digitech-areal:prolog-funk' }] },
  effects: [{ message: text }, { travel: 'digitech-areal', entry: 'prolog-start', minutes: 0 }],
});

export const part: ContentPart = {
  quests: {
    [Q]: {
      id: Q,
      kind: 'main',
      title: 'Vor sieben Jahren',
      summary: 'Digitech-Areal, 2079. Raven, Blade und ein Chip, der aus Menschen Kunden machen soll. Hunter und Dante sind am Funk.',
      giver: 'hunter',
      act: 1,
      autoStart: IM_PROLOG,
      steps: [
        {
          id: 'drohne',
          text: 'Komm an der Wachdrohne vor der Kellertreppe vorbei – leise oder laut.',
          done: { any: [{ flag: 'prolog_geschlichen' }, { won: 'enc-prolog-drohne' }, { visited: 'digitech-tresor' }] },
          marker: { map: 'digitech-areal', at: 'prolog-funkpunkt' },
        },
        {
          id: 'keller',
          text: 'Steig die Kellertreppe hinab zum Tresor.',
          when: { questStep: Q, step: 'drohne' },
          done: { visited: 'digitech-tresor' },
          marker: { map: 'digitech-areal', at: 'kellertreppe' },
        },
        {
          id: 'tuer',
          text: 'Öffne die Tresortür. Der Kartenleser will mehr Technik, als Raven hat.',
          when: { visited: 'digitech-tresor' },
          done: { flag: 'prolog_tuer_offen' },
          marker: { map: 'digitech-tresor', at: 'kartenleser' },
        },
        {
          id: 'chip',
          text: 'Hol den Chip aus dem Tresor.',
          when: { flag: 'prolog_tuer_offen' },
          done: { flag: 'prolog_done' },
          marker: { map: 'digitech-tresor', at: 'tresor-rohr' },
        },
      ],
      reward: { xp: 60 },
    },
  },

  cutscenes: {
    // Läuft direkt nach der Charaktererstellung (GameContent.start.cutscene, siehe design/plan/start.md).
    'intro-noxius': {
      id: 'intro-noxius',
      title: 'Noxius, 2086',
      beats: [
        {
          image: 'black', caption: 'Noxius, 2086.', fade: 'in', hold: 1600,
          lines: [N('Oben, in der Oberstadt, glänzen Glastürme, die nie jemand von unten putzt. Drohnen liefern Sushi an Leute, die nie hungrig waren.')],
        },
        {
          image: 'black', caption: 'Unten rostet der Rest.', hold: 1400,
          lines: [
            N('In der Unterstadt hält die U-Bahn, wann sie Bock hat. Die Reklamen flackern im Takt der Stromrechnung, und jeder kennt jemanden, der jemanden kennt, der dir für zehn Credits die Niere aus dem Leib quatscht.'),
            N('Du kommst in einer Woche hierher, in der sich verdammt viel ändern wird. Aber diese Geschichte fängt nicht mit dir an.'),
          ],
        },
        {
          image: 'black', caption: 'Vor sieben Jahren.', hold: 1600,
          lines: [
            N('Sie fängt mit einem Einbruch an. Mit einem Chip. Mit einem Mann im Teddyfell-Mantel. Und mit Raven.'),
            N('Prolog: Du spielst Raven. Körper 6, Reflexe 6, Ausstrahlung 4, Technik 2, Straße 5. Nicht alles, was du siehst, kann sie auch. Deine eigene Geschichte fängt danach an.'),
          ],
        },
      ],
      // Ab hier spielt man Raven (bis zum Ende von prolog-verrat).
      effects: [{ standIn: RAVEN_PROLOG }],
      gallery: false,
    },

    'prolog-verrat': {
      id: 'prolog-verrat',
      title: 'Ich teile nicht gerne',
      beats: [
        {
          image: 'cut-prolog-rohr', pan: 'in', fade: 'in', sfx: 'alarm',
          lines: [
            N('Rotes Licht, Sirenen, und an deinem Handgelenk ein Metallring, dessen anderes Ende um ein Kühlrohr geschlossen ist.'),
            L('blade', 'Ich teile nicht gerne. Tut mir leid.', 'signatur'),
            L('raven', 'Blade. Mach das ab. Sofort, du verdammter …', 'wut'),
            L('blade', 'Grüß die Jungs von mir. Sag ihnen, die Zukunft war leider ausverkauft.', 'freude'),
          ],
        },
        {
          image: 'cut-prolog-rohr', caption: 'Er geht. Er dreht sich nicht um.', hold: 1400,
          lines: [
            L('hunter', 'Raven? Raven, antworte! Wo ist Blade?', 'besorgt'),
            L('raven', 'Weg. Mit dem Chip. Ich häng hier am Rohr wie ein Fahrrad vorm Supermarkt.', 'wut'),
            L('dante', 'Ich – ich kann die Handschellen nicht hacken, die sind analog! Um Himmels willen, warum sind die analog?!', 'besorgt'),
          ],
        },
        {
          image: 'cut-prolog-rohr', caption: 'FREEZE.', fade: 'cross', hold: 1200,
          lines: [
            L('vega', 'Stopp. Genau da. Das ist Raven. Beste Einbrecherin, die Noxius je hatte, angekettet an ein Rohr, während oben die Stiefel trampeln.'),
            L('vega', 'Und der Kerl im Teddyfell-Mantel, der da gerade durch den Lieferausgang verschwindet, heißt Blade Nocturne. Merkt euch die Fresse. Wir haben sie uns gemerkt.'),
          ],
        },
        {
          image: 'cut-prolog-gericht', pan: 'right', caption: 'Noxius, Gerichtssaal. Drei Wochen später.', hold: 1200,
          lines: [
            L('richter', 'Hunter. Drei Jahre.'),
            L('richter', 'Dante. Vier Jahre. Inklusive zehntausend Stunden illegal gestreamter Musik und Filme.'),
            L('dante', 'Die Filme waren gut! Einspruch! Die waren wirklich gut!', 'ueberrascht'),
            L('richter', 'Raven. Sieben Jahre. Die Angeklagte wurde angekettet am Tatort aufgefunden. Das Gericht hält das nicht für mildernd.'),
            L('raven', 'Ich auch nicht.'),
          ],
        },
        {
          image: 'cut-prolog-gericht', hold: 1200,
          lines: [
            L('vega', 'Blade? Kein Prozess, keine Fingerabdrücke. Drei Monate später gründet er mit den Chrome-Schwestern eine Firma: Quantum Industries.'),
            L('vega', 'Hunter kommt nach drei Jahren raus und baut aus dem Nichts einen Club. Dante nach vier Jahren eine Werkstatt voller Schallplatten. Raven sitzt die vollen sieben.'),
            L('vega', 'Diese Woche kommt sie raus. Und diese Woche sucht Hunter jemand Neues. Rate mal, wen.'),
          ],
        },
        { image: 'black', caption: 'Sieben Jahre später.', fade: 'out', hold: 1800 },
      ],
      effects: [
        { setFlag: 'prolog_done' },
        // Zurück zur eigenen Figur; die Ankunft spielt am selben Montag um 16:30 (main-1-ankunft).
        { standIn: null },
        { setClock: UHR(16, 30) },
        { setFlag: 'ankunft_uhr' },
        { travel: 'bahnhof-mitte', entry: 'start', minutes: 0 },
      ],
      gallery: false,
    },
  },

  dialogues: {
    'prolog-funk': {
      id: 'prolog-funk',
      start: 'start',
      nodes: [
        node('start', [
          N('Digitech-Areal, Oberstadt-Rand. 2079. Hinter dem Bauzaun summen Flutlichter, irgendwo tropft Kondenswasser auf Beton.'),
          N('Du bist Raven. Schwarze Handschuhe, ruhiger Puls, null Vertrauen in Türen.'),
          L('hunter', 'Wo bleiben diese Idioten? Raven, Status.'),
          L('raven', 'Am Zaun. Blade ist bei mir. Er hat seinen Stock dabei. Natürlich hat er seinen Stock dabei.'),
          L('blade', 'Ein Gentleman bricht nie ohne Goldknauf ein, Liebes. Stil ist das Erste, was die Wachen sehen.', 'signatur'),
          L('raven', 'Und das Letzte, woran sie sich erinnern.'),
          L('dante', 'Raven! Ich bin drin! Also fast drin. Ich bin im Kamerasystem, und alle Kameras zeigen gerade eine Katze. Heiliges Kanonenrohr, ist das eine schöne Katze.', 'freude'),
          L('hunter', 'Dante. Fokus.'),
          L('dante', 'Fokus, ja! Der Tresor liegt im Keller. Vor der Kellertreppe kreist eine Wachdrohne mit eigenem Akku, an die komm ich nicht ran.'),
          L('hunter', 'Rein, Chip holen, raus. Keiner spielt den Helden. Verstanden?'),
        ], {
          // Sicherheitsnetz für Spielstände, die mitten im Prolog ohne Vertretung geladen wurden.
          effects: [{ standIn: RAVEN_PROLOG }],
          choices: [
            { text: '„Verstanden. Blade, du bleibst hinter mir.“', next: 'hinter', effects: [{ setFlag: 'prolog_skepsis' }] },
            { text: '„Verstanden. Und Blade spielt nicht mit seinem Stock.“', next: 'stock' },
            { text: '„Ich spiel nie den Helden. Ich spiel die, die am Ende noch steht.“', next: 'uebrig' },
          ],
        }),
        node('hinter', [
          L('blade', 'Hinter dir? Mit Vergnügen. Die Aussicht ist hervorragend.', 'freude'),
          L('raven', 'Noch ein Spruch, und die Aussicht ist mein Ellbogen.'),
        ], { next: 'tipp' }),
        node('stock', [
          L('blade', 'Mein Stock ist ein Werkzeug, Liebes. Er öffnet Türen. Manchmal auch Köpfe.', 'signatur'),
          L('dante', 'Bitte keine Köpfe! Ich hab nur für Türen geplant!'),
        ], { next: 'tipp' }),
        node('uebrig', [
          L('hunter', 'Das ist die richtige Antwort.'),
          L('blade', 'Am Ende stehen wir alle, Raven. Nur nicht alle am selben Ort.', 'neutral'),
        ], { next: 'tipp' }),
        node('tipp', [
          N('Tipp: Die Wachdrohne kreist am Funkpunkt vor der Kellertreppe. Geh hin und sieh sie dir an. Blade kannst du jederzeit ansprechen.'),
        ]),
      ],
    },

    'prolog-blade': {
      id: 'prolog-blade',
      start: 'start',
      nodes: [
        node('start', [
          L('blade', 'Nicht stehen bleiben, Liebes. Stehen bleiben ist was für Statuen und Wachpersonal.', 'signatur'),
        ], {
          choices: [
            { text: '„Warum bist du heute so verdammt gut gelaunt?“', next: 'laune', once: true },
            { text: '„Was willst du eigentlich mit dem Chip?“', next: 'chip', once: true },
            { text: 'Weiter.' },
          ],
        }),
        node('laune', [
          L('blade', 'Weil heute der Tag ist, an dem sich alles ändert. Für manche mehr als für andere.', 'freude'),
          L('raven', 'Klingt wie ein Glückskeks mit Hintergedanken.'),
        ], { next: 'start' }),
        node('chip', [
          L('blade', 'Ihn verkaufen, natürlich. An den Meistbietenden. Und dann, wer weiß, vielleicht ein kleines Unternehmen gründen.', 'neutral'),
          L('raven', 'Du und ein Unternehmen. Da geh ich lieber wieder in den Knast.'),
          L('blade', 'Sag so was nicht, Liebes. Das Universum hört mit.', 'signatur'),
        ], { next: 'start' }),
      ],
    },

    'prolog-drohne': {
      id: 'prolog-drohne',
      start: 'start',
      nodes: [
        node('start', [
          N('Eine weiße Wachdrohne zieht ihre Kreise vor der Kellertreppe. Ihr rotes Auge tastet die Regale ab, als suche es ein Hobby.'),
          L('blade', 'Zwei Möglichkeiten, Liebes. Du schleichst, ich bewundere. Oder wir machen sie kaputt, und ich bewundere trotzdem.', 'signatur'),
          L('dante', 'Ich wär für Schleichen! Kaputte Drohnen schicken der Zentrale vielleicht eine Abschiedsnachricht. Vielleicht. Hab ich nie getestet.'),
        ], {
          choices: [
            { tag: '[Reflexe 6]', text: 'Im Schatten der Regale vorbeischleichen.', next: 'schleichen', effects: [{ setFlag: 'prolog_geschlichen' }] },
            { text: 'Sie zerlegen. Blade lenkt ab.', next: 'kampf' },
            { text: 'Noch nicht. Erst umsehen.' },
          ],
        }),
        node('schleichen', [
          N('Drei Schritte. Pause. Zwei Schritte. Die Drohne summt an dir vorbei wie ein gelangweilter Kellner kurz vor Feierabend.'),
          L('dante', 'Du bist ein Geist! Ein sehr gut angezogener Geist!', 'freude'),
          N('Merke: Fast jedes Hindernis hat einen Weg ohne Kampf. Ravens Reflexe 6 reichen hier locker. Weiter zur Kellertreppe.'),
        ]),
        node('kampf', [
          L('blade', 'Arbeitsteilung. Ich liebe Arbeitsteilung.', 'freude'),
          L('raven', 'Du liebst es, wenn andere arbeiten.'),
        ], { effects: [{ battle: 'enc-prolog-drohne' }] }),
      ],
    },

    'prolog-kartenleser': {
      id: 'prolog-kartenleser',
      start: 'start',
      nodes: [
        node('start', [
          N('Eine Stahltür mit Kartenleser. Grünes Lämpchen, rotes Lämpchen und jede Menge Kratzer von Leuten, die es vor dir versucht haben.'),
        ], {
          choices: [
            // Ravens Technik ist 2: Die Option bleibt bewusst ausgegraut (world.md §5.1).
            { tag: '[Technik 4]', text: 'Den Leser kurzschließen.', requires: { flag: 'prolog_raven_technik_4' } },
            { text: 'Blade draufhauen lassen.', next: 'stock', once: true },
            { text: '„Dante? Du bist dran.“', next: 'dante' },
          ],
        }),
        node('stock', [
          L('blade', 'Mit dem größten Vergnügen.', 'signatur'),
          N('KLONK. Der Goldknauf hat jetzt eine Delle. Die Tür nicht.'),
          L('blade', 'Das war ein Erbstück.', 'trauer'),
          L('dante', 'Nicht hauen! Um Himmels willen, nicht hauen, das Ding zählt mit!'),
        ], { next: 'start' }),
        node('dante', [
          L('raven', 'Dante. Tür. Jetzt.'),
          L('dante', 'Gib mir noch eine Sekunde …'),
          N('Eine Sekunde. Fünf. Zwölf. Blade poliert seine Delle.'),
          L('dante', '… und … jetzt!', 'freude'),
          N('Klack. Grün.'),
          L('hunter', 'Merkt euch das, ihr zwei. Es gibt immer einen anderen Weg.'),
          L('raven', 'Und immer einen, der ihn findet.'),
          N('Tipp: Ausgegraute Optionen zeigen, was dir fehlt. Es gibt immer einen anderen Weg: eine Person, einen Gegenstand, eine Tür weiter.'),
        ], { effects: [{ setFlag: 'prolog_tuer_offen' }, { sfx: 'door' }] }),
      ],
    },

    'prolog-tresor': {
      id: 'prolog-tresor',
      start: 'start',
      nodes: [
        node('start', [
          N('Der Tresorraum. Rohre an der Wand, Kälte, ein Sockel mit Glashaube. Darunter ein Chip, schwarz wie ein Loch in der Welt.'),
          L('blade', 'Da ist er ja. Der Neurochip. Das Ding, das aus Menschen Kunden macht.', 'signatur'),
          L('raven', 'Aus Menschen Kunden?'),
          L('blade', 'Ein Witz, Liebes. Oder ein Geschäftsmodell. Ich verwechsle das ständig.', 'freude'),
          N('Du hebst die Glashaube an. Der Chip ist warm, als hätte ihn gerade jemand in der Hand gehabt.'),
          L('blade', 'Gib ihn mir. Ich trag ihn sicher, dann hast du beide Hände fürs Klettern frei.'),
        ], {
          choices: [
            { text: '„Hier. Pass bloß drauf auf.“', next: 'gib', effects: [{ setFlag: 'prolog_raven_vertraut' }] },
            { text: '„Der bleibt bei mir.“', next: 'behalte', effects: [{ setFlag: 'prolog_raven_misstrauisch' }] },
            {
              text: '„Du warst den ganzen Abend zu höflich, Blade. Was ist los?“', next: 'misstrauen',
              when: { flag: 'prolog_skepsis' }, effects: [{ setFlag: 'prolog_raven_misstrauisch' }],
            },
          ],
        }),
        node('gib', [
          N('Blade nimmt den Chip. Seine Finger sind kalt wie die Rohre.'),
          L('blade', 'Danke, Liebes. Ehrlich. Das meine ich ausnahmsweise so.', 'neutral'),
        ], { next: 'alarm' }),
        node('behalte', [
          N('Du schließt die Faust um den Chip. Blade lächelt, als hätte er genau das erwartet.'),
          L('blade', 'Natürlich. Vertrauen ist teuer, und du warst schon immer sparsam.', 'signatur'),
          N('Dann ein Ruck am Handgelenk, ein Dreh, ein Griff, den du nicht hast kommen sehen. Der Chip ist weg.'),
        ], { next: 'alarm' }),
        node('misstrauen', [
          L('blade', 'Höflich? Ich bin immer höflich. Das ist mein Problem. Und gleich deins.', 'signatur'),
          N('Er greift nach dem Chip, schneller als du. Natürlich schneller als du. Er hat den ganzen Abend darauf gewartet.'),
        ], { next: 'alarm' }),
        node('alarm', [
          N('SIRENEN. Rotes Licht flutet den Raum. Irgendwo oben brüllen Stiefel durch die Gänge.'),
          L('dante', 'Alarm! Das war nicht ich! Das war wirklich nicht ich! Raus da, raus, raus!', 'besorgt'),
          L('hunter', 'Raven! Blade! Lagebericht, verdammt!', 'wut'),
          L('blade', 'Alles im Griff, Hunter.', 'signatur'),
          N('Etwas klickt um dein Handgelenk. Kalt. Metall. Das andere Ende sitzt am Rohr.'),
        ], { effects: [{ cutscene: 'prolog-verrat' }] }),
      ],
    },
  },

  mapAdditions: {
    'digitech-areal': {
      onEnter: [{ id: 'prolog-funk', when: IM_PROLOG, dialogue: 'prolog-funk' }],
      npcs: [{ id: 'prolog-blade-areal', npc: 'blade', at: 'bauzaun-innen', facing: 's', dialogue: 'prolog-blade', when: IM_PROLOG }],
      hotspots: [{
        id: 'prolog-drohne', at: 'prolog-funkpunkt', label: 'Wachdrohne', kind: 'talk', dialogue: 'prolog-drohne',
        when: { all: [IM_PROLOG, { notFlag: 'prolog_geschlichen' }, { not: { won: 'enc-prolog-drohne' } }] },
      }],
    },
    'digitech-tresor': {
      npcs: [{ id: 'prolog-blade-tresor', npc: 'blade', at: 'waechter-gang', facing: 'n', dialogue: 'prolog-blade', when: IM_PROLOG }],
      hotspots: [
        {
          id: 'prolog-kartenleser', at: 'kartenleser', label: 'Kartenleser', kind: 'talk', dialogue: 'prolog-kartenleser',
          when: { all: [IM_PROLOG, { notFlag: 'prolog_tuer_offen' }] },
        },
        {
          id: 'prolog-tresor', at: 'tresor-rohr', label: 'Tresor', kind: 'talk', dialogue: 'prolog-tresor',
          when: { all: [IM_PROLOG, { flag: 'prolog_tuer_offen' }] },
        },
      ],
    },
    // Sicherheitsnetz: Niederlage gegen die Drohne schickt in den Unterschlupf; der Bauzaun führt zum Stufenplatz.
    'crew-quartier': { onEnter: [zurueck('prolog-zurueck', 'Raven rappelt sich zwischen den Regalen wieder auf. Der Chip wartet noch.')] },
    stufenplatz: { onEnter: [zurueck('prolog-zurueck', 'Raven: „Falsche Richtung. Der Chip liegt da drin, nicht hier draußen.“')] },
  },
};
