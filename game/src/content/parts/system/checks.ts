// Gesprächs- und Welt-Checks aller Akte (world.md §7, design.md §3.2). Wert = Attribut + Boni ≥ Schwelle, kein Würfel.
//
// Stichwörter (`tags`) sind der Haken für Perks, Cyberware, Kleidung und Gegenstände (CheckBonusRule/AutoPassRule).
// Verbindliches Vokabular (bitte in Perks/Cyberware/Gegenständen genau so verwenden):
//   hacken       – Systeme knacken, Code umschreiben          (kopf-fx-60 +1 Technik, kopf-nexus-splitter alle Technik)
//   terminal     – Konsole, Kasse, Formularsystem, Logs       (arme-datenbuchse +1 Technik)
//   maschine     – Mechanik, Generatoren, Roboter, Winden     (dexters-schraubschluessel +1 Technik)
//   reparieren   – etwas Kaputtes wieder ganz machen
//   drohne       – Drohnen umleiten, umprogrammieren, fangen
//   geruecht     – Gerüchte, Klatsch, Erinnerungen der Leute  (kopf-merkchip-alt +1 Straße)
//   welt         – Welt-Check an einem Hotspot                (arme-greifhaken +1 Körper bei Welt-Checks)
//   dach         – Sprünge und Wege über Dächer und Höhen     (dachlaeuferin: ohne Check)
//   flucht       – Fluchtwege, Verfolgungen                   (dachlaeuferin, perk-doppelschritt)
//   springen, klettern, schleichen, taschendiebstahl, fernkampf, tauchen, beobachten, verstecke
//   verklemmt    – Festgerostetes/Verklemmtes aufstemmen      (perk-rammbock: ohne Check bis Schwelle 6)
//   kraft        – rohe Körperkraft (heben, halten, schieben)
//   gift         – Giftnebel aushalten                        (perk-dickes-fell, haut-filtermembran)
//   sandsturm    – Ödnis-Wetter                               (outfit-oednis +1 Körper im Sandsturm)
//   schulden     – Schulden eintreiben                        (perk-einschuechtern: Ausstrahlung statt Körper)
//   einschuechtern, ueberreden, verhandeln, feilschen, bluff, flirt, etikette, buehne, trost
//
// Boni hier sind situativ (Herkunft, Herzen, Ruf, Flags, Gegenstände im Inventar). Ein Bonus von +10 heißt
// „automatisch bestanden“ (world.md nennt den Weg ausdrücklich als Ersatz, z. B. `[Ödnis]` bei gc-92).
// Ersatzwege ohne Check stehen als Kommentar dabei; Dialoge und Hotspots müssen sie anbieten.
import type { CheckBonusDef, CheckDef, AttributeId, Condition, FactionId } from '../../../modules/contracts';
import type { ContentPart } from '../../part';

interface Extra {
  bonuses?: CheckBonusDef[];
  hiddenIfFailed?: boolean;
  faction?: FactionId;
}

function c(id: string, attribute: AttributeId, threshold: number, tags: string[], extra: Extra = {}): CheckDef {
  return { id, attribute, threshold, tags, ...extra };
}

/** Bonus, der den Check sicher bestehen lässt. */
const auto = (when: Condition, label: string): CheckBonusDef => ({ when, value: 10, label });
const plus = (when: Condition, value: number, label: string): CheckBonusDef => ({ when, value, label });

const T: AttributeId = 'technik';
const K: AttributeId = 'koerper';
const R: AttributeId = 'reflexe';
const A: AttributeId = 'ausstrahlung';
const S: AttributeId = 'strasse';

const LIST: CheckDef[] = [
  // ------------------------------------------------------------------ Akt 1 · Hauptquests
  // main-1-ankunft
  c('gc-01', S, 4, ['geruecht', 'einschuechtern']), // Abzieher aufs Rostzahn-Revier hinweisen. Ersatz: [Gosse], Kampf enc-bahnhof-abzieher
  c('gc-02', A, 5, ['ueberreden']), // „Ich bin mit Hunter verabredet.“ Ersatz: Kampf, zahlen
  c('gc-03', R, 4, ['springen', 'flucht', 'welt']), // über die Gleise springen. Ersatz: Kampf
  // main-1-probezeit
  c('gc-04', A, 3, ['ueberreden'], { // Türsteher Bruno. Ersatz: Hunters Nachricht zeigen oder 20 Cr
    bonuses: [auto({ cyberware: 'haut-neonnaehte' }, 'Neonnähte: Clubeintritt frei')],
  }),
  c('gc-05', T, 5, ['hacken', 'reparieren']), // Virus im Kinder-Implantat. Ersatz: zahlen, Kampf, Hunter regelt es
  c('gc-06', K, 6, ['kraft', 'einschuechtern', 'schulden'], { faction: 'zerleger' }), // Ripper die Waffe abnehmen
  c('gc-07', S, 5, ['geruecht', 'einschuechtern'], { faction: 'zerleger' }), // Rippers „Ersatzteile“ ansprechen
  c('gc-08', A, 4, ['ueberreden', 'trost'], { // Aria soll Nyra loslassen
    bonuses: [plus({ hearts: 'aria', min: 2 }, 1, 'Aria hört auf dich')],
  }),
  // main-1-dexter
  c('gc-45', T, 4, ['hacken', 'drohne', 'maschine']), // Drohnen-Begrüßungsmodus. Ersatz: Schleichen, Kampf enc-schrott-drohnen
  c('gc-09', K, 5, ['kraft', 'einschuechtern', 'schulden', 'welt']), // Schrottwürfel abstellen (500 Cr)
  c('gc-10', T, 5, ['hacken', 'terminal'], { // Nebenkonto (800 Cr)
    bonuses: [plus({ companion: 'vega' }, 1, 'Vega zeigt auf die Zahlen')],
  }),
  c('gc-11', S, 6, ['geruecht', 'verstecke'], { hiddenIfFailed: true }), // Ölfass mit doppeltem Boden
  c('gc-12', A, 6, ['verhandeln', 'feilschen']), // Anteil verhandeln: 20 % für alle
  // main-1-raven
  c('gc-13', A, 5, ['ueberreden'], { // „Ich glaube eher, er schuldet dir was.“ Ersatz: [Ödnis], [Knast], gc-15, Flucht
    bonuses: [plus({ hearts: 'raven', min: 1 }, 1, 'Raven mag dich')],
  }),
  c('gc-14', R, 6, ['springen', 'flucht', 'welt']), // Abkürzung über die Marktstände. Ersatz: Aria-Ringkampf, Raven kommt abends selbst
  c('gc-15', S, 4, ['verhandeln']), // Runde Neon-Limo aufs Haus versprechen
  // main-1-auf-raven
  c('gc-16', S, 5, ['geruecht', 'schleichen'], { hiddenIfFailed: true }), // Quantum-Fahrer belauschen → geruecht-master
  c('gc-17', A, 7, ['buehne'], { // Rede auf dem Tresen
    bonuses: [
      plus({ hearts: 'raven', min: 2 }, 1, 'Raven grinst dich an'),
      plus({ rep: 'crew-hunter', min: 20 }, 1, 'Die Crew johlt mit'),
    ],
  }),
  // main-1-dante
  c('gc-18', T, 4, ['maschine', 'reparieren']), // Faxgerät würdigen
  c('gc-19', A, 6, ['ueberreden', 'trost'], { // Nyra darf schweigend mit
    bonuses: [plus({ hearts: 'nyra', min: 2 }, 1, 'Nyra vertraut dir')],
  }),
  c('gc-20', R, 5, ['schleichen'], { hiddenIfFailed: true }), // am Fenster lauschen
  c('gc-21', A, 7, ['ueberreden', 'trost'], { // „Allein ist man nicht frei. Nur allein.“
    bonuses: [plus({ hearts: 'nyra', min: 3 }, 1, 'Nyra hört dir zu')],
  }),
  // Vorbereitungen
  c('gc-22', T, 6, ['hacken', 'drohne']), // prep-grundriss: Lieferdrohne umleiten. Ersatz: gc-104, Kameramann 300 Cr, [Ex-Wache]
  c('gc-104', A, 4, ['ueberreden', 'trost']), // prep-grundriss: Pim Mitgefühl zeigen (Serviette)
  c('gc-23', R, 6, ['taschendiebstahl', 'schleichen']), // prep-zugangskarte: Taschendiebstahl bei Pfeffer. Ersatz: gc-24, behoerdenkarte, Kampf
  c('gc-24', A, 5, ['buehne', 'ueberreden']), // prep-zugangskarte: Karaoke-Wette
  c('gc-25', S, 5, ['geruecht']), // prep-wachplan: Wachmann mit Xion-Klatsch. Ersatz: mit Vega beobachten, Lieferzone
  c('gc-26', S, 6, ['verhandeln', 'geruecht'], { // prep-fluchtweg: Bürgermeister Gully. Ersatz: Kampf, 3 Ersatzteile
    faction: 'kanalvolk',
    bonuses: [plus({ rep: 'kanalvolk', min: 20 }, 1, 'Ehrenwertes Kanalvolk')],
  }),
  c('gc-27', A, 6, ['ueberreden', 'buehne'], { // prep-ablenkung: Exklusivstory für Collin. Ersatz: Kinder-Turnier, Feuerwerk, Dexter
    faction: 'nx1-medien',
    bonuses: [plus({ hearts: 'collin-charleston', min: 2 }, 1, 'Collin wittert die Story')],
  }),
  c('gc-28', T, 7, ['hacken']), // main-1-der-plan: Notschalter vorschlagen

  // ------------------------------------------------------------------ Akt 2 · Hauptquests
  c('gc-29', T, 7, ['hacken', 'terminal']), // main-2-bruch: Nyras Abschirmung
  c('gc-105', T, 6, ['hacken', 'maschine', 'welt']), // main-2-bruch: Außenwand-Panel (eigener Eingang)
  c('gc-30', R, 7, ['flucht']), // main-2-bruch: Fesselhalterung lösen. Ersatz: Vega-Schuss
  c('gc-31', S, 6, ['feilschen', 'verhandeln'], { faction: 'zerleger' }), // main-2-kanal: Ripper mit 700 überbieten. Ersatz: Zerberster-Attrappe
  c('gc-32', A, 7, ['bluff'], { // main-2-kanal: „Da ist ein Virus drauf.“ (automatisch nach gc-05)
    bonuses: [auto({ seen: 'check:gc-05' }, 'Du kennst das Virus schon')],
  }),
  c('gc-33', K, 7, ['kraft', 'schleichen']), // main-2-kanal: Xion überraschen
  c('gc-34', T, 6, ['reparieren', 'maschine']), // main-2-countdown: richtige Leitung. Ersatz: Wurf in die Gasse
  c('gc-35', A, 6, ['ueberreden', 'trost'], { // main-2-krisensitzung: Hunter aus der Resignation. Ersatz: Raven überzeugt ihn
    bonuses: [plus({ hearts: 'hunter', min: 4 }, 1, 'Hunter vertraut dir')],
  }),
  c('gc-36', S, 7, ['verhandeln']), // main-2-krisensitzung: Releaseparty-Idee selbst einbringen

  // ------------------------------------------------------------------ Akt 3 · Hauptquests
  c('gc-38', A, 6, ['etikette', 'ueberreden'], { // main-3-einlass: Haupteingang
    bonuses: [
      auto({ origin: 'origin-oberstadt' }, '[Oberstadt] Du gehörst hierher'),
      plus({ item: 'outfit-party' }, 1, 'Partygarderobe'),
    ],
  }),
  c('gc-39', S, 5, ['geruecht', 'verstecke']), // main-3-einlass: mit dem Catering
  c('gc-40', R, 7, ['klettern', 'schleichen', 'welt']), // main-3-einlass: Lüftungsschacht
  c('gc-41', T, 7, ['hacken', 'terminal']), // main-3-einlass: Gästeliste ändern
  c('gc-42', A, 7, ['ueberreden'], { // main-3-labor: Alesa mit Fachgespräch ablenken. Ersatz: Hunter flirtet
    bonuses: [plus({ attr: 'technik', min: 6 }, 1, 'Du redest ihre Sprache')],
  }),
  c('gc-43', A, 8, ['bluff']), // main-3-labor: Hubschrauber-Lüge
  c('gc-44', T, 9, ['hacken'], { // main-3-gedankenkontrolle: Ravens Chip trennen. Ersatz: Dantes Geständnis, [Raven ♥8], Kampf
    bonuses: [plus({ item: 'nexus-forschungsdaten' }, 1, 'Nexus-Forschungsdaten')],
  }),
  c('gc-46', T, 8, ['hacken', 'terminal'], { // main-3-nexus: Nexus umschreiben
    bonuses: [
      plus({ item: 'nexus-forschungsdaten' }, 1, 'Nexus-Forschungsdaten'),
      plus({ flag: 'alesa_zweifel' }, 1, 'Alesas Hintertür'),
    ],
  }),
  c('gc-47', A, 9, ['ueberreden']), // main-3-nexus: Nexus von seinen Fehlern überzeugen
  c('gc-48', A, 8, ['einschuechtern', 'ueberreden']), // main-3-blade: „Darum stehst du jetzt allein hier oben.“
  c('gc-49', K, 8, ['kraft']), // main-3-blade: am Mantel festhalten

  // ------------------------------------------------------------------ Akt 1 · Nebenquests
  c('gc-50', T, 5, ['maschine', 'reparieren', 'welt']), // side-uebliche-verspaetung: Stellwerk. Ersatz: dexters-schraubschluessel (1 Std.)
  c('gc-51', S, 6, ['geruecht', 'verhandeln']), // side-uebliche-verspaetung: Blitz fliegt ohne Lizenz
  c('gc-52', A, 5, ['ueberreden'], { // side-zehn-credits: Oma Volt stellt die Kinder an
    bonuses: [plus({ hearts: 'oma-volt', min: 2 }, 1, 'Oma Volt mag dich')],
  }),
  c('gc-53', T, 4, ['reparieren', 'hacken']), // side-zehn-credits: Implantat gemeinsam reparieren
  c('gc-54', S, 5, ['geruecht']), // side-riegel-krise: Schmuggler Knuspi finden
  c('gc-55', A, 4, ['ueberreden', 'flirt']), // side-keksalarm: „abgelaufene“ Butter
  c('gc-56', K, 3, ['kraft', 'maschine']), // side-keksalarm: Ofen-Tritt
  c('gc-57', A, 5, ['trost'], { // side-eins-turnier: Dante beruhigen
    bonuses: [plus({ hearts: 'dante', min: 3 }, 1, 'Dante atmet mit dir')],
  }),
  c('gc-58', T, 7, ['hacken']), // side-jimmys-chip: Ruhemodus. Ersatz: [Vega ♥4], Lieblingsplatte, Kampf
  c('gc-59', S, 6, ['geruecht']), // side-jimmys-chip: Ripper-Seriennummer erkennen
  c('gc-60', T, 6, ['hacken', 'terminal']), // side-chrome-10: Gerds Kassenterminal
  c('gc-61', K, 5, ['einschuechtern', 'schulden']), // side-chrome-10: Gerd vor Publikum einschüchtern
  c('gc-62', T, 6, ['hacken', 'terminal']), // side-eingehendes-fax: Faxe sofort entschlüsseln. Ersatz: warten
  c('gc-63', S, 4, ['geruecht'], { // side-eingehendes-fax: Kuriercodes der Hafenarbeiter
    bonuses: [auto({ origin: 'origin-ex-wache' }, '[Ex-Wache] Kennst du aus dem Dienst')],
  }),
  c('gc-64', S, 5, ['feilschen'], { // side-schallplatten: Vinyl-Vincent auf ein Drittel
    bonuses: [plus({ hearts: 'vinyl-vincent', min: 2 }, 1, 'Vincent mag dich')],
  }),
  c('gc-65', K, 5, ['tauchen', 'welt']), // side-live-dabei: tauchen. Ersatz: gc-66, magnetangel, Kampf
  c('gc-66', T, 4, ['drohne', 'hacken']), // side-live-dabei: Notfallprotokoll der Drohne
  c('gc-67', A, 6, ['ueberreden'], { // side-feierabend-fuer-kessel: Richter überzeugen. Ersatz: gc-68, Kampf, Kisten nachts
    faction: 'ordnungsdienst',
    bonuses: [plus({ origin: 'origin-ex-wache' }, 1, '[Ex-Wache] Du kennst den Dienstweg')],
  }),
  c('gc-68', T, 5, ['terminal']), // side-feierabend-fuer-kessel: Formular „vorgenehmigen“
  c('gc-69', T, 7, ['hacken', 'terminal']), // side-streaming-suenden: Eintrag löschen. Ersatz: [Dante ♥4], Server nachts
  c('gc-70', S, 6, ['einschuechtern'], { faction: 'ordnungsdienst' }), // side-streaming-suenden: Druck machen
  c('gc-71', T, 4, ['maschine', 'reparieren']), // side-neon-limo: Mixi reparieren
  c('gc-72', A, 5, ['ueberreden'], { // side-neon-limo: Oma Volts Familienrezept
    bonuses: [plus({ hearts: 'oma-volt', min: 3 }, 1, 'Oma Volt mag dich')],
  }),
  c('gc-73', T, 5, ['maschine', 'reparieren']), // side-rattenkoenig: Lebendfalle mit Käseköder. Ersatz: Kampf, Captain Kuschel, [Gosse]
  c('gc-74', A, 6, ['ueberreden'], { // side-abzieher: ehrliche Arbeit
    bonuses: [plus({ origin: 'origin-gossenkind' }, 1, '[Gosse] Knut kennt dich aus der Suppenküche')],
  }),
  c('gc-75', T, 5, ['reparieren']), // side-zweite-hand: Frau Klingels Hörimplantat
  c('gc-76', T, 6, ['hacken', 'terminal']), // side-digitech-geist: Notstrom- und Dienstplan-Logs. Ersatz: gc-77, [Raven ♥3]
  c('gc-77', S, 5, ['geruecht']), // side-digitech-geist: alte Hafenarbeiter erinnern sich
  c('gc-78', S, 7, ['einschuechtern'], { // side-oma-volts-lager: „Dieser Stand steht unter Hunters Schutz.“
    faction: 'rostzaehne',
    bonuses: [plus({ rep: 'crew-hunter', min: 20 }, 1, 'Hunters Name zieht')],
  }),
  c('gc-79', T, 6, ['maschine', 'reparieren']), // side-oma-volts-lager: Opa Blech reaktivieren
  c('gc-80', A, 5, ['ueberreden', 'bluff']), // side-thai-chi: Aria mit Kran-Mutprobe ablenken. Ersatz: Hinterhöfe, [Aria ♥5]
  c('gc-81', T, 6, ['hacken', 'drohne']), // side-hunde-der-brackbucht: Alpha umprogrammieren → Bolzen
  c('gc-82', R, 6, ['springen', 'welt']), // side-drohnenrennen: Abkürzung durchs Kranfundament
  c('gc-83', R, 7, ['fernkampf']), // pers-vega-adlerauge: selbst schießen. Ersatz: Wind-Minispiel mit Vega, nachts holen, Kampf
  c('gc-84', K, 6, ['kraft']), // pers-aria-lieblingsshirt: Armdrücken mit dem Roadie. Ersatz: Tausch, [Hunter ♥4], Fälschung
  c('gc-85', S, 6, ['geruecht']), // pers-raven-handschellen: Hehler finden. Ersatz: behoerdenkarte, presseausweis
  c('gc-113', S, 5, ['feilschen'], { faction: 'kanalvolk' }), // side-rostlaube: Kühlerpumpe von Fluss-Frieda. Ersatz: Gustav-Tausch, Pumpwerk
  c('gc-114', T, 5, ['reparieren', 'maschine']), // side-rostlaube: Batterie aus Schrott löten
  c('gc-115', T, 4, ['reparieren', 'maschine'], { // side-rostlaube: Teile einbauen. Ersatz: Dante ♥2
    bonuses: [plus({ hearts: 'opa-gustav', min: 2 }, 1, 'Gustav reicht das Werkzeug')],
  }),
  c('gc-116', R, 5, ['schleichen']), // side-container-77: Beweisfoto
  c('gc-117', T, 6, ['hacken', 'terminal']), // side-container-77: Container hacken
  c('gc-118', S, 6, ['einschuechtern'], { // side-container-77: Ripper unter vier Augen stellen
    faction: 'zerleger',
    bonuses: [plus({ flag: 'ripper_kennt_dich' }, 1, 'Ripper kennt dich')],
  }),
  c('gc-119', T, 6, ['maschine', 'reparieren']), // side-strom-fuer-die-rohre: Generator. Ersatz: 3 Ersatzteile + 1 Tag
  c('gc-120', A, 4, ['ueberreden']), // side-strom-fuer-die-rohre: Mira Lötzinn überreden (Kabel gratis)
  c('gc-121', T, 5, ['reparieren'], { // side-lumos-platte: Kratzer mit Dantes Methode glätten
    bonuses: [plus({ hearts: 'dante', min: 2 }, 1, 'Dantes Methode')],
  }),
  c('gc-122', S, 4, ['geruecht']), // side-collins-peruecke: Gerücht verfolgen
  c('gc-123', T, 4, ['drohne', 'hacken']), // side-collins-peruecke: Taubendrohne umleiten
  c('gc-124', A, 6, ['buehne'], { // side-collins-peruecke: ehrlich ohne Perücke auf Sendung. Ersatz: Gina 100 Cr
    bonuses: [plus({ hearts: 'collin-charleston', min: 3 }, 1, 'Collin vertraut dir')],
  }),
  c('gc-125', K, 6, ['kraft', 'welt']), // side-rettung-am-rechen: Gitter halten. Ersatz: Seilwinde, Bolzen, Floß-Minispiel
  c('gc-126', S, 5, ['geruecht', 'verstecke']), // side-wand-der-freiheit: Farbe aus dem Rostzähne-Lager. Ersatz: kaufen 90 Cr
  c('gc-142', R, 6, ['klettern', 'schleichen', 'welt']), // side-alte-gewohnheiten: Wäscheschacht. Ersatz: [Kiki ♥4], Kampf
  c('gc-143', T, 6, ['hacken', 'maschine', 'terminal']), // side-alte-gewohnheiten: Lastenaufzug auf „Blumenlieferung“
  c('gc-144', A, 5, ['bluff'], { faction: 'chrome-haus' }), // side-alte-gewohnheiten: Portier Albert abwimmeln

  // ------------------------------------------------------------------ Akt 2 · Nebenquests und persönliche Quests
  c('gc-37', T, 8, ['hacken']), // pers-nyra-silent-angel: Signalanalyse → peilsender_entdeckt
  c('gc-98', A, 6, ['trost', 'ueberreden'], { // pers-nyra-silent-angel: „Wir lassen dich nicht zurück.“
    bonuses: [plus({ hearts: 'nyra', min: 6 }, 1, 'Nyra glaubt dir')],
  }),
  c('gc-86', A, 7, ['ueberreden', 'etikette'], { faction: 'chrome-haus' }), // side-teekraenzchen: Sybella mit Fakten
  c('gc-87', T, 6, ['hacken', 'terminal']), // side-teekraenzchen: Alesas Kalender verschieben
  c('gc-88', T, 7, ['hacken', 'maschine']), // side-alesas-zuendholz: Löschmodus. Ersatz: Löschwassertank, Bosskampf
  c('gc-89', A, 6, ['trost', 'ueberreden'], { // side-alesas-zuendholz: Alesa stärken
    bonuses: [plus({ hearts: 'alesa-zero', min: 4 }, 1, 'Alesa hört dir zu')],
  }),
  c('gc-90', T, 5, ['hacken']), // side-ki-fluestern: Wartungsmodus. Ersatz: chip-blocker, Dantes Kekse
  c('gc-91', A, 6, ['trost']), // side-ki-fluestern: persönliche Erinnerung
  c('gc-92', S, 6, ['sandsturm'], { // side-weg-zum-meer: Wind lesen. Ersatz: einen Tag warten
    bonuses: [auto({ origin: 'origin-oednis' }, '[Ödnis] Du kennst diesen Wind')],
  }),
  c('gc-93', A, 6, ['ueberreden', 'buehne'], { faction: 'staubfalken' }), // side-weg-zum-meer: Zoll mit einer Geschichte. Ersatz: 300 Cr, Kampf
  c('gc-94', T, 6, ['maschine', 'reparieren', 'welt']), // side-weg-zum-meer: Seilwinde. Ersatz: gc-103
  c('gc-103', K, 7, ['klettern', 'kraft', 'sandsturm', 'welt']), // side-weg-zum-meer: über die Schlucht hangeln
  c('gc-95', A, 5, ['verhandeln', 'trost']), // side-captain-kuschel: geteiltes Sorgerecht. Ersatz: Captain Kuschel II, [Jakko ♥5]
  c('gc-96', R, 8, ['flucht']), // side-xions-kralle: Konter
  c('gc-97', A, 7, ['einschuechtern']), // side-xions-kralle: Blades Spott zitieren
  c('gc-127', T, 5, ['hacken', 'terminal'], { // pers-aria-zerberster: Einbaubeleg im Faxspeicher
    bonuses: [auto({ flag: 'aria_kern_ripper' }, 'Du weißt schon, dass es Ripper-Ware ist')],
  }),
  c('gc-128', S, 7, ['einschuechtern'], { // pers-aria-zerberster: Ripper mit Container 77 erpressen
    faction: 'zerleger',
    bonuses: [plus({ flag: 'ripper_kennt_dich' }, 1, 'Ripper kennt dich')],
  }),
  c('gc-129', R, 6, ['springen']), // side-chrome-pudel: Bijou einfangen. Ersatz: leckerli-schraube, Bolzen
  c('gc-130', A, 5, ['ueberreden']), // side-hartlaufs-rache: Ole Gähn wach halten
  c('gc-131', T, 7, ['hacken', 'maschine']), // side-hartlaufs-rache: Wachkoloss umprogrammieren
  c('gc-132', S, 8, ['einschuechtern'], { faction: 'rostzaehne' }), // side-rostzaehne-ende: Funzel bloßstellen
  c('gc-133', A, 6, ['ueberreden', 'buehne'], { // side-rostzaehne-ende: Hafenstreik
    bonuses: [plus({ rep: 'unterstadt', min: 20 }, 1, 'Die Unterstadt steht hinter dir')],
  }),
  c('gc-134', R, 7, ['springen']), // side-kraehes-ehre: Sprungschanze im Wrackrennen
  c('gc-135', A, 6, ['buehne'], { faction: 'staubfalken' }), // side-kraehes-ehre: eine Geschichte, die Krähe nicht kennt
  c('gc-136', A, 8, ['verhandeln'], { faction: 'aussiedler' }), // side-oednis-frieden: Friedensvertrag. Ersatz: 2 wasserfilter
  c('gc-137', S, 7, ['verhandeln'], { faction: 'staubfalken' }), // side-oednis-frieden: Eskorte statt Zoll
  c('gc-138', S, 6, ['feilschen']), // side-glasherz: Brösel das Ei abschwatzen. Ersatz: Ei zurück, Glasperlen
  c('gc-139', T, 6, ['maschine', 'reparieren']), // side-verlorene-frequenz: Windrad

  // ------------------------------------------------------------------ Nachspiel
  c('gc-99', S, 7, ['verhandeln'], { faction: 'staubfalken' }), // side-strandclub: Krähe als Teilhaberin
  c('gc-100', T, 7, ['maschine', 'hacken'], { // side-strandclub: Shuttle automatisieren
    bonuses: [plus({ cyberware: 'kopf-fx-60' }, 1, 'FX-60 fährt mit')],
  }),
  c('gc-101', T, 9, ['hacken', 'terminal']), // side-zweite-chance: Nexus allein herunterfahren. Ersatz: gc-102
  c('gc-102', A, 8, ['ueberreden']), // side-zweite-chance: Nexus überzeugen
  c('gc-140', A, 6, ['verhandeln', 'etikette'], { faction: 'chrome-haus' }), // side-offene-werkstatt: Seraphina als Geldgeberin
  c('gc-141', T, 6, ['hacken', 'maschine']), // side-offene-werkstatt: Serverkern zum Stadtnetz umbauen

  // ------------------------------------------------------------------ Welt: Zugänge
  c('gc-106', A, 6, ['etikette', 'ueberreden', 'welt'], { // Drehkreuz Glasarkaden (Akt 1). Ersatz: act2, outfit-ordentlich, presseausweis, Feinkost-Lieferanteneingang
    bonuses: [
      auto({ origin: 'origin-oberstadt' }, '[Oberstadt] Das Drehkreuz kennt dich'),
      auto({ item: 'presseausweis' }, 'Presseausweis'),
    ],
  }),
  c('gc-107', R, 6, ['klettern', 'schleichen', 'welt']), // Bauzaun Digitech-Areal (Akt 1). Ersatz: act2, Digitech-Auftrag
  c('gc-108', A, 7, ['etikette', 'bluff'], { // Liftboy am Panoramaaufzug. Ersatz: ausweis-oberstadt, Ruf chrome-haus 20, act3
    faction: 'chrome-haus',
    bonuses: [plus({ item: 'outfit-party' }, 1, 'Partygarderobe')],
  }),
  c('gc-109', T, 7, ['hacken', 'terminal', 'welt'], { // Lieferzone Digitech → Campus (nur act2). Ersatz: karte-lieferzone
    bonuses: [auto({ item: 'karte-lieferzone' }, 'Karte Lieferzone')],
  }),
  c('gc-110', T, 6, ['hacken', 'maschine', 'welt'], { // Schott zum Datentunnel (Akt 1 nur als Hinweis). Ersatz: schottschluessel
    bonuses: [auto({ item: 'schottschluessel' }, 'Schottschlüssel')],
  }),
  c('gc-111', K, 8, ['gift', 'welt'], { // Giftnebel der Glasdünen. Ersatz: haut-filtermembran, staubmaske
    bonuses: [
      auto({ cyberware: 'haut-filtermembran' }, 'Filtermembran'),
      auto({ item: 'staubmaske' }, 'Staubmaske'),
      auto({ perk: 'perk-dickes-fell' }, 'Dickes Fell'),
    ],
  }),
  c('gc-112', T, 6, ['hacken', 'terminal', 'welt']), // Digitech-Archiv → kuestenkarte-fragment. Ersatz: Hartlauf ab Ruf digitech 20

  // ------------------------------------------------------------------ Welt: Abkürzungen und Verstecke (Akt 1)
  c('gc-145', K, 6, ['kraft', 'welt'], { // hafenkante: Container im Labyrinth schieben → Abkürzung, glueckstern-08
    bonuses: [
      auto({ cyberware: 'arme-greifhaken' }, 'Greifhaken'),
      auto({ hearts: 'hafen-hannes', min: 2 }, 'Hafen-Hannes packt mit dem Greifarm an'),
    ],
  }),
  c('gc-146', K, 5, ['klettern', 'welt'], { // rohrsiedlung: Rohr zum Wasserturm → Aussichtspunkt, glueckstern-06
    bonuses: [auto({
      any: [{ hearts: 'daria', min: 2 }, { hearts: 'freya', min: 2 }, { hearts: 'jakko', min: 2 }],
    }, 'Die Kinder lassen dir ihre Leiter runter')],
  }),
  c('gc-147', K, 7, ['kraft', 'tauchen', 'welt'], { // kanal-sammler: gegen die Strömung zum Rechen-Versteck → datenwuerfel-18. Ersatz: Floß-Minispiel
    bonuses: [auto({ item: 'outfit-kanal' }, 'Kanal-Watanzug')],
  }),
  c('gc-148', K, 4, ['kraft', 'verklemmt', 'maschine', 'welt'], { // schrottmarkt: Gustavs Kranhebel → Kranfahrt, Gustav ♥ +20
    bonuses: [auto({ item: 'oelkaennchen' }, 'Ölkännchen')],
  }),
  c('gc-149', K, 6, ['kraft', 'welt'], { // flutmauer: Treibgutnetz bei Ebbe → schallplatte-07
    bonuses: [auto({ item: 'magnetangel' }, 'Magnetangel')],
  }),
  c('gc-150', R, 7, ['springen', 'dach', 'welt'], { // neon-gasse: Dachsprung zu den Lötgassen → Abkürzung, schallplatte-03
    bonuses: [
      auto({ cyberware: 'beine-sprungfedern' }, 'Sprungfedern'),
      auto({ cyberware: 'arme-greifhaken' }, 'Greifhaken'),
    ],
  }),
  c('gc-151', R, 6, ['beobachten', 'welt']), // schrottmarkt: Wett-Willis Hütchentrick → 50 Cr/Tag. Ersatz: Minispiel akt-huetchenspiel
  c('gc-152', R, 6, ['klettern', 'dach', 'welt'], { // hafenkante: Kranausleger → datenwuerfel-06, Aussicht
    bonuses: [auto({ quest: 'pers-vega-adlerauge', state: 'done' }, 'Vegas Kranleiter')],
  }),
  c('gc-153', R, 5, ['drohne', 'springen', 'welt'], { // loetgassen: Taubendrohne fangen → Opa Gurrmann ♥ +40
    bonuses: [auto({ item: 'schrott-ersatzteil' }, 'Ersatzteil als Futter')],
  }),
];

export const part: ContentPart = {
  checks: Object.fromEntries(LIST.map(check => [check.id, check])),
};
