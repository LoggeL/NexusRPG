// Reine Anzeige-Modelle der DOM-Oberfläche (ohne DOM, testbar): Check-Texte, Toasts, Herzen, Geschenkwissen,
// Galerie, Questlog-Gruppen, Spielstand-Zusammenfassungen. Regeln liegen in modules/; hier nur Aufbereitung.
import { ATTRIBUTE_LABELS, formatClock, TIME_SLOT_LABELS, WEEKDAY_LABELS } from '../../modules/campaign';
import type {
  CampaignPort, ChoiceCheckView, CutsceneDef, CutsceneId, GameContent, GiftTaste, ItemCategory, ItemId, NpcId, PanMode, QuestKind,
  QuestStatus, QuestView, TimeSlot, Weekday,
} from '../../modules/contracts';
import type { SlotSummary } from '../../platform/storage';

// ---------------------------------------------------------------------------
// Checks: „[Technik 6]“, „Dir fehlen 2 Punkte“

/** „Dir fehlt 1 Punkt“ / „Dir fehlen 2 Punkte“ (0 → leer). */
export function missingLabel(missing: number): string {
  if (missing <= 0) return '';
  return missing === 1 ? 'Dir fehlt 1 Punkt' : `Dir fehlen ${missing} Punkte`;
}

const SOURCE_LABEL: Record<ChoiceCheckView['parts'][number]['source'], string> = {
  attribut: 'Attribut', cyberware: 'Cyberware', ausruestung: 'Ausrüstung', perk: 'Perk', gegenstand: 'Gegenstand', situation: 'Lage',
  herkunft: 'Herkunft', beziehung: 'Beziehung', begleiter: 'Begleiter', voruebergehend: 'Vorübergehend',
};

/** Aufschlüsselung „Technik 4 + Ocular-Chip 1 (Cyberware)“. */
export function checkBreakdown(check: Pick<ChoiceCheckView, 'parts'>): string {
  return check.parts
    .filter((part) => part.value !== 0)
    .map((part, index) => {
      const sign = index === 0 ? '' : part.value > 0 ? '+ ' : '− ';
      const value = index === 0 ? part.value : Math.abs(part.value);
      const source = part.source === 'attribut' ? '' : ` (${SOURCE_LABEL[part.source]})`;
      return `${sign}${part.label} ${value}${source}`;
    })
    .join(' ');
}

/** Tooltip einer Check-Wahl: fehlende Punkte bzw. Bestätigung, dazu Wert und Aufschlüsselung. */
export function checkTooltip(check: ChoiceCheckView): string {
  const head = check.ok
    ? `Check erfüllt: Wert ${check.value} / ${check.threshold}.`
    : `${missingLabel(check.missing)} (Wert ${check.value} / ${check.threshold}).`;
  const breakdown = checkBreakdown(check);
  return breakdown ? `${head} ${breakdown}` : head;
}

/** Kurzer Hinweis unter einer gesperrten Check-Wahl: „Dir fehlen 2 Punkte Technik“. */
export function checkReason(check: ChoiceCheckView): string {
  return check.ok ? '' : `${missingLabel(check.missing)} ${ATTRIBUTE_LABELS[check.attribute]}`;
}

// ---------------------------------------------------------------------------
// Toasts

export type ToastKind = 'heart' | 'xp' | 'credits' | 'quest' | 'item' | 'level' | 'station' | 'phone' | 'info';

export interface ToastModel {
  kind: ToastKind;
  text: string;
  /** Herz-Toast: Name, Vorzeichen und Betrag. */
  heart?: { name: string; delta: number };
}

/** Ordnet Meldungen der Kampagne einer Toast-Art zu („Raven ♥ +45“ → Herz-Toast). */
export function classifyToast(text: string): ToastModel {
  const heart = /^(.+?) ♥ ([+−-])\s?(\d+)$/.exec(text.trim());
  if (heart) {
    const delta = Number(heart[3]) * (heart[2] === '+' ? 1 : -1);
    return { kind: 'heart', text, heart: { name: heart[1], delta } };
  }
  if (/^[+−-]\d+ XP$/.test(text)) return { kind: 'xp', text };
  if (/^Stufe \d+ erreicht/.test(text)) return { kind: 'level', text };
  if (/Credits$/.test(text) && /^[+−-]\d+/.test(text)) return { kind: 'credits', text };
  if (/^(Neue Quest|Quest abgeschlossen|Quest gescheitert|Auftrag angenommen|Auftrag erledigt):/.test(text)) return { kind: 'quest', text };
  if (/^(Erhalten|Abgegeben|Gekauft|Verkauft|Eingebaut|Ausgebaut):/.test(text)) return { kind: 'item', text };
  if (/^U-Bahn-Station freigeschaltet/.test(text)) return { kind: 'station', text };
  if (/^Neue Nachricht/.test(text)) return { kind: 'phone', text };
  return { kind: 'info', text };
}

// ---------------------------------------------------------------------------
// HUD: Uhr, Tageszeit, Wochentag

export interface ClockModel { time: string; slot: TimeSlot; slotLabel: string; weekday: string; day: number; label: string; dateLabel?: string }

/** `dateLabel` (Vertretung im Prolog, z. B. „Vor 7 Jahren“) ersetzt Wochentag und Spieltag. */
export function clockModel(day: number, minutes: number, slot: TimeSlot, weekday: Weekday, dateLabel?: string): ClockModel {
  const time = formatClock(minutes);
  const weekdayLabel = WEEKDAY_LABELS[weekday];
  const model: ClockModel = {
    time, slot, slotLabel: TIME_SLOT_LABELS[slot], weekday: weekdayLabel, day,
    label: dateLabel
      ? `${dateLabel}, ${time} Uhr (${TIME_SLOT_LABELS[slot]})`
      : `${weekdayLabel}, Tag ${day}, ${time} Uhr (${TIME_SLOT_LABELS[slot]})`,
  };
  if (dateLabel) model.dateLabel = dateLabel;
  return model;
}

/** Prozent LP und Warnstufe für Balken. */
export function hpModel(hp: number, max: number): { percent: number; level: 'ok' | 'low' | 'crit' } {
  const percent = max > 0 ? Math.max(0, Math.min(100, Math.round((hp / max) * 100))) : 100;
  return { percent, level: percent <= 25 ? 'crit' : percent <= 50 ? 'low' : 'ok' };
}

// ---------------------------------------------------------------------------
// Beziehungen und Geschenkwissen

export const heartsText = (hearts: number): string => {
  const full = Math.max(0, Math.min(10, Math.floor(hearts)));
  return `${'♥'.repeat(full)}${'♡'.repeat(10 - full)}`;
};

/** Fortschritt zum nächsten Herz in Prozent (0–99); Rivalität und Maximum → null. */
export function heartProgress(points: number): number | null {
  if (points < 0 || points >= 1000) return null;
  return Math.floor(points % 100);
}

export const GIFT_TASTE_TEXT: Record<GiftTaste, string> = {
  loves: 'liebt', likes: 'mag', neutral: 'neutral', dislikes: 'mag nicht', hates: 'hasst',
};
export const GIFT_TASTE_ORDER: readonly GiftTaste[] = ['loves', 'likes', 'neutral', 'dislikes', 'hates'];

/** `seen`-Schlüssel für entdecktes Geschenkwissen (bis die Kampagne `knownGiftTastes` anbietet). */
export const giftSeenKey = (npc: NpcId, item: ItemId): string => `gift:${npc}:${item}`;

/** Aus `seen` gelesene Gegenstände, die dieser Figur schon geschenkt wurden. */
export function giftedItems(seen: readonly string[], npc: NpcId): ItemId[] {
  const prefix = `gift:${npc}:`;
  return seen.filter((key) => key.startsWith(prefix)).map((key) => key.slice(prefix.length)).filter(Boolean);
}

/** Entdecktes Geschenkwissen, gruppiert nach Geschmack (Reihenfolge: liebt … hasst). */
export function groupGiftKnowledge(entries: readonly { item: ItemId; taste: GiftTaste }[]): { taste: GiftTaste; items: ItemId[] }[] {
  return GIFT_TASTE_ORDER.map((taste) => ({ taste, items: entries.filter((entry) => entry.taste === taste).map((entry) => entry.item) }))
    .filter((group) => group.items.length > 0);
}

/** Heute schon beschenkt bzw. Wochenlimit erreicht (nur Anzeige; die Regel prüft die Kampagne). */
export function giftLimitText(rel: { giftDay: number; giftWeek: number; giftsThisWeek: number } | undefined, day: number): string | null {
  if (!rel) return null;
  if (rel.giftDay === day) return 'Heute schon beschenkt.';
  if (rel.giftWeek === Math.floor((day - 1) / 7) && rel.giftsThisWeek >= 2) return 'Diese Woche schon zweimal beschenkt.';
  return null;
}

// ---------------------------------------------------------------------------
// Galerie

export interface GalleryImage { image: string; caption?: string; pan?: PanMode }
export interface GalleryEntry { id: CutsceneId; title: string; images: GalleryImage[]; seen: boolean }

/** Bild einer Szene, das in die Galerie gehört ('black' und leer zählen nicht). */
const pictured = (image: string | undefined): image is string => !!image && image !== 'black';

export function galleryCutscenes(content: GameContent): CutsceneDef[] {
  return Object.values(content.cutscenes).filter((cut) => cut.gallery ?? cut.beats.some((beat) => pictured(beat.image)));
}

/** Galerie: alle Schlüsselszenen mit Bild in Inhaltsreihenfolge; gesehene mit ihren Bildern. */
export function galleryEntries(content: GameContent, seen: ReadonlySet<string>): GalleryEntry[] {
  return galleryCutscenes(content).map((cut) => {
    const images: GalleryImage[] = [];
    let caption: string | undefined;
    for (const beat of cut.beats) {
      if (beat.caption) caption = beat.caption;
      if (!pictured(beat.image) || images.some((entry) => entry.image === beat.image)) continue;
      images.push({ image: beat.image, ...(beat.caption ?? caption ? { caption: beat.caption ?? caption } : {}), ...(beat.pan ? { pan: beat.pan } : {}) });
    }
    return { id: cut.id, title: cut.title ?? images[0]?.caption ?? 'Schlüsselszene', images, seen: seen.has(cut.id) };
  });
}

// ---------------------------------------------------------------------------
// Questlog

export const QUEST_KIND_LABEL: Record<QuestKind, string> = { main: 'Hauptquest', side: 'Nebenquest', job: 'Auftrag', personal: 'Persönlich' };
export const QUEST_STATUS_LABEL: Record<Exclude<QuestStatus, 'inactive'>, string> = { active: 'Aktiv', done: 'Abgeschlossen', failed: 'Gescheitert' };
const KIND_ORDER: readonly QuestKind[] = ['main', 'personal', 'side', 'job'];

/** Quests je Status, innerhalb nach Art (Haupt, Persönlich, Neben, Auftrag) und Titel sortiert. */
export function groupQuests(views: readonly QuestView[]): Record<Exclude<QuestStatus, 'inactive'>, QuestView[]> {
  const out: Record<Exclude<QuestStatus, 'inactive'>, QuestView[]> = { active: [], done: [], failed: [] };
  for (const view of views) if (view.status !== 'inactive') out[view.status].push(view);
  for (const list of Object.values(out)) {
    list.sort((a, b) => KIND_ORDER.indexOf(a.quest.kind) - KIND_ORDER.indexOf(b.quest.kind) || a.quest.title.localeCompare(b.quest.title, 'de'));
  }
  return out;
}

/** Sichtbare Schritte (Bedingung `when`) mit Erledigt-Status. */
export function visibleSteps(view: QuestView, evaluate: CampaignPort['evaluate']): QuestView['steps'] {
  return view.steps.filter((entry) => entry.done || evaluate(entry.step.when));
}

// ---------------------------------------------------------------------------
// Inventar

export const CATEGORY_LABEL: Record<ItemCategory, string> = {
  waffe: 'Waffen', cyberware: 'Cyberware', verbrauch: 'Verbrauch', geschenk: 'Geschenke', quest: 'Quest', sammeln: 'Sammelstücke', kleidung: 'Kleidung',
};
export const CATEGORY_ORDER: readonly ItemCategory[] = ['quest', 'verbrauch', 'waffe', 'kleidung', 'cyberware', 'geschenk', 'sammeln'];

/** Verschenkbar sind alle Gegenstände außer Questgegenständen. */
export const giftable = (category: ItemCategory | undefined): boolean => !!category && category !== 'quest';

// ---------------------------------------------------------------------------
// Spielstände

/** „Kim · Stufe 3 · Tag 4, 18:20 · Neon-Gasse“ */
export function slotLine(summary: SlotSummary, mapName: (id: string) => string): string {
  if (summary.empty) return 'Leer';
  if (summary.corrupt) return 'Beschädigt';
  const parts = [summary.name || 'Ohne Namen'];
  if (summary.level) parts.push(`Stufe ${summary.level}`);
  if (summary.day) parts.push(`Tag ${summary.day}${summary.minutes !== undefined ? `, ${formatClock(summary.minutes)}` : ''}`);
  if (summary.map) parts.push(mapName(summary.map));
  if (summary.ended) parts.push('abgeschlossen');
  return parts.join(' · ');
}

/** Gespeichert-Zeitpunkt in deutscher Schreibweise. */
export function savedAtText(ms: number | undefined): string {
  if (!ms || !Number.isFinite(ms)) return '';
  const date = new Date(ms);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())} Uhr`;
}
