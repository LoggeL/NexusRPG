// akt-karaoke: Karaoke im High Voltage. Silben laufen in drei Tonhöhen auf die Mikrofonlinie zu.
// Richtige Höhe wählen (↑/↓ oder Zeile antippen) und singen (Leertaste/Finger halten), solange der Balken durchläuft.
// Ausstrahlung: größeres Trefferfenster; ab 7 zählt die Nachbarhöhe halb.
import { h } from '../dom/dom';
import type { MinigameDef } from './types';
import { byLevel, clamp, isAction, isDown, isUp, pick } from './util';

const SONGS = [
  { title: 'Neonregen', lines: [
    'Ne-on-re-gen auf mei-nem Ge-sicht',
    'die Mie-te ist fäl-lig, ich zahl sie nicht',
    'oh Un-ter-stadt, du bist so laut',
    'du hast mein Herz und mein Fahr-rad ge-klaut',
    'ich sing für die Crew und den Typ an der Bar',
    'ja ge-nau du, mit dem Chrom im Haar',
  ] },
  { title: 'Rost und Liebe', lines: [
    'mein Herz ist aus Rost, doch es schlägt noch für dich',
    'du riechst nach Ka-nal, a-ber das stört mich nicht',
    'wir tan-zen im Dreck, bis die Son-ne er-wacht',
    'No-xi-us, du Sau, wir lie-ben dich die gan-ze Nacht',
  ] },
];

export interface Syllable { text: string; row: number; start: number; end: number; line: number; score: number; done: boolean }

export function buildSong(lines: readonly string[], bpm: number, jumpiness: number, lead = 2.2): Syllable[] {
  const beat = 60 / bpm;
  const out: Syllable[] = [];
  let t = lead;
  let row = 1;
  lines.forEach((line, lineIndex) => {
    const parts = line.split(' ').flatMap((word) => word.split('-').map((piece, i, all) => (i < all.length - 1 ? `${piece}-` : piece)));
    parts.forEach((text, i) => {
      if (Math.random() < jumpiness) row = clamp(row + (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.25 ? 2 : 1), 0, 2);
      const last = i === parts.length - 1;
      const beats = last ? 2 : Math.random() < 0.3 ? 1.5 : 1;
      out.push({ text, row, start: t, end: t + beats * beat * 0.88, line: lineIndex, score: 0, done: false });
      t += beats * beat;
    });
    t += beat * 1.5; // Luft holen
  });
  return out;
}

const ROW_NAMES = ['hoch', 'mitte', 'tief'];

export const karaoke: MinigameDef = {
  title: 'Karaoke',
  blurb: 'Mikro in der Hand, Scheinwerfer im Gesicht, das Publikum halb besoffen. Triff die Töne, dann gehört dir der Laden.',
  controls: ['↑/↓ (W/S): Tonhöhe, Leertaste halten: singen', 'Touch/Maus: auf die Zeile drücken und halten', 'Balken müssen über die Mikrofonlinie laufen'],
  bonuses(ctx) {
    const lines = [`Ausstrahlung ${ctx.attr('ausstrahlung')}: Trefferfenster +${Math.round(ctx.edge('ausstrahlung') * 100)} ms`];
    if (ctx.attr('ausstrahlung') >= 7) lines.push('Ausstrahlung 7+: knapp daneben zählt halb');
    return lines;
  },
  async run(host, ctx) {
    const level = ctx.level;
    const song = pick(SONGS);
    const bpm = byLevel(level, [84, 92, 100, 108, 116]);
    const syllables = buildSong(song.lines, bpm, byLevel(level, [0.25, 0.35, 0.45, 0.55, 0.65]));
    const tol = 0.07 + ctx.edge('ausstrahlung') * 0.1;
    const neighbourHalf = ctx.attr('ausstrahlung') >= 7;
    const needed = byLevel(level, [0.45, 0.5, 0.55, 0.6, 0.65]);
    const LOOK = 3.4;
    const HIT_X = 16;

    const rowsEl = ROW_NAMES.map((name, index) => {
      const row = h('div', { class: `ko-row r${index}`, 'data-row': String(index) }, h('span', { class: 'ko-row-name' }, name));
      return row;
    });
    const mic = h('div', { class: 'ko-mic' });
    const lane = h('div', { class: 'ko-lanes' }, ...rowsEl, h('div', { class: 'ko-line' }), mic);
    const lyric = h('div', { class: 'ko-lyric' });
    const moodFill = h('i');
    host.stage.append(h('div', { class: 'ko-wrap' },
      h('div', { class: 'ko-title' }, `♪ ${song.title}`),
      lane, lyric,
      h('div', { class: 'ko-mood' }, h('span', null, 'Stimmung'), h('div', { class: 'ko-mood-bar' }, moodFill))));

    let row = 1;
    let keySing = false;
    let pointerSing = false;
    let mood = 50;
    const start = performance.now();
    const now = () => (performance.now() - start) / 1000;
    const singing = () => keySing || pointerSing;

    const rowFromPointer = (event: PointerEvent) => {
      const rect = lane.getBoundingClientRect();
      return clamp(Math.floor(((event.clientY - rect.top) / rect.height) * 3), 0, 2);
    };
    lane.addEventListener('pointerdown', (event) => { event.preventDefault(); lane.setPointerCapture?.(event.pointerId); row = rowFromPointer(event); pointerSing = true; });
    lane.addEventListener('pointermove', (event) => { if (pointerSing) row = rowFromPointer(event); });
    const stopPointer = () => { pointerSing = false; };
    lane.addEventListener('pointerup', stopPointer);
    lane.addEventListener('pointercancel', stopPointer);
    host.onKey((event, down) => {
      if (isUp(event.code) && down) row = Math.max(0, row - 1);
      else if (isDown(event.code) && down) row = Math.min(2, row + 1);
      else if (isAction(event.code)) keySing = down;
    });

    const bars = new Map<Syllable, HTMLElement>();
    let lyricLine = -1;
    const lyricSpans: HTMLElement[] = [];
    const showLine = (index: number) => {
      lyricLine = index;
      lyric.textContent = '';
      lyricSpans.length = 0;
      for (const syl of syllables) if (syl.line === index) {
        const span = h('span', { class: 'ko-syl' }, syl.text.endsWith('-') ? syl.text.slice(0, -1) : `${syl.text} `);
        lyricSpans.push(span);
        lyric.append(span);
      }
    };

    /** Treffer zählen 85 %, die Stimmung im Saal 15 %. */
    const finalScore = () => (syllables.reduce((sum, s) => sum + clamp(s.score, 0, 1), 0) / syllables.length) * 0.85 + (mood / 100) * 0.15;
    let resolveEnd!: (won: boolean) => void;
    const end = new Promise<boolean>((resolve) => { resolveEnd = resolve; });
    const songEnd = (syllables.at(-1)?.end ?? 0) + 1.2;
    let last = now();
    host.frame(() => {
      const t = now();
      const dt = t - last;
      last = t;
      mic.style.top = `${(row + 0.5) * 33.333}%`;
      mic.classList.toggle('sing', singing());
      let active: Syllable | null = null;
      for (const syl of syllables) {
        if (syl.done) continue;
        if (syl.start - t > LOOK) break;
        // Wertung
        if (singing() && t >= syl.start - tol && t <= syl.end + tol) {
          const weight = row === syl.row ? 1 : neighbourHalf && Math.abs(row - syl.row) === 1 ? 0.5 : 0;
          syl.score += (dt * weight) / Math.max(0.15, syl.end - syl.start);
          if (weight === 0) mood = clamp(mood - dt * 18, 0, 100);
        }
        if (t >= syl.start && t <= syl.end) active = syl;
        if (t > syl.end + tol) {
          syl.done = true;
          syl.score = clamp(syl.score, 0, 1);
          bars.get(syl)?.remove();
          const span = lyricSpans[syllables.filter((s) => s.line === syl.line).indexOf(syl)];
          if (syl.score >= 0.6) { mood = clamp(mood + 4, 0, 100); span?.classList.add('hit'); if (syl.score > 0.9) host.pop(pick(['♪', '♫', 'Yeah!']), 'gold', HIT_X, 20 + syl.row * 25); }
          else { mood = clamp(mood - 5, 0, 100); span?.classList.add('miss'); }
          continue;
        }
        let bar = bars.get(syl);
        if (!bar) {
          bar = h('div', { class: `ko-bar r${syl.row}` }, h('span', null, syl.text.replace(/-$/, '')));
          bar.style.width = `${((syl.end - syl.start) / LOOK) * (100 - HIT_X)}%`;
          rowsEl[syl.row].append(bar);
          bars.set(syl, bar);
        }
        bar.style.left = `${HIT_X + ((syl.start - t) / LOOK) * (100 - HIT_X)}%`;
        bar.classList.toggle('now', t >= syl.start - tol && t <= syl.end + tol);
      }
      const inWindow = syllables.some((s) => !s.done && t >= s.start - tol && t <= s.end + tol);
      if (singing() && !inWindow) mood = clamp(mood - dt * 10, 0, 100);
      const upcoming = active ?? syllables.find((s) => !s.done);
      if (upcoming && upcoming.line !== lyricLine) showLine(upcoming.line);
      lyricSpans.forEach((span, i) => span.classList.toggle('cur', !!active && syllables.filter((s) => s.line === active!.line)[i] === active));
      moodFill.style.width = `${mood}%`;
      const done = syllables.filter((s) => s.done);
      const avg = done.length ? done.reduce((sum, s) => sum + s.score, 0) / done.length : 0;
      host.setScore(`Treffer ${Math.round(avg * 100)} %`);
      if (t >= songEnd) {
        resolveEnd(finalScore() >= needed);
        return false;
      }
      return true;
    });
    host.setInfo(`${bpm} BPM`);
    const won = await end;
    const total = finalScore();
    host.summary(`„${song.title}“ – ${Math.round(total * 100)} % Wertung (nötig ${Math.round(needed * 100)} %).`);
    host.summary(won
      ? pick(['Die Bar grölt mit. Jemand wirft dir eine Rose zu – oder einen Bierdeckel.', 'Zugabe-Rufe! Sogar der Türsteher wippt.', 'Collin würde sagen: „Das war Sendezeit wert.“'])
      : pick(['Ein Glas zerspringt. Hoffentlich nicht wegen dir.', 'Buhrufe, aber herzliche. Na ja, fast.', 'Der DJ dreht dir den Saft ab. Höflich.']));
    return won;
  },
};
