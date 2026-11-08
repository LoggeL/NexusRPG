// Blurhash-Platzhalter für Schlüsselszenen (design.md §6.1): reine Dekodierung plus kleine Canvas-Ausgabe.
// Algorithmus nach https://github.com/woltapp/blurhash (MIT), auf das Nötigste gekürzt.

const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~';

function decode83(text: string): number {
  let value = 0;
  for (const char of text) {
    const digit = DIGITS.indexOf(char);
    if (digit < 0) throw new Error(`Ungültiges Blurhash-Zeichen: ${char}`);
    value = value * 83 + digit;
  }
  return value;
}

const srgbToLinear = (value: number): number => {
  const v = value / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
};

const linearToSrgb = (value: number): number => {
  const v = Math.max(0, Math.min(1, value));
  return Math.round(v <= 0.0031308 ? v * 12.92 * 255 + 0.5 : (1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
};

const signPow = (value: number, exp: number): number => Math.sign(value) * Math.pow(Math.abs(value), exp);

/** Prüft Länge und Zeichen eines Blurhash; ungültig → false (dann kein Platzhalter). */
export function isBlurhash(hash: unknown): hash is string {
  if (typeof hash !== 'string' || hash.length < 6) return false;
  try {
    const size = decode83(hash[0]);
    const nx = (size % 9) + 1;
    const ny = Math.floor(size / 9) + 1;
    if (hash.length !== 4 + 2 * nx * ny) return false;
    decode83(hash);
    return true;
  } catch {
    return false;
  }
}

/** Dekodiert in RGBA-Pixel (Breite × Höhe × 4). `punch` verstärkt den Kontrast (Standard 1). */
export function decodeBlurhash(hash: string, width: number, height: number, punch = 1): Uint8ClampedArray {
  if (!isBlurhash(hash)) throw new Error('Ungültiger Blurhash.');
  const size = decode83(hash[0]);
  const nx = (size % 9) + 1;
  const ny = Math.floor(size / 9) + 1;
  const maxValue = ((decode83(hash[1]) + 1) / 166) * punch;
  const colors: [number, number, number][] = [];
  const dc = decode83(hash.slice(2, 6));
  colors.push([srgbToLinear(dc >> 16), srgbToLinear((dc >> 8) & 255), srgbToLinear(dc & 255)]);
  for (let i = 1; i < nx * ny; i++) {
    const ac = decode83(hash.slice(4 + i * 2, 6 + i * 2));
    const r = Math.floor(ac / (19 * 19));
    const g = Math.floor(ac / 19) % 19;
    const b = ac % 19;
    colors.push([signPow((r - 9) / 9, 2) * maxValue, signPow((g - 9) / 9, 2) * maxValue, signPow((b - 9) / 9, 2) * maxValue]);
  }
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      for (let j = 0; j < ny; j++) {
        const basisY = Math.cos((Math.PI * y * j) / height);
        for (let i = 0; i < nx; i++) {
          const basis = Math.cos((Math.PI * x * i) / width) * basisY;
          const color = colors[i + j * nx];
          r += color[0] * basis;
          g += color[1] * basis;
          b += color[2] * basis;
        }
      }
      const offset = 4 * (x + y * width);
      pixels[offset] = linearToSrgb(r);
      pixels[offset + 1] = linearToSrgb(g);
      pixels[offset + 2] = linearToSrgb(b);
      pixels[offset + 3] = 255;
    }
  }
  return pixels;
}

const urlCache = new Map<string, string | null>();

/** Kleines Vorschaubild als data-URL (zwischengespeichert); null ohne Canvas oder bei ungültigem Hash. */
export function blurhashDataUrl(hash: string, width = 32, height = 21): string | null {
  const key = `${hash}|${width}x${height}`;
  if (urlCache.has(key)) return urlCache.get(key) ?? null;
  let url: string | null = null;
  try {
    if (typeof document !== 'undefined' && isBlurhash(hash)) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const g = canvas.getContext('2d');
      if (g) {
        const image = g.createImageData(width, height);
        image.data.set(decodeBlurhash(hash, width, height));
        g.putImageData(image, 0, 0);
        url = canvas.toDataURL('image/png');
      }
    }
  } catch {
    url = null;
  }
  urlCache.set(key, url);
  return url;
}
