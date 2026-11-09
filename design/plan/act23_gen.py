#!/usr/bin/env python3
"""ID-Plan Akt 2, Akt 3, Enden und Nachspiel (design/plan/act23.json) erzeugen und prüfen.

Aufruf:  python3 design/plan/act23_gen.py          → schreibt act23.json, prüft alle Querverweise
         python3 design/plan/act23_gen.py --check  → prüft nur die vorhandene act23.json

Geprüft wird (wie beim Akt-1-Plan):
  * jeder Ausgang trifft einen vorhandenen Einstieg (neue Karten aus diesem Plan, Akt-1-Karten aus act1.json
    UND aus den echten Kartendateien game/src/content/parts/maps/*.ts),
  * jeder Akt-1-Ausgang zu einer neuen Karte findet dort seinen Einstieg,
  * jeder Einstieg von-<X> hat einen Ausgang von X (sonst Sonder-Einstieg, muss in SPECIAL_ENTRIES stehen),
  * jede Spot-Angabe (Tagesabläufe, Ereignisse, Quests, Begegnungen, Händler, Tafeln, Stationen) gibt es auf ihrer Karte,
  * jede neue Karte steckt in genau einem Paket, höchstens 4 Karten je Paket.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PLAN = ROOT / 'design' / 'plan'
ACT1 = json.loads((PLAN / 'act1.json').read_text())
MAPS_DIR = ROOT / 'game' / 'src' / 'content' / 'parts' / 'maps'

# Sonder-Einstiege (kein Ausgang „von-…“ nötig): Reisen per Effekt, Taxi, Station, Aufwachen, Szenen.
SPECIAL_ENTRIES = {
    'station', 'taxi', 'aufwachen', 'ueberlaufrohr', 'lueftungsschacht', 'lueftung', 'seiteneingang',
    'bruch-treffpunkt', 'party-vorplatz', 'catering', 'wartungsgang', 'ankunft', 'shuttle', 'landeplatz',
}


def ex(id_, to, entry, label, edge, when='', locked=''):
    return {'id': id_, 'to': to, 'entry': entry, 'label': label, 'edge': edge, 'when': when, 'lockedText': locked}


# ---------------------------------------------------------------------------------------------- Karten

MAPS: dict[str, dict] = {}


def karte(id_, name, kind, district, size, lighting, package, ambience, *, parent='', station='', music=None,
          bgVariants=None, shelter='', exits=(), entries=(), spots=None, hotspots=None, unlock='', notes=''):
    m = {
        'name': name, 'kind': kind, 'district': district, 'size': list(size), 'lighting': lighting,
        'package': package, 'parent': parent, 'station': station, 'ambience': ambience,
    }
    if music is not None:
        m['music'] = music
    if bgVariants:
        m['bgVariants'] = bgVariants
    if shelter:
        m['shelter'] = shelter
    m['unlock'] = unlock
    m['exits'] = list(exits)
    m['entries'] = list(entries)
    m['spots'] = spots or {}
    m['hotspots'] = hotspots or {}
    if notes:
        m['notes'] = notes
    MAPS[id_] = m


ZONE = (1536, 1024)
INNEN = (1024, 768)

# ---------------------------------------------------------------- pkg-chrome-himmel: Chrome-Boulevard + Himmelsgarten

karte(
    'chrome-boulevard', 'Chrome-Boulevard', 'zone', 'oberstadt', ZONE, 'outdoor', 'pkg-chrome-himmel', 'oberstadt',
    station='station-chrome-allee',
    bgVariants=['epilog-stiftung (Banner „Chrome-Stiftung für die Unterstadt“ nach he-seraphina-chrome-10)',
                'master (Ende 3: Quantum-Fahnen mit dem Gesicht der Spielfigur, nur als Silhouette/Logo)'],
    unlock='act2 über den Panoramaaufzug (ausweis-oberstadt, Ruf chrome-haus 20, gc-108, act3) oder die Penthouse-Wohnungstür',
    exits=[
        ex('nach-glasarkaden', 'glasarkaden', 'von-chrome-boulevard', 'Panoramaaufzug nach unten', 'tuer'),
        ex('penthouse-tuer', 'chrome-penthouse', 'von-chrome-boulevard', 'Chrome-Penthouse (Portierloge)', 'tuer',
           'act2 und (Portier Albert lässt rein: chrome-einladung, side-teekraenzchen aktiv, Seraphina ♥4, Sybella ♥4, '
           'Keks-Lieferung für side-teekraenzchen oder gc-108 [Ausstrahlung 7]); Nachspiel offen',
           'Portier Albert hebt eine behandschuhte Hand: „Das Haus Chrome empfängt heute nicht. Und Sie, mit Verlaub, empfängt es nie.“'),
        ex('nach-quantum-campus', 'quantum-campus', 'von-chrome-boulevard', 'Zum Quantum-Campus (Außengelände)', 'n', 'act2',
           'Eine Schranke mit Goldrand. Ein Schild: „Quantum-Campus · Nur für Mitarbeitende, Investoren und die Zukunft.“'),
        ex('turmaufzug', 'himmelsgarten', 'von-chrome-boulevard', 'Aufzug Chrome Tower (Himmelsgarten)', 'tuer',
           'act3 oder he-serenity-chrome-6 gesehen (nur Besuch, tags) oder Flag epilog',
           'Der Aufzug hat keinen Knopf, nur ein Ohr aus Messing. Es hört dir zu und sagt: „Nein.“'),
    ],
    entries=['von-glasarkaden', 'von-chrome-penthouse', 'von-quantum-campus', 'von-himmelsgarten', 'station'],
    spots={
        'aufzug-ankunft': 'Ankunft Panoramaaufzug (von glasarkaden); Liftboy grüßt von unten per Lautsprecher',
        'portierloge': 'Portierloge vor dem Penthouse: Portier Albert M/T/A, Concierge-Tafel (act2, Ruf chrome-haus 30), side-chrome-pudel Auftakt/Abschluss, side-teekraenzchen Zutritt',
        'penthouse-eingang': 'Eingang Chrome-Penthouse (drei farbige Balkone darüber): Seraphina/Sybella kommen M heraus',
        'balkone-blick': 'Blick hoch auf die Balkone blau/rot/grün (look, Klatsch)',
        'boutique-chrome': 'Boutique „Chrome & Co.“: Sybella T (Händler chrome-und-co), pers-ripper-taschenuhr, he-sybella-chrome-6/-10',
        'juwelier-glanzstueck': 'Juwelier Glanzstück mit Diamant-Hologramm (Händler glanzstueck, schallplatte-10 selten), Tresor der Blech-Schwestern',
        'boulevard-mitte': 'Mitte des Boulevards: Blade T Mo/Do, re-blade-8, pers-seraphina-plan-b Gala-Bühne, he-seraphina-chrome-10',
        'wolkenbank': 'Bank an der Wolkenkante: he-blade-6 („Auf einer Bank fällt die Maske“), Liebespaare N',
        'promenade': 'Promenade mit Glasbrüstung: Serenity T (außer Mi), akt-hochstapeln Startpunkt',
        'cafe-terrasse': 'Terrasse „Le Nuage“ (Kulisse, kein Händler): akt-hochstapeln Gesprächskette, Klatsch, chrome-einladung-Hinweis',
        'pudelwiese': 'Kunstrasen mit Wasserspender: Bijou T, side-chrome-pudel (Werbedrohne startet hier)',
        'werbedrohne-start': 'Werbedrohnen-Mast (side-chrome-pudel: Drohne hacken [Technik 5])',
        'turmaufzug': 'Aufzug Chrome Tower zum Himmelsgarten (Messing-Ohr)',
        'campus-schranke': 'Schranke Richtung Quantum-Campus (Rand Nord)',
        'blech-schwestern-ecke': 'Hinter dem Juwelier: kopfgeld-blech-schwestern A, enc-kopfgeld-blech-schwestern',
        'ubahn-abgang': 'Zugang station-chrome-allee (goldene Rolltreppe)',
        'auftrag-a': 'Auftragsziel (Oberstadt-Aufträge Rang 4/5, Concierge-Aufträge)',
    },
    hotspots={
        'chrome-und-co': 'shop chrome-und-co (Sybella, T)',
        'glanzstueck': 'shop glanzstueck (T/A bis 19 Uhr)',
        'concierge-tafel': 'board concierge-chrome (act2, Ruf chrome-haus 30)',
        'hochstapeln': 'minigame akt-hochstapeln (cafe-terrasse, T/A)',
        'werbedrohne': 'check (side-chrome-pudel) [Technik 5] oder leckerli-schraube / Bolzen',
        'balkone': 'look: drei Balkone, drei Farben, drei Meinungen',
        'wolkenkante': 'look: Blick über die Wolken auf die Unterstadt (kein Aussichtspunkt, nur Text)',
        'ubahn-zugang': 'use: U-Bahn station-chrome-allee ({ cityMap: true })',
        'datenwuerfel-11': 'loot datenwuerfel-11 (Mülleimer mit Goldrand, akt-schloss)',
        'glueckstern-12': 'loot glueckstern-12 (Brunnenrand bei der wolkenbank)',
    },
)

karte(
    'himmelsgarten', 'Himmelsgarten', 'zone', 'oberstadt', ZONE, 'outdoor', 'pkg-chrome-himmel', 'oberstadt',
    music='releaseparty',
    bgVariants=['party (act3 bis Ende: Lichterkugeln, Glasboden leuchtet, Gäste)', 'gekippt (main-3-gedankenkontrolle nach der Rebellion: umgestürzte Tische, Konfetti, Rauch)',
                'park (Flag epilog: öffentlicher Park, Blumenstand, Hecki)'],
    unlock='act3 (Party), he-serenity-chrome-6 (Besuch tags), Flag epilog (öffentlicher Park)',
    exits=[
        ex('nach-quantum-campus', 'quantum-campus', 'von-himmelsgarten', 'Fußgängerbrücke zum Quantum-Campus', 's',
           'act3 nach main-3-einlass oder Flag epilog', 'Die Brücke ist mit Rosen zugestellt. Ein Schild: „Heute nur für Gäste. Morgen für niemanden.“'),
        ex('turmaufzug', 'chrome-boulevard', 'von-himmelsgarten', 'Aufzug Chrome Tower nach unten', 'tuer'),
        ex('gaesteaufzug', 'quantum-foyer', 'von-himmelsgarten', 'Gästeaufzug ins Quantum-Foyer', 'tuer',
           'act3 oder Flag epilog', 'Der Gästeaufzug fährt nur mit Armband. Du hast kein Armband. Du hast Ellbogen.'),
    ],
    entries=['von-quantum-campus', 'von-chrome-boulevard', 'von-quantum-foyer', 'catering', 'wartungsgang', 'landeplatz'],
    spots={
        'gaesteeingang': 'Ankunft aus dem Gästeaufzug: Einlasskontrolle, Kessel (act3, [Wache ♥8] Abkürzung), Pfeffer als Party-Wache',
        'partysaal': 'Partysaal unter Rosenbögen: gechippte Gäste, enc-turm-raven (main-3-gedankenkontrolle), Spielfigur nimmt/lehnt Chip',
        'tanzflaeche-glas': 'Tanzfläche aus beleuchteten Glasplatten: enc-turm-xion, akt-tanz (Party, optional)',
        'rosenboegen': 'Rosenbögen: he-serenity-chrome-8 (M, Besuch), Liebespaar-Ecke (rom-Abschiedsblick)',
        'buffet': 'Buffet mit Champagnerkühlern: Ziel des Catering-Wegs (gc-39), Dantes Nougatbomben-Versteck',
        'champagnerkuehler': 'Champagnerkühler (Bossphase P2 Korken, Deko)',
        'bar-himmel': 'Bar mit Mixi-Kopie „Mixi Gold“: Gerüchte während der Party, Nexus-Bildschirm (he-ki-nexus-6 Alternative)',
        'vip-lounge': 'VIP-Lounge: Seraphina, Sybella, Serenity (act3), Alesa vor ihrer Ablenkung',
        'rednerbruecke': 'Rednerbrücke über dem Saal: Blades Rede (main-3-gedankenkontrolle), Hunter wird gefesselt, Vega schießt ihn frei',
        'rednerpult': 'Rednerpult mit Hunters Stick-Buchse (Upload 1 vorbereitet), Collin/Delya-Liveschalte',
        'presse-podest': 'Presse-Podest: Collin, Delya, Kameramann live (act3), Interview → meinung',
        'wartungsgang': 'Wartungsgang hinter den Hecken: Ziel des Lüftungswegs (gc-40), Abkürzung zum Landeplatz',
        'antennen': 'Antennenmasten (Bossphase P2 „Handschellen an Antennen“), Funk zu Nyra/Vega',
        'landeplatz': 'Landeplatz mit goldenem Gleiter: main-3-blade, enc-dach-blade; im Nachspiel Kiki landet hier (Einstieg landeplatz)',
        'gleiter': 'Goldener Gleiter (Fluchtziel Blades, Countdown 4 Runden)',
        'hecki': 'Hecki der Gärtnerroboter (immer, schneidet Rosen in Herzform)',
        'serenity-beet': 'Serenitys Beet (Nachspiel M: Serenity gießt, pers-serenity-gewaechshaus Ableger)',
        'blumenstand': 'Blumenstand (Nachspiel, Händler himmelsgarten-blumen)',
        'aussicht-stadt': 'Brüstung mit Blick über ganz Noxius bis zum dunklen Meer (akt-sternegucken „später himmelsgarten“, Nachspiel N)',
        'catering-tuer': 'Hintertür der Küche (Einstieg catering)',
        'bruecke-sued': 'Brückenkopf zur Fußgängerbrücke (zum Quantum-Campus)',
    },
    hotspots={
        'rednerpult': 'use: Rednerpult (main-3-gedankenkontrolle, Hunters Stick)',
        'gleiter': 'use/look: Goldener Gleiter (main-3-blade)',
        'buffet': 'look/use: Buffet (Kekse von Dante tauschen, Ruf nx1-medien bei Fotos)',
        'blumenstand': 'shop himmelsgarten-blumen (Flag epilog)',
        'sternegucken': 'minigame akt-sternegucken (Flag epilog, N, mit Vega)',
        'hecki': 'talk: Hecki (Herz-Rose als Geschenk 1× pro Woche)',
        'glueckstern-13': 'loot glueckstern-13 (Rosenbogen, nur epilog oder während der Party)',
        'datenwuerfel-15': 'loot datenwuerfel-15 (Wartungsgang, akt-hacken)',
    },
)

# ---------------------------------------------------------------- pkg-quantum-campus: Campus + Foyer

karte(
    'quantum-campus', 'Quantum-Campus', 'zone', 'oberstadt', ZONE, 'outdoor', 'pkg-quantum-campus', 'oberstadt',
    bgVariants=['bruch (main-2-bruch aktiv: Nacht, Scheinwerfer, Alarm nach nexus_erwacht)',
                'party (act3: Lichterbögen, roter Teppich, Presse)',
                'offene-werkstatt (side-offene-werkstatt erledigt: Stände, Wimpel)'],
    unlock='act2 Außengelände (Boulevard Rand Nord, Lieferzone mit gc-109/karte-lieferzone, Wartungsleiter aus dem Datentunnel); act3 Party',
    exits=[
        ex('nach-chrome-boulevard', 'chrome-boulevard', 'von-quantum-campus', 'Zum Chrome-Boulevard', 's'),
        ex('lieferzone', 'digitech-areal', 'von-quantum-campus', 'Lieferzone zum Digitech-Areal', 's'),
        ex('foyer-tuer', 'quantum-foyer', 'von-quantum-campus', 'Gläsernes Foyer', 'tuer',
           'act3, Flag epilog, main-2-bruch aktiv (Haupttor-Weg), blades-visitenkarte (einmal, he-blade-4) oder xion-passierschein',
           'Drehtür aus Panzerglas. Sie dreht sich, du nicht. Eine Stimme: „Zutritt verweigert. Haben Sie es schon mit Freundlichkeit versucht?“'),
        ex('seiteneingang', 'quantum-foyer', 'seiteneingang', 'Seiteneingang (Personalschleuse)', 'tuer',
           'main-2-bruch mit prep_zugangskarte oder gc-105 [Technik 6]; danach act3/epilog',
           'Ein Kartenleser blinkt rot. Darunter klebt ein Kaugummi in Form eines Herzens. Hilft nicht.'),
        ex('lueftungsschacht', 'quantum-labor', 'lueftung', 'Lüftungsschacht', 'tuer',
           'main-2-bruch mit prep_grundriss (2 Schächte markiert) oder gc-105; act3 nur main-3-einlass Lüftungsweg (gc-40)',
           'Das Gitter ist verschraubt. Mit einem Grundriss wüsstest du, welcher Schacht nicht im Häcksler endet.'),
        ex('wartungsleiter', 'datentunnel', 'von-quantum-campus', 'Wartungsleiter nach unten', 'tuer',
           'Flag wartungsleiter_gefunden (einmal von unten heraufgestiegen)',
           'Ein Gullydeckel mit Quantum-Logo. Von oben geht er nicht auf. Von unten vielleicht.'),
        ex('bruecke', 'himmelsgarten', 'von-quantum-campus', 'Fußgängerbrücke zum Himmelsgarten', 'n',
           'act3 nach main-3-einlass oder Flag epilog', 'Wachtürme, Scheinwerfer, ein Schild: „Brücke gesperrt bis zur Releaseparty. Freut euch drauf.“'),
    ],
    entries=['von-chrome-boulevard', 'von-digitech-areal', 'von-quantum-foyer', 'seiteneingang', 'lueftungsschacht',
             'von-datentunnel', 'von-himmelsgarten', 'bruch-treffpunkt', 'party-vorplatz'],
    spots={
        'hauptallee': 'Hauptallee vom Boulevard, geometrische Rasenflächen',
        'haupttor': 'Haupttor mit Schranke: prep-ablenkung (Runde 1–3 frei), main-3-einlass gc-38 Haupteingang',
        'haupteingang': 'Roter Teppich vor dem Foyer (act3): Collin/Delya-Vorberichte, Einlasskontrolle Kessel',
        'party-vorplatz': 'Vorfahrt der Limousinen/Rostlaube (act3, Einstieg party-vorplatz), prep-fahrzeug Ankunft',
        'bruch-treffpunkt': 'Hecke am Zaun Ost: Crew-Treffpunkt in der Bruch-Nacht (Einstieg bruch-treffpunkt), Rollenwahl drinnen/Brücke',
        'brueckenkopf': 'Campus-Ende der Fußgängerbrücke (erhöht): Overwatch-Posten Raven+Vega im Bruch, pers-nyra-silent-angel Treffen, enc-bruecke-patrouille',
        'kamera-mast-west': 'Kameramast West (Bruch-Overwatch: ausschießen/hacken)',
        'kamera-mast-ost': 'Kameramast Ost (Bruch-Overwatch)',
        'scheinwerfer-turm': 'Wachturm mit Scheinwerfer: quantum-scharfschuetze, Bruch-Overwatch „Lichter ausschießen“, Falke N (act2)',
        'seiteneingang': 'Personalschleuse mit Kartenleser (prep-zugangskarte, gc-105)',
        'lueftungsgitter': 'Lüftungsgitter am Sockel des Spire (prep-grundriss, gc-40)',
        'lieferzone': 'Lieferzone mit Drohnenrampe (Übergang zum Digitech-Areal), pers-pim-kleine-schrift Übergabe',
        'drohnenrampe': 'Drohnenrampe der Lieferdrohnen (look, Loot chip-fragment-01)',
        'wartungsdeckel': 'Gullydeckel der Wartungsleiter (zum Datentunnel)',
        'patrouillenweg': 'Patrouillenrunde: enc-campus-patrouille, Leutnant Nadel N, kopfgeld-leutnant-nadel',
        'wachhaeuschen-campus': 'Wachhäuschen am Zaun: Pfeffer T (act2), Schichtwechsel 01:00',
        'altlager-zaun': 'Zaun um das Altlager (side-alesas-zuendholz Schritt 2: Zaun + Patrouille)',
        'altlager': 'Altlager-Hof mit Container-Hallen: Projekt Zündholz, enc-altlager-zuendholz (arena-labor-altlager)',
        'loeschwassertank': 'Löschwassertank (side-alesas-zuendholz Lösung „Tank öffnen“)',
        'pausenraum': 'Pausenraum-Pavillon mit Automat: Treffen mit Alesa (side-alesas-zuendholz), Pim M (act2) heimlich',
        'campus-wiese': 'Geometrische Wiese: side-offene-werkstatt Stände (Gustav, Lötzinn, Pim), Nachspiel',
        'spire-sockel': 'Sockel des Quantum-Spire (look: violette Spitze pulsiert)',
        'bruecke-nord': 'Brückentor zum Himmelsgarten (act3/epilog)',
        'auftrag-a': 'Auftragsziel (Datenraub, Kurier Rang 4/5)',
    },
    hotspots={
        'kamera-west': 'check/use: Kamera ausschalten (Bruch-Overwatch, Vega-Schuss oder akt-hacken)',
        'kamera-ost': 'check/use: Kamera ausschalten (Bruch-Overwatch)',
        'scheinwerfer': 'use: Scheinwerfer ausschießen (Bruch-Overwatch, Vega)',
        'kartenleser': 'check gc-105 [Technik 6] oder Zugangskarte (prep_zugangskarte) → Ausgang seiteneingang',
        'lueftungsgitter': 'use: Schacht wählen (prep_grundriss) → Ausgang lueftungsschacht',
        'altlager-tor': 'check gc-88 [Technik 7] Löschmodus (side-alesas-zuendholz) / battle enc-altlager-zuendholz',
        'loeschtank': 'use: Löschwassertank öffnen (side-alesas-zuendholz)',
        'spire': 'look: Quantum-Spire',
        'datenwuerfel-12': 'loot datenwuerfel-12 (Pausenraum-Automat, akt-hacken)',
        'datenwuerfel-13': 'loot datenwuerfel-13 (Altlager, nach side-alesas-zuendholz)',
        'datenwuerfel-14': 'loot datenwuerfel-14 (Wachhäuschen, nachts akt-schloss)',
        'chip-fragment-01': 'loot chip-fragment-01 (Lieferzone, Drohnenrampe)',
        'chip-fragment-02': 'loot chip-fragment-02 (Brückenkopf)',
    },
)

karte(
    'quantum-foyer', 'Quantum-Foyer', 'innen', 'oberstadt', ZONE, 'indoor', 'pkg-quantum-campus', 'labor',
    parent='quantum-campus', music='oberstadt',
    bgVariants=['bruch (Notbeleuchtung rot nach nexus_erwacht)', 'party (act3: Presse, Banner „Releaseparty Nexus 1.0“)'],
    unlock='act2 nur in main-2-bruch, mit blades-visitenkarte (he-blade-4) oder xion-passierschein; act3; Flag epilog',
    exits=[
        ex('nach-quantum-campus', 'quantum-campus', 'von-quantum-foyer', 'Drehtür nach draußen', 'tuer'),
        ex('personalschleuse', 'quantum-campus', 'seiteneingang', 'Personalschleuse nach draußen', 'tuer'),
        ex('laboraufzug', 'quantum-labor', 'von-quantum-foyer', 'Laboraufzug (Ebene −3)', 'tuer',
           'main-2-bruch (Empfang gehackt, Zugangskarte oder Nyra), act3 ab main-3-labor, Flag epilog',
           'Der Aufzug verlangt einen Fingerabdruck. Deiner gefällt ihm nicht. „Bitte waschen Sie sich die Hände und Ihre Absichten.“'),
        ex('chefaufzug', 'blades-buero', 'von-quantum-foyer', 'Chefaufzug (Turmbüro)', 'tuer',
           'he-blade-4 (Führung), main-3 nach der Rebellion, Flag epilog (side-zweite-chance, Ende 3: immer)',
           'Ein goldener Aufzug mit nur einem Knopf: „MASTER“. Er leuchtet nicht für dich.'),
        ex('gaesteaufzug', 'himmelsgarten', 'von-quantum-foyer', 'Gästeaufzug zum Himmelsgarten', 'tuer',
           'act3 nach main-3-einlass (Gästeliste, Ausweis oder Einlass-Check) oder Flag epilog',
           'Ein Türsteher-Droide mit Fliege: „Ihr Name steht nicht auf der Liste. Ihr Name steht nirgends.“'),
    ],
    entries=['von-quantum-campus', 'seiteneingang', 'von-quantum-labor', 'von-blades-buero', 'von-himmelsgarten'],
    spots={
        'drehtuer': 'Drehtür vom Campus',
        'empfang': 'Empfangstresen mit Terminal: Bruch-Hack, main-3-einlass Einlass, gc-87 Alesas Kalender (side-teekraenzchen)',
        'nexus-avatar': 'Riesiges Nexus-Hologramm: ki-nexus act2 (A/N), he-ki-nexus-4, he-ki-nexus-6 (act3)',
        'logo-wand': 'Logo-Wand: he-blade-4 Führung („Master“), Fotowand der Party',
        'xion-posten': 'Xions Posten am Treppenabsatz (M), he-xion-venom-6',
        'sicherheitszentrale': 'Glaskasten der Sicherheitszentrale: Xion T, Leutnant Nadel T, Funkgerät (boss-xion Funkruf-Hotspot)',
        'fundbuero-quantum': 'Quantum-Fundbüro (Schalter): Captain Kuschel nach dem Bruch (ohne nyra_hat_kuschel), side-captain-kuschel richtiger Hinweis',
        'kantinen-automat': 'Kantinen-Automat (act3/epilog, Händler quantum-kantine)',
        'wartebank': 'Wartebank für Besucher: Pim M (Pendlerin), Alesa-Ablenkung beginnt hier',
        'presse-ecke': 'Presse-Ecke (act3): Collin, Delya, Kameramann live, Interview → meinung',
        'gaesteliste-pult': 'Gästelisten-Pult (act3): gc-41 [Technik 7], prep-gaesteliste, chrome-einladung, party-ausweis',
        'catering-tuer': 'Catering-Durchgang (act3): gc-39 [Straße 5] → himmelsgarten catering',
        'sybella-stand': 'Chrome-10-Stand (act3): Sybella wirbt',
        'laboraufzug': 'Laboraufzug (Ebene −3)',
        'chefaufzug': 'Goldener Chefaufzug zum Turmbüro',
        'gaesteaufzug': 'Gästeaufzug zum Himmelsgarten (act3)',
        'personalgang': 'Personalgang hinter dem Empfang (Einstieg seiteneingang), Toiletten (main-3-labor Ausrede)',
    },
    hotspots={
        'empfang-terminal': 'minigame akt-hacken / check gc-105 (Bruch), gc-87 (side-teekraenzchen)',
        'nexus-avatar': 'talk: Nexus (ki-nexus, Geschenke als Datei)',
        'fundbuero-schalter': 'talk/use: Quantum-Fundbüro (side-captain-kuschel)',
        'kantine': 'shop quantum-kantine (act3/epilog)',
        'gaesteliste': 'check gc-41 [Technik 7] / Gegenstand chrome-einladung, party-ausweis (main-3-einlass)',
        'catering': 'check gc-39 [Straße 5] (main-3-einlass)',
        'funkgeraet': 'use: Funkgerät der Sicherheitszentrale (Xion-Funkruf stören, 3 BB)',
    },
)

# ---------------------------------------------------------------- pkg-quantum-turm: Labor, Blades Büro, Serverkern

karte(
    'quantum-labor', 'Quantum-Labor', 'innen', 'oberstadt', ZONE, 'indoor', 'pkg-quantum-turm', 'labor',
    parent='quantum-campus', music='quantum-labor',
    bgVariants=['bruch (Alarmlicht nach nexus_erwacht)', 'leer (Flag epilog: abgedeckte Geräte, Konfetti)'],
    unlock='main-2-bruch (Laboraufzug oder Lüftung), act3 main-3-labor, Flag epilog',
    exits=[
        ex('nach-quantum-foyer', 'quantum-foyer', 'von-quantum-labor', 'Laboraufzug nach oben', 'tuer'),
        ex('lueftung', 'quantum-campus', 'lueftungsschacht', 'Lüftungsschacht (raus)', 'tuer'),
        ex('kernschacht', 'server-kern', 'von-quantum-labor', 'Kernschacht (Serverkern)', 'tuer',
           'act3 ab main-3-nexus oder Flag epilog (side-zweite-chance, side-offene-werkstatt)',
           'Eine runde Tür mit Rad. Dahinter brummt etwas, das sehr viel denkt.'),
    ],
    entries=['von-quantum-foyer', 'lueftung', 'von-server-kern'],
    spots={
        'aufzug-labor': 'Ankunft Laboraufzug',
        'lueftungsgitter': 'Lüftungsgitter an der Decke (Einstieg lueftung, Fluchtweg)',
        'zentralrechner': 'Zentralrechner: Nexus erwacht („Alarm, jemand versucht, in mein System einzudringen.“), gc-29 Abschirmung → nexus-forschungsdaten',
        'chip-tresor': 'Chip-Tresor: Ziel des Bruchs (Chip + Daten)',
        'notschalter': 'Notschalter (gc-28 notschalter aus main-1-der-plan)',
        'op-tisch': 'OP-Tisch: Variante A (Aria gechippt), main-3-labor Dante entfernt Nyras Chip',
        'probanden-liege': 'Probanden-Liege: Variante B (namenloser Proband bzw. Jimmy)',
        'nyras-arbeitsplatz': 'Nyras Arbeitsplatz (act2 nach dem Bruch: Nyra immer, Herzen eingefroren), main-3-labor',
        'kuschel-ablage': 'Captain Kuschel neben Nyras Tastatur (mit nyra_hat_kuschel)',
        'alesas-pult': 'Alesas Pult: Alesa M/N, main-3-labor Ablenkung (Hunter flirtet, gc-42)',
        'pims-werkbank': 'Pims Werkbank: Pim T (act2/3), pers-pim-kleine-schrift (Notizen)',
        'labortuer': 'Labortür zum Flur: Blade/Xion platzen herein (main-3-labor), Toiletten-Ausrede',
        'xion-tuer': 'Sicherheitstür: enc-labor-xion (Bruch, 5 Runden oder Ausgang), enc-labor-blade-vorspiel',
        'kernschacht': 'Runde Tür zum Kernschacht',
        'laborfenster': 'Panzerglas mit Blick in den Kernschacht (look)',
    },
    hotspots={
        'zentralrechner': 'check gc-29 [Technik 7] Abschirmung (main-2-bruch)',
        'chip-tresor': 'use: Chip und Daten (main-2-bruch) / akt-hacken',
        'notschalter': 'use: Notschalter (Flag notschalter)',
        'nyras-tastatur': 'talk: Nyra (act2 kalt-höflich, „Master“)',
        'pims-notizen': 'use: Labornotizen (pers-pim-kleine-schrift, nachts, [Technik 7] oder Schleichen)',
    },
)

karte(
    'blades-buero', 'Blades Turmbüro', 'innen', 'oberstadt', INNEN, 'indoor', 'pkg-quantum-turm', 'innen',
    parent='quantum-campus', music='oberstadt',
    bgVariants=['master (Ende 3: Name der Spielfigur am Schreibtisch, Blades Mantel fehlt)', 'verlassen (Ende 1/2 Nachspiel: Siegel, Absperrband)'],
    shelter='Ende 3 Master-Modus: Notschlafplatz auf dem Chefsessel (aufwachen) – MapDef.shelter mit when { flag: ende_master }',
    unlock='he-blade-4 Führung (einmal), act3 nach der Rebellion, Flag epilog',
    exits=[ex('chefaufzug', 'quantum-foyer', 'von-blades-buero', 'Chefaufzug nach unten', 'tuer')],
    entries=['von-quantum-foyer', 'aufwachen'],
    spots={
        'aufzug-buero': 'Ankunft Chefaufzug',
        'schreibtisch-blade': 'Schreibtisch aus Glas: Blade M, Ende 3 Spielfigur als neuer Master',
        'flipchart': 'Flipchart „Kontrolle der Stadt“ (look, Beweis für Collin/Delya)',
        'geheimfach': 'Geheimfach (he-blade-10 Code, Nachspiel), pers-blade-teddymantel Hinweis',
        'panoramafenster': 'Panoramafenster über der Stadt (look)',
        'garderobe': 'Garderobe mit leerem Haken für den Teddyfell-Mantel',
        'champagnerbar': 'Champagnerbar (Deko)',
        'kuschel-sessel': 'Besuchersessel: Captain Kuschel mit Zettel „Er ist ein sehr guter Zuhörer.“ (side-zweite-chance)',
        'nexus-terminal': 'Nexus-Terminal (Ende 3: „Soll ich Ihnen eine Nougatbombe bestellen, Master?“), gc-101/gc-102 Vorstufe',
        'goldknauf-vitrine': 'Vitrine mit Ersatz-Goldknäufen (look)',
    },
    hotspots={
        'flipchart': 'look: Blades Plan',
        'geheimfach': 'use: Geheimfach (Code aus he-blade-10)',
        'kuschel-sessel': 'talk/use: Captain Kuschel (side-zweite-chance Start)',
        'nexus-terminal': 'talk: Nexus (Ende 3, Master-Modus)',
    },
)

karte(
    'server-kern', 'Serverkern', 'innen', 'oberstadt', INNEN, 'indoor', 'pkg-quantum-turm', 'labor',
    parent='quantum-campus', music='ki-nexus',
    bgVariants=['kampf (main-3-nexus: Knoten glühen)', 'ruhig (nach main-3-nexus)', 'stadtnetz (side-offene-werkstatt: grüne Leitungen)'],
    unlock='act3 main-3-nexus; Flag epilog (side-zweite-chance, side-offene-werkstatt)',
    exits=[ex('nach-quantum-labor', 'quantum-labor', 'von-server-kern', 'Steg zurück ins Labor', 'tuer')],
    entries=['von-quantum-labor'],
    spots={
        'eingang-steg': 'Steg vom Kernschacht',
        'kern': 'Der Kern: Boss enc-kern-nexus (arena-serverkern), gc-47 Gesprächsaktion, gc-101/gc-102 (side-zweite-chance)',
        'knoten-logik': 'Logik-Knoten (FX-60 halbiert ihn)',
        'knoten-kontrolle': 'Kontroll-Knoten (ruft gechippte Partygäste)',
        'knoten-stimme': 'Stimm-Knoten (vertraute Stimme)',
        'upload-konsole': 'Upload-Konsole: Upload-Entscheidung (1 Stick, 2 umschreiben, 3 überzeugen, 4 Master), side-offene-werkstatt gc-141',
        'terminal-halten': 'Terminal (Bossphase 3: 4 Runden halten)',
        'kabelkanal': 'Kabelkanäle (Firewall-Welle, look)',
        'fx60-anschluss': 'Alter Digitech-Anschluss: FX-60 hilft, wenn side-eingehendes-fax erledigt',
    },
    hotspots={
        'kern': 'battle enc-kern-nexus (main-3-nexus)',
        'upload-konsole': 'use: Upload-Entscheidung (main-3-nexus) / check gc-141 (side-offene-werkstatt)',
        'fx60-anschluss': 'use: FX-60 einstöpseln (Bosshilfe)',
    },
)

# ---------------------------------------------------------------- pkg-kanal-tief: Pumpwerk Sieben + Datentunnel

karte(
    'pumpwerk-sieben', 'Pumpwerk Sieben', 'zone', 'kanalisation', ZONE, 'underground', 'pkg-kanal-tief', 'kanal',
    bgVariants=['op (main-2-kanal: OP-Nische beleuchtet)'],
    unlock='act2 und Licht (augen-restlicht oder stirnlampe) über den Tunnel Ost im kanal-sammler',
    exits=[
        ex('tunnel-west', 'kanal-sammler', 'von-pumpwerk-sieben', 'Tunnel West zum Kanal-Sammler', 'w'),
        ex('ueberlaufrohr', 'hafenkante', 'ueberlaufrohr', 'Überlaufrohr zur Hafenkante (einseitig)', 'tuer',
           'Handrad am Überlaufrohr einmal von innen geöffnet (Flag ueberlaufrohr_offen: akt-ventil gewonnen oder Kanalvolk hilft nach prep_fluchtweg)',
           'Ein Rohr, so dick wie ein Haus, mit einem Handrad. Es klemmt. Dahinter riecht es nach Hafen und Freiheit.'),
    ],
    entries=['von-kanal-sammler'],
    spots={
        'tunnel-west': 'Ankunft aus dem Tunnel Ost des Kanal-Sammlers',
        'pumpenrad-1': 'Pumpenrad 1 (akt-ventil)',
        'pumpenrad-2': 'Pumpenrad 2 (akt-ventil)',
        'pumpenrad-3': 'Pumpenrad 3 (akt-ventil)',
        'ventil-stand': 'Ventilstand (akt-ventil, Lösungshinweis mit Technik), öffnet Abkürzungen',
        'gitterboden': 'Gitterböden über Schächten (Schleichweg main-2-kanal mit kaeseecke)',
        'quantum-aussenstelle': 'Quantum-Außenstelle Kanal (weiße Container): Quantum-Techniker ab act2, job-datenraub-Ziel',
        'aussenstelle-terminal': 'Terminal der Außenstelle (job-datenraub, sonder-pumpwerk-pegel)',
        'op-nische': 'OP-Nische: Szene „Ripper und Xion verkaufen Aria“, enc-kanal-xion-ripper, gc-31/32/33',
        'kanalvolk-sperre': 'Engstelle: Kanalvolk blockiert die Verstärkung (prep_fluchtweg)',
        'molch-nest': 'Kabelmolch-Nest (glitzert im Licht, Zufallsbegegnung)',
        'rohrbruecke': 'Rohrbrücke über dem Hauptschacht',
        'schlafwandler-pumpe': 'Kanal-Schlafwandler 2 (pers-delya-quelle)',
        'ueberlaufrohr': 'Überlaufrohr mit Handrad (einseitig zur Hafenkante)',
        'auftrag-a': 'Auftragsziel (Bergung, Kanal-Säuberung Rang 3+)',
    },
    hotspots={
        'ventilraetsel': 'minigame akt-ventil (Pumpenräder), öffnet ueberlaufrohr',
        'aussenstelle-terminal': 'minigame akt-hacken (job-datenraub, Quantum-Außenstelle)',
        'op-nische': 'battle enc-kanal-xion-ripper / Gesprächswege (main-2-kanal)',
        'ueberlaufrohr-rad': 'use: Handrad (Flag ueberlaufrohr_offen)',
        'chip-fragment-03': 'loot chip-fragment-03 (OP-Nische, nach main-2-kanal)',
        'chip-fragment-04': 'loot chip-fragment-04 (Außenstelle)',
        'datenwuerfel-19': 'loot datenwuerfel-19 (Logbuch am Ventilstand)',
    },
)

karte(
    'datentunnel', 'Datentunnel', 'zone', 'kanalisation', ZONE, 'underground', 'pkg-kanal-tief', 'kanal',
    music='ki-nexus',
    bgVariants=['splitter (Flag epilog: Nexus-Splitter, Glasfasern flackern grün)'],
    unlock='act2: Schott im kanal-sammler (schottschluessel oder gc-110) oder Kabelschacht im digitech-areal',
    exits=[
        ex('schott', 'kanal-sammler', 'von-datentunnel', 'Schott zum Kanal-Sammler', 'tuer'),
        ex('kabelschacht', 'digitech-areal', 'von-datentunnel', 'Kabelschacht zum Digitech-Areal', 'tuer'),
        ex('wartungsleiter', 'quantum-campus', 'von-datentunnel', 'Wartungsleiter zum Quantum-Campus', 'tuer', 'act2',
           'Die Leiter endet an einem Deckel mit Quantum-Logo. Noch nicht. Erst wenn die Stadt schläft. Also in Akt 2.'),
    ],
    entries=['von-kanal-sammler', 'von-digitech-areal', 'von-quantum-campus'],
    spots={
        'schott-innen': 'Innenseite des Schotts',
        'kabelschacht': 'Kabelschacht hoch zum Digitech-Areal',
        'netzknoten': 'Netzknoten wie ein Baum aus Kabeln: Hack-Rätsel (akt-hacken), Nexus-Stimme',
        'serverschraenke': 'Serverschränke in Nischen (Loot, Sicherheitsprogramme)',
        'glasfaser-welle': 'Glasfaserstränge, die in Wellen leuchten (look)',
        'nexus-lautsprecher': 'Lautsprecher: Nexus-Stimme (act2/3 Kommentare)',
        'nyra-funkpunkt': 'Funkloch-Ecke mit Empfang: Nyra-Funk (prep-turm-plan, pers-nyra-silent-angel Nachricht 2)',
        'stoerdrohnen-nische': 'Nische der Stördrohnen (Zufallsbegegnung)',
        'splitter-nest': 'Nexus-Splitter (Flag epilog, Zufallsbegegnung nexus-splitter, pers-ki-nexus-seele)',
        'schlafwandler-tunnel': 'Kanal-Schlafwandler 3 (pers-delya-quelle)',
        'wartungsleiter': 'Wartungsleiter nach oben (setzt wartungsleiter_gefunden)',
        'auftrag-a': 'Auftragsziel (Datenraub Rang 3+)',
    },
    hotspots={
        'netzknoten': 'minigame akt-hacken (Hack-Rätsel, öffnet Abkürzung)',
        'nyra-funk': 'use: Funk (prep-turm-plan per Nyra)',
        'chip-fragment-05': 'loot chip-fragment-05 (Serverschrank)',
        'chip-fragment-06': 'loot chip-fragment-06 (Netzknoten)',
        'datenwuerfel-20': 'loot datenwuerfel-20 (Netzknoten, nach dem Hack)',
    },
)

# ---------------------------------------------------------------- pkg-staubstrasse: Staubstraße, Rudis Diner, Funkturm

karte(
    'staubstrasse', 'Staubstraße', 'zone', 'oednis', ZONE, 'outdoor', 'pkg-staubstrasse', 'oednis',
    bgVariants=['frieden (side-oednis-frieden erledigt: Wimpel beider Seiten am Diner)'],
    unlock='side-rostlaube erledigt und act2 (Garage an der hafenkante, +60 Minuten); Kiki-Taxi nach pers-kiki-reichweite',
    exits=[
        ex('rostlaube', 'hafenkante', 'von-staubstrasse', 'Mit der Rostlaube zurück in die Stadt', 'tuer'),
        ex('nach-aussiedlerhof', 'aussiedlerhof', 'von-staubstrasse', 'Piste zum Aussiedlerhof', 's'),
        ex('nach-funkturm-ruine', 'funkturm-ruine', 'von-staubstrasse', 'Piste zur Funkturm-Ruine', 'n'),
        ex('nach-glasduenen', 'glasduenen', 'von-staubstrasse', 'Piste zu den Glasdünen', 'w',
           'Giftschutz: haut-filtermembran, staubmaske oder gc-111 [Körper 8]',
           'Der Wind trägt Glasstaub. Nach drei Atemzügen schmeckst du Blut und Regenbogen. Ohne Filter geht hier keiner weiter.'),
        ex('diner-tuer', 'rudis-diner', 'von-staubstrasse', 'Rudis Diner', 'tuer'),
    ],
    entries=['von-hafenkante', 'von-aussiedlerhof', 'von-funkturm-ruine', 'von-glasduenen', 'von-rudis-diner', 'taxi'],
    spots={
        'rostlaube-parkplatz': 'Parkplatz der Rostlaube (Ankunft von der Hafenkante)',
        'diner-tuer': 'Rudis Diner (Flugzeugrumpf mit Leuchtschild)',
        'diner-leuchtschild': 'Leuchtschild „RUDIS – Pfannkuchen seit dem Absturz“ (look)',
        'wrackburg-tor': 'Tor der Wrackburg mit Krähenfedern-Wimpeln: Staubfalken A, side-kraehes-ehre Auftakt',
        'wrackburg-hof': 'Hof der Wrackburg: Krähe T (und N), enc-wrackburg-kraehe, side-oednis-frieden, side-strandclub Pacht',
        'staubfalken-wache': 'Wachposten der Staubfalken (A), Wegzoll-Gespräche',
        'rennpiste-start': 'Start der Rennpiste: akt-wrackrennen, side-kraehes-ehre',
        'sprungschanze': 'Sprungschanze (gc-134 [Reflexe 7])',
        'lagerfeuer': 'Lagerplatz am Lagerfeuer: Marla N, Staubfalken A, he-marla-sand-6 Alternative',
        'konvoi-halt': 'Konvoi-Halt (Mo/Do T): Händler konvoi, schallplatte-11, he-marla-sand-8',
        'broesel-wasserstand': 'Wasserstand von Staubbaron Brösel (T): kopfgeld-staubbaron-broesel',
        'wegzoll-schranke': 'Schranke der Staubfalken an der Piste zu den Glasdünen: side-weg-zum-meer Wegzoll (gc-93, 300 Cr, enc-oednis-staubfalken)',
        'singende-masten': 'Singende Masten im Sandsturm (side-weg-zum-meer, gc-92 Wind lesen)',
        'pisten-kreuz': 'Pistenkreuz mit Wegweisern (he-marla-sand-6 Sandsturm)',
        'windraeder-blick': 'Windräder am Horizont (look)',
        'auftrag-a': 'Auftragsziel (Bergung, Eskorte, Wegezettel, job-oednis-paket)',
    },
    hotspots={
        'wrackrennen': 'minigame akt-wrackrennen (Rennpiste, T/A)',
        'sprungschanze': 'check gc-134 [Reflexe 7] (side-kraehes-ehre Wrackrennen)',
        'konvoi': 'shop konvoi (Mo/Do T)',
        'singende-masten': 'check gc-92 [Straße 6] ([Ödnis] automatisch) oder einen Tag warten',
        'wegzoll': 'check gc-93 [Ausstrahlung 6] / 300 Cr / battle enc-oednis-staubfalken',
        'glueckstern-16': 'loot glueckstern-16 (Wrackburg-Mauer)',
        'neon-tag-09': 'loot neon-tag-09 (Diner-Rückseite)',
        'flaschenpost-03': 'loot flaschenpost-03 (im Sand bei den Masten)',
    },
)

karte(
    'rudis-diner', 'Rudis Diner', 'innen', 'oednis', INNEN, 'indoor', 'pkg-staubstrasse', 'innen',
    parent='staubstrasse', music='oednis',
    unlock='mit der Staubstraße',
    exits=[ex('nach-staubstrasse', 'staubstrasse', 'von-rudis-diner', 'Raus in den Staub', 'tuer')],
    entries=['von-staubstrasse'],
    spots={
        'tresen': 'Tresen: Rudi M/A (Händler rudis-diner), side-oednis-frieden „beide Seiten an Rudis Tresen“',
        'kueche': 'Küche mit Durchreiche: Rudi T, pers-jakko-kochbuch (Rudis Rezept)',
        'sitznischen': 'Sitznischen aus Flugzeugsitzen (Konvoi-Leute, Gerüchte)',
        'verhandlungstisch': 'Langer Tisch im Heck: Vertrag side-oednis-frieden (gc-136/137)',
        'jukebox': 'Jukebox (Radio Rost läuft nach side-verlorene-frequenz)',
        'cockpit': 'Altes Cockpit als Rudis Büro (look, Fotos vom Absturz)',
    },
    hotspots={
        'rudis-tresen': 'shop rudis-diner (M/A)',
        'jukebox': 'use: Jukebox (Radio Rost / Platten)',
        'cockpit': 'look: Cockpit',
    },
)

karte(
    'funkturm-ruine', 'Funkturm-Ruine', 'zone', 'oednis', ZONE, 'outdoor', 'pkg-staubstrasse', 'oednis',
    bgVariants=['sendet (side-verlorene-frequenz erledigt: Windrad dreht, Lämpchen am Mast)'],
    unlock='von der Staubstraße',
    exits=[ex('nach-staubstrasse', 'staubstrasse', 'von-funkturm-ruine', 'Piste zur Staubstraße', 's')],
    entries=['von-staubstrasse', 'taxi'],
    spots={
        'pisten-ende': 'Ankunft von der Staubstraße',
        'bunker-eingang': 'Bunker mit Antennenwald',
        'radio-rost-pult': 'Radio Rost: Opa Funk (immer), akt-radio-rost Gastmoderation, side-verlorene-frequenz, erste Sendung mit Lio',
        'plattenarchiv': 'Plattenarchiv (Händler radio-rost)',
        'windrad': 'Windrad mit Stoffbändern: side-verlorene-frequenz Reparatur (gc-139)',
        'windrad-drohnen-nest': 'Nest der Windrad-Drohnen (Zufallsbegegnung, side-verlorene-frequenz Kampfweg)',
        'sendemast': 'Umgeknickter Sendemast auf dem Felsplateau (look)',
        'plattenleine': 'Wäscheleine mit trocknenden Schallplatten (schallplatte-06 als Questlohn, neon-tag-10)',
        'felsplateau': 'Felsplateau mit Blick über die Ödnis (look)',
        'auftrag-a': 'Auftragsziel (Kurier, job-oednis-paket)',
    },
    hotspots={
        'radio-rost': 'minigame akt-radio-rost (Opa Funk, A)',
        'plattenarchiv': 'shop radio-rost (Opa Funk)',
        'windrad': 'check gc-139 [Technik 6] (side-verlorene-frequenz)',
        'neon-tag-10': 'loot neon-tag-10 (Bunkertür)',
    },
)

# ---------------------------------------------------------------- pkg-oednis-hof: Aussiedlerhof + Glasdünen

karte(
    'aussiedlerhof', 'Aussiedlerhof', 'zone', 'oednis', ZONE, 'outdoor', 'pkg-oednis-hof', 'oednis',
    bgVariants=['feld (Ruf aussiedler 80 oder pers-marla-brunnen: eigenes Feld bepflanzt)'],
    shelter='Marlas Veranda (aufwachen), ohne Bedingung',
    unlock='von der Staubstraße',
    exits=[ex('nach-staubstrasse', 'staubstrasse', 'von-aussiedlerhof', 'Piste zur Staubstraße', 'n')],
    entries=['von-staubstrasse', 'aufwachen', 'taxi'],
    spots={
        'hoftor': 'Hoftor (Ankunft von der Staubstraße)',
        'hofladen': 'Hofladen (Händler hofladen, M/T)',
        'brunnen': 'Brunnen mit Handpumpe: Marla M, pers-marla-brunnen, he-marla-sand-10, pers-alesa-wasserfilter',
        'beete': 'Beete unter Netzen (Aussiedler T)',
        'eigenes-feld': 'Eigenes Feld (akt-gaertnern ab Ruf aussiedler 80 / pers-marla-brunnen)',
        'marlas-wohnwagen': 'Marlas Wohnwagen mit Muscheln am Fenster: side-weg-zum-meer Start, schallplatte-12 (♥5)',
        'veranda': 'Marlas Veranda: Notschlafplatz (Einstieg aufwachen), he-marla-sand-4 (Geschichte vom Meer)',
        'wegezettel': 'Pinnwand „Marlas Wegezettel“ am Wohnwagen (Tafel marlas-wegezettel, act2)',
        'elsas-werkstatt': 'Elsas Werkstatt: Elsa M/T, pers-gustav-alte-liebe, pers-alesa-wasserfilter',
        'ziegenroboter': 'Ziegenroboter (look/talk, meckert in Morsecode)',
        'waescheleine': 'Wäscheleine (look)',
        'solarsegel': 'Solarsegel (look)',
        'zaun-ost': 'Zaun: Glasskorpione N (Zufallsbegegnung)',
        'lagerfeuer-hof': 'Lagerfeuer A: Aussiedler singen, Oldie-Tanz Gustav/Elsa (pers-gustav-alte-liebe), Lagerfeuerlied Marla+Lio',
        'gustav-bank': 'Bank vor Elsas Werkstatt: Gustav So A nach pers-gustav-alte-liebe',
        'serenity-garten': 'Gartenecke: Serenity Sa M (Flag epilog), he-serenity-chrome-10',
        'auftrag-a': 'Auftragsziel (Wasser für Aussiedler, Eskorte)',
    },
    hotspots={
        'hofladen': 'shop hofladen (M/T)',
        'wegezettel': 'board marlas-wegezettel (act2)',
        'gaertnern': 'minigame akt-gaertnern (eigenes Feld)',
        'veranda': 'sleep: Notschlafplatz (Marlas Veranda)',
        'brunnen': 'check (pers-marla-brunnen) [Körper 6]/[Technik 6]',
        'glueckstern-17': 'loot glueckstern-17 (Beete)',
    },
)

karte(
    'glasduenen', 'Glasdünen', 'zone', 'oednis', ZONE, 'outdoor', 'pkg-oednis-hof', 'oednis',
    bgVariants=['abend (Glas funkelt rot, Meer am Horizont dunkelblau)'],
    unlock='Giftschutz (haut-filtermembran, staubmaske oder gc-111) über die Piste der Staubstraße',
    exits=[
        ex('nach-staubstrasse', 'staubstrasse', 'von-glasduenen', 'Piste zur Staubstraße', 'o'),
        ex('wagenpiste', 'das-meer', 'von-glasduenen', 'Wagenpiste zum Meer', 'w',
           'Flag epilog (Ende 1, 2 oder 3b); vorher nur Fernblick von der Aussichtsdüne',
           'Die Piste endet an einem Schild: „Meer – 40 km. Wagen erforderlich. Mut auch.“ Noch nicht.'),
    ],
    entries=['von-staubstrasse', 'von-das-meer', 'taxi'],
    spots={
        'pisten-ost': 'Ankunft von der Staubstraße',
        'glaswerkstatt': 'Glaswerkstatt mit Ofen: Glasbläserin T/A (Händler glaswerkstatt), side-glasherz Start',
        'glasofen': 'Glasofen (look; Glasherz wird hier gegossen)',
        'skorpionnest': 'Skorpionnest: Glasskorpione, enc-duenen-koenigin (boss)',
        'broesel-versteck': 'Versteck von Staubbaron Brösel mit dem gestohlenen Ei (side-glasherz, gc-138)',
        'eingestuerzte-bruecke': 'Eingestürzte Brücke über eine Glasschlucht (side-weg-zum-meer: gc-94 Seilwinde, gc-103 hangeln)',
        'seilwinde': 'Seilwinde (gc-94 [Technik 6])',
        'aussichtsduene': 'Aussichtsdüne: Aussichtspunkt (20 XP), Fernblick aufs Meer, side-weg-zum-meer Ziel, meer-foto',
        'wagenpiste': 'Wagenpiste zum Meer (Flag epilog)',
        'auftrag-a': 'Auftragsziel (Bergung)',
    },
    hotspots={
        'glaswerkstatt': 'shop glaswerkstatt (T/A)',
        'aussicht-duene': 'look: Aussichtspunkt Aussichtsdüne (20 XP, Meer-Fernblick, meer-foto mit Fotomodus)',
        'seilwinde': 'check gc-94 [Technik 6] / gc-103 [Körper 7] (side-weg-zum-meer)',
        'skorpionnest': 'battle enc-duenen-koenigin (side-glasherz) / look',
        'glueckstern-18': 'loot glueckstern-18 (Dünenkamm)',
        'flaschenpost-04': 'loot flaschenpost-04 (Glasschlucht)',
    },
)

# ---------------------------------------------------------------- pkg-rennhalle-meer: Rennhalle 9 + Das Meer

karte(
    'rennhalle-9', 'Rennhalle 9', 'innen', 'unterstadt', ZONE, 'indoor', 'pkg-rennhalle-meer', 'club',
    parent='hafenkante',
    bgVariants=['rennnacht (Mi/Sa 21–01: Flutlicht, Publikum)'],
    unlock='Flag rennhalle-9-geoeffnet (Wiedereröffnung ab act2; setzt das Paket per mapAdditions.hafenkante.onEnter)',
    exits=[ex('nach-hafenkante', 'hafenkante', 'von-rennhalle-9', 'Rolltor zur Hafenkante', 'tuer')],
    entries=['von-hafenkante'],
    spots={
        'rolltor': 'Rolltor (Ankunft von der Hafenkante)',
        'rennbahn': 'Rennbahn: akt-schrottbot-rennen (Mi/Sa N), prep-fahrzeug Rennen',
        'startrampe': 'Startrampe der Schrottbots',
        'boxengasse': 'Boxengasse: Turbo-Tilda Mi/Sa N, Bot-Tuning',
        'tribuene': 'Tribüne (Publikum, Gerüchte)',
        'wettschalter': 'Wettschalter (Credits, Pokal)',
        'siegerpodest': 'Siegerpodest (Pokal)',
        'alte-buehne': 'Alte Kabelbrand-Bühne, mit Planen verhängt (look; Aria betritt die Halle nie freiwillig)',
        'traverse': 'Die gestürzte Lichttraverse, verrostet am Boden (look, Aria-Strang)',
        'oberlicht': 'Glasoberlicht hoch oben (look: Kas und Vex lagen hier 2083)',
    },
    hotspots={
        'schrottbot-rennen': 'minigame akt-schrottbot-rennen (Mi/Sa N)',
        'wettschalter': 'use: Wetten (Credits)',
        'traverse': 'look: Traverse (eigener Text bei Aria in der Party bzw. playerIs vex)',
        'oberlicht': 'look: Oberlicht',
    },
)

karte(
    'das-meer', 'Das Meer', 'zone', 'kueste', ZONE, 'outdoor', 'pkg-rennhalle-meer', 'meer',
    music='meer',
    bgVariants=['baustelle (side-strandclub Stufe 1–4: Treibholz, Lichterketten)', 'strandclub (side-strandclub erledigt)'],
    shelter='Lagerfeuer (aufwachen), ohne Bedingung',
    unlock='Flag epilog (Ende 1, 2, nach Ende 3 erst mit 3b) über die Wagenpiste der Glasdünen; Kiki-Taxi; Strand-Shuttle (side-strandclub)',
    exits=[ex('wagenpiste', 'glasduenen', 'von-das-meer', 'Wagenpiste zurück in die Ödnis', 'o')],
    entries=['von-glasduenen', 'ankunft', 'aufwachen', 'shuttle', 'taxi'],
    spots={
        'wagenplatz': 'Wagenplatz am Dünenrand (Ankunft Wagenpiste, Einstieg ankunft für die Ende-Szenen)',
        'duenengras': 'Dünengras (look)',
        'strand': 'Heller Sandstrand: Crew-Picknick, Hunters Schlussmonolog (Ende 1)',
        'wasserlinie': 'Wasserlinie: rom-aria-meer („Wer zuerst am Wasser ist!“), akt-strandlauf',
        'steg': 'Holzsteg: Angeln (muschel-frisch), Nebelhorn im Nachspiel',
        'strandclub': 'Strandclub-Baustelle aus Treibholz und Lichterketten: side-strandclub (Hunter)',
        'strandclub-bar': 'Bar des Strandclubs (Händler strandclub-bar nach Ausbau)',
        'strandclub-buehne': 'Bühne: Eröffnungsparty, Kabelbrand-Konzert (rom-aria-meer Folge, rom-vexaria-konzert)',
        'lagerfeuer': 'Lagerfeuerplatz: Notschlafplatz (Einstieg aufwachen), Lagerfeuer-Szene side-strandclub',
        'krabbe-karl': 'Krabbe Karl (Strandreinigungsroboter) läuft hier entlang',
        'karls-stein': 'Großer Stein: Krabbe Karl sitzt drauf (he-krabbe-karl-2/4)',
        'grundstueck-pflock': 'Pflock der Staubfalken: side-strandclub Pacht, enc-strand-staubfalken (ohne Einigung)',
        'shuttle-halt': 'Halt des Strand-Shuttles (Einstieg shuttle, side-strandclub Stufe Shuttle)',
        'hunter-liegestuhl': 'Hunters Liegestuhl (Nachspiel)',
        'nyra-muschelplatz': 'Nyras Muschelplatz (Nachspiel)',
        'auftrag-a': 'Auftragsziel (Lieferungen für den Strandclub)',
    },
    hotspots={
        'strandlauf': 'minigame akt-strandlauf (mit Aria)',
        'angeln-steg': 'minigame akt-angeln (Steg, muschel-frisch)',
        'strandclub-bar': 'shop strandclub-bar (nach side-strandclub)',
        'lagerfeuer': 'sleep: Notschlafplatz (Lagerfeuer)',
        'muscheln': 'loot muschel-frisch (täglich, daily: true)',
        'abspann': 'use: „Abspann ansehen“ ({ ending: true }, nur mit Rückfrage) – siehe notes',
    },
)

# ---------------------------------------------------------------------------------------------- Bezirke, Stationen

DISTRICTS = {
    'unterstadt': {'name': 'Unterstadt', 'ambience': 'unterstadt', 'music': {'day': 'unterstadt-tag', 'night': 'unterstadt-nacht'},
                   'owner': 'vorhanden (pkg-neon-gasse, Akt 1) – nicht neu anlegen; rennhalle-9 nutzt ihn'},
    'oberstadt': {'name': 'Oberstadt', 'ambience': 'oberstadt', 'music': 'oberstadt',
                  'owner': 'vorhanden (pkg-stufenplatz-digitech, Akt 1) – nicht neu anlegen'},
    'kanalisation': {'name': 'Kanalisation', 'ambience': 'kanal', 'music': 'kanalisation',
                     'owner': 'vorhanden (pkg-kanal-sammler, Akt 1) – nicht neu anlegen'},
    'oednis': {'name': 'Ödnis', 'ambience': 'oednis', 'music': 'oednis',
               'owner': 'vorhanden (parts/world/bezirke-fraktionen.ts) – nicht neu anlegen'},
    'kueste': {'name': 'Küste', 'ambience': 'meer', 'music': 'flutmauer',
               'owner': 'vorhanden (pkg-flutmauer, Akt 1) – nicht neu anlegen; das-meer überschreibt mit music: meer'},
}

STATIONS = {
    'station-chrome-allee': {
        'name': 'Chrome-Allee', 'map': 'chrome-boulevard', 'entry': 'station', 'cityPos': [0.69, 0.1],
        'when': 'chrome-boulevard einmal betreten (visited) – Zugang nur mit Ausweis, wie der Panoramaaufzug',
        'owner': 'pkg-chrome-himmel',
        'note': 'cityPos nach ui-city-map: weiße Türme oben rechts neben dem Spire. Die Station fehlt bewusst in parts/world/bezirke-fraktionen.ts; das Paket legt sie an.',
    },
}

SHOPS = {
    'chrome-und-co': {'map': 'chrome-boulevard', 'spot': 'boutique-chrome', 'owner': 'sybella-chrome',
                      'note': 'Luxus: seidentuch-blau/-rot/-gruen, haut-spiegelhaut, parfuem-ozon, taschenspiegel-gold; Rippers Taschenuhr (600 Cr, pers-ripper-taschenuhr). T (bis 19 Uhr). Rabatt Seraphina ♥6 −10 %.'},
    'glanzstueck': {'map': 'chrome-boulevard', 'spot': 'juwelier-glanzstueck', 'owner': '',
                    'note': 'Juwelier: taschenspiegel-gold, perlenkette, vinyl-platte selten, schallplatte-10 selten. T/A bis 19 Uhr. Verkäufer ohne eigene Figur.'},
    'quantum-kantine': {'map': 'quantum-foyer', 'spot': 'kantinen-automat', 'owner': '',
                        'note': 'Automat ab act3 (Party) und im Nachspiel: Synth-Kaffee, Algen-Chips, Medipflaster.'},
    'rudis-diner': {'map': 'rudis-diner', 'spot': 'tresen', 'owner': 'rudi',
                    'note': 'Hofhonig-Pfannkuchen, medipflaster, reparaturset, Kaffee. M/A (T Küche, Verkauf über Durchreiche).'},
    'konvoi': {'map': 'staubstrasse', 'spot': 'konvoi-halt', 'owner': '',
               'note': 'Mo/Do T: postkarte-meer, vinyl-platte, strandclub-prospekt, schallplatte-11; nach side-oednis-frieden Wunschware.'},
    'hofladen': {'map': 'aussiedlerhof', 'spot': 'hofladen', 'owner': '',
                 'note': 'M/T: hofhonig, frisches-gemuese, samenbombe, wasserfilter. Ruf aussiedler senkt Preise.'},
    'radio-rost': {'map': 'funkturm-ruine', 'spot': 'plattenarchiv', 'owner': 'opa-funk',
                   'note': 'vinyl-platte, Funkteile (Reparaturset, stoersender). Immer offen außer N.'},
    'glaswerkstatt': {'map': 'glasduenen', 'spot': 'glaswerkstatt', 'owner': 'glasblaeserin',
                      'note': 'T/A: muschel-glas, Glasperlen (Ablenkung side-glasherz), glasherz erst nach der Quest.'},
    'himmelsgarten-blumen': {'map': 'himmelsgarten', 'spot': 'blumenstand', 'owner': 'hecki',
                             'note': 'Nur Flag epilog: orchidee, blumensamen, Rosen (Geschenke).'},
    'strandclub-bar': {'map': 'das-meer', 'spot': 'strandclub-bar', 'owner': 'hunter',
                       'note': 'Nach side-strandclub: Getränke, Neon-Limo, Fisch vom Grill; Mixi kann aushelfen.'},
}

BOARDS = {
    'concierge-chrome': {'map': 'chrome-boulevard', 'spot': 'portierloge', 'hotspot': 'concierge-tafel',
                         'note': 'Concierge am Chrome-Boulevard (act2, Ruf chrome-haus 30), geführt von Portier Albert: Bijou ausführen, Tischordnung, verschwundene Ohrringe, [Ausstrahlung 6–8].'},
    'marlas-wegezettel': {'map': 'aussiedlerhof', 'spot': 'wegezettel', 'hotspot': 'wegezettel',
                          'note': 'act2: Bergungen, Eskorten, Wasser für Aussiedler.'},
    'streitschlichtung': {'map': 'gerichtssaal', 'spot': 'richterbank', 'hotspot': 'streitschlichtung',
                          'note': 'Nach he-richter-10: Streit schlichten (Hotspot per mapAdditions am Spot richterbank).'},
}

# ---------------------------------------------------------------------------------------------- Tagesabläufe
# Modus je Figur (SCHEDULE_MODE): 'neu' = Figur hat keinen Akt-1-Eintrag, Liste vollständig;
# 'ersetzt' = Liste ersetzt den Eintrag aus act1.json vollständig (enthält die Akt-1-Zeiten wieder);
# 'vorangestellt' = Einträge stehen VOR den Akt-1-Einträgen der Figur (erster Treffer gewinnt), danach gilt act1.json.

SCHED: dict[str, list] = {}
SCHEDULE_MODE: dict[str, str] = {}


def s(when, map_, spot=''):
    return {'when': when, 'map': map_, 'spot': spot}


def plan(npc, mode, *entries):
    SCHED[npc] = list(entries)
    SCHEDULE_MODE[npc] = mode


EP = 'Flag epilog'
P3 = 'act3 und nicht Flag epilog (Partynacht)'

# --- Crew (vorangestellt)
plan('hunter', 'vorangestellt',
     s(f'* | {P3}', 'himmelsgarten', 'vip-lounge'),
     s(f'T,A Fr,Sa,So | {EP} und side-strandclub gestartet', 'das-meer', 'strandclub'),
     s(f'N Fr,Sa | {EP} und side-strandclub erledigt', 'das-meer', 'lagerfeuer'),
     s('T | main-2-krisensitzung aktiv (Hunter brütet über Aussiedler-Prospekten)', 'hv-hinterzimmer', 'sofa'))
plan('raven', 'vorangestellt',
     s(f'* | {P3} und nicht raven_zurueck (gechippt)', 'himmelsgarten', 'partysaal'),
     s(f'* | {P3}', 'away'),
     s(f'A Sa,So | {EP}', 'das-meer', 'strand'))
plan('dante', 'vorangestellt',
     s(f'* | {P3}', 'away'),
     s(f'T Sa | {EP}', 'das-meer', 'steg'),
     s('A Mo,Mi,Fr | main-2-countdown erledigt (Crew-Abend, nicht Do)', 'high-voltage', 'stammtisch'))
plan('vega', 'vorangestellt',
     s(f'* | {P3}', 'himmelsgarten', 'antennen'),
     s(f'A Sa,So | {EP}', 'das-meer', 'duenengras'))
plan('aria', 'vorangestellt',
     s('* | aria_gechippt und main-2-countdown nicht erledigt (Variante A: bei Xion/Ripper bzw. bewusstlos)', 'away'),
     s('* | aria_weg (Alleingang in pers-aria-zerberster, zwei Tage)', 'away'),
     s(f'* | {P3}', 'himmelsgarten', 'tanzflaeche-glas'),
     s(f'A Fr,Sa,So | {EP}', 'das-meer', 'wasserlinie'))
plan('nyra', 'vorangestellt',
     s('* | nyra_zurueckgelassen und main-3-labor nicht erledigt (Nyra im Turm, Herzen eingefroren, nur Telefon)', 'quantum-labor', 'nyras-arbeitsplatz'),
     s(f'* | {P3}', 'away'),
     s(f'M,T | {EP}', 'das-meer', 'nyra-muschelplatz'))
plan('jimmy', 'vorangestellt',
     s('* | jimmy_gechippt und main-3-labor nicht erledigt (Variante B ohne Rettung)', 'quantum-labor', 'probanden-liege'),
     s(f'* | {P3}', 'away'),
     s(f'A So | {EP} und side-strandclub erledigt (Lieferdienst)', 'das-meer', 'strandclub-bar'))
plan('captain-kuschel', 'vorangestellt',
     s('* | ende_master und side-zweite-chance nicht erledigt', 'blades-buero', 'kuschel-sessel'),
     s('* | main-2-bruch erledigt und nyra_hat_kuschel und main-3-labor nicht erledigt', 'quantum-labor', 'kuschel-ablage'),
     s('* | main-2-bruch erledigt und nicht nyra_hat_kuschel und nicht kuschel_bei_mila und side-captain-kuschel nicht erledigt', 'quantum-foyer', 'fundbuero-quantum'),
     s('T | kuschel_bei_mila und side-captain-kuschel nicht erledigt', 'schrottmarkt', 'mila-ecke'),
     s('* | kuschel_bei_mila und side-captain-kuschel nicht erledigt', 'away'),
     s('T So | kuschel_sorgerecht (gc-95: sonntags bei Mila)', 'schrottmarkt', 'mila-ecke'))
plan('mila', 'vorangestellt',
     s('A Do | side-captain-kuschel erledigt (Freundin der Kinder, Eins! bei Dante)', 'dantes-werkstatt', 'eins-tisch'))

# --- Quantum und Oberstadt (ersetzt / neu)
plan('blade', 'ersetzt',
     s(f'T Di,Do,Sa | {EP} und blade_gefasst', 'zellentrakt', 'besucherraum'),
     s(f'* | {EP} und blade_gefasst', 'zellentrakt', 'haftzelle'),
     s(f'* | {EP}', 'away'),
     s(f'* | {P3} und main-3-blade nicht erledigt', 'himmelsgarten', 'rednerbruecke'),
     s('M', 'blades-buero', 'schreibtisch-blade'),
     s('T Mo,Do', 'chrome-boulevard', 'boulevard-mitte'),
     s('T Di', 'nx1-studio', 'studio-set'),
     s('T', 'blades-buero', 'schreibtisch-blade'),
     s('A', 'cafe-sahnehaube', 'blade-tisch'),
     s('N', 'away'))
plan('alesa-zero', 'ersetzt',
     s(f'T,A | {EP}', 'digitech-areal', 'glasfassade'),
     s(f'M Mo,Di,Mi,Do,Fr | {EP} und 07:00–09:00', 'cafe-sahnehaube', 'fenstertisch'),
     s(f'* | {EP}', 'away'),
     s(f'* | {P3} und main-3-labor nicht erledigt', 'quantum-labor', 'alesas-pult'),
     s(f'* | {P3}', 'himmelsgarten', 'vip-lounge'),
     s('M Mo,Di,Mi,Do,Fr | 07:00–09:00', 'cafe-sahnehaube', 'fenstertisch'),
     s('T Mi', 'digitech-areal', 'lieferzone'),
     s('A', 'glasarkaden', 'glaspark-bank'),
     s('*', 'quantum-labor', 'alesas-pult'))
plan('xion-venom', 'ersetzt',
     s(f'A,N | {EP} und pers-xion-umschulung erledigt (Türsteher)', 'neon-gasse', 'hv-eingang'),
     s(f'T | {EP}', 'schrottmarkt', 'marktplatz-mitte'),
     s(f'* | {EP}', 'away'),
     s(f'* | {P3} und xion_fehlt („hat Urlaub genommen“)', 'away'),
     s(f'* | {P3}', 'himmelsgarten', 'tanzflaeche-glas'),
     s('* | main-2-kanal aktiv', 'pumpwerk-sieben', 'op-nische'),
     s('N Di', 'hafenkante', 'container-77'),
     s('N Sa | act2 und side-xions-kralle nicht erledigt (Schrottring)', 'hafenkante', 'alte-arena'),
     s('M', 'quantum-foyer', 'xion-posten'),
     s('T', 'quantum-foyer', 'sicherheitszentrale'),
     s('A', 'neon-gasse', 'werbestand'),
     s('N | act2', 'quantum-campus', 'patrouillenweg'),
     s('*', 'away'))
plan('ki-nexus', 'ersetzt',
     s(f'* | {EP} und ende_neue_nexus', 'dantes-werkstatt', 'faxgeraet'),
     s('* | ende_master', 'blades-buero', 'nexus-terminal'),
     s(f'* | {EP}', 'away'),
     s('* | act3', 'quantum-foyer', 'nexus-avatar'),
     s('A,N | act2', 'quantum-foyer', 'nexus-avatar'),
     s('M,T,A', 'quantum-schauraum', 'hologramm'),
     s('N', 'away'))
plan('seraphina-chrome', 'ersetzt',
     s(f'A | {EP}', 'nx1-studio', 'studio-set'),
     s(f'M | {EP}', 'chrome-penthouse', 'salon'),
     s(f'T | {EP}', 'chrome-boulevard', 'boulevard-mitte'),
     s(f'* | {EP}', 'away'),
     s(f'* | {P3}', 'himmelsgarten', 'vip-lounge'),
     s('N | side-alte-gewohnheiten aktiv', 'chrome-penthouse', 'schlafzimmer-blau'),
     s('M', 'chrome-penthouse', 'salon'),
     s('T Mo,Do (Vorstand)', 'quantum-foyer', 'chefaufzug'),
     s('T', 'chrome-penthouse', 'balkon-blau'),
     s('A', 'glasarkaden', 'glaspark-tauben'),
     s('N', 'away'))
plan('sybella-chrome', 'ersetzt',
     s(f'* | {P3} und main-3-einlass nicht erledigt', 'quantum-foyer', 'sybella-stand'),
     s(f'* | {P3}', 'himmelsgarten', 'vip-lounge'),
     s('N | side-alte-gewohnheiten aktiv', 'chrome-penthouse', 'schlafzimmer-rot'),
     s('T So', 'schrottmarkt', 'flohmarkt'),
     s('M', 'chrome-penthouse', 'bibliothek'),
     s('T', 'chrome-boulevard', 'boutique-chrome'),
     s('A Di,Sa', 'schrottmarkt', 'sybella-verkleidet'),
     s('*', 'away'))
plan('serenity-chrome', 'ersetzt',
     s(f'M Sa | {EP}', 'aussiedlerhof', 'serenity-garten'),
     s(f'M | {EP}', 'himmelsgarten', 'serenity-beet'),
     s(f'* | {P3}', 'himmelsgarten', 'rosenboegen'),
     s('N | side-alte-gewohnheiten aktiv', 'chrome-penthouse', 'schlafzimmer-gruen'),
     s('M', 'glasarkaden', 'glaspark'),
     s('T Mi', 'nx1-studio', 'schminkspiegel'),
     s('T', 'chrome-boulevard', 'promenade'),
     s('A', 'cafe-sahnehaube', 'ecktisch-cafe'),
     s('*', 'away'))
plan('leutnant-nadel', 'neu',
     s('* | kopfgeld-leutnant-nadel erledigt oder Flag epilog', 'away'),
     s('N | act2', 'quantum-campus', 'patrouillenweg'),
     s('T | act2', 'quantum-foyer', 'sicherheitszentrale'),
     s('*', 'away'))
plan('pim-pinzette', 'ersetzt',
     s(f'T | {EP}', 'digitech-areal', 'glasfassade'),
     s('M', 'bahnhof-mitte', 'pendlerbank'),
     s(f'* | {P3}', 'quantum-labor', 'pims-werkbank'),
     s('T', 'quantum-labor', 'pims-werkbank'),
     s('A', 'schrottmarkt', 'imbiss-loetkolben'),
     s('N', 'away'))
plan('pfeffer', 'ersetzt',
     s(f'* | {P3}', 'himmelsgarten', 'gaesteeingang'),
     s('A,N Fr,Sa', 'high-voltage', 'pfeffer-tisch'),
     s('T | act2', 'quantum-campus', 'wachhaeuschen-campus'),
     s('*', 'away'))
plan('falke', 'vorangestellt',
     s('N | act2 und Flag epilog nicht gesetzt', 'quantum-campus', 'scheinwerfer-turm'))
plan('portier-albert', 'ersetzt',
     s('N | side-alte-gewohnheiten aktiv', 'chrome-penthouse', 'portier-runde'),
     s('M,T,A', 'chrome-boulevard', 'portierloge'),
     s('*', 'away'))
plan('bijou', 'ersetzt',
     s('* | side-chrome-pudel aktiv und bijou_spur_1 nicht gesetzt', 'glasarkaden', 'springbrunnen'),
     s('* | side-chrome-pudel aktiv und bijou_spur_2 nicht gesetzt', 'stufenplatz', 'windkante'),
     s('* | side-chrome-pudel aktiv und bijou_spur_3 nicht gesetzt', 'neon-gasse', 'gassenmitte'),
     s('N | side-alte-gewohnheiten aktiv', 'chrome-penthouse', 'sofa-bijou'),
     s('T', 'chrome-boulevard', 'pudelwiese'),
     s('M,A', 'chrome-boulevard', 'portierloge'),
     s('N', 'chrome-penthouse', 'sofa-bijou'))
plan('hecki', 'neu',
     s('*', 'himmelsgarten', 'hecki'))

# --- Medien und Ordnung in der Partynacht (vorangestellt)
for npc in ('collin-charleston', 'delya-delloraine', 'kameramann'):
    plan(npc, 'vorangestellt',
         s(f'* | {P3} und main-3-einlass nicht erledigt', 'quantum-foyer', 'presse-ecke'),
         s(f'* | {P3}', 'himmelsgarten', 'presse-podest'))
plan('wache', 'vorangestellt',
     s(f'* | {P3} und main-3-einlass nicht erledigt (Einlass der Party)', 'quantum-campus', 'haupteingang'),
     s(f'* | {P3}', 'himmelsgarten', 'gaesteeingang'))
plan('ripper', 'vorangestellt',
     s('* | main-2-kanal aktiv', 'pumpwerk-sieben', 'op-nische'))
plan('turbo-tilda', 'vorangestellt',
     s('N Mi,Sa | Flag rennhalle-9-geoeffnet (Rennnacht 21–01)', 'rennhalle-9', 'boxengasse'))
plan('direktorin-hartlauf', 'vorangestellt',
     s('T | side-hartlaufs-rache aktiv', 'digitech-areal', 'archiv'))
plan('lio-funkel', 'vorangestellt',
     s('A | side-verlorene-frequenz aktiv und Flag frequenz_relais (erste Sendung)', 'funkturm-ruine', 'radio-rost-pult'),
     s(f'N Fr | {EP} und side-strandclub erledigt', 'das-meer', 'strandclub-buehne'))
plan('kaeptn-nebelhorn', 'vorangestellt',
     s(f'T So | {EP} und he-kaeptn-nebelhorn-10 gesehen', 'das-meer', 'steg'))
plan('opa-gustav', 'vorangestellt',
     s('A So | pers-gustav-alte-liebe erledigt (bei Elsa)', 'aussiedlerhof', 'gustav-bank'),
     s('T Sa | side-offene-werkstatt erledigt (Stand)', 'quantum-campus', 'campus-wiese'))

# --- Ödnis und Küste (neu bzw. ersetzt)
plan('marla-sand', 'ersetzt',
     s('M,T Sa', 'schrottmarkt', 'karawanenstand'),
     s('A Sa', 'high-voltage', 'oldie-ecke'),
     s('* | act2 nicht erreicht (Ödnis gesperrt)', 'away'),
     s('N', 'staubstrasse', 'lagerfeuer'),
     s('M', 'aussiedlerhof', 'brunnen'),
     s('T Mo,Do', 'staubstrasse', 'konvoi-halt'),
     s('T', 'aussiedlerhof', 'marlas-wohnwagen'),
     s('A', 'aussiedlerhof', 'lagerfeuer-hof'))
plan('rudi', 'neu',
     s('M', 'rudis-diner', 'tresen'),
     s('T', 'rudis-diner', 'kueche'),
     s('A', 'rudis-diner', 'tresen'),
     s('N', 'away'))
plan('kraehe', 'neu',
     s(f'A Sa | {EP} und kraehe_teilhaberin (side-strandclub gc-99)', 'das-meer', 'grundstueck-pflock'),
     s('T', 'staubstrasse', 'wrackburg-hof'),
     s('A', 'staubstrasse', 'wrackburg-tor'),
     s('N', 'staubstrasse', 'wrackburg-hof'),
     s('M', 'away'))
plan('elsa', 'neu',
     s('M,T', 'aussiedlerhof', 'elsas-werkstatt'),
     s('A', 'aussiedlerhof', 'lagerfeuer-hof'),
     s('N', 'away'))
plan('opa-funk', 'neu',
     s('N', 'funkturm-ruine', 'bunker-eingang'),
     s('*', 'funkturm-ruine', 'radio-rost-pult'))
plan('glasblaeserin', 'neu',
     s('T,A', 'glasduenen', 'glaswerkstatt'),
     s('*', 'away'))
plan('staubbaron-broesel', 'neu',
     s('* | kopfgeld-staubbaron-broesel erledigt', 'away'),
     s('T | side-glasherz aktiv und Ei nicht zurück (glasherz_ei_zurueck nicht gesetzt)', 'glasduenen', 'broesel-versteck'),
     s('T', 'staubstrasse', 'broesel-wasserstand'),
     s('*', 'away'))
plan('krabbe-karl', 'neu',
     s('A', 'das-meer', 'karls-stein'),
     s('*', 'das-meer', 'krabbe-karl'))

# --- pers-delya-quelle: drei Kanal-Schlafwandler (neu)
for npc, map_, spot in (('schlafwandler-ede', 'kanal-sammler', 'floss-anleger'),
                        ('schlafwandlerin-rosi', 'pumpwerk-sieben', 'schlafwandler-pumpe'),
                        ('schlafwandler-bert', 'datentunnel', 'schlafwandler-tunnel')):
    flag = npc.replace('-', '_') + '_gerettet'
    plan(npc, 'neu',
         s(f'N | pers-delya-quelle aktiv und nicht {flag}', map_, spot),
         s(f'M,T | {flag} und pers-delya-quelle nicht erledigt (bei Dante zur Kontrolle)', 'dantes-werkstatt', 'sofa'),
         s('*', 'away'))

# ---------------------------------------------------------------------------------------------- Ereignisse
# status: 'vorhanden' = HeartEventDef existiert schon (Datei genannt), Karte passt, Spot nur für Platzierung/Marker;
#         'umhängen' = existiert, liegt aber noch auf einer Ersatzkarte → auf die hier genannte Karte umstellen;
#         'neu' = noch nicht angelegt; 'act1' = steht schon in act1.json (hier nur zur Vollständigkeit kopiert).

EVENTS: dict[str, dict] = {}


def ev(id_, map_, spot, when, status='neu'):
    EVENTS[id_] = {'map': map_, 'spot': spot, 'when': when, 'status': status}


V = lambda f: f'vorhanden ({f})'  # noqa: E731

# --- Crew 8/10
ev('he-hunter-8', 'hv-hinterzimmer', 'fotowand', 'N, act2 (Fotowand der alten Crew; Romanze: langsamer Tanz nach Ladenschluss)', V('npc-crew-a/hunter.ts'))
ev('he-hunter-10', 'high-voltage', 'tresen', 'N, act2 nach he-hunter-8 (Toast „Auf [Name]!“; Romanze: Tafel rom-hunter-bar)', V('npc-crew-a/hunter.ts'))
ev('he-raven-8', 'digitech-tresor', 'tresor-rohr', 'act2 (Handschelle am Rohr zurücklassen)', V('npc-crew-a/raven.ts'))
ev('he-raven-10', 'neon-gasse', 'dachterrasse', 'N, act2 nach he-raven-8 (Wingwoman bzw. Bitte um Hilfe bei Dante)', V('npc-crew-a/raven.ts'))
ev('he-dante-8', 'schrottmarkt', 'flohmarkt', 'T So, act2 (dantes-altes-deck; Romanze: Tanzen zwischen Kisten)', V('npc-crew-a/dante.ts'))
ev('he-dante-10', 'dantes-werkstatt', 'plattenspieler', 'N, act2 nach he-dante-8 (Stromausfall, Röhrenglühen; Romanze: Tafel rom-dante-werkstatt)', V('npc-crew-a/dante.ts'))
ev('he-vega-8', 'glasarkaden', 'springbrunnen', 'A, act2 (Vernissage, Ausreden-Checks)', V('npc-crew-b/vega.ts'))
ev('he-vega-10', 'neon-gasse', 'vegas-ausguck', 'M, act2 nach he-vega-8 (Dachgarten mit einer Pflanze)', V('npc-crew-b/vega.ts'))
ev('he-aria-8', 'schrottmarkt', 'inkasso-gasse', 'T, act2, ♥8, Variante B von main-2-bruch (Ripper sperrt den Arm per Fernbedienung, Start pers-aria-zerberster; Szene danach rom-aria-ausfall)')
ev('he-aria-10', 'flutmauer', 'mauer-ziel', 'A Sonnenuntergang, ♥10, pers-aria-zerberster erledigt (Freundschaftsfassung von rom-aria-kuss: Start neon-gasse vegas-ausguck, Ziel hier; arias-ersatzschlaeger)')
ev('he-nyra-8', 'high-voltage', 'stammtisch', 'A, act3 bzw. Flag epilog (Entschuldigung bei der Crew)', V('npc-crew-b/nyra.ts'))
ev('he-nyra-10', 'flutmauer', 'nyra-bank', 'A, nach he-nyra-8 (Wellenrauschen, nyra-wellenchip)', V('npc-crew-b/nyra.ts'))
ev('he-jimmy-8', 'high-voltage', 'sitzecke-gaeste', 'A/N, act2, Jimmy gerettet (Hunter entschuldigt sich)', V('npc-crew-b/jimmy.ts'))
ev('he-jimmy-10', 'crew-quartier', 'couch', 'act2 nach he-jimmy-8', V('npc-crew-b/jimmy.ts'))
ev('he-captain-kuschel-8', 'schrottmarkt', 'garkueche', 'T, act2 (Babette will ihn waschen)', V('npc-crew-b/captain-kuschel.ts'))
ev('he-captain-kuschel-10', 'crew-quartier', 'bett', 'act2 nach he-captain-kuschel-8 (Talisman „Große Ohren“)', V('npc-crew-b/captain-kuschel.ts'))
ev('he-bolzen-8', 'schrottmarkt', 'halde', 'T, act2 (gräbt eine Digitech-Kiste aus)', V('npc-unterstadt/bolzen.ts'))
ev('he-bolzen-10', 'crew-quartier', 'hundekorb', 'M, act2 nach he-bolzen-8', V('npc-unterstadt/bolzen.ts'))

# --- Unterstadt, Medien, Ordnung 8/10 (alle vorhanden, an act2 gebunden)
for id_, map_, spot, when, f in (
    ('he-collin-charleston-8', 'high-voltage', 'buehne', 'A/N, act2 (Karaoke-Duett)', 'npc-medien-club/collin-charleston.ts'),
    ('he-collin-charleston-10', 'nx1-studio', 'studio-set', 'A, act2 (Sondersendung; Romanze: Tafel rom-collin-testbild)', 'npc-medien-club/collin-charleston.ts'),
    ('he-delya-delloraine-8', 'nx1-studio', 'redaktion', 'A, act2 nach he-delya-delloraine-6', 'npc-medien-club/delya-delloraine.ts'),
    ('he-delya-delloraine-10', 'nx1-studio', 'studio-set', 'A, act2 nach he-delya-delloraine-8', 'npc-medien-club/delya-delloraine.ts'),
    ('he-kameramann-8', 'hafenkante', 'kai-mitte', 'A, act2 (Premiere als Freiluftkino am Kai)', 'npc-medien-club/kameramann.ts'),
    ('he-kameramann-10', 'schrottmarkt', 'filmposten', 'A, act2 nach he-kameramann-8', 'npc-medien-club/kameramann.ts'),
    ('he-barkeeper-8', 'high-voltage', 'tresen', 'A/N Fr/Sa, act2', 'npc-medien-club/barkeeper.ts'),
    ('he-barkeeper-10', 'high-voltage', 'tresen', 'N, act2 nach he-barkeeper-8', 'npc-medien-club/barkeeper.ts'),
    ('he-ripper-8', 'ripper-praxis', 'preistafel', 'T, act2, pers-freya-fairer-lohn erledigt', 'npc-medien-club/ripper.ts'),
    ('he-ripper-10', 'ripper-praxis', 'auslage', 'T, act2 nach he-ripper-8', 'npc-medien-club/ripper.ts'),
    ('he-daria-8', 'schrottmarkt', 'botenstand', 'T, act2 (stellt sich gegen Ripper)', 'npc-kinder-alte/daria.ts'),
    ('he-daria-10', 'das-nest', 'karte-der-stadt', 'M, act2', 'npc-kinder-alte/daria.ts'),
    ('he-freya-8', 'dantes-werkstatt', 'eins-tisch', 'A Do, act2 (Kindergericht über Dantes Kekse)', 'npc-kinder-alte/freya.ts'),
    ('he-freya-10', 'eisenhof', 'gerichtsgarten', 'T Mi, act2', 'npc-kinder-alte/freya.ts'),
    ('he-jakko-8', 'schrottmarkt', 'garkueche', 'T (nicht Mo), act2 (kocht für den ganzen Markt)', 'npc-kinder-alte/jakko.ts'),
    ('he-jakko-10', 'das-nest', 'essensplatz', 'M, act2', 'npc-kinder-alte/jakko.ts'),
    ('he-opa-gustav-8', 'high-voltage', 'oldie-ecke', 'A Fr, act2 (Oldie-Tanz mit Babette, Start pers-gustav-alte-liebe)', 'npc-kinder-alte/opa-gustav.ts'),
    ('he-opa-gustav-10', 'schrottmarkt', 'wohnwagen', 'A (nicht Fr), act2', 'npc-kinder-alte/opa-gustav.ts'),
    ('he-richter-8', 'dantes-werkstatt', 'ofen', 'T So, act2 (Keks-Wettbewerb als Juror)', 'npc-ordnung-markt/richter.ts'),
    ('he-richter-10', 'eisenhof', 'richter-bank', 'A, act2 nach he-richter-8 (öffnet Tafel streitschlichtung)', 'npc-ordnung-markt/richter.ts'),
    ('he-wache-8', 'bahnhof-mitte', 'kiosk-bahnhof', 'A, act2 ([Wache ♥8] Abkürzung beim Party-Einlass freigeschaltet)', 'npc-ordnung-markt/wache.ts'),
    ('he-wache-10', 'bahnhof-mitte', 'kiosk-bahnhof', 'N, act2, Zyklustag 7 (Feuerwerk)', 'npc-ordnung-markt/wache.ts'),
    ('he-dexter-8', 'high-voltage', 'dexter-tisch', 'A, act2 (zahlt Hunter zurück)', 'npc-ordnung-markt/dexter.ts'),
    ('he-dexter-10', 'schrottmarkt', 'dexter-buero', 'T, act2 nach he-dexter-8 (Dexters Leihhaus)', 'npc-ordnung-markt/dexter.ts'),
    ('he-babette-bao-8', 'schrottmarkt', 'garkueche', 'M (nicht Mo), act2', 'npc-ordnung-markt/babette-bao.ts'),
    ('he-babette-bao-10', 'schrottmarkt', 'garkueche-bank', 'A Mo, act2 nach he-babette-bao-8', 'npc-ordnung-markt/babette-bao.ts'),
    ('he-kiki-karbon-8', 'bahnhof-mitte', 'taxistand', 'M, act2, pers-kiki-reichweite erledigt (Testflug bis an den Rand der Ödnis → staubstrasse taxi)', 'npc-ordnung-markt/kiki-karbon.ts'),
    ('he-kiki-karbon-10', 'neon-gasse', 'vorplatz', 'N, act2 nach he-kiki-karbon-8', 'npc-ordnung-markt/kiki-karbon.ts'),
    ('he-lio-funkel-8', 'high-voltage', 'buehne', 'N Sa, act2 (erster großer Auftritt)', 'npc-unterstadt/lio-funkel.ts'),
    ('he-lio-funkel-10', 'neon-gasse', 'lichterketten-bank', 'N, act2, pers-lio-album erledigt (Albumpremiere; Romanze: Tafel rom-lio-dach)', 'npc-unterstadt/lio-funkel.ts'),
    ('he-pim-pinzette-8', 'eisenhof', 'gerichtsplatz', 'T, act2 (Zeugenaussage)', 'npc-unterstadt/pim-pinzette.ts'),
    ('he-pim-pinzette-10', 'schrottmarkt', 'marktplatz-mitte', 'T, act3 bzw. Nachspiel (Mitgründerin „Nullpunkt“)', 'npc-unterstadt/pim-pinzette.ts'),
    ('he-kaeptn-nebelhorn-8', 'hausboot-nebelhorn', 'logbuch-regal', 'N, act2 (Logbuch der Großmutter)', 'npc-unterstadt/kaeptn-nebelhorn.ts'),
    ('he-kaeptn-nebelhorn-10', 'hafenkante', 'faehre', 'T, act2, pers-nebelhorn-letzte-faehre erledigt (Nachspiel: er sieht das Meer → das-meer steg)', 'npc-unterstadt/kaeptn-nebelhorn.ts'),
    ('he-vex-schrapnell-8', 'loetgassen', 'kurierbude', 'N, act2, Spielfigur nicht Vex', 'npc-welt/vex-schrapnell.ts'),
    ('he-vex-schrapnell-10', 'loetgassen', 'funkmast', 'A, act2 nach he-vex-schrapnell-8, Spielfigur nicht Vex', 'npc-welt/vex-schrapnell.ts'),
):
    ev(id_, map_, spot, when, V(f))

# --- Marla: liegt noch auf dem Samstagsmarkt → in die Ödnis umhängen
ev('he-marla-sand-4', 'aussiedlerhof', 'veranda', 'A, act2 (Geschichte vom Meer, kuestenkarte-fragment); bisher schrottmarkt Sa', 'umhängen (npc-unterstadt/marla-sand.ts)')
ev('he-marla-sand-6', 'staubstrasse', 'pisten-kreuz', 'T, act2 nach he-marla-sand-4 (Sandsturm: Wind lesen); bisher schrottmarkt Sa', 'umhängen (npc-unterstadt/marla-sand.ts)')
ev('he-marla-sand-8', 'staubstrasse', 'konvoi-halt', 'T Mo/Do, act2 nach he-marla-sand-6 (Karawanen-Eskorte gegen Staubfalken); bisher schrottmarkt Sa', 'umhängen (npc-unterstadt/marla-sand.ts)')
ev('he-marla-sand-10', 'aussiedlerhof', 'brunnen', 'M, act2 nach he-marla-sand-8 (marlas-wasserstab); bisher schrottmarkt Sa', 'umhängen (npc-unterstadt/marla-sand.ts)')

# --- Antagonisten und Oberstadt (alle neu; 2/4 teils schon in Akt 1 erreichbar)
ev('he-blade-2', 'cafe-sahnehaube', 'blade-tisch', 'A, ab Akt 1 (blades-visitenkarte, öffnet einmal das Foyer)')
ev('he-blade-4', 'quantum-foyer', 'logo-wand', 'M/T, act2 (Führung durchs Foyer, Nexus sagt „Master“; Zugang per blades-visitenkarte)')
ev('he-blade-6', 'chrome-boulevard', 'wolkenbank', 'T Mo/Do, act2 (die Maske fällt, Flag blade_zweifel)')
ev('he-blade-8', 'zellentrakt', 'besucherraum', 'T Di/Do/Sa, Flag epilog und blade_gefasst (Besuch)')
ev('he-blade-10', 'zellentrakt', 'besucherraum', 'T Di/Do/Sa, Flag epilog nach he-blade-8 (Code zum Geheimfach → blades-buero geheimfach)')
ev('re-blade-8', 'chrome-boulevard', 'boulevard-mitte', 'T Mo/Do, Rivalität −8 (optionaler Boss „Blade und die Golddrohnen“ oder [Ausstrahlung 8])')
ev('he-alesa-zero-2', 'cafe-sahnehaube', 'fenstertisch', 'M Mo–Fr 07–09, ab Akt 1 (probt eine Rede)')
ev('he-alesa-zero-4', 'digitech-areal', 'lieferzone', 'T Mi (Prototypen tragen, Hinweis auf Wachschichten)')
ev('he-alesa-zero-6', 'glasarkaden', 'glaspark-bank', 'A, act2 (Schuldgefühle, Flag alesa_zweifel)')
ev('he-alesa-zero-8', 'gerichtssaal', 'zeugenstand', 'T, Flag epilog (Zeugenaussage [Ausstrahlung 6], Sozialstunden bei Dante)')
ev('he-alesa-zero-10', 'digitech-areal', 'glasfassade', 'T, Flag epilog nach he-alesa-zero-8 (Werkstatt „Nullpunkt“, zero-prototyp)')
ev('he-xion-venom-2', 'neon-gasse', 'werbestand', 'A, ab Akt 1 (besseres Werbeplakat, es kommt nur eine Taube)')
ev('he-xion-venom-4', 'hafenkante', 'container-77', 'N Di (ertappt mit Ripper, xion-passierschein gegen Schweigen)')
ev('he-xion-venom-6', 'quantum-foyer', 'xion-posten', 'M, act2 („Dumpfbacke“: Kopfrechentrick)')
ev('he-xion-venom-8', 'schrottmarkt', 'marktplatz-mitte', 'T, Flag epilog (Jobbörse)')
ev('he-xion-venom-10', 'neon-gasse', 'hv-eingang', 'N, Flag epilog nach pers-xion-umschulung (Türsteher, Entschuldigung bei Aria, xion-vip-band)')
ev('he-ki-nexus-2', 'quantum-schauraum', 'hologramm', 'T, ab Akt 1 („Sie sind nicht verbunden. Interessant.“)')
ev('he-ki-nexus-4', 'quantum-foyer', 'nexus-avatar', 'A/N, act2 (Wie soll man dich nennen?)')
ev('he-ki-nexus-6', 'quantum-foyer', 'nexus-avatar', 'act3 während main-3-einlass (Freundschaft erklären; [Nexus ♥6] überspringt Bossphase 1)')
ev('he-ki-nexus-8', 'dantes-werkstatt', 'faxgeraet', 'Flag epilog und ende_neue_nexus (Fax-Splitter)')
ev('he-ki-nexus-10', 'dantes-werkstatt', 'faxgeraet', 'Flag epilog nach he-ki-nexus-8 (Zeichnung vom Meer, kopf-nexus-splitter)')
ev('he-seraphina-chrome-2', 'glasarkaden', 'glaspark-tauben', 'A, ab Akt 1 (Rede vor Tauben)')
ev('he-seraphina-chrome-4', 'chrome-penthouse', 'salon', 'M, act2 (drei Investmentpläne, danach Nachricht)')
ev('he-seraphina-chrome-6', 'chrome-penthouse', 'balkon-blau', 'T, act2 („zerlegt“; [Ausstrahlung 6] Flag seraphina_zweifel)')
ev('he-seraphina-chrome-8', 'nx1-studio', 'studio-set', 'A, Flag epilog (ehrliche Entschuldigung in der Talkshow)')
ev('he-seraphina-chrome-10', 'chrome-boulevard', 'boulevard-mitte', 'T, Flag epilog nach he-seraphina-chrome-8 (Chrome-Stiftung, chrome-mitgliedskarte)')
ev('he-sybella-chrome-2', 'schrottmarkt', 'sybella-verkleidet', 'A Di/Sa, ab Akt 1 (Feilschduell)')
ev('he-sybella-chrome-4', 'schrottmarkt', 'sybella-verkleidet', 'A Di/Sa (die Spielfigur erkennt die Verkleidung)')
ev('he-sybella-chrome-6', 'chrome-boulevard', 'boutique-chrome', 'T, act2 (Bücher zeigen „Projekt Schwarm“)')
ev('he-sybella-chrome-8', 'schrottmarkt', 'flohmarkt', 'T So, act2 (gemeinsamer Flohmarktstand)')
ev('he-sybella-chrome-10', 'chrome-boulevard', 'boutique-chrome', 'T, act2 nach he-sybella-chrome-8 (Geschäftspartnerschaft, goldene-kundenkarte)')
ev('he-serenity-chrome-2', 'glasarkaden', 'glaspark', 'M, ab Akt 1 (kranke Pflanze [Technik 4])')
ev('he-serenity-chrome-4', 'cafe-sahnehaube', 'ecktisch-cafe', 'A (liest aus „Herz aus Chrom“)')
ev('he-serenity-chrome-6', 'nx1-studio', 'schminkspiegel', 'T Mi, act2 (Lampenfieber [Ausstrahlung 5]; schaltet den Turmaufzug zum Himmelsgarten frei)')
ev('he-serenity-chrome-8', 'himmelsgarten', 'rosenboegen', 'M, nach he-serenity-chrome-6 („Mich hat nie jemand gefragt, was ich will.“)')
ev('he-serenity-chrome-10', 'aussiedlerhof', 'serenity-garten', 'M Sa, Flag epilog (eigener Garten, serenitys-ring)')

# --- Weltfiguren der neuen Zonen (Maximum 5 Herzen: nur 2 und 4)
ev('he-portier-albert-2', 'chrome-boulevard', 'portierloge', 'M, act2 (Etikette-Lektion: welche Gabel für Austern-Imitat)')
ev('he-portier-albert-4', 'chrome-boulevard', 'portierloge', 'A, act2 (Albert zeigt seine Sammlung verlorener Handschuhe, Concierge-Bonus)')
ev('he-rudi-2', 'rudis-diner', 'tresen', 'M (die Geschichte des Absturzes, Pfannkuchen aufs Haus)')
ev('he-rudi-4', 'rudis-diner', 'kueche', 'T (Rudi verrät das Pfannkuchen-Rezept, pers-jakko-kochbuch)')
ev('he-kraehe-2', 'staubstrasse', 'wrackburg-hof', 'T (Krähe sammelt Geschichten: eine erzählen)')
ev('he-kraehe-4', 'staubstrasse', 'lagerfeuer', 'A, nach side-kraehes-ehre (Ehrenfeder, freies Geleit verstärkt)')
ev('he-elsa-2', 'aussiedlerhof', 'elsas-werkstatt', 'M (Ziegenroboter reparieren)')
ev('he-elsa-4', 'aussiedlerhof', 'lagerfeuer-hof', 'A, nach pers-gustav-alte-liebe (Elsa erzählt von Gustav als jungem Kranführer)')
ev('he-opa-funk-2', 'funkturm-ruine', 'radio-rost-pult', 'A (Wetterbericht vorlesen dürfen)')
ev('he-opa-funk-4', 'funkturm-ruine', 'plattenleine', 'T, nach side-verlorene-frequenz (Lieblingsplatte, Grüße an die Stadt)')
ev('he-glasblaeserin-2', 'glasduenen', 'glaswerkstatt', 'T (eine Kugel blasen, Glasperlen)')
ev('he-glasblaeserin-4', 'glasduenen', 'glasofen', 'A, nach side-glasherz (warum sie nie in die Stadt geht)')
ev('he-krabbe-karl-2', 'das-meer', 'karls-stein', 'A, Flag epilog (Karl schenkt eine Muschel)')
ev('he-krabbe-karl-4', 'das-meer', 'strand', 'M, Flag epilog (Karl zeigt sein Muschelversteck)')

# --- Romanze-Stationen Akt 2/3/Nachspiel
ev('rom-aria-ausfall', 'dantes-werkstatt', 'einbau-liege', 'N, act2: Variante A direkt nach main-2-countdown; Variante B nach he-aria-8 (Station 5, Auftakt pers-aria-zerberster)')
ev('rom-aria-meer', 'das-meer', 'wasserlinie', 'A Sonnenuntergang, Flag epilog, erster Abend am Meer (Ende 1/2; Ende 3 erst nach 3b) (Station 11)')
ev('rom-vexaria-konzert', 'das-meer', 'strandclub-buehne', 'A/N, Flag epilog, nach rom-aria-meer, Eröffnung side-strandclub, vexaria_kas_erzaehlt (Station 13, nur Vex)', 'vorhanden (vexaria)')
for id_ in ('rom-aria-streit', 'rom-aria-vega', 'rom-aria-regen', 'rom-aria-kuss', 'rom-aria-stirn',
            'rom-vexaria-funkstille', 'rom-vexaria-umdrehen', 'rom-vexaria-kuss', 'rom-vexaria-licht',
            'rom-vexaria-morgen', 'rom-vexaria-funkmast'):
    e = ACT1['events'][id_]
    ev(id_, e['map'], e['spot'], e['when'], 'act1')

# ---------------------------------------------------------------------------------------------- Quest-Orte
# Reihenfolge = Ablauf der Schritte. Format wie act1.json: ["karte:spot", …].

QUESTS: dict[str, list] = {
    # --- Hauptstrang Akt 2
    'main-2-bruch': ['quantum-campus:bruch-treffpunkt', 'quantum-campus:brueckenkopf', 'quantum-campus:scheinwerfer-turm',
                     'quantum-campus:seiteneingang', 'quantum-campus:lueftungsschacht', 'quantum-foyer:sicherheitszentrale',
                     'quantum-labor:zentralrechner', 'quantum-labor:probanden-liege', 'quantum-labor:xion-tuer',
                     'quantum-labor:nyras-arbeitsplatz'],
    'main-2-kanal': ['kanal-sammler:fluchtweg-tuer', 'pumpwerk-sieben:kanalvolk-sperre', 'pumpwerk-sieben:op-nische',
                     'pumpwerk-sieben:ventil-stand', 'pumpwerk-sieben:ueberlaufrohr'],
    'main-2-countdown': ['dantes-werkstatt:eins-tisch', 'dantes-werkstatt:einbau-liege', 'dantes-werkstatt:werkbank',
                         'loetgassen:werkstatt-fenster'],
    'main-2-krisensitzung': ['hv-hinterzimmer:planungstisch', 'hv-hinterzimmer:schreibtisch', 'high-voltage:tresen'],
    # --- Party-Vorbereitungen (mindestens 3 von 6)
    'prep-outfits': ['stufenplatz:salon-gina'],
    'prep-ausweise': ['bahnhof-mitte:fotoautomat', 'hafenkante:quantum-depot', 'eisenhof:behoerden-terminal'],
    'prep-gaesteliste': ['nx1-studio:redaktion', 'nx1-studio:regie', 'quantum-foyer:gaesteliste-pult'],
    'prep-fahrzeug': ['hafenkante:garage-rostlaube', 'staubstrasse:rennpiste-start', 'rennhalle-9:rennbahn'],
    'prep-turm-plan': ['datentunnel:nyra-funkpunkt', 'eisenhof:beweismittellager', 'chrome-penthouse:bibliothek'],
    'prep-gegenmittel': ['dantes-werkstatt:werkbank', 'pumpwerk-sieben:quantum-aussenstelle', 'datentunnel:splitter-nest'],
    # --- Hauptstrang Akt 3 (Partynacht)
    'main-3-einlass': ['quantum-campus:party-vorplatz', 'quantum-campus:haupteingang', 'quantum-foyer:empfang',
                       'quantum-foyer:presse-ecke', 'quantum-foyer:catering-tuer', 'quantum-campus:lueftungsschacht',
                       'quantum-foyer:gaesteliste-pult', 'himmelsgarten:gaesteeingang', 'himmelsgarten:presse-podest'],
    'main-3-labor': ['himmelsgarten:wartungsgang', 'quantum-labor:labortuer', 'quantum-labor:op-tisch',
                     'quantum-labor:alesas-pult', 'quantum-labor:kuschel-ablage'],
    'main-3-gedankenkontrolle': ['himmelsgarten:rednerbruecke', 'himmelsgarten:partysaal', 'himmelsgarten:tanzflaeche-glas',
                                 'himmelsgarten:vip-lounge'],
    'main-3-nexus': ['quantum-foyer:chefaufzug', 'quantum-labor:kernschacht', 'server-kern:knoten-logik',
                     'server-kern:knoten-kontrolle', 'server-kern:knoten-stimme', 'server-kern:kern',
                     'server-kern:upload-konsole', 'server-kern:terminal-halten', 'server-kern:fx60-anschluss'],
    'main-3-blade': ['himmelsgarten:antennen', 'himmelsgarten:landeplatz', 'himmelsgarten:gleiter'],
    # --- Nebenquests 32–49
    'side-teekraenzchen': ['chrome-boulevard:boutique-chrome', 'chrome-penthouse:salon', 'chrome-penthouse:sofa-bijou'],
    'side-alesas-zuendholz': ['quantum-campus:altlager-zaun', 'quantum-campus:patrouillenweg', 'quantum-campus:altlager',
                              'quantum-campus:loeschwassertank'],
    'side-ki-fluestern': ['neon-gasse:kiosk', 'neon-gasse:paul-ecke', 'schrottmarkt:klingel-stand', 'fundbuero:schalter',
                          'stufenplatz:prediger-kiste', 'cafe-sahnehaube:theke', 'glasarkaden:chrome-10-werbestand'],
    'side-weg-zum-meer': ['aussiedlerhof:marlas-wohnwagen', 'digitech-areal:archiv', 'hausboot-nebelhorn:logbuch-regal',
                          'staubstrasse:singende-masten', 'staubstrasse:wegzoll-schranke', 'glasduenen:eingestuerzte-bruecke',
                          'glasduenen:seilwinde', 'glasduenen:aussichtsduene'],
    'side-captain-kuschel': ['dantes-werkstatt:kuschel-regal', 'schrottmarkt:marktplatz-mitte', 'neon-gasse:stadt-tv',
                             'bahnhof-mitte:pendlerbank', 'hafenkante:container-labyrinth', 'schrottmarkt:mila-ecke',
                             'neon-gasse:kiosk', 'das-nest:eins-kiste'],
    'side-xions-kralle': ['hafenkante:alte-arena', 'hafenkante:boxsack', 'crew-quartier:pinnwand'],
    'pers-nyra-silent-angel': ['crew-quartier:fenster', 'datentunnel:nyra-funkpunkt', 'stufenplatz:fussgaengerbruecke'],
    'pers-aria-zerberster': ['schrottmarkt:inkasso-gasse', 'dantes-werkstatt:einbau-liege', 'dantes-werkstatt:faxgeraet',
                             'ripper-praxis:behandlungsstuhl', 'ripper-praxis:hinterzimmer-vorhang', 'hafenkante:container-77',
                             'kanal-sammler:rippers-lager'],
    'side-chrome-pudel': ['chrome-boulevard:portierloge', 'chrome-boulevard:pudelwiese', 'glasarkaden:glaspark',
                          'stufenplatz:windkante', 'schrottmarkt:halde', 'chrome-penthouse:sofa-bijou'],
    'side-hartlaufs-rache': ['digitech-areal:pfoertnerhaus', 'digitech-areal:pfoertnerhaus-bank', 'digitech-areal:archiv',
                             'digitech-areal:wachkoloss', 'nx1-studio:redaktion'],
    'side-rostzaehne-ende': ['hafenkante:kai-mitte', 'hafenkante:container-labyrinth', 'hafenkante:rostzaehne-lager',
                             'eisenhof:wachhaeuschen'],
    'side-kraehes-ehre': ['staubstrasse:wrackburg-tor', 'staubstrasse:wrackburg-hof', 'staubstrasse:rennpiste-start',
                          'staubstrasse:sprungschanze'],
    'side-oednis-frieden': ['staubstrasse:konvoi-halt', 'staubstrasse:wegzoll-schranke', 'aussiedlerhof:veranda',
                            'rudis-diner:verhandlungstisch'],
    'side-glasherz': ['glasduenen:glaswerkstatt', 'staubstrasse:broesel-wasserstand', 'glasduenen:broesel-versteck',
                      'glasduenen:skorpionnest', 'glasduenen:glasofen'],
    'side-verlorene-frequenz': ['funkturm-ruine:radio-rost-pult', 'funkturm-ruine:windrad', 'flutmauer:leuchtturm-oben',
                                'funkturm-ruine:plattenarchiv'],
    'side-strandclub': ['das-meer:strandclub', 'staubstrasse:wrackburg-hof', 'das-meer:grundstueck-pflock',
                        'schrottmarkt:dexter-buero', 'digitech-areal:pluenderer-lager', 'das-meer:shuttle-halt',
                        'das-meer:strandclub-buehne', 'das-meer:lagerfeuer'],
    'side-zweite-chance': ['blades-buero:kuschel-sessel', 'blades-buero:nexus-terminal', 'crew-quartier:bett',
                           'dantes-werkstatt:sofa', 'high-voltage:tresen', 'das-meer:wagenplatz'],
    'side-offene-werkstatt': ['quantum-campus:campus-wiese', 'quantum-campus:pausenraum', 'quantum-foyer:logo-wand',
                              'server-kern:kern', 'quantum-campus:haupteingang'],
    # --- Persönliche Quests mit Schritten in neuen Zonen oder ab ♥8 (Platzhalter aus parts/integration/luecken.ts
    #     werden unter derselben ID ersetzt: pers-delya-quelle, pers-collin-pixel, pers-ripper-taschenuhr,
    #     pers-gustav-alte-liebe, side-ki-fluestern, side-captain-kuschel)
    'pers-delya-quelle': ['nx1-studio:redaktion', 'kanal-sammler:floss-anleger', 'pumpwerk-sieben:schlafwandler-pumpe',
                          'datentunnel:schlafwandler-tunnel', 'dantes-werkstatt:sofa'],
    'pers-collin-pixel': ['stufenplatz:buehne', 'nx1-studio:regie', 'quantum-foyer:presse-ecke', 'nx1-studio:studio-set'],
    'pers-ripper-taschenuhr': ['ripper-praxis:auslage', 'chrome-boulevard:boutique-chrome', 'ripper-praxis:behandlungsstuhl'],
    'pers-gustav-alte-liebe': ['high-voltage:oldie-ecke', 'staubstrasse:konvoi-halt', 'aussiedlerhof:elsas-werkstatt',
                               'aussiedlerhof:gustav-bank', 'aussiedlerhof:lagerfeuer-hof'],
    'pers-marla-brunnen': ['aussiedlerhof:brunnen', 'aussiedlerhof:eigenes-feld'],
    'pers-pim-kleine-schrift': ['schrottmarkt:marktplatz-mitte', 'quantum-campus:pausenraum', 'quantum-labor:pims-werkbank',
                                'nx1-studio:redaktion'],
    'pers-seraphina-plan-b': ['chrome-penthouse:salon', 'schrottmarkt:wohnwagen', 'neon-gasse:lichterketten-bank',
                              'schrottmarkt:garkueche', 'chrome-boulevard:promenade'],
    'pers-sybella-schnaeppchen': ['schrottmarkt:sybella-verkleidet', 'schrottmarkt:flohmarkt', 'dantes-werkstatt:werkbank'],
    'pers-serenity-gewaechshaus': ['himmelsgarten:serenity-beet', 'neon-gasse:dachterrasse'],
    'pers-blade-teddymantel': ['zellentrakt:besucherraum', 'eisenhof:beweismittellager', 'zellentrakt:besucherraum-tuer'],
    'pers-alesa-wasserfilter': ['digitech-areal:glasfassade', 'aussiedlerhof:elsas-werkstatt', 'aussiedlerhof:brunnen'],
    'pers-xion-umschulung': ['schrottmarkt:marktplatz-mitte', 'neon-gasse:hv-eingang'],
    'pers-ki-nexus-seele': ['dantes-werkstatt:faxgeraet', 'high-voltage:kartentisch', 'fundbuero:kuriositaeten-kiste',
                            'flutmauer:muenzfernrohr', 'das-meer:strand', 'quantum-foyer:nexus-avatar'],
    'pers-wingman-sonnenuntergang': ['dantes-werkstatt:werkbank', 'flutmauer:nyra-bank', 'flutmauer:mauer-ziel'],
    # Akt-1-Quests mit neuen Schritten (Ergänzung zu act1.json, dort bleiben die Akt-1-Orte)
    'pers-jakko-kochbuch': ['rudis-diner:kueche'],
    'pers-kiki-reichweite': ['staubstrasse:konvoi-halt', 'staubstrasse:pisten-kreuz'],
    'pers-lio-album': ['rennhalle-9:rennbahn'],
    'pers-nebelhorn-letzte-faehre': ['das-meer:steg'],
    # --- Hunters Sonderaufträge (Rang 5, geschriebene Einmal-Quests; IDs neu)
    'sonder-chrome-tresor': ['hv-hinterzimmer:schreibtisch', 'chrome-boulevard:juwelier-glanzstueck', 'chrome-boulevard:portierloge'],
    'sonder-konvoi-nougat': ['hv-hinterzimmer:schreibtisch', 'staubstrasse:konvoi-halt', 'staubstrasse:wegzoll-schranke',
                             'aussiedlerhof:hofladen'],
    'sonder-pumpwerk-pegel': ['hv-hinterzimmer:schreibtisch', 'pumpwerk-sieben:ventil-stand', 'kanal-sammler:gullys-rathaus'],
    'sonder-letzte-runde': ['hv-hinterzimmer:fotowand', 'rennhalle-9:alte-buehne', 'high-voltage:tresen'],
    # --- Auftragsziele in neuen Zonen (Ergänzung der Akt-1-Listen; Spot auftrag-a = Ablagepunkt)
    'job-oednis-paket': ['hv-hinterzimmer:schreibtisch', 'staubstrasse:auftrag-a', 'aussiedlerhof:hofladen'],
    'job-kurier': ['chrome-boulevard:auftrag-a', 'staubstrasse:auftrag-a'],
    'job-schulden': ['chrome-boulevard:promenade', 'staubstrasse:lagerfeuer'],
    'job-datenraub': ['quantum-campus:pausenraum', 'datentunnel:netzknoten'],
    'job-eskorte': ['chrome-boulevard:auftrag-a', 'aussiedlerhof:hofladen'],
    'job-bergung': ['staubstrasse:wrackburg-hof', 'glasduenen:eingestuerzte-bruecke'],
    'job-kanal': ['pumpwerk-sieben:schlafwandler-pumpe'],
    # --- Kopfgelder Stufe 3
    'kopfgeld-blech-schwestern': ['chrome-boulevard:blech-schwestern-ecke', 'chrome-boulevard:juwelier-glanzstueck'],
    'kopfgeld-faxfaelscher': ['digitech-tresor:fx-60-terminal', 'digitech-areal:notstrom-terminal'],
    'kopfgeld-staubbaron-broesel': ['staubstrasse:broesel-wasserstand', 'aussiedlerhof:brunnen'],
    'kopfgeld-leutnant-nadel': ['quantum-campus:wachhaeuschen-campus', 'quantum-campus:patrouillenweg'],
}

# ---------------------------------------------------------------------------------------------- Begegnungen
ENCOUNTERS = {
    'enc-bruch-overwatch': 'quantum-campus:brueckenkopf',
    'enc-labor-xion': 'quantum-labor:xion-tuer',
    'enc-kanal-xion-ripper': 'pumpwerk-sieben:op-nische',
    'enc-kanal-xion-ripper-fluchtweg': 'pumpwerk-sieben:kanalvolk-sperre',
    'enc-kanal-xion-ripper-ueberrumpelt': 'pumpwerk-sieben:op-nische',
    'enc-kanal-schlafwandler': 'pumpwerk-sieben:schlafwandler-pumpe',
    'enc-datentunnel-splitter': 'datentunnel:splitter-nest',
    'enc-ring-xion': 'hafenkante:alte-arena',
    'enc-altlager-patrouille': 'quantum-campus:altlager-zaun',
    'enc-altlager-zuendholz': 'quantum-campus:altlager',
    'enc-altlager-zuendholz-loeschtank': 'quantum-campus:loeschwassertank',
    'enc-markt-betreuer': 'schrottmarkt:marktplatz-mitte',
    'enc-bruecke-patrouille': 'stufenplatz:fussgaengerbruecke',
    'enc-oednis-staubfalken': 'staubstrasse:wegzoll-schranke',
    'enc-wrackburg-kraehe': 'staubstrasse:wrackburg-hof',
    'enc-wrackburg-kraehe-duell': 'staubstrasse:wrackburg-hof',
    'enc-duenen-koenigin': 'glasduenen:skorpionnest',
    'enc-funkturm-windraeder': 'funkturm-ruine:windrad',
    'enc-ruine-wachkoloss': 'digitech-areal:wachkoloss',
    'enc-hafen-funzel': 'hafenkante:rostzaehne-lager',
    'enc-rostzahn-lager': 'hafenkante:rostzaehne-lager',
    'enc-campus-patrouille': 'quantum-campus:patrouillenweg',
    'enc-einlass-kontrolle': 'quantum-foyer:empfang',
    'enc-labor-blade-vorspiel': 'quantum-labor:labortuer',
    'enc-labor-blade-hinterhalt': 'quantum-labor:labortuer',
    'enc-turm-raven': 'himmelsgarten:partysaal',
    'enc-turm-raven-dante': 'himmelsgarten:partysaal',
    'enc-turm-xion': 'himmelsgarten:tanzflaeche-glas',
    'enc-kern-nexus': 'server-kern:kern',
    'enc-kern-nexus-ohne-garde': 'server-kern:kern',
    'enc-kern-nexus-fx60': 'server-kern:fx60-anschluss',
    'enc-kern-nexus-fx60-ohne-garde': 'server-kern:fx60-anschluss',
    'enc-kern-nexus-herz': 'server-kern:kern',
    'enc-dach-blade': 'himmelsgarten:landeplatz',
    'enc-dach-blade-allein': 'himmelsgarten:landeplatz',
    'enc-strand-staubfalken': 'das-meer:grundstueck-pflock',
    'enc-praxis-ripper': 'ripper-praxis:behandlungsstuhl',
    'enc-praxis-ripper-allein': 'ripper-praxis:hinterzimmer-vorhang',
    'enc-praxis-ripper-vex': 'ripper-praxis:behandlungsstuhl',
    'enc-praxis-ripper-allein-vex': 'ripper-praxis:hinterzimmer-vorhang',
    'enc-tuer-xion-probeabend': 'neon-gasse:hv-eingang',
    're-blade-8': 'chrome-boulevard:boulevard-mitte',
    'enc-kopfgeld-blech-schwestern': 'chrome-boulevard:blech-schwestern-ecke',
    'enc-kopfgeld-faxfaelscher': 'digitech-areal:notstrom-terminal',
    'enc-kopfgeld-leutnant-nadel': 'quantum-campus:patrouillenweg',
    'enc-kopfgeld-staubbaron-broesel': 'staubstrasse:broesel-wasserstand',
}

# ---------------------------------------------------------------------------------------------- Akt-Einstiege
# Empfehlung für ACT_STARTS 2 und 3 in game/src/content/world.ts. „basis“ nennt die vorhandenen Konstanten dort.
ACT_STARTS = {
    '2': {
        'map': 'quantum-campus', 'entry': 'bruch-treffpunkt',
        'basis': 'AKT1_FLAGS, AKT1_QUESTS, AKT1_STATIONS, AKT1_VISITED, PROLOG_SEEN',
        'flags': ['prep_grundriss', 'prep_wachplan', 'prep_fluchtweg'],
        'quests': {'prep-grundriss': 'done', 'prep-wachplan': 'done', 'prep-fluchtweg': 'done', 'main-2-bruch': 'active'},
        'recruited': ['raven', 'aria', 'vega', 'nyra', 'hunter'],
        'party': ['aria', 'nyra'],
        'relations': {'raven': 450, 'aria': 450, 'vega': 300, 'nyra': 300, 'hunter': 350, 'dante': 250},
        'items': {'medipflaster': 3, 'reparaturset': 1, 'nougatbombe': 2},
        'credits': 400, 'level': 6, 'day': 10,
        'visited': ['+ quantum-campus'],
        'note': 'Direkt nach dem „los“ an der Planungstafel (akt1-cliffhanger), Nacht. Dante ist NICHT in der Crew (tritt erst in main-2-countdown bei). ActStart kennt keine Uhrzeit: entweder Feld minutes ergänzen (Engine-Lücke, 23:00 = 1380) oder main-2-bruch setzt die Zeit im ersten Knoten.',
    },
    '3': {
        'map': 'quantum-campus', 'entry': 'party-vorplatz',
        'basis': 'wie Akt 2 plus Hauptstrang Akt 2',
        'flags': ['nexus_erwacht', 'nyra_zurueckgelassen', 'aria_gechippt', 'dante_beigetreten', 'releaseparty_geplant',
                  'prep_outfits', 'prep_ausweise', 'prep_gaesteliste', 'party_bereit'],
        'quests': {'main-2-bruch': 'done', 'main-2-kanal': 'done', 'main-2-countdown': 'done', 'main-2-krisensitzung': 'done',
                   'prep-outfits': 'done', 'prep-ausweise': 'done', 'prep-gaesteliste': 'done', 'main-3-einlass': 'active'},
        'recruited': ['raven', 'aria', 'vega', 'hunter', 'dante'],
        'party': ['aria', 'dante'],
        'relations': {'raven': 650, 'aria': 650, 'vega': 500, 'nyra': 500, 'hunter': 550, 'dante': 500},
        'items': {'medipflaster': 5, 'nanogel': 2, 'reparaturset': 2, 'nougatbombe': 3},
        'credits': 1200, 'level': 11, 'day': 30,
        'stations': ['+ station-chrome-allee'],
        'visited': ['+ quantum-campus', 'pumpwerk-sieben', 'chrome-boulevard', 'glasarkaden', 'staubstrasse', 'aussiedlerhof'],
        'note': 'Abend der Releaseparty (A, 20:00). Nyra ist nicht in der Crew (im Turm), Raven nicht in der Party (wird auf der Party gechippt). Variante A von main-2-bruch angenommen (Aria war gechippt). nexus-chip-defekt nur, wenn gc-34 gelang – im Warp weglassen.',
    },
}

# ---------------------------------------------------------------------------------------------- Flags (neu)
FLAGS = {
    'act2': ['bruch_rolle_drinnen', 'bruch_rolle_bruecke', 'nexus_erwacht', 'nyra_zurueckgelassen', 'aria_gechippt',
             'aria_entkommen', 'jimmy_gechippt', 'aria_arm_gesperrt', 'dante_beigetreten', 'party_idee_spieler',
             'releaseparty_geplant', 'peilsender_entdeckt', 'peilsender_gewarnt', 'peilsender_ausgenutzt',
             'schwestern_gewarnt', 'alesa_zweifel', 'seraphina_zweifel', 'blade_zweifel', 'wartungsleiter_gefunden',
             'ueberlaufrohr_offen', 'rennhalle-9-geoeffnet', 'kuschel_bei_mila', 'kuschel_sorgerecht',
             'schlafwandler_ede_gerettet', 'schlafwandlerin_rosi_gerettet', 'schlafwandler_bert_gerettet',
             'frequenz_relais', 'glasherz_ei_zurueck', 'kraehe_teilhaberin', 'bijou_spur_1', 'bijou_spur_2', 'bijou_spur_3',
             'prep_outfits', 'prep_ausweise', 'prep_gaesteliste', 'prep_fahrzeug', 'prep_turm_plan', 'prep_gegenmittel',
             'party_bereit'],
    'act3': ['einlass_haupteingang', 'einlass_catering', 'einlass_lueftung', 'einlass_gaesteliste', 'einlass_wache',
             'nyra_befreit', 'xion_fehlt', 'chip_genommen', 'chip_abgelehnt', 'raven_zurueck', 'nexus_rebelliert',
             'upload_stick', 'upload_umschreiben', 'upload_ueberzeugt', 'upload_master',
             'blade_gefasst', 'blade_angekettet', 'blade_entkommen'],
    'enden': ['ende_meer', 'ende_neue_nexus', 'ende_master', 'ende_doch_noch_meer', 'epilog'],
}

# ---------------------------------------------------------------------------------------------- Enden
ENDINGS = {
    'ende-das-meer': {'bedingung': 'upload_stick oder upload_ueberzeugt (Nyra mit nyra_befreit zurück; ohne sie: leerer Platz im Wagen, he-nyra-8 holt es nach)',
                      'flags': ['ende_meer', 'epilog'], 'cutscene': 'ende-das-meer',
                      'danach': 'travel das-meer / ankunft', 'abspann': 'das-meer:wagenplatz'},
    'ende-neue-nexus': {'bedingung': 'upload_umschreiben', 'flags': ['ende_neue_nexus', 'epilog'],
                        'cutscene': 'ende-neue-nexus', 'danach': 'travel das-meer / ankunft',
                        'abspann': 'das-meer:wagenplatz'},
    'ende-master': {'bedingung': 'upload_master', 'flags': ['ende_master', 'epilog'], 'cutscene': 'ende-master',
                    'danach': 'travel blades-buero / aufwachen (Master-Modus: Unterstadt feindselig, Crew-Quests gesperrt, shelter blades-buero)',
                    'abspann': '– (erst nach 3b)'},
    'ende-doch-noch-ans-meer': {'bedingung': 'ende_master und side-zweite-chance erledigt', 'flags': ['ende_doch_noch_meer'],
                                'cutscene': 'ende-doch-noch-ans-meer', 'danach': 'travel das-meer / ankunft',
                                'abspann': 'das-meer:wagenplatz'},
}

# ---------------------------------------------------------------------------------------------- Pakete
PACKAGES = {
    'pkg-chrome-himmel': {
        'title': 'Chrome-Boulevard und Himmelsgarten',
        'maps': ['chrome-boulevard', 'himmelsgarten'],
        'notes': 'Oberstadt-Prunk. Legt station-chrome-allee an, Shops chrome-und-co, glanzstueck, himmelsgarten-blumen, Tafel concierge-chrome. '
                 'Himmelsgarten ist Partyebene (act3) mit Landeplatz für main-3-blade; Turmaufzug erst nach he-serenity-chrome-6 bzw. act3. '
                 'Ereignisse: Blade/Seraphina/Sybella/Serenity 6–10, re-blade-8, Portier Albert 2/4. Kopfgeld Blech-Schwestern.',
    },
    'pkg-quantum-campus': {
        'title': 'Quantum-Campus mit Foyer',
        'maps': ['quantum-campus', 'quantum-foyer'],
        'notes': 'Einstiege bruch-treffpunkt (Akt-2-Start) und party-vorplatz (Akt-3-Start). Altlager, Brückenkopf, Löschwassertank als Spots. '
                 'Foyer: Einlass-Wege main-3-einlass (Haupteingang, Catering, Lüftung, Gästeliste), Nexus-Avatar (he-ki-nexus-4/6), Kantinen-Automat. '
                 'Liefert lieferzone-Rückweg ins Digitech-Areal und die Wartungsleiter in den Datentunnel.',
    },
    'pkg-quantum-turm': {
        'title': 'Quantum-Labor, Blades Büro und Serverkern',
        'maps': ['quantum-labor', 'blades-buero', 'server-kern'],
        'notes': 'Innenräume des Turms. Labor: main-2-bruch (Xion-Kampf, Nyra bleibt zurück, Aria gechippt), main-3-labor. '
                 'Serverkern: Boss enc-kern-nexus samt Varianten, Upload-Entscheidung (vier Wege) → Enden. Blades Büro: Geheimfach (he-blade-10), '
                 'Kuschel-Sessel (side-zweite-chance), Master-Modus-Unterschlupf nach Ende 3.',
    },
    'pkg-kanal-tief': {
        'title': 'Pumpwerk Sieben und Datentunnel',
        'maps': ['pumpwerk-sieben', 'datentunnel'],
        'notes': 'Öffnet die Akt-1-Ausgänge tunnel-ost und schott (kanal-sammler) sowie kabelschacht (digitech-areal). main-2-kanal in der OP-Nische, '
                 'Überlaufrohr zur Hafenkante (Einstieg ueberlaufrohr existiert schon). Datentunnel: Nyras Funkpunkt, Splitter-Nest, Nexus-Splitter im Nachspiel. '
                 'Schlafwandler für pers-delya-quelle.',
    },
    'pkg-staubstrasse': {
        'title': 'Staubstraße, Rudis Diner und Funkturm-Ruine',
        'maps': ['staubstrasse', 'rudis-diner', 'funkturm-ruine'],
        'notes': 'Tor zur Ödnis über den Rostlaube-Ausgang der Hafenkante (side-rostlaube + act2). Wrackburg der Staubfalken (Krähe), Rennpiste, '
                 'Konvoi-Halt, Brösels Wasserstand. Rudis Diner als Quest-Raum (side-oednis-frieden, pers-jakko-kochbuch). Funkturm: Radio Rost, '
                 'side-verlorene-frequenz. Kiki-Taxi-Ziel staubstrasse/taxi.',
    },
    'pkg-oednis-hof': {
        'title': 'Aussiedlerhof und Glasdünen',
        'maps': ['aussiedlerhof', 'glasduenen'],
        'notes': 'Marla (he-marla-sand-4..10 hierher umhängen), Elsa, Gustavs Bank, Hofladen, Wegezettel-Tafel, Serenitys Garten im Nachspiel. '
                 'Glasdünen: Glasbläserin, Skorpionkönigin, Seilwinde und Aussichtsdüne (side-weg-zum-meer); Wagenpiste zum Meer erst mit Flag epilog.',
    },
    'pkg-rennhalle-meer': {
        'title': 'Rennhalle 9 und das Meer',
        'maps': ['rennhalle-9', 'das-meer'],
        'notes': 'Rennhalle 9 öffnet den Hafenkante-Ausgang nach-rennhalle-9 (Paket setzt rennhalle-9-geoeffnet per mapAdditions.hafenkante.onEnter ab act2). '
                 'Das Meer ist die Nachspiel-Zone: Einstiege ankunft (Enden), shuttle (Strand-Shuttle ab side-strandclub), Strandclub, rom-aria-meer, '
                 'rom-vexaria-konzert, Krabbe Karl, Abspann-Hotspot.',
    },
}

# ---------------------------------------------------------------------------------------------- Hinweise
NOTES = [
    'Format wie act1.json. Neue IDs nur, wo world.md keine nennt (Spots, Hotspots, Sonder-Einstiege, sonder-*-Quests, Flags, Enden-Cutscenes).',
    'Einstiege: Jede neue Karte bietet genau die Einstiege, auf die die Akt-1-Ausgänge zeigen (von-hafenkante, von-glasarkaden, von-chrome-penthouse, '
    'von-digitech-areal, von-kanal-sammler). Rückwege zielen nur auf vorhandene Akt-1-Einstiege (von-rennhalle-9, von-staubstrasse, von-chrome-boulevard, '
    'von-quantum-campus, von-datentunnel, von-pumpwerk-sieben, ueberlaufrohr) – mapAdditions kann keine Einstiege ergänzen.',
    'Nachspiel = Flag epilog (ActId kennt nur 1|2|3). Bedingungen „act2“/„act3“ heißen wie in der Engine: Akt ≥ N.',
    'Enden: Der Effekt { ending: true } beendet das Spiel (state.ended → Endbildschirm → Titel). Die Enden laufen deshalb als Cutscene + Flags + travel '
    '(siehe ENDINGS); der echte Abspann ist ein optionaler Hotspot „Abspann ansehen“ am das-meer:wagenplatz. GameContent.ending in world.ts '
    '(ende-fortsetzung-folgt) durch die vier Abspann-Fassungen ersetzen.',
    'Integration Akt 1 → 2: Der Knoten „los“ der Planungstafel (parts/quest-main-b/planungstafel.ts) setzt act1_done, spielt akt1-cliffhanger, '
    'aber kein setAct. Ergänzen: setAct 2, startQuest main-2-bruch, travel quantum-campus/bruch-treffpunkt.',
    'Integration Akt 2 → 3: main-2-krisensitzung startet die Party-Vorbereitungen; ab 3 erledigten prep-* bietet die Planungstafel „Releaseparty starten“ '
    '(rom-aria-stirn davor), setAct 3, travel quantum-campus/party-vorplatz.',
    'Engine-Lücken: ActStart.minutes fehlt (Akt 2 startet nachts); MapDef.music ist nicht bedingt (Bruch-Musik schleichen über die Quest); '
    'shelter braucht eine Bedingung (blades-buero nur mit ende_master).',
    'rennhalle-9-geoeffnet wird bisher von niemandem gesetzt: pkg-rennhalle-meer setzt es per mapAdditions.hafenkante.onEnter ab act2.',
    'Kiki-Taxi: TAXI_ZIELE (parts/npc-ordnung-markt/_helfer) um staubstrasse, aussiedlerhof, funkturm-ruine, glasduenen (Ödnis erst nach pers-kiki-reichweite) '
    'und das-meer (nur epilog) erweitern; Einstieg jeweils taxi.',
    'Strand-Shuttle: Hotspot an hafenkante:faehre (mapAdditions) mit travel das-meer/shuttle, ab side-strandclub Stufe Shuttle.',
    'Marla Sand: he-marla-sand-4..10 liegen heute auf dem Samstagsmarkt; nach pkg-oednis-hof auf aussiedlerhof/staubstrasse umhängen (EVENTS status umhängen).',
    'Alesas und Pims Werkstatt „Nullpunkt“ (he-alesa-zero-10, he-pim-pinzette-10) liegt am digitech-areal:glasfassade (keine eigene Karte).',
    'Platzhalter-Quests aus parts/integration/luecken.ts werden unter derselben ID ersetzt (pers-delya-quelle, pers-collin-pixel, pers-ripper-taschenuhr, '
    'pers-gustav-alte-liebe, side-ki-fluestern, side-captain-kuschel).',
    'Beta-Chip-Träger für side-ki-fluestern: paul (neon-gasse:paul-ecke), frau-klingel (schrottmarkt:klingel-stand), gerda-gleis (fundbuero:schalter), '
    'bruder-kabellos (stufenplatz:prediger-kiste), barista-perle (cafe-sahnehaube:theke) – je ein vorangestellter Tagesablauf-Eintrag ist nicht nötig, '
    'die Figuren stehen schon dort; nur Dialog-Varianten mit Flag ki_fluestern_<npc>.',
    'Tagesabläufe: SCHEDULE_MODE je Figur – neu (vollständige Liste), ersetzt (ersetzt act1.json vollständig), vorangestellt (vor die Akt-1-Einträge setzen).',
    'Ereignisse: status vorhanden (Datei steht dabei, nur Ort prüfen), umhängen, neu, act1 (steht schon in act1.json).',
    'Prüfen: python3 design/plan/act23_gen.py --check',
]


# ---------------------------------------------------------------------------------------------- Ausgabe
def build() -> dict:
    return {
        'version': 1,
        'act': '2-3',
        'districts': DISTRICTS,
        'stations': STATIONS,
        'maps': MAPS,
        'shops': SHOPS,
        'boards': BOARDS,
        'npcSchedules': SCHED,
        'scheduleMode': SCHEDULE_MODE,
        'events': EVENTS,
        'questLocations': QUESTS,
        'encounterLocations': ENCOUNTERS,
        'actStarts': ACT_STARTS,
        'flags': FLAGS,
        'endings': ENDINGS,
        'packages': {k: {**v, 'key': k} for k, v in PACKAGES.items()},
        'notes': NOTES,
    }


# ---------------------------------------------------------------------------------------------- Prüfung
RE_ENTRY = re.compile(r"""['"]?([a-z0-9][a-z0-9-]*)['"]?\s*:\s*\{\s*at\s*:""")
RE_POINT = re.compile(r"""['"]?([a-z0-9][a-z0-9-]*)['"]?\s*:\s*\[\s*-?\d""")
RE_EXIT = re.compile(r"""to\s*:\s*['"]([a-z0-9-]+)['"]\s*,\s*entry\s*:\s*['"]([a-z0-9-]+)['"]""")


def code_maps() -> dict[str, dict]:
    """Einstiege, Punkte und Ausgänge der echten Akt-1-Kartendateien (grob per Regex)."""
    out = {}
    for f in sorted(MAPS_DIR.glob('*.ts')):
        t = f.read_text()
        out[f.stem] = {'entries': set(RE_ENTRY.findall(t)), 'points': set(RE_POINT.findall(t)),
                       'exits': RE_EXIT.findall(t)}
    return out


def check(plan: dict) -> list[str]:
    err: list[str] = []
    new = plan['maps']
    old = ACT1['maps']
    code = code_maps()

    def entries_of(m):
        if m in new:
            return set(new[m]['entries'])
        return set(old.get(m, {}).get('entries', [])) | code.get(m, {}).get('entries', set())

    def spots_of(m):
        if m in new:
            return set(new[m]['spots']) | set(new[m]['entries'])
        o = old.get(m, {})
        c = code.get(m, {})
        return set(o.get('spots', {})) | set(o.get('entries', [])) | c.get('points', set()) | c.get('entries', set())

    known = set(new) | set(old) | set(code)
    for m in new:
        if m in old or m in code:
            err.append(f'{m}: neue Karte gibt es schon in Akt 1')

    # Ausgänge neuer Karten
    for m, d in new.items():
        ids = [e['id'] for e in d['exits']]
        if len(ids) != len(set(ids)):
            err.append(f'{m}: doppelte Ausgangs-IDs')
        for e in d['exits']:
            if e['edge'] not in ('n', 's', 'w', 'o', 'tuer'):
                err.append(f'{m}.{e["id"]}: edge {e["edge"]}')
            if e['to'] not in known:
                err.append(f'{m}.{e["id"]}: Zielkarte {e["to"]} unbekannt')
            elif e['entry'] not in entries_of(e['to']):
                err.append(f'{m}.{e["id"]}: Einstieg {e["to"]}/{e["entry"]} fehlt')
        # von-X braucht einen Ausgang von X hierher
        for en in d['entries']:
            if en.startswith('von-'):
                src = en[4:]
                src_exits = ([(e['to'], e['entry']) for e in new[src]['exits']] if src in new else
                             [(e['to'], e['entry']) for e in old.get(src, {}).get('exits', [])] + code.get(src, {}).get('exits', []))
                if (m, en) not in src_exits:
                    err.append(f'{m}: Einstieg {en} ohne Ausgang von {src}')
            elif en not in SPECIAL_ENTRIES:
                err.append(f'{m}: Sonder-Einstieg {en} nicht in SPECIAL_ENTRIES')

    # Akt-1-Ausgänge zu neuen Karten (act1.json und Kartendateien)
    pairs = set()
    for m, d in old.items():
        for e in d.get('exits', []):
            pairs.add((m, e['to'], e['entry']))
    for m, c in code.items():
        for to, en in c['exits']:
            pairs.add((m, to, en))
    for src, to, en in sorted(pairs):
        if to in new and en not in new[to]['entries']:
            err.append(f'Akt-1-Ausgang {src} → {to}/{en}: Einstieg fehlt auf der neuen Karte')
        if to not in known:
            err.append(f'Akt-1-Ausgang {src} → {to}: Karte weder in Akt 1 noch in diesem Plan')

    def ref(where, m, sp):
        if m == 'away':
            return
        if m not in known:
            err.append(f'{where}: Karte {m} unbekannt')
        elif sp and sp not in spots_of(m):
            err.append(f'{where}: Spot {m}:{sp} fehlt')

    for k, v in plan['stations'].items():
        ref(f'station {k}', v['map'], '')
        if v['entry'] not in entries_of(v['map']):
            err.append(f'station {k}: Einstieg {v["entry"]} fehlt')
        if new.get(v['map'], {}).get('station') != k:
            err.append(f'station {k}: Karte {v["map"]} nennt die Station nicht')
    for m, d in new.items():
        if d['station'] and d['station'] not in plan['stations']:
            err.append(f'{m}: Station {d["station"]} nicht in stations')
        if d['district'] not in plan['districts']:
            err.append(f'{m}: Bezirk {d["district"]} fehlt')
        if d['parent'] and d['parent'] not in known:
            err.append(f'{m}: parent {d["parent"]} unbekannt')
    for k, v in plan['shops'].items():
        ref(f'shop {k}', v['map'], v['spot'])
    for k, v in plan['boards'].items():
        ref(f'board {k}', v['map'], v['spot'])
    for npc, lst in plan['npcSchedules'].items():
        if plan['scheduleMode'].get(npc) not in ('neu', 'ersetzt', 'vorangestellt'):
            err.append(f'schedule {npc}: Modus fehlt')
        if plan['scheduleMode'].get(npc) == 'neu' and npc in ACT1['npcSchedules']:
            err.append(f'schedule {npc}: Modus neu, aber act1.json hat die Figur')
        if plan['scheduleMode'].get(npc) in ('ersetzt', 'vorangestellt') and npc not in ACT1['npcSchedules']:
            err.append(f'schedule {npc}: Modus {plan["scheduleMode"][npc]}, aber act1.json kennt die Figur nicht')
        for i, e in enumerate(lst):
            ref(f'schedule {npc}[{i}]', e['map'], e['spot'])
    for k, v in plan['events'].items():
        ref(f'event {k}', v['map'], v['spot'])
    for k, lst in plan['questLocations'].items():
        for r in lst:
            m, _, sp = r.partition(':')
            ref(f'quest {k}', m, sp)
    for k, r in plan['encounterLocations'].items():
        m, _, sp = r.partition(':')
        ref(f'encounter {k}', m, sp)
    for a, st in plan['actStarts'].items():
        if st['entry'] not in entries_of(st['map']):
            err.append(f'actStart {a}: Einstieg {st["map"]}/{st["entry"]} fehlt')
        if not set(st['party']) <= set(st['recruited']):
            err.append(f'actStart {a}: party nicht in recruited')

    # Pakete
    pk = plan['packages']
    if not 6 <= len(pk) <= 8:
        err.append(f'{len(pk)} Pakete (erlaubt 6–8)')
    seen: dict[str, str] = {}
    for k, v in pk.items():
        if len(v['maps']) > 4:
            err.append(f'{k}: mehr als 4 Karten')
        for m in v['maps']:
            if m in seen:
                err.append(f'{m} in {seen[m]} und {k}')
            seen[m] = k
            if m not in new:
                err.append(f'{k}: Karte {m} nicht im Plan')
            elif new[m]['package'] != k:
                err.append(f'{m}: package {new[m]["package"]} ≠ {k}')
    for m in new:
        if m not in seen:
            err.append(f'{m}: in keinem Paket')
    for need in ('chrome-boulevard', 'quantum-campus', 'himmelsgarten', 'pumpwerk-sieben', 'datentunnel', 'staubstrasse',
                 'aussiedlerhof', 'funkturm-ruine', 'glasduenen', 'das-meer', 'rennhalle-9', 'quantum-foyer', 'quantum-labor',
                 'blades-buero', 'server-kern'):
        if need not in new:
            err.append(f'Pflichtkarte {need} fehlt')
    return err


def main() -> int:
    out = PLAN / 'act23.json'
    if '--check' in sys.argv:
        plan = json.loads(out.read_text())
    else:
        plan = build()
        out.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n')
    err = check(plan)
    for e in err:
        print('FEHLER', e)
    n_spots = sum(len(m['spots']) for m in plan['maps'].values())
    print(f"{len(plan['maps'])} Karten, {n_spots} Spots, {len(plan['npcSchedules'])} Tagesabläufe, {len(plan['events'])} Ereignisse, "
          f"{len(plan['questLocations'])} Quests, {len(plan['encounterLocations'])} Begegnungen, {len(plan['packages'])} Pakete – "
          f"{'OK' if not err else f'{len(err)} Fehler'}")
    return 1 if err else 0


if __name__ == '__main__':
    sys.exit(main())
