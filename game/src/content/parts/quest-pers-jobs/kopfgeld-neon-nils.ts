// kopfgeld-neon-nils · Stufe 2 (world.md §6.7): klebt Fake-Werbung über Leuchtreklamen. Neon-Gasse, Dächer, nachts.
// Wege: `[Technik 6]` Netz zurückverfolgen, über die Dächer schleichen (ohne Check), `[Ausstrahlung 6]` Selbstanzeige, Kampf.
import type { ContentPart } from '../../part';
import { zusatz } from './_auftrag';
import { type Kopfgeld, kgId, vorlageKopfgeld, zielDialog, zielHotspot } from './_kopfgeld';
import { N, P, time, zeit } from './_lib';

export const ziel: Kopfgeld = {
  key: 'neon-nils', name: 'Neon-Nils', stufe: 2, map: 'neon-gasse', spot: 'dachterrasse', ortLabel: 'Neon-Gasse, auf den Dächern, nachts',
  wann: time('nacht'), encounter: 'enc-kopfgeld-neon-nils',
  steckbrief: 'Hackt Leuchtreklamen und lässt sie Dinge sagen wie „QUANTUM LIEBT DICH (NICHT)“. Quantum hat das Kopfgeld gestellt. Persönlich beleidigt.',
  auftritt: [N('Über der Neon-Gasse flackert eine Reklame: „DIGITECH – WIR WISSEN, WAS DU LETZTEN SOMMER GEKAUFT HAST“. Auf dem Dach daneben: ein Schatten mit Laptop und Kleistereimer.')],
  wege: [
    { text: 'Das Reklamesignal bis zu seinem Laptop zurückverfolgen und ihm den Bildschirm einfrieren.', check: ['technik', 6, ['hacken', 'netz']], ergebnis: 'gestellt',
      zeilen: [N('Sein Bildschirm zeigt plötzlich deine Botschaft: „HINTER DIR.“ Er dreht sich um. Du bist hinter ihm.'), P('Gute Werbung wirkt.')] },
    { text: 'Leise über die Feuerleiter, Dach für Dach, bis du hinter ihm stehst.', effects: [zeit(60)], ergebnis: 'gestellt',
      zeilen: [N('Eine Stunde Dachpappe, Taubenkot und ein Schornstein, der dich fast verrät. Dann legst du ihm die Hand auf die Schulter. Nils lässt den Kleister fallen. Er landet auf einem Ordnungsdienst-Auto.')] },
    { text: '„Deine Plakate sind Kunst. Zeig sie dem Richter. Er hasst Quantum mehr als du.“', check: ['ausstrahlung', 6, ['ueberreden']], ergebnis: 'selbst',
      zeilen: [N('Nils klappt den Laptop zu. „Kunst. Endlich sagt’s einer.“ Er stellt sich. Im Gericht hängt am nächsten Morgen eine Leuchtschrift: „FREISPRUCH FÜR DIE KUNST“. Der Richter lässt sie hängen. Eine Woche.')] },
  ],
  kampfText: 'Aufs Dach springen. Die Lichter gehen aus.',
  info: [N('„Der Werbestand in der Neon-Gasse ist Quantums Abhörzentrale. Jede Reklame hier hat ein Mikro. Ich überkleb nicht die Werbung. Ich überkleb die Ohren.“')],
  abgabe: 'Nils pfeift beim Abliefern. Auf dem Bildschirm des Kopfgeldterminals steht für eine Sekunde „DANKE, SCHATZ“. Dann der Beleg.',
};

export const part: ContentPart = {
  jobs: { [kgId(ziel)]: vorlageKopfgeld(ziel) },
  dialogues: { [`pj-kg-${ziel.key}`]: zielDialog(ziel) },
  mapAdditions: zusatz([zielHotspot(ziel)]),
};
