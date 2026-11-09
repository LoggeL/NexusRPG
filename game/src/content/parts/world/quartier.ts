// Crew-Quartier-Ausbau (world.md §3.7). Die Stufen 0–3 baut das Paket pkg-neon-gasse in parts/maps/crew-quartier.ts
// als Flag-Kette (quartier_stufe_1..3, Dialog cq-ausbau am Hotspot „Quartier ausbauen“). Hier nur die Wege dorthin:
// Captain Kuschel meldet sich per Telefon, sobald eine Stufe bezahlbar ist, und die Crew reagiert auf den Ausbau.
// Stufen 4–6 (Gästecouch, Dachgarten, Aussicht) folgen ab Akt 2 (gaps/world.md).
import type { PhoneMessageDef } from '../../../modules/contracts';
import type { ContentPart } from '../../part';
import { all, byId, done, flag, herz, msg, not, sms } from './_w';

const S1 = flag('quartier_stufe_1');
const S2 = flag('quartier_stufe_2');
const S3 = flag('quartier_stufe_3');
const PROBEZEIT = done('main-1-probezeit');

const phone: PhoneMessageDef[] = [
  sms('tel-kuschel-pinnwand', 'captain-kuschel',
    'Dein Container sieht aus wie ein Wartezimmer beim Zahnarzt. 150 Credits, und ich häng dir eine Pinnwand auf. Mit Reißzwecken. Echten. – C. K.',
    all(PROBEZEIT, not(S1), { credits: 150 }), [
      { text: 'Bin unterwegs. (Quartier, Hotspot „Quartier ausbauen“)' },
      { text: 'Seit wann kannst du schreiben?', effects: [msg('Captain Kuschel: Seit wann kannst du lesen? – C. K.')] },
    ]),
  sms('tel-kuschel-plattenspieler', 'captain-kuschel',
    'Drei Platten hast du. Der Plattenspieler unter der Plane hat Sehnsucht. Ich auch. Nach Ruhe. Mach Musik, dann hör ich dich nicht atmen. – C. K.',
    all(S1, not(S2), done('side-schallplatten'))),
  sms('tel-kuschel-werkbank', 'captain-kuschel',
    '400 Credits und fünf Ersatzteile. Ich riech das von hier. Werkbank? Werkbank. Ich hab schon Schraubstock gesagt, jetzt musst du auch. – C. K.',
    all(S2, not(S3), { credits: 400 }, { item: 'schrott-ersatzteil', min: 5 })),
  sms('tel-chat-pinnwand', 'crew-chat',
    'Vega: Du hast eine Pinnwand? Mit Fäden? Rote Fäden? – Aria: wieso hat der neuzugang eine pinnwand und ich nicht mal einen nagel in der wand – Hunter: Du hast keinen Nagel, weil du die Wand eingeschlagen hast. – Vega: Ich komm vorbei und häng was Sinnvolles dran.',
    all(S1, PROBEZEIT), [{ text: 'Bring Fäden mit.', effects: [herz('vega', 10)] }]),
  sms('tel-chat-werkbank', 'crew-chat',
    'Dante: DU HAST EINE WERKBANK??? – Dante: darf ich – Dante: nur kurz – Dante: ich bring kekse – Raven: Lass ihn nicht. Er baut dir einen Toaster, der zurückspricht.',
    S3, [
      { text: 'Komm vorbei, Dante.', effects: [herz('dante', 15)] },
      { text: 'Nur mit Keksen.', effects: [herz('dante', 10), msg('Dante: ICH HAB IMMER KEKSE')] },
    ]),
];

export const part: ContentPart = {
  phone: byId(phone),
};
