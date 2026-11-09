// job-tuersteher · Türsteherdienst ab Rang 2 (world.md §6.6): 21:00–01:00 an der HV-Tür nach Hunters Regel des Tages.
// Vier Fälle: übermüdeter Stammgast `[Ausstrahlung 4]`, Rempler `[Körper 5]`, gefälschte VIP-Karte `[Technik 4]`/`[Straße 4]`,
// Collin „undercover“. Jeder Fall hat einen Weg ohne Check. JobKind kennt keinen Türsteher: läuft als 'eskorte' (Lücke).
import type { JobTemplateDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { fertig, vorlage, zielSpot, zusatz } from './_auftrag';
import { L, N, P, abRang, all, byId, c, chk, cr, dlg, job, node, rel, time, zeit } from './_lib';

const J = 'job-tuersteher';
const ZIEL = { map: 'neon-gasse', spot: 'hv-eingang', label: 'High Voltage, Eingang' };
const BR = 'bruno-brecher';
const CO = 'collin-charleston';

const tpl: JobTemplateDef = vorlage({
  id: J, kind: 'eskorte', title: 'Türsteherdienst: {ziel}',
  text: 'Von 21 bis 1 Uhr an der Tür. Hunters Regel des Tages: „Heute keine Sonnenbrillen nach Mitternacht.“ Bruno hat frei, aber Bruno ist trotzdem da. {credits} Cr plus Trinkgeld.',
  boards: ['auftragstafel'], when: abRang(2), targets: [{ map: ZIEL.map, label: ZIEL.label }],
  reward: { credits: [90, 110], xp: 60, rep: { 'crew-hunter': 3 } },
});

const tuer = dlg('pj-tuersteher', [
  node('start', [
    L(BR, 'Du bist heute die Tür. Ich bin heute die Wand. Wenn du nicht weiterweißt: Wand fragen.', 'signatur'),
    N('Neonlicht, Bass durch die Tür, eine Schlange bis zum Kiosk. Der erste Gast schwankt heran.'),
  ], { choices: [c('Schicht anfangen.', 'stammgast'), c('Später.')] }),
  node('stammgast', [N('Ein Stammgast, drei Tage wach, Augenringe bis zum Kinn. „Lass mich rein. Ich muss nur kurz … schlafen. Auf der Tanzfläche.“')], {
    choices: [
      c('„Geh nach Hause, Kumpel. Morgen bist du wieder König. Heute bist du Matsch.“', 'rempler', { check: chk('tuer-stammgast', 'ausstrahlung', 4, ['ueberreden']) }),
      c('Kiki rufen, ihm ein Taxi bestellen und ihm einen Kaffee in die Hand drücken.', 'rempler', { effects: [cr(-5)] }),
    ],
  }),
  node('rempler', [N('Ein Zwei-Meter-Typ drängelt sich vor, rammt dir die Schulter in die Brust. „Ich bin VIP. Very Important Prügler.“')], {
    choices: [
      c('Zurückrammen. Er wackelt. Du nicht.', 'vip', { check: chk('tuer-rempler', 'koerper', 5, ['einschuechtern']) }),
      c('Einen Schritt zur Seite. Bruno übernimmt.', 'bruno'),
    ],
  }),
  node('bruno', [N('Bruno legt ihm eine Hand auf die Schulter. Nur die Hand. Der Typ geht. Freiwillig. Sehr schnell.'), L(BR, 'Wand.', 'signatur')], { next: 'vip' }),
  node('vip', [N('Eine Frau mit Federboa wedelt mit einer glänzenden Karte: „VIP. Platin. Unbegrenzt.“ Das Hologramm zeigt ein Einhorn. Hunters Karten zeigen einen Hai.')], {
    choices: [
      c('Die Karte gegen das Licht halten und den Chip prüfen.', 'gefaelscht', { check: chk('tuer-vip-technik', 'technik', 4, ['elektronik']) }),
      c('„Wer hat dir die verkauft? Wett-Willi? Der verkauft auch Glück in Tüten.“', 'gefaelscht', { check: chk('tuer-vip-strasse', 'strasse', 4, ['geruecht']) }),
      c('„Kein Hai, kein Einlass.“', 'gefaelscht'),
    ],
  }),
  node('gefaelscht', [N('Die Federboa schnaubt, zieht ab und nimmt zwei Federn weniger mit, als sie gebracht hat. Kurz vor Mitternacht nähert sich jemand mit Sonnenbrille, Schnurrbart aus Filz und viel zu bekanntem Lächeln.')], {
    next: 'collin',
  }),
  node('collin', [L(CO, 'Pssst. Ich bin nicht Collin Charleston. Ich bin … Colin Charlston. Ganz anderer Mensch. Undercover für eine Reportage.', 'freude')], {
    choices: [
      c('„Sonnenbrille ab. Hunters Regel. Dann darfst du rein, Colin.“', 'collin-rein', { effects: [rel(CO, 10)] }),
      c('„Kein Einlass für Leute, die keine Leute sind.“', 'collin-raus'),
    ],
  }),
  node('collin-rein', [L(CO, 'Ohne Brille erkennt mich doch jeder! … Na gut. Für die Wahrheit.', 'verlegen'), N('Drinnen erkennt ihn jeder. Er gibt elf Autogramme. Die Reportage heißt jetzt „Undercover im Rampenlicht“.')], { next: 'ende' }),
  node('collin-raus', [L(CO, 'Das ist investigativer Journalismus! Das ist … okay, ich komm morgen wieder. Als jemand anderes.', 'wut')], { next: 'ende' }),
  node('ende', [N('Um eins schließt Bruno die Tür, zählt das Trinkgeld und schiebt dir die Hälfte rüber.'), L(BR, 'Gute Tür.', 'signatur'), P('Gute Wand.')], {
    effects: [zeit(240), cr(25), fertig(J)],
  }),
]);

export const part: ContentPart = {
  jobs: byId(tpl),
  dialogues: byId(tuer),
  mapAdditions: zusatz([zielSpot('pj-tuersteher', ZIEL, 'Türsteherdienst antreten', tuer.id, all(job(J), time('abend', 'nacht')), 50, 20)]),
};
