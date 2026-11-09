// akt-fernsehen: NX1 sendet live vom Stufenplatz. Hinter Collin ins Bild drängeln, im richtigen Moment winken,
// bei ernsten Meldungen stillhalten, nicht zu oft winken (sonst schiebt dich der Kameramann raus). Danach das Kurzinterview.
// Ausstrahlung: breiterer Bildausschnitt, mehr Wirkung pro Winken, ab 7 eine glänzende Antwort im Interview.
import { h } from '../dom/dom';
import { choose, ending, relPoint, speaker } from './kit';
import type { MinigameDef } from './types';
import { byLevel, clamp, gameButton, isAction, isLeft, isRight, pick, shuffle } from './util';

const SERIOUS = ['… und nun eine traurige Nachricht aus dem Hafen.', '… wir gedenken der Opfer des Rohrbruchs.', '… Quantum dementiert jede Beteiligung. Wie immer.'];
const CHEERFUL = ['Guten Tag, Unterstadt! Hier ist Collin Charleston, live und in Farbe!', 'Das Wetter: Rostregen ab sechs. Nehmt einen Schirm. Oder eine Plane.', 'Und jetzt zu den Nachrichten, die euch wirklich interessieren: mir!'];

interface Answer { text: string; score: number; reply: string }
const QUESTIONS: { q: string; answers: Answer[]; shine: Answer }[] = [
  { q: 'Sie da! Ja, Sie mit dem Gesicht! Was sagen Sie zur Lage in der Unterstadt?',
    answers: [
      { text: 'Die Lage? Liegt. Wie wir alle, seit Quantum drauf sitzt.', score: 3, reply: 'Hah! Schneiden Sie das NICHT raus!' },
      { text: 'Äh. Gut? Glaub ich. Hallo Mama.', score: 1, reply: 'Grüße an Mama. Rührend. Weiter.' },
      { text: 'Collin, du hast da Spinat zwischen den Zähnen.', score: -1, reply: '… Werbung! Wir gehen in die Werbung!' },
    ],
    shine: { text: 'Die Unterstadt ist wie Ihre Frisur, Collin: zusammengehalten von Willenskraft und Haarspray.', score: 4, reply: 'Ich … liebe es. Ich hasse es. Ich liebe es!' } },
  { q: 'Und was wünschen Sie sich für die Zukunft?',
    answers: [
      { text: 'Dass einer mal den Smog abstellt. Ich will die Sterne sehen.', score: 3, reply: 'Poetisch! Die Zuschauer weinen. Ich auch, aber das ist der Smog.' },
      { text: 'Mehr Geld. Weniger Ratten. In der Reihenfolge.', score: 2, reply: 'Ein Mensch des Volkes. Applaus!' },
      { text: 'Deine Nummer, Collin.', score: 0, reply: 'Die gibt’s nur gegen Quittung, Liebling.' },
    ],
    shine: { text: 'Dass Leute wie Sie wieder die Wahrheit senden. Und dass Sie mich dabei gut aussehen lassen.', score: 4, reply: 'Wahrheit UND Schmeichelei? Sie sind gefährlich. Ich mag gefährlich.' } },
  { q: 'Ein Satz an die Oberstadt, live, unzensiert!',
    answers: [
      { text: 'Wir sehen euch. Von unten sieht man euch richtig gut. Vor allem die Doppelkinne.', score: 3, reply: 'Oh, das gibt Ärger. Wunderbar!' },
      { text: 'Hallo da oben. Werft mal was runter.', score: 1, reply: 'Kurz, knackig, bettelnd. Sehr Unterstadt.' },
      { text: 'Ich … hab den Satz vergessen.', score: -1, reply: 'Live-Fernsehen, meine Damen und Herren! Gnadenlos!' },
    ],
    shine: { text: 'Ihr baut Türme, wir bauen Leitern. Ratet mal, wer schneller ist.', score: 4, reply: 'Das kommt in die Abendausgabe. Mit Zeitlupe.' } },
];

export const fernsehen: MinigameDef = {
  title: 'Live hinter Collin',
  blurb: 'Collin Charleston moderiert live vom Stufenplatz, der Kameramann schwenkt, die halbe Unterstadt drängelt ins Bild. Bleib drin, wink im richtigen Moment – und benimm dich, wenn’s ernst wird.',
  controls: ['←/→ oder A/D, Maus/Finger: im Bild bleiben', 'Leertaste/„Winken“: winken, wenn LIVE leuchtet', 'Bei „ERNST“ nicht winken; zu viel Winken = rausgeschoben', 'Interview: 1–4 oder antippen'],
  bonuses(ctx) {
    const lines = [`Ausstrahlung ${ctx.attr('ausstrahlung')}: Bildausschnitt +${Math.round(ctx.edge('ausstrahlung') * 40)} %, Winken wirkt +${Math.round(ctx.edge('ausstrahlung') * 60)} %`];
    if (ctx.attr('ausstrahlung') >= 7) lines.push('Ausstrahlung 7+: Du findest im Interview die perfekte Antwort.');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const charm = ctx.edge('ausstrahlung');
    const need = byLevel(level, [24, 30, 36, 42, 48]);
    const frameW = byLevel(level, [30, 27, 24, 21, 18]) * (1 + charm * 0.4);
    const panSpeed = byLevel(level, [14, 17, 20, 23, 26]);
    const waveGain = 2 * (1 + charm * 0.6);
    const spamLimit = byLevel(level, [6, 5, 5, 4, 4]);
    const phaseOne = 35;

    const plaza = h('div', { class: 'tv-plaza' });
    const frame = h('div', { class: 'tv-frame' }, h('span', { class: 'tv-tally' }, 'LIVE'));
    const collin = h('div', { class: 'tv-collin' });
    const you = h('div', { class: 'tv-you' });
    const crowd = h('div', { class: 'tv-crowd' });
    for (let i = 0; i < 9; i++) { const p = h('i', null); p.style.left = `${4 + i * 11 + Math.random() * 4}%`; crowd.append(p); }
    const voice = speaker('tv-voice', 'Collin');
    plaza.append(crowd, frame, collin, you, voice.el);
    const waveButton = gameButton('WINKEN', () => wave(), 'mg-big');
    host.stage.append(h('div', { class: 'tv-wrap' }, plaza), h('div', { class: 'mg-toolbar' }, waveButton));

    const end = ending();
    let x = 30, targetX: number | null = null, leftHeld = false, rightHeld = false;
    let camX = 50, camTarget = 50, camTimer = 0;
    let airtime = 0, hype = 0, spam = 0, shoved = 0, blunders = 0;
    let serious = 0, nextMood = 6 + Math.random() * 4;
    let stun = 0, t = 0;
    voice.say(pick(CHEERFUL));

    const inFrame = () => Math.abs(x - camX) <= frameW / 2;
    const wave = () => {
      if (end.over || stun > 0 || t >= phaseOne) return;
      you.classList.remove('wave'); void you.offsetWidth; you.classList.add('wave');
      spam += 1;
      if (serious > 0 && inFrame()) {
        blunders++; hype = Math.max(0, hype - 4);
        ctx.sfx('fail');
        host.pop('Pietätlos! −4', 'bad', x, 40);
        voice.say('… Wer winkt da bei einer Trauermeldung?! Kamera weg von dem Idioten!');
        return;
      }
      if (spam > spamLimit) {
        shoved++; stun = 2; spam = 0;
        x = clamp(x + (x < camX ? -25 : 25), 4, 96);
        ctx.sfx('hurt');
        host.pop('Rausgeschoben!', 'bad', x, 40);
        voice.say(pick(['Kann mal jemand den Winkeaffen entfernen?', 'Security! Der Mensch da hat einen Krampf im Arm!']));
        return;
      }
      if (inFrame()) {
        hype += waveGain;
        ctx.sfx('heart-up');
        host.pop(`+${Math.round(waveGain)}`, 'gold', x, 40);
      } else host.pop('Keiner sieht’s', 'info', x, 40);
    };

    plaza.addEventListener('pointerdown', (event) => { event.preventDefault(); targetX = relPoint(event, plaza).x; });
    plaza.addEventListener('pointermove', (event) => { if (event.pointerType === 'mouse' || event.buttons) targetX = relPoint(event, plaza).x; });
    host.onKey((event, down) => {
      if (isLeft(event.code)) { leftHeld = down; if (down) targetX = null; }
      else if (isRight(event.code)) { rightHeld = down; if (down) targetX = null; }
      else if (isAction(event.code) && down && !event.repeat) wave();
    });

    host.frame((dt) => {
      if (end.over) return false;
      t += dt;
      if (t >= phaseOne) { end.finish(true); return false; }
      stun = Math.max(0, stun - dt);
      spam = Math.max(0, spam - dt * 0.7);
      if (stun <= 0) {
        if (targetX !== null) x += clamp(targetX - x, -40 * dt, 40 * dt);
        else x += ((rightHeld ? 1 : 0) - (leftHeld ? 1 : 0)) * 40 * dt;
      }
      x = clamp(x, 4, 96);
      camTimer -= dt;
      if (camTimer <= 0) { camTimer = 1.5 + Math.random() * 2.5; camTarget = 15 + Math.random() * 70; }
      camX += clamp(camTarget - camX, -panSpeed * dt, panSpeed * dt);
      // Stimmung: ab und zu eine ernste Meldung
      nextMood -= dt;
      if (nextMood <= 0 && serious <= 0) { serious = 3.2; nextMood = 7 + Math.random() * 5; voice.say(pick(SERIOUS)); ctx.sfx('alarm'); }
      if (serious > 0) { serious -= dt; if (serious <= 0) voice.say(pick(['Und nun wieder gute Laune!', 'Genug geweint. Zum Sport!', 'Weiter im Text, Leute, die Werbung zahlt nicht fürs Schweigen.'])); }
      const seen = inFrame();
      if (seen && stun <= 0) airtime += dt * (serious > 0 ? 0.5 : 1);
      frame.style.left = `${camX}%`;
      frame.style.width = `${frameW}%`;
      frame.classList.toggle('serious', serious > 0);
      (frame.firstChild as HTMLElement).textContent = serious > 0 ? 'ERNST' : 'LIVE';
      collin.style.left = `${clamp(camX + frameW * 0.18, 5, 95)}%`;
      you.style.left = `${x}%`;
      you.classList.toggle('seen', seen);
      you.classList.toggle('stun', stun > 0);
      const score = Math.round(airtime + hype);
      host.setScore(`Sendezeit ${score}/${need}`);
      host.setInfo(stun > 0 ? 'Weggeschubst!' : seen ? 'Im Bild!' : 'Nicht im Bild');
      return true;
    });
    const clock = host.countdown(phaseOne);
    await end.done;
    clock.stop();

    // Interview
    waveButton.remove();
    let interview = 0;
    const score1 = Math.round(airtime + hype);
    if (score1 >= need * 0.6) {
      host.setInfo('Interview!');
      plaza.classList.add('interview');
      const box = h('div', { class: 'tv-interview' });
      host.stage.append(box);
      const qs = shuffle([...QUESTIONS]).slice(0, 2);
      for (const q of qs) {
        box.textContent = '';
        box.append(h('div', { class: 'tv-q' }, h('b', null, 'Collin: '), q.q));
        const row = h('div', { class: 'tv-answers' });
        box.append(row);
        const answers = shuffle([...q.answers]);
        if (ctx.attr('ausstrahlung') >= 7) answers.push(q.shine);
        const timer = host.wait(7000).then(() => -1);
        const index = await Promise.race([choose(host, row, answers.map((a) => a.text)), timer]);
        const a = index >= 0 ? answers[index] : { text: '', score: -1, reply: 'Hallo? Ist das Ding an? … Zum Wetter.' };
        interview += a.score;
        voice.say(a.reply);
        ctx.sfx(a.score >= 3 ? 'success' : a.score > 0 ? 'talk' : 'fail');
        host.pop(a.score >= 0 ? `+${a.score * 3}` : `${a.score * 3}`, a.score >= 3 ? 'gold' : a.score > 0 ? 'good' : 'bad', 50, 20);
        await host.wait(1800);
      }
    } else {
      voice.say('Danke, Unterstadt! Bleiben Sie hübsch, oder wenigstens laut!');
      await host.wait(1200);
    }
    const total = score1 + interview * 3;
    const won = total >= need;
    host.summary(`Im Bild ${Math.round(airtime)} s · Winkpunkte ${Math.round(hype)}${interview ? ` · Interview ${interview * 3 >= 0 ? '+' : ''}${interview * 3}` : ''} · gesamt ${total}/${need}`);
    if (shoved || blunders) host.summary(`${shoved ? `${shoved}× rausgeschoben` : ''}${shoved && blunders ? ' · ' : ''}${blunders ? `${blunders}× bei Trauer gewinkt` : ''}`);
    host.summary(won ? 'Heute Abend läuft dein Gesicht in der Kurzmeldung. Die halbe Unterstadt wird dich erkennen. Die andere Hälfte tut so.' : 'Man sieht dich in der Sendung genau einmal: als unscharfen Ellbogen.');
    return won;
  },
};
