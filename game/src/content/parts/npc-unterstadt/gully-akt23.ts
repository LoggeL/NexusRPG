// Bürgermeister Gully in Akt 2, Akt 3 und im Nachspiel (world.md §4.4). Weltfigur mit höchstens 5 Herzen: keine
// Herz-Ereignisse 8/10, nur Menü-Ergänzung (Kanalvolk als Zuflucht vor Chrome 10) und Phasen-Gespräche.
// Kein eigener Inhaltsteil: buergermeister-gully.ts holt alles von hier.
import type { DialogueDef, TalkDef } from '../../../modules/contracts';
import {
  type Menue, AKT2_NUR, AKT3_NACHT, ARIA_GECHIPPT, COUNTDOWN_DONE, ENDE_3B, ENDE_MEER, ENDE_NEXUS, EPILOG_FREI, MASTER,
  NYRA_WEG, PARTY_VORB, alle, erz, flag, herz, knoten, phasen, sprecher,
} from './_lib';

const ID = 'buergermeister-gully';
const G = sprecher(ID);

export const MENUE_23: Menue = {
  choices: [
    {
      text: 'Versteckt das Kanalvolk Leute vor den Chips?', next: 'g23-zuflucht',
      when: alle(AKT2_NUR, { notFlag: 'gully_zuflucht' }), effects: [flag('gully_zuflucht'), herz(ID, 20), { rep: 'unterstadt', delta: 1 }],
    },
    {
      text: 'Was sagt der Kanal heute?', next: 'g23-kanal',
      when: alle(AKT2_NUR, { notFlag: 'heute_gully_kanal' }), effects: [flag('heute_gully_kanal')],
    },
  ],
  nodes: [
    knoten('g23-zuflucht', [
      G('Verstecken? Wir verstecken niemanden. Wir gewähren Asyl! Mit Stempel! Ich hab einen Stempel aus einem Flaschendeckel geschnitzt. Er sagt „ASYL“. Rückwärts, aber er sagt es.', 'freude'),
      G('Siebzehn Bürger sind schon da. Zwei Gechippte, die wir rechtzeitig vor dem Einsetzen gefunden haben, eine Bibliothekarin und ein Toaster, der nicht „Master“ sagen will. Der Toaster ist mein Stellvertreter.', 'signatur'),
      G('Wer runterkommt, kriegt eine Decke, eine Ratte zum Kuscheln und das Wahlrecht. Wenn du jemanden kennst: Gully drei, zweimal klopfen, „Das Rohr ist frei“ sagen.'),
    ], { next: 'menue' }),
    knoten('g23-kanal', [
      G('Der Kanal sagt: oben lächeln sie, unten stinkt es. Das ist ehrlicher. Hier unten weiß jeder, woran er ist. Meistens an Schlamm.', 'signatur'),
      erz('Er hält eine Hand ins Wasser und horcht. Lange. Dann nickt er ernst.'),
      G('Und er sagt, dass Quantum Rohre verlegt. Neue. Glänzende. Die gehen bis zum Turm. Wir haben eins angebohrt. Es riecht nach Parfüm und Angst.'),
    ], { next: 'menue' }),
  ],
};

export function akt23(M: Menue): { dialogues: DialogueDef[]; talk: TalkDef[] } {
  return phasen(ID, 'buergermeister-gully-23', M, [
    {
      id: 'master', when: MASTER, ohneMenue: true,
      gruss: [
        G('Die Gullydeckel bleiben zu. Für dich. Beschluss des Stadtrats. Einstimmig. Der Toaster hat zweimal abgestimmt.', 'wut'),
        erz('Hinter ihm schlägt ein schwerer Deckel zu. Von unten hört man Ratten. Sie klingen enttäuscht.'),
      ],
    },
    {
      id: 'ende-3b', when: ENDE_3B, einmal: true,
      gruss: [G('Ehrenbürger! Du warst kurz Oberstädter, hab ich gehört. Das passiert den Besten. Wir haben dir die Bürgerschaft nicht entzogen. Nur eingefroren. Jetzt ist sie aufgetaut. Riecht ein bisschen.', 'freude')],
    },
    {
      id: 'ende-nexus', when: ENDE_NEXUS, einmal: true,
      gruss: [
        G('Die neue Stadt-KI hat mich angerufen! Mich! Bürgermeister Gully! Sie will das Kanalvolk als offiziellen Stadtteil anerkennen. Mit Straßenschild! „Unterm Gully 1–17“.', 'freude'),
        G('Ich hab gesagt, wir überlegen es uns. Man muss sich zieren. Das hab ich vom Richter gelernt.'),
      ],
    },
    {
      id: 'ende-meer', when: ENDE_MEER, einmal: true,
      gruss: [G('Blade im Knast, die Oberstadt in Panik, und hier unten? Alles wie immer. Das ist der Vorteil, wenn man ganz unten ist. Man kann nicht fallen. Nur feucht werden.', 'signatur')],
    },
    {
      id: 'epilog', when: EPILOG_FREI, taeglich: true,
      gruss: [G('Ehrenbürger! Wir haben eine Bücherei! Unten! Die Bibliothekarin ist geblieben. Sie sagt, es ist hier ruhiger als oben. Und die Ratten blättern vorsichtiger als Studenten.', 'freude')],
    },
    {
      id: 'akt3', when: AKT3_NACHT,
      gruss: [G('Heute Nacht sind alle Gullys offen. Alle. Wer von oben fliehen muss, fällt bei uns weich. Auf Schlamm. Aber weich.', 'besorgt')],
    },
    {
      id: 'party', when: PARTY_VORB, taeglich: true,
      gruss: [G('Eine Party im Turm. Ohne Einladung für den Bürgermeister. Typisch. Die Oberstadt lädt nie das Kanalvolk ein. Dabei fließt ihr ganzer Champagner am Ende zu uns.', 'wut')],
    },
    {
      id: 'gerettet', when: alle(COUNTDOWN_DONE, { notFlag: 'epilog' }), einmal: true,
      gruss: [G('Die Laute ist zurück! Das Kanalvolk hat getanzt. Im Wasser. Das ist schwerer, als es aussieht. Zwei sind abgetrieben. Wir haben sie wiedergefunden. Beim Rechen.', 'freude')],
    },
    {
      id: 'nyra', when: NYRA_WEG, taeglich: true,
      gruss: [G('Wir horchen an den neuen Rohren. Manchmal klopft es von innen. Dreimal kurz, dreimal lang. Das ist kein Wasser. Das ist jemand, der um Hilfe bittet.', 'besorgt')],
    },
    {
      id: 'chip', when: ARIA_GECHIPPT, taeglich: true,
      gruss: [G('Die Laute aus deiner Crew war hier unten. Gechippt. Sie hat gelächelt und gesagt, wir sollen „produktiver“ sein. Die Ratten haben gefaucht. Die Ratten fauchen nie.', 'trauer')],
    },
    {
      id: 'akt2', when: AKT2_NUR, taeglich: true,
      gruss: [G('Willkommen, Ehrenbürger! Der Stadtrat tagt gerade. Also, ich und der Toaster. Thema: Wie halten wir die Chips aus dem Kanal raus. Vorschlag des Toasters: verbrennen. Ich bin dafür.', 'signatur')],
    },
  ]);
}
