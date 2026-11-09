// Perks (world.md §2.5): je Attribut vier Perks, Bedingung Attributwert und Mindeststufe, Kosten 1 Perkpunkt.
// Jeder Perk hat eine Welt- und eine Kampfseite. Regeln ohne eigene Engine-Stütze laufen als `traits`
// (Abfrage über hasTrait). Die Cyberware steht in content/parts/system/cyberware.ts.
// Stichwörter nach dem Vokabular in content/parts/system/checks.ts.
import type { CharacterCyberwareDef, CharacterPerkDef } from '../modules/character/types';

const PERK_LIST: CharacterPerkDef[] = [
  // Start-Perk der fertigen Spielfigur Vex (world.md §2.1a); nicht lernbar.
  {
    id: 'dachlaeuferin', name: 'Dachläuferin', exclusive: true, attribute: 'reflexe', min: 6,
    description: 'Sprünge und Fluchtwege über Dächer ohne Check. Kurieraufträge +15 % Credits.',
    autoPass: [{ attribute: 'reflexe', tags: ['dach'], maxThreshold: 10 }], traits: ['kurier-bonus'],
  },

  // --- Technik ---------------------------------------------------------------------------------------------
  {
    id: 'perk-schnelle-finger', name: 'Schnelle Finger', attribute: 'technik', min: 4, level: 2,
    description: 'Hack-Minispiel +10 Sekunden. Im Kampf kostet der erste Hack 1 Bandbreite weniger.',
    traits: ['hack-zeit-10', 'erster-hack-billiger'],
  },
  {
    id: 'perk-ueberladung', name: 'Überladung', attribute: 'technik', min: 6, level: 5,
    description: 'Reparaturset wird nur bei jedem zweiten Einsatz verbraucht. Hack oder Strom auf „Nass“ springt auf benachbarte nasse Ziele über.',
    traits: ['reparaturset-sparen', 'nass-kettenblitz'],
  },
  {
    id: 'perk-drohnenfluesterer', name: 'Drohnenflüsterer', attribute: 'technik', min: 8, level: 9,
    description: 'An der Werkbank Cyberware-Macken entfernen. Gehackte Drohnen wechseln 2 Runden die Seite.',
    checkBonus: [{ tags: ['drohne'], value: 1, label: 'Drohnenflüsterer' }], traits: ['macken-entfernen', 'drohnen-uebernehmen'],
  },
  {
    id: 'perk-systemabsturz', name: 'Systemabsturz', attribute: 'technik', min: 10, level: 14,
    description: 'Kameras einer Zone 1× pro Tag abschalten. Einmal pro Kampf: alle Drohnen und Gechippten „Gehackt“.',
    traits: ['kameras-aus', 'systemabsturz'],
  },

  // --- Körper ----------------------------------------------------------------------------------------------
  {
    id: 'perk-dickes-fell', name: 'Dickes Fell', attribute: 'koerper', min: 4, level: 2,
    description: '+2 Tragplätze, Giftnebel ohne Staubmaske. Im Kampf +5 LP.',
    autoPass: [{ tags: ['gift'], maxThreshold: 10 }], combat: { hp: 5 }, traits: ['tragplaetze-2', 'giftnebel-immun'],
  },
  {
    id: 'perk-rammbock', name: 'Rammbock', attribute: 'koerper', min: 6, level: 5,
    description: 'Verklemmte Türen ohne Check öffnen (Schwelle bis 6). Schubsen 2 Felder, +4 Schaden beim Aufprall.',
    autoPass: [{ tags: ['verklemmt'], maxThreshold: 6 }], traits: ['schubsen-2'],
  },
  {
    id: 'perk-zweiter-wind', name: 'Zweiter Wind', attribute: 'koerper', min: 8, level: 9,
    description: 'Der Zusammenbruch um 02:00 kostet keine Credits. Einmal pro Kampf bei 0 LP mit 1 LP stehen bleiben.',
    traits: ['zusammenbruch-gratis', 'zweiter-wind'],
  },
  {
    id: 'perk-unaufhaltsam', name: 'Unaufhaltsam', attribute: 'koerper', min: 10, level: 14,
    description: 'Sprint auf der Karte ohne Ausdauer-Ende. Immun gegen „Verlangsamt“ und „Betäubt“.',
    traits: ['sprint-endlos', 'immun-verlangsamt', 'immun-betaeubt'],
  },

  // --- Reflexe ---------------------------------------------------------------------------------------------
  {
    id: 'perk-schnelle-haende', name: 'Schnelle Hände', attribute: 'reflexe', min: 4, level: 2,
    description: 'Taschendiebstahl-Fenster +30 %. Gegenstand benutzen kostet 0 AP (1× pro Zug).',
    checkBonus: [{ tags: ['taschendiebstahl'], value: 1, label: 'Schnelle Hände' }], traits: ['taschendieb-fenster-30', 'gegenstand-gratis'],
  },
  {
    id: 'perk-doppelschritt', name: 'Doppelschritt', attribute: 'reflexe', min: 6, level: 5,
    description: '+10 % Lauftempo, Verfolgungen 10 Sekunden länger. Im Kampf +1 Bewegung.',
    checkBonus: [{ tags: ['flucht'], value: 1, label: 'Doppelschritt' }], combat: { move: 1 }, traits: ['lauftempo-10'],
  },
  {
    id: 'perk-ausweichrolle', name: 'Ausweichrolle', attribute: 'reflexe', min: 8, level: 9,
    description: 'Sichtkegel bemerken dich eine halbe Sekunde später. Überwachungsfeuer gegen dich −20.',
    checkBonus: [{ tags: ['schleichen'], value: 1, label: 'Ausweichrolle' }], traits: ['sichtkegel-traege', 'ueberwachung-minus-20'],
  },
  {
    id: 'perk-zeitlupe', name: 'Zeitlupe', attribute: 'reflexe', min: 10, level: 14,
    description: 'Minispiel-Zeitlimits ×1,5. Einmal pro Kampf ein zweiter Angriff im selben Zug.',
    traits: ['minispiel-zeit-150', 'zweiter-angriff'],
  },

  // --- Ausstrahlung ----------------------------------------------------------------------------------------
  {
    id: 'perk-anfeuern', name: 'Anfeuern', attribute: 'ausstrahlung', min: 4, level: 2,
    description: 'Tagesgespräch +10 zusätzlich. Begleiter in 2 Feldern +5 Trefferchance.',
    talkBonus: 10, traits: ['anfeuern'],
  },
  {
    id: 'perk-einschuechtern', name: 'Einschüchtern', attribute: 'ausstrahlung', min: 6, level: 5,
    description: 'Schulden-Aufträge: Ausstrahlung zählt auch für Körper-Checks. „Ansprechen“ senkt die Moral zusätzlich um 20.',
    substitute: [{ use: 'ausstrahlung', for: 'koerper', tags: ['schulden'] }],
    checkBonus: [{ tags: ['einschuechtern'], value: 1, label: 'Einschüchtern' }], traits: ['ansprechen-moral-20'],
  },
  {
    id: 'perk-kapitulation', name: 'Kapitulation', attribute: 'ausstrahlung', min: 8, level: 9,
    description: 'Einmal pro Tag ein misslungenes Gespräch neu beginnen. Gegner ergeben sich schon bei Moral 30.',
    traits: ['gespraech-neu', 'kapitulation-30'],
  },
  {
    id: 'perk-anfuehrer', name: 'Anführerin/Anführer', attribute: 'ausstrahlung', min: 10, level: 14,
    description: 'Begleiter-Herzpunkte aus gemeinsamen Siegen verdoppelt. Begleiter starten „Ermutigt“.',
    traits: ['sieg-herzen-doppelt', 'party-ermutigt'],
  },

  // --- Straße ----------------------------------------------------------------------------------------------
  {
    id: 'perk-taschen-leeren', name: 'Taschen leeren', attribute: 'strasse', min: 4, level: 2,
    description: 'Händler −5 %. Im Kampf +25 % Beute.',
    shopDiscount: 5, traits: ['beute-25'],
  },
  {
    id: 'perk-sand-in-die-augen', name: 'Sand in die Augen', attribute: 'strasse', min: 6, level: 5,
    description: 'Wegzoll und Schutzgeld halbiert. Schmutziger Trick gegen Gangs ohne Check.',
    traits: ['wegzoll-halb', 'schmutziger-trick'],
  },
  {
    id: 'perk-hinterhalt', name: 'Hinterhalt', attribute: 'strasse', min: 8, level: 9,
    description: 'Zwei zusätzliche Gerüchte pro Abend im High Voltage. „Überrumpelt“ auch aus Seitenrichtung.',
    checkBonus: [{ tags: ['geruecht'], value: 1, label: 'Hinterhalt' }], traits: ['geruechte-plus-2', 'ueberrumpeln-seite'],
  },
  {
    id: 'perk-kennt-jeden', name: 'Kennt jeden', attribute: 'strasse', min: 10, level: 14,
    description: 'Jeder Händler verkauft einen Gegenstand unter der Hand. Einmal pro Kampf Verstärkung rufen.',
    traits: ['unter-der-hand', 'verstaerkung-rufen'],
  },
];

export const PERKS: Record<string, CharacterPerkDef> = Object.fromEntries(PERK_LIST.map((p) => [p.id, p]));

/** Cyberware kommt aus den Inhaltsteilen (parts/system/cyberware.ts). */
export const CYBERWARE: Record<string, CharacterCyberwareDef> = {};
