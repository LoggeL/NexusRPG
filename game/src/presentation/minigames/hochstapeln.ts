// akt-hochstapeln: Gesprächskette als reiche Person auf dem `chrome-boulevard` (world.md §3.9). 5–7 Begegnungen, je eine
// Antwort unter Zeitdruck; „Tarnung“ steigt und fällt, manche Antworten bringen Trinkgeld oder Klatsch. Fallen (Yachtclub in
// Sektor 4, Taschendiebin) erkennt man mit Straße. Ausstrahlung: mehr Zeit, mehr Tarnung, mehr Trinkgeld. Straße 5+: Fallen
// markiert, 7+: Trinkgeld-Antworten markiert. Zusatzeffekte: `{ credits }` (Trinkgeld, immer), Klatsch über die Einladungen
// `{ setFlag: 'klatsch-chrome-einladung' }` (Hinweis auf `chrome-einladung`).
import type { Effect } from '../../modules/contracts';
import { h } from '../dom/dom';
import { ending, speaker } from './kit';
import { chooseTimed } from './kit3';
import type { MinigameDef } from './types';
import { byLevel, clamp, pick, shuffle } from './util';

interface Answer { text: string; tarn: number; tip?: number; klatsch?: string; flag?: string; reply: string }
interface Meet { who: string; line: string; trap?: string; answers: Answer[] }

const MEETS: Meet[] = [
  { who: 'Portier Albert', line: 'Guten Tag. Sie wohnen hier?', answers: [
    { text: '„Penthouse, Ostflügel. Albert, nicht wahr? Man hat mir von Ihnen erzählt.“', tarn: 15, reply: 'Albert verbeugt sich einen Millimeter tiefer als nötig.' },
    { text: '„Nee, ich such nur ’n Klo.“', tarn: -25, reply: 'Albert: „Die Unterstadt hat sicher ganz entzückende Gullys.“' },
    { text: '„Ich wohne überall, wo man mich lässt.“', tarn: 5, tip: 10, reply: 'Albert schmunzelt und steckt dir einen Gutschein fürs Café zu. Er hat Humor. Wer hätte das gedacht.' }] },
  { who: 'Juwelier Glanzstück', line: 'Darf ich Ihnen dieses Collier zeigen? Ein Schnäppchen. 40 000.', answers: [
    { text: '„Zu klein. Haben Sie das auch in angemessen?“', tarn: 15, klatsch: 'Der Juwelier verkauft Blade seit Monaten „Diamanten“ aus Quantum-Glas.', reply: 'Glanzstück wird blass und flüstert dir etwas über seine besten Kunden zu.' },
    { text: '„Ich nehm’s! … Geht auch Ratenzahlung?“', tarn: -20, reply: 'Das Wort „Raten“ fällt auf den Boulevard wie eine tote Taube.' },
    { text: '„Das ist Glas, mein Lieber. Ich seh’s am Schliff.“', tarn: 10, tip: 40, reply: 'Glanzstück drückt dir 40 Credits in die Hand. „Für Ihre … Diskretion.“' }] },
  { who: 'Herr Glanz', trap: 'Den Yachtclub in Sektor 4 gibt es nicht. Das ist ein Test.', line: 'Sie kennen doch sicher den Yachtclub in Sektor 4?', answers: [
    { text: '„Natürlich. Ich bin seit Jahren Mitglied.“', tarn: -25, reply: 'Herr Glanz: „Ha! Den gibt es gar nicht! Hochstapler!“ Mehrere Köpfe drehen sich.' },
    { text: '„Sektor 4? Da ankert man nicht mehr, seit die Algen singen.“', tarn: 15, klatsch: 'Herr Glanz testet jeden Neuen mit dem Yachtclub. Wer drauf reinfällt, landet auf Sybellas schwarzer Liste.', reply: 'Herr Glanz lacht anerkennend: „Sie gefallen mir. Endlich jemand mit Weltkenntnis.“' },
    { text: '„Yacht? Ich hab ein Floß. Aus Ölfässern.“', tarn: -10, tip: 15, reply: 'Er hält das für einen Witz und gibt dir Trinkgeld für die Pointe.' }] },
  { who: 'Madame Pompadura', line: 'Würden Sie kurz auf Fifi aufpassen? Er ist ein Pudel. Aus Titan.', answers: [
    { text: '„Mit Vergnügen. Fifi und ich verstehen uns.“', tarn: 5, tip: 40, reply: 'Fifi beißt dich nur einmal. Madame zahlt fürs Aufpassen, als wärst du eine Kita.' },
    { text: '„Ich fress Hunde zum Frühstück, Lady.“', tarn: -20, reply: 'Madame Pompadura kreischt so hoch, dass die Glasfassaden vibrieren.' },
    { text: '„Mein Personal übernimmt so etwas.“', tarn: 12, reply: 'Madame nickt verständnisvoll. „Natürlich. Wie dumm von mir.“' }] },
  { who: 'Ein Kellner vom Café Sahnehaube', line: 'Ihre Rechnung, bitte. 380 Credits.', answers: [
    { text: '„Aufs Zimmer. Wie immer.“', tarn: 12, reply: 'Der Kellner zögert, dann nickt. Irgendwer im Penthouse zahlt jetzt deinen Cappuccino.' },
    { text: '„Schreiben Sie’s Blade Nocturne an. Er schuldet mir was.“', tarn: 8, klatsch: 'Blade lässt im Café anschreiben und zahlt nie. Die Kellner hassen ihn leise.', reply: 'Der Kellner lacht bitter. „Dem schreiben wir sowieso alles an.“' },
    { text: 'Rennen.', tarn: -30, reply: 'Du rennst. In der Oberstadt rennt niemand. Alle starren.' }] },
  { who: 'Eine Klatschbase mit Hut', line: 'Haben Sie schon gehört, wer zur Releaseparty kommt?', answers: [
    { text: '„Natürlich. Ich stehe auf der Liste. Sie etwa nicht?“', tarn: 10, flag: 'klatsch-chrome-einladung', klatsch: 'Die Einladungen auf Büttenpapier liegen in Alberts Portierloge, bis er sie persönlich verteilt.', reply: 'Die Klatschbase verrät dir beleidigt, wo die Einladungen liegen, um zu beweisen, dass sie auch eine kriegt.' },
    { text: '„Releaseparty? Ist das so ’ne Rave-Sache?“', tarn: -15, reply: '„Rave?“ Sie sagt es, als hättest du „Krätze“ gesagt.' },
    { text: '„Erzählen Sie mir lieber, wer NICHT kommt.“', tarn: 15, klatsch: 'Serenity Chrome will angeblich gar nicht zur Party. Sie hat Lampenfieber.', reply: 'Ihre Augen leuchten. Endlich jemand, der die richtigen Fragen stellt.' }] },
  { who: 'Quantum-Streife', trap: 'Wer hier nach dem Ausweis fragt, kennt die Reichen nicht. Frechheit siegt.', line: 'Ausweis, bitte.', answers: [
    { text: '„Ich bitte Sie. Rufen Sie meinen Anwalt an, er langweilt sich.“', tarn: 15, reply: 'Der Wachmann schluckt und tritt beiseite. „Schönen Tag noch, äh, Hoheit.“' },
    { text: '„Hier, mein … Bibliotheksausweis?“', tarn: -20, reply: '„Abgelaufen. Seit 2081.“' },
    { text: '„Sie sind neu, oder? Der Letzte hat das auch gefragt. Jetzt fegt er die Unterstadt.“', tarn: 10, tip: 20, reply: 'Er wird blass, entschuldigt sich und schiebt dir „für den Ärger“ 20 Credits rüber.' }] },
  { who: 'Eine Dame im Pelzmantel', trap: 'Anrempeln, entschuldigen, Brieftasche weg. Älteste Masche der Stadt.', line: 'Oh, Verzeihung! Wie ungeschickt von mir!', answers: [
    { text: '„Kein Problem, Gnädigste.“', tarn: 0, reply: 'Sie lächelt. Deine Brieftasche lächelt nicht mehr, sie ist weg. Zum Glück war sie leer.' },
    { text: 'Ihr Handgelenk greifen: „Meine Brieftasche bleibt bei mir, Schätzchen.“', tarn: 10, tip: 30, reply: 'Sie zischt, dann zahlt sie dir 30 Credits Schweigegeld. Profis unter sich.' },
    { text: '„WACHE! WACHE!“', tarn: -10, reply: 'Die Wachen kommen und kontrollieren – dich.' }] },
  { who: 'Ein Influencer mit Drohne', line: 'Darf ich ein Selfie? Sie sehen so … wichtig aus.', answers: [
    { text: '„Nur von links. Rechts ist für die Presse.“', tarn: 10, tip: 20, reply: 'Er zahlt dir 20 Credits fürs Foto. Es hat 40 000 Likes, bevor du um die Ecke bist.' },
    { text: '„Nein.“', tarn: 8, reply: 'Kalt. Arrogant. Er ist begeistert.' },
    { text: 'Grimasse schneiden, Zunge raus.', tarn: -12, reply: 'Das Bild geht viral unter „Unterstadt-Tourist auf dem Boulevard“.' }] },
];

export const hochstapeln: MinigameDef = {
  title: 'Hochstapeln',
  blurb: 'Geliehener Mantel, geborgte Haltung, null Credits. Spaziere den Chrome-Boulevard runter, als würde er dir gehören. Wer überzeugt, kriegt Trinkgeld und Klatsch. Wer auffliegt, kriegt Albert.',
  controls: ['Antwort antippen', 'Tastatur: Ziffern 1–3 oder ↑/↓ + Leertaste', 'Jede Antwort hat ihre Zeit – Zögern kostet Tarnung'],
  bonuses(ctx) {
    const s = ctx.attr('strasse');
    return [
      `Ausstrahlung ${ctx.attr('ausstrahlung')}: +${(ctx.edge('ausstrahlung') * 3).toFixed(1)} s, Tarnung +${Math.round(ctx.edge('ausstrahlung') * 50)} %, Trinkgeld +${Math.round(ctx.edge('ausstrahlung') * 100)} %`,
      `Straße ${s}: ${s >= 7 ? 'Fallen und Trinkgeld-Antworten erkennbar' : s >= 5 ? 'Fallen erkennbar' : 'keine Vorwarnung'}`,
    ];
  },
  async run(host, ctx) {
    const level = ctx.level;
    const charm = ctx.edge('ausstrahlung');
    const street = ctx.attr('strasse');
    const count = byLevel(level, [5, 5, 6, 7, 7]);
    const goal = byLevel(level, [40, 50, 55, 60, 70]);
    const time = byLevel(level, [10, 9, 8, 7, 6]) + charm * 3;

    const pool = shuffle([...MEETS]);
    if (level >= 2 && !pool.slice(0, count).some((m) => m.trap)) {
      const trapIndex = pool.findIndex((m) => m.trap);
      [pool[0], pool[trapIndex]] = [pool[trapIndex], pool[0]];
    }
    const meets = shuffle(pool.slice(0, count));

    const scene = h('div', { class: 'hs-scene' });
    const who = h('div', { class: 'hs-who' });
    const line = h('div', { class: 'hs-line' });
    const hint = h('div', { class: 'hs-hint' });
    const answers = h('div', { class: 'hs-answers' });
    const tarnFill = h('i', { class: 'hs-tarn-fill' });
    const tarnMark = h('b', { class: 'hs-tarn-goal' });
    const tarnEl = h('div', { class: 'hs-tarn' }, tarnFill, tarnMark, h('span', null, 'Tarnung'));
    const inner = speaker('hs-inner', 'Du (innerlich)');
    scene.append(tarnEl, who, line, hint, answers, inner.el);
    host.stage.append(h('div', { class: 'hs-wrap' }, scene));
    tarnMark.style.left = `${goal}%`;

    const end = ending();
    let tarn = 50, tips = 0, flagSet = false;
    const klatsch: string[] = [];
    const render = (i: number) => {
      tarnFill.style.width = `${clamp(tarn, 0, 100)}%`;
      tarnEl.classList.toggle('low', tarn < 25);
      host.setScore(`Begegnung ${Math.min(i + 1, count)}/${count}`);
      host.setInfo(`Trinkgeld ${tips} Cr`);
    };
    render(0);
    inner.say(pick(['Kinn hoch. Du bist reich. Du hast noch nie einen Gully von innen gesehen.', 'Reiche gucken nie auf den Boden. Der gehört ihnen eh.']));
    await host.wait(1200);

    for (let i = 0; i < meets.length && !end.over; i++) {
      const m = meets[i];
      who.textContent = m.who;
      line.textContent = `„${m.line}“`;
      hint.textContent = m.trap && street >= 5 ? `Straße: ${m.trap}` : '';
      answers.textContent = '';
      scene.classList.remove('enter'); void scene.offsetWidth; scene.classList.add('enter');
      const order = shuffle([...m.answers]);
      const index = await chooseTimed(host, answers, order.map((a) => h('span', null, a.text, street >= 7 && a.tip ? h('em', { class: 'hs-tip' }, ' (+Cr)') : null)), time);
      if (end.over) break;
      if (index < 0) {
        tarn -= 15; ctx.sfx('fail');
        host.pop('Gestammel!', 'bad', 50, 30);
        inner.say('Sag was. Irgendwas. … Zu spät.');
      } else {
        const a = order[index];
        const delta = a.tarn > 0 ? a.tarn * (1 + charm * 0.5) : a.tarn;
        tarn += delta;
        if (a.tip) { const t = Math.round(a.tip * (1 + charm)); tips += t; ctx.sfx('coin'); host.pop(`+${t} Cr`, 'gold', 70, 20); }
        if (a.klatsch) klatsch.push(a.klatsch);
        if (a.flag) flagSet = true;
        host.pop(delta >= 0 ? 'Überzeugend' : 'Peinlich!', delta >= 0 ? 'good' : 'bad', 50, 30);
        ctx.sfx(delta >= 0 ? 'success' : 'fail');
        inner.say(a.reply);
      }
      render(i + 1);
      if (tarn <= 0) { end.finish(false); break; }
      await host.wait(2200);
    }
    const won = tarn >= goal;
    end.finish(won);
    const extra: Effect[] = [];
    if (tips > 0) extra.push({ credits: tips });
    if (flagSet && tarn > 0) extra.push({ setFlag: 'klatsch-chrome-einladung' });
    host.extra(...extra);
    host.summary(`Tarnung ${Math.round(clamp(tarn, 0, 100))} (nötig ${goal}) · Trinkgeld ${tips} Cr`);
    for (const k of klatsch.slice(0, 3)) host.summary(`Klatsch: ${k}`);
    host.summary(won ? 'Du schlenderst vom Boulevard, als hättest du ihn gekauft. Niemand ahnt was. Nicht mal du.' : tarn <= 0 ? 'Aufgeflogen. Portier Albert hält dir die Tür zur Treppe auf: „Die Unterstadt ist da lang. Wie immer.“' : 'Keiner hat dich enttarnt, aber geglaubt hat dir auch keiner. Die Oberstadt lächelt höflich an dir vorbei.');
    return won;
  },
};
