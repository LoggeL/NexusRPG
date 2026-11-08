// DOM-Ebene für Weltbeschriftungen über der Karte (Bereich explore-presentation): Namensschilder, Aktionslabel,
// Sprechblasen von Passanten, Zielmarker-Text. Texte bleiben DOM (gut lesbar, design.md §2); Position in Prozent
// der Spielfläche, damit jede Skalierung passt. Liegt unter HUD, Dialogen und Menüs (wird vorn in den Rahmen gehängt).
import type { Point } from '../../modules/contracts';
import { clampCenter, toFramePercent } from './labels';

export type WorldLabelKind = 'name' | 'enemy' | 'action' | 'bubble' | 'objective';

export interface WorldLabelSpec {
  id: string;
  kind: WorldLabelKind;
  text: string;
  /** Zweite Zeile (z. B. „E Sprechen“). */
  sub?: string;
  /** Taste vor dem Text bzw. vor `sub`. */
  key?: string;
  /** Unterkante Mitte in Bildschirmkoordinaten der Spielfläche. */
  at: Point;
}

const BASE = 'position:absolute;transform:translate(-50%,-100%);pointer-events:none;white-space:nowrap;line-height:1.25;';
const STYLE: Record<WorldLabelKind, string> = {
  name: `${BASE}font-family:var(--font-display);font-size:var(--fs-label,16px);color:#f4f0ff;background:rgba(11,7,22,0.82);border:1px solid rgba(62,242,255,0.75);box-shadow:0 0 6px rgba(62,242,255,0.35);padding:1px 8px;border-radius:3px;text-align:center;`,
  enemy: `${BASE}font-family:var(--font-display);font-size:var(--fs-label,16px);color:#ffd0da;background:rgba(30,6,14,0.85);border:1px solid #ff6a8a;box-shadow:0 0 6px rgba(255,63,100,0.45);padding:1px 8px;border-radius:3px;text-align:center;`,
  action: `${BASE}font-family:var(--font-display);font-size:var(--fs-label,16px);color:#f4f0ff;background:rgba(11,7,22,0.88);border:1px solid #ff3fa4;box-shadow:0 0 6px rgba(255,63,164,0.4);padding:1px 8px;border-radius:3px;`,
  bubble: `${BASE}font-family:var(--font-text);font-size:var(--fs-small,15px);color:#140c26;background:#f4f0ff;border:2px solid #140c26;padding:4px 10px;border-radius:12px;white-space:normal;width:max-content;max-width:16em;text-align:center;box-shadow:0 2px 0 rgba(0,0,0,0.35);`,
  objective: `${BASE}font-family:var(--font-display);font-size:var(--fs-small,15px);color:#ffe14a;background:rgba(11,7,22,0.8);border:1px solid #ffe14a;padding:0 6px;border-radius:3px;`,
};
const KBD = 'pointer-events:none;display:inline-block;min-width:1.4em;margin-right:0.4em;padding:0 0.3em;border:1px solid #5b4c9a;background:#0d0820;color:#3ef2ff;font-family:var(--font-text);font-weight:700;font-size:0.85em;text-align:center;';
const TAIL = 'pointer-events:none;position:absolute;left:50%;bottom:-7px;width:10px;height:10px;background:#f4f0ff;border-right:2px solid #140c26;border-bottom:2px solid #140c26;transform:translateX(-50%) rotate(45deg);';

/** `width`: gemessene Breite (px) bei Rahmenbreite `measuredAt` – neu gemessen nach Text- oder Größenwechsel. */
interface Entry { el: HTMLElement; signature: string; left: string; top: string; width: number; measuredAt: number }

export class WorldLabels {
  readonly layer: HTMLElement;
  private entries = new Map<string, Entry>();
  private visible = true;

  constructor(parent: HTMLElement) {
    this.layer = document.createElement('div');
    this.layer.className = 'world-labels';
    this.layer.dataset.testid = 'world-labels';
    this.layer.setAttribute('aria-hidden', 'true');
    this.layer.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;';
    parent.prepend(this.layer);
  }

  /** Setzt genau diese Beschriftungen (fehlende werden entfernt). */
  sync(specs: readonly WorldLabelSpec[]) {
    const keep = new Set<string>();
    const frameW = specs.length ? this.layer.clientWidth : 0;
    for (const spec of specs) {
      keep.add(spec.id);
      let entry = this.entries.get(spec.id);
      const signature = `${spec.kind}|${spec.text}|${spec.sub ?? ''}|${spec.key ?? ''}`;
      if (!entry) {
        const el = document.createElement('div');
        el.dataset.testid = 'world-label';
        el.dataset.id = spec.id;
        entry = { el, signature: '', left: '', top: '', width: 0, measuredAt: -1 };
        this.entries.set(spec.id, entry);
        this.layer.append(el);
      }
      if (entry.signature !== signature) {
        entry.signature = signature;
        this.render(entry.el, spec);
        entry.measuredAt = -1;
      }
      if (entry.measuredAt !== frameW) { entry.width = entry.el.offsetWidth; entry.measuredAt = frameW; }
      const [left, top] = toFramePercent(spec.at);
      // Am Rand nicht abschneiden: Mitte so verschieben, dass das Schild ganz im Rahmen bleibt.
      const l = frameW > 0 ? `${clampCenter((left / 100) * frameW, entry.width, frameW).toFixed(1)}px` : `${left.toFixed(2)}%`;
      const t = `${top.toFixed(2)}%`;
      if (l !== entry.left) { entry.el.style.left = l; entry.left = l; }
      if (t !== entry.top) { entry.el.style.top = t; entry.top = t; }
    }
    for (const [id, entry] of this.entries) {
      if (keep.has(id)) continue;
      entry.el.remove();
      this.entries.delete(id);
    }
  }

  private render(el: HTMLElement, spec: WorldLabelSpec) {
    el.dataset.kind = spec.kind;
    el.style.cssText = STYLE[spec.kind] + (el.style.left ? `left:${el.style.left};top:${el.style.top};` : '');
    el.replaceChildren();
    // .ui-root * setzt pointer-events:auto – jedes Kind ausdrücklich durchklickbar machen.
    const line = document.createElement('div');
    line.style.pointerEvents = 'none';
    if (spec.key && !spec.sub) line.append(this.kbd(spec.key));
    line.append(spec.text);
    el.append(line);
    if (spec.sub) {
      const sub = document.createElement('div');
      sub.style.cssText = 'pointer-events:none;font-size:0.85em;color:#b8afd6;';
      if (spec.key) sub.append(this.kbd(spec.key));
      sub.append(spec.sub);
      el.append(sub);
    }
    if (spec.kind === 'bubble') {
      const tail = document.createElement('div');
      tail.style.cssText = TAIL;
      el.append(tail);
    }
  }

  private kbd(key: string): HTMLElement {
    const kbd = document.createElement('kbd');
    kbd.style.cssText = KBD;
    kbd.textContent = key;
    return kbd;
  }

  setVisible(visible: boolean) {
    if (visible === this.visible) return;
    this.visible = visible;
    this.layer.style.display = visible ? '' : 'none';
  }

  /** Aktuell gezeigte Beschriftungen (Test-Hook). */
  list(): { id: string; kind: string; text: string }[] {
    if (!this.visible) return [];
    return [...this.entries].map(([id, entry]) => ({ id, kind: entry.el.dataset.kind ?? '', text: entry.el.textContent ?? '' }));
  }

  destroy() {
    this.entries.clear();
    this.layer.remove();
  }
}
