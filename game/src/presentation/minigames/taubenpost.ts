// akt-taubenpost: Opa Gurrmanns Taubendrohnen-Post. Keine Spielmechanik: Empfänger wählen (nur bekannte Figuren), Ton wählen,
// Taube fliegt los. Zusatzeffekte: { relation: <id>, delta: 10 } und { setFlag: 'taubenpost-an-<id>' }.
// Flirtige Briefe nur an Figuren mit offener Romanze ({ romance: id }), nie an Kinder. Die 1×-pro-Tag-Regel prüft der Inhalt.
import type { NpcId } from '../../modules/contracts';
import { h } from '../dom/dom';
import { choose, speaker } from './kit';
import type { MinigameDef } from './types';

const RECIPIENTS: { id: NpcId; name: string; kid?: boolean }[] = [
  { id: 'hunter', name: 'Hunter' }, { id: 'raven', name: 'Raven' }, { id: 'dante', name: 'Dante' }, { id: 'vega', name: 'Vega' },
  { id: 'aria', name: 'Aria' }, { id: 'nyra', name: 'Nyra' }, { id: 'jimmy', name: 'Jimmy' },
  { id: 'collin-charleston', name: 'Collin Charleston' }, { id: 'delya-delloraine', name: 'Delya Delloraine' },
  { id: 'kiki-karbon', name: 'Kiki Karbon' }, { id: 'lio-funkel', name: 'Lio Funkel' }, { id: 'barkeeper', name: 'Der Barkeeper' },
  { id: 'ripper', name: 'Ripper' }, { id: 'babette-bao', name: 'Babette Bao' }, { id: 'mutter-bruehe', name: 'Mutter Brühe' },
  { id: 'opa-gustav', name: 'Opa Gustav' }, { id: 'oma-volt', name: 'Oma Volt' },
  { id: 'daria', name: 'Daria', kid: true }, { id: 'freya', name: 'Freya', kid: true }, { id: 'jakko', name: 'Jakko', kid: true },
];

type Tone = 'nett' | 'frech' | 'flirt';
const LETTERS: Record<Tone, (name: string) => string> = {
  nett: (name) => `${name}, nur kurz: Du bist eine von den Guten. Pass auf dich auf da draußen. Die Taube wartet nicht auf Antwort, also antworte persönlich.`,
  frech: (name) => `${name}, du alte Abrissbirne. Hab an dich gedacht. Nur kurz. Bild dir bloß nix drauf ein. Die Taube hat übrigens gesagt, du riechst.`,
  flirt: (name) => `${name}. Ich hab heute Nacht an dich gedacht, und es war nicht jugendfrei. Mehr steht hier nicht. Den Rest erzähl ich dir ins Ohr.`,
};

export const taubenpost: MinigameDef = {
  title: 'Taubendrohnen-Post',
  blurb: 'Opa Gurrmann streichelt eine Taubendrohne, die leise surrt. „Schreib, wem du willst. Hilde fliegt überall hin. Außer zur Oberstadt. Da ist sie allergisch.“',
  controls: ['Empfänger wählen: antippen oder 1–9, Pfeile + Leertaste', 'Dann den Ton des Briefs wählen'],
  bonuses: () => ['Ein Brief am Tag bringt +10 Herzpunkte aus der Ferne.'],
  async run(host, ctx) {
    const known = RECIPIENTS.filter((r) => ctx.has({ met: r.id }));
    const desk = h('div', { class: 'tp-desk' });
    const opa = speaker('tp-opa', 'Opa Gurrmann');
    const list = h('div', { class: 'tp-list' });
    desk.append(h('div', { class: 'tp-loft' }, h('i', { class: 'tp-dove' })), h('p', { class: 'tp-ask' }, 'An wen geht der Brief?'), list, opa.el);
    host.stage.append(h('div', { class: 'tp-wrap' }, desk));
    if (!known.length) {
      opa.say('Du kennst ja noch keinen, Kindchen. Geh erst mal raus und red mit Leuten.');
      host.summary('Kein Empfänger. Hilde guckt beleidigt.');
      await host.wait(2600);
      return false;
    }
    opa.say('Hilde ist bereit. Sie hat gefrühstückt. Schrauben.');
    const shown = known.slice(0, 9);
    const target = shown[await choose(host, list, shown.map((r) => r.name), 'tp-name')];

    const flirt = !target.kid && ctx.has({ romance: target.id });
    const tones: Tone[] = target.kid ? ['nett', 'frech'] : flirt ? ['nett', 'frech', 'flirt'] : ['nett', 'frech'];
    const toneLabels: Record<Tone, string> = { nett: 'Herzlich', frech: 'Frech', flirt: 'Flirtig' };
    list.textContent = '';
    (desk.querySelector('.tp-ask') as HTMLElement).textContent = `Brief an ${target.name}. Welcher Ton?`;
    const tone = tones[await choose(host, list, tones.map((t) => toneLabels[t]), 'tp-tone')];

    const vexAria = target.id === 'aria' && tone === 'flirt' && ctx.has({ playerIs: 'vex' });
    const text = vexAria
      ? 'Zöpfe. Dein Kronkorken klebt noch. Ich auch – an dem Gedanken an dich, und der ist ziemlich unanständig. Heute Nacht, Dach überm Taubenschlag. Komm nicht zu spät, ich halt nicht gern an. Für dich schon. – V.'
      : LETTERS[tone](target.name);
    list.textContent = '';
    (desk.querySelector('.tp-ask') as HTMLElement).textContent = '';
    desk.append(h('div', { class: 'tp-letter' }, text));
    const dove = desk.querySelector('.tp-dove') as HTMLElement;
    dove.classList.add('fly');
    ctx.sfx('page');
    opa.say(tone === 'flirt' ? 'Uiuiui. Hilde wird rot. Und sie ist aus Blech.' : tone === 'frech' ? 'Hehe. Den Schnabel hat sie von mir.' : 'Hilde fliegt. Liebe Grüße kommen immer an.');
    host.extra({ relation: target.id, delta: 10 }, { setFlag: `taubenpost-an-${target.id}` });
    host.summary(`Brief an ${target.name} (${toneLabels[tone].toLowerCase()}) ist unterwegs. ${target.name} ♥ +10`);
    await host.wait(2200);
    return true;
  },
};
