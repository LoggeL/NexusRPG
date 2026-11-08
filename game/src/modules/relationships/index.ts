// Beziehungen als reine Regeln (design.md §3.3): Punkte, Herzen, Rivalität, Ansprechen, Geschenke, Herz-Ereignisse,
// Crew und Romanze-Schalter. Die Kampagne (campaign/domains/relations.ts) verbindet sie mit dem Spielzustand; die
// Darstellung darf die lesenden Funktionen (relationView, giftTasteFor …) direkt mit `campaign.state()` nutzen.
export * from './points';
export * from './extras';
export * from './gifts';
export * from './talk';
export * from './events';
export * from './crew';
export * from './romance';
export * from './view';
export * from './problems';
