// Prozedurale Platzhalter: Das Spiel bleibt ohne jede Grafik vollständig spielbar (design.md §6).
// Neon-Farben: Cyan #3ef2ff, Pink #ff3fa4, Violett #9b5cff auf Nachtblau #0b0716.

export const NEON = { cyan: '#3ef2ff', pink: '#ff3fa4', violet: '#9b5cff', bg: '#0b0716', ink: '#f4f0ff' } as const;

/** Laufblatt-Zelle (wie die echten Blätter): 128×128, Fußanker (64, 120). */
export const WALK_FRAME = 128;
export const WALK_FOOT: readonly [number, number] = [64, 120];
/** Kinderfiguren sind kleiner (~76 px statt ~96 px). */
const CHILD_IDS = new Set(['daria', 'freya', 'jakko']);

export interface ActorPalette { shirt: string; pants: string; skin: string; hair: string; accent?: string }

const PALETTES: Record<string, ActorPalette> = {
  raven: { shirt: '#1d1a26', pants: '#2b2738', skin: '#e6b994', hair: '#121018', accent: NEON.pink },
  dante: { shirt: '#4a3a2a', pants: '#2a2a32', skin: '#c99272', hair: '#2a1a12', accent: NEON.cyan },
  player: { shirt: '#2e3a66', pants: '#22222c', skin: '#e2b08a', hair: '#3a2a22', accent: NEON.violet },
};

const baseId = (id: string) => id.replace(/^(portrait|bg|cut|prop)-/, '').replace(/-(walk|pose|lying|sleeping|sitting|standing|angry)$/, '');

export function paletteFor(id: string): ActorPalette {
  const base = baseId(id);
  if (PALETTES[base]) return PALETTES[base];
  let hash = 0;
  for (const char of base) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  const hue = hash % 360;
  return { shirt: `hsl(${hue} 50% 38%)`, pants: `hsl(${(hue + 40) % 360} 25% 22%)`, skin: '#d8a882', hair: '#201a22', accent: [NEON.cyan, NEON.pink, NEON.violet][hash % 3] };
}

export function hashColor(text: string, saturation = 45, lightness = 32): string {
  let hash = 0;
  for (const char of text) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return `hsl(${hash % 360} ${saturation}% ${lightness}%)`;
}

function canvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const element = document.createElement('canvas');
  element.width = Math.max(1, Math.round(width));
  element.height = Math.max(1, Math.round(height));
  const context = element.getContext('2d')!;
  context.imageSmoothingEnabled = true;
  return [element, context];
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (context.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

const DISPLAY_FONT = '"Chakra Petch", "Atkinson Hyperlegible", sans-serif';

/** Kartenhintergrund: dunkler Verlauf mit Kartenraster (128 px), Neonkanten und Kartenname. */
export function drawBackground(name: string, seed: string, width = 1536, height = 1024): HTMLCanvasElement {
  const [element, context] = canvas(width, height);
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, hashColor(seed, 35, 14));
  gradient.addColorStop(1, hashColor(`${seed}b`, 40, 7));
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.lineWidth = 1;
  context.strokeStyle = 'rgba(62, 242, 255, 0.12)';
  for (let x = 0; x <= width; x += 64) { context.beginPath(); context.moveTo(x + 0.5, 0); context.lineTo(x + 0.5, height); context.stroke(); }
  for (let y = 0; y <= height; y += 64) { context.beginPath(); context.moveTo(0, y + 0.5); context.lineTo(width, y + 0.5); context.stroke(); }
  context.strokeStyle = 'rgba(255, 63, 164, 0.28)';
  for (let x = 0; x <= width; x += 256) { context.beginPath(); context.moveTo(x + 0.5, 0); context.lineTo(x + 0.5, height); context.stroke(); }
  for (let y = 0; y <= height; y += 256) { context.beginPath(); context.moveTo(0, y + 0.5); context.lineTo(width, y + 0.5); context.stroke(); }
  context.strokeStyle = NEON.violet;
  context.lineWidth = 6;
  context.strokeRect(3, 3, width - 6, height - 6);
  context.fillStyle = 'rgba(11, 7, 22, 0.7)';
  context.fillRect(0, height / 2 - 60, width, 120);
  context.fillStyle = NEON.ink;
  context.font = `600 56px ${DISPLAY_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(name, width / 2, height / 2 - 12);
  context.font = `24px ${DISPLAY_FONT}`;
  context.fillStyle = NEON.cyan;
  context.fillText(`Platzhalter – Grafik folgt · ${width}×${height}`, width / 2, height / 2 + 34);
  return element;
}

function drawFigure(context: CanvasRenderingContext2D, ox: number, oy: number, palette: ActorPalette, dir: number, frame: number, height: number) {
  const footY = oy + WALK_FOOT[1];
  const cx = ox + WALK_FOOT[0];
  const scale = height / 40;
  const step = frame % 2 === 1 ? (frame === 1 ? 2 : -2) : 0;
  const px = (x: number, y: number, w: number, h: number, color: string) => {
    context.fillStyle = color;
    context.fillRect(cx + x * scale, footY - y * scale, Math.max(1, w * scale), Math.max(1, h * scale));
  };
  context.fillStyle = 'rgba(0,0,0,0.4)';
  context.beginPath();
  context.ellipse(cx, footY - 2, 9 * scale, 3 * scale, 0, 0, Math.PI * 2);
  context.fill();
  px(-5, 14 + Math.max(0, step), 4, 14, palette.pants);
  px(1, 14 + Math.max(0, -step), 4, 14, palette.pants);
  px(-6, 2 + Math.max(0, step), 5, 2, '#121018');
  px(1, 2 + Math.max(0, -step), 5, 2, '#121018');
  px(-7, 30, 14, 17, palette.shirt);
  if (palette.accent) px(-7, 22, 14, 1.5, palette.accent);
  px(-9, 29 - Math.max(0, -step), 3, 12, palette.shirt);
  px(6, 29 - Math.max(0, step), 3, 12, palette.shirt);
  px(-5, 40, 10, 10, palette.skin);
  if (dir === 3) px(-5, 41, 10, 9, palette.hair);
  else {
    px(-5, 41, 10, 4, palette.hair);
    if (dir === 0) { px(-3, 35, 2, 2, '#121018'); px(1, 35, 2, 2, '#121018'); }
    else if (dir === 1) px(-4, 35, 2, 2, '#121018');
    else px(2, 35, 2, 2, '#121018');
  }
  context.strokeStyle = palette.accent ?? NEON.cyan;
  context.lineWidth = 2;
  context.strokeRect(cx - 7 * scale, footY - 30 * scale, 14 * scale, 17 * scale);
}

/** Laufblatt 4×4 (Zeilen Süd, West, Ost, Nord) à 128×128 mit farbiger Silhouette. */
export function drawWalkSheet(id: string, frame = WALK_FRAME): HTMLCanvasElement {
  const [element, context] = canvas(frame * 4, frame * 4);
  const palette = paletteFor(id);
  const height = CHILD_IDS.has(baseId(id)) ? 76 : 96;
  for (let row = 0; row < 4; row++) for (let col = 0; col < 4; col++) drawFigure(context, col * frame, row * frame, palette, row, col, height);
  return element;
}

/** Einzelpose als 128×128-Zelle (liegend breiter). */
export function drawPose(id: string, pose: string): HTMLCanvasElement {
  const lying = /lying|sleeping|down/.test(pose);
  const [element, context] = canvas(lying ? 256 : WALK_FRAME, WALK_FRAME);
  const palette = paletteFor(id);
  if (!lying) { drawFigure(context, 0, 0, palette, 0, 0, 96); return element; }
  context.fillStyle = 'rgba(0,0,0,0.4)';
  context.beginPath();
  context.ellipse(128, 112, 60, 10, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = palette.pants;
  context.fillRect(128, 92, 52, 16);
  context.fillStyle = palette.shirt;
  context.fillRect(88, 88, 44, 22);
  context.fillStyle = palette.skin;
  context.fillRect(68, 90, 20, 18);
  context.fillStyle = palette.hair;
  context.fillRect(64, 90, 8, 18);
  return element;
}

/** Requisit: Kiste mit Neonrand und Kennung. */
export function drawProp(id: string): HTMLCanvasElement {
  const [element, context] = canvas(64, 64);
  context.fillStyle = 'rgba(0,0,0,0.35)';
  context.fillRect(8, 54, 48, 8);
  context.fillStyle = hashColor(id, 30, 22);
  context.fillRect(12, 20, 40, 36);
  context.strokeStyle = NEON.cyan;
  context.lineWidth = 2;
  context.strokeRect(13, 21, 38, 34);
  context.fillStyle = NEON.ink;
  context.font = `600 16px ${DISPLAY_FONT}`;
  context.textAlign = 'center';
  context.fillText(baseId(id).slice(0, 2).toUpperCase(), 32, 44);
  return element;
}

/** Cutscene-/Plate-Platzhalter: dunkle Fläche mit Neon-Vignette und Titel. */
export function drawCutscene(title: string, seed: string, width = 1536, height = 1024): HTMLCanvasElement {
  const [element, context] = canvas(width, height);
  const gradient = context.createRadialGradient(width * 0.5, height * 0.42, 40, width * 0.5, height * 0.5, width * 0.7);
  gradient.addColorStop(0, hashColor(seed, 45, 26));
  gradient.addColorStop(1, '#05030b');
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.fillStyle = 'rgba(255,255,255,0.03)';
  for (let y = 0; y < height; y += 4) context.fillRect(0, y, width, 1);
  context.fillStyle = NEON.ink;
  context.font = `600 64px ${DISPLAY_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  const lines = wrapText(context, title, width * 0.8);
  lines.forEach((line, index) => context.fillText(line, width / 2, height * 0.45 + (index - (lines.length - 1) / 2) * 76));
  context.font = `26px ${DISPLAY_FONT}`;
  context.fillStyle = NEON.pink;
  context.fillText('Schlüsselszene – Bild folgt', width / 2, height * 0.45 + lines.length * 48 + 30);
  return element;
}

/** Porträt mit Initialen und Neonakzent. */
export function drawPortrait(name: string, seed: string, size = 256): HTMLCanvasElement {
  const [element, context] = canvas(size, size);
  context.fillStyle = '#120c22';
  context.fillRect(0, 0, size, size);
  const palette = paletteFor(seed);
  context.fillStyle = palette.shirt;
  context.fillRect(size * 0.18, size * 0.72, size * 0.64, size * 0.28);
  context.fillStyle = palette.skin;
  context.fillRect(size * 0.32, size * 0.26, size * 0.36, size * 0.42);
  context.fillStyle = palette.hair;
  context.fillRect(size * 0.3, size * 0.18, size * 0.4, size * 0.12);
  const initials = name === '???' ? '?' : name.split(/[\s-]+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  context.fillStyle = 'rgba(11,7,22,0.6)';
  context.fillRect(0, size * 0.42, size, size * 0.2);
  context.fillStyle = NEON.ink;
  context.font = `600 ${Math.round(size * 0.18)}px ${DISPLAY_FONT}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(initials || '?', size / 2, size * 0.53);
  context.strokeStyle = palette.accent ?? NEON.cyan;
  context.lineWidth = Math.max(2, size / 64);
  context.strokeRect(1, 1, size - 2, size - 2);
  return element;
}

/** Titelbild-Platzhalter: Skyline von Noxius bei Nacht. */
export function drawTitle(width = 1536, height = 1024): HTMLCanvasElement {
  const [element, context] = canvas(width, height);
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, '#05030b');
  sky.addColorStop(0.6, '#241040');
  sky.addColorStop(1, '#0b0716');
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
  let x = 0;
  let i = 0;
  while (x < width) {
    const w = 60 + ((i * 53) % 90);
    const h = 220 + ((i * 97) % 420);
    context.fillStyle = '#0d0a18';
    context.fillRect(x, height - h, w, h);
    context.fillStyle = [NEON.cyan, NEON.pink, NEON.violet][i % 3];
    context.globalAlpha = 0.5;
    for (let wy = height - h + 20; wy < height - 30; wy += 34) for (let wx = x + 10; wx < x + w - 12; wx += 22) if ((wx + wy + i) % 3 === 0) context.fillRect(wx, wy, 8, 12);
    context.globalAlpha = 1;
    x += w + 6;
    i++;
  }
  return element;
}

/** Stadtkarten-Platzhalter: Bezirke als Neonflächen. */
export function drawCityMap(width = 1536, height = 1024): HTMLCanvasElement {
  const [element, context] = canvas(width, height);
  context.fillStyle = NEON.bg;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = 'rgba(62,242,255,0.15)';
  for (let gx = 0; gx < width; gx += 64) { context.beginPath(); context.moveTo(gx, 0); context.lineTo(gx, height); context.stroke(); }
  for (let gy = 0; gy < height; gy += 64) { context.beginPath(); context.moveTo(0, gy); context.lineTo(width, gy); context.stroke(); }
  context.strokeStyle = NEON.pink;
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(width * 0.1, height * 0.7);
  context.bezierCurveTo(width * 0.35, height * 0.4, width * 0.6, height * 0.9, width * 0.9, height * 0.3);
  context.stroke();
  return element;
}

export function canvasToDataUrl(element: HTMLCanvasElement): string {
  try { return element.toDataURL('image/png'); } catch { return ''; }
}
