// Zeit und Tagesablauf als reine Regeln (design.md §3.4). Die Kampagne (campaign/domains/clock.ts, schedule.ts)
// verbindet sie mit dem Spielzustand; die Darstellung darf die Funktionen direkt mit `campaign.state()` nutzen.
export * from './clock';
export * from './collapse';
export * from './schedule';
export * from './weather';
