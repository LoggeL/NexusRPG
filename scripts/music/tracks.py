"""Musikkatalog für Nexus – Das RPG (docs/design.md §7).

Jedes Stück ist ein eigenständiges Instrumental. Prompts nennen nur Genre, Tempo, Instrumente und Stimmung – keine echten
Songtitel, Künstler oder Lieder aus dem Theaterstück. Stimmen sind verboten, einzige Ausnahme sind gedämpfte, wortlose
Vocal-Chops im Club (high-voltage).

Felder:
  id      Dateiname (game/public/assets/music/<id>.m4a)
  kind    'loop' (nahtlose Schleife) oder 'stinger' (einmalig, ohne Schleife)
  bpm     Tempo-Vorgabe; build.py nutzt es als Startwert der Takterkennung
  use     wo das Stück läuft (nur Doku)
  loop    (min, max) Länge der Schleife in Sekunden   – nur kind='loop'
  length  (min, max) Länge des Stingers in Sekunden   – nur kind='stinger'
  prompt  Lyria-Prompt (englisch)
"""

NO_VOICE = ' Purely instrumental, no vocals, no singing, no spoken words.'

TRACKS = [
    # ---- Titel und Unterstadt -------------------------------------------------------------------------------------
    dict(id='titel', kind='loop', bpm=100, loop=(70, 110), use='Titelbildschirm, Abspann',
         prompt='A big, anthemic instrumental synthwave theme at 100 BPM. Wide analog polysynth chords, a soaring lead synth melody, '
                'pulsing octave bass, gated reverb drums and shimmering arpeggios. Heroic, warm and hopeful with a playful wink, '
                'evoking a neon city skyline at night.' + NO_VOICE),
    dict(id='unterstadt-tag', kind='loop', bpm=112, loop=(60, 100), use='Unterstadt (Morgen, Tag): Neon-Gasse, Schrottmarkt, Lötgassen, Rohrsiedlung, Bahnhof Mitte, Hafenkante',
         prompt='A driving, upbeat instrumental retro synth track at 112 BPM with a slap funk bass line, bright analog synth stabs, '
                'clavinet-like plucks, a tight drum machine groove and a catchy lead hook. Busy, cheerful street life in a scrappy '
                'futuristic neighbourhood, mischievous and friendly.' + NO_VOICE),
    dict(id='unterstadt-nacht', kind='loop', bpm=80, loop=(60, 100), use='Unterstadt (Abend, Nacht), Rostregen',
         prompt='A moody, atmospheric instrumental synth track at 80 BPM. Slow warm pads, a soft pulsing sub bass, distant filtered '
                'drum machine, gentle rain texture and lonely electric piano notes. Dark neon streets at night in the rain, '
                'melancholic but safe and calm.' + NO_VOICE),
    dict(id='high-voltage', kind='loop', bpm=124, loop=(60, 100), use='Club High Voltage (innen; draußen per Tiefpass gedämpft)',
         prompt='An energetic instrumental electro house club track at 124 BPM. Four-on-the-floor kick, punchy offbeat bass, '
                'bright sawtooth chord stabs, crisp hi-hats and claps, a filtered disco-style groove and a few soft wordless vocal '
                'chops kept low and muffled in the mix. Neon dance floor, joyful party energy. No lyrics, no sung words.'),
    dict(id='dantes-werkstatt', kind='loop', bpm=86, loop=(60, 100), use='Dantes Werkstatt, Crew-Quartier',
         prompt='A cozy instrumental lo-fi funk track at 86 BPM with warm Rhodes electric piano chords, a lazy round bass line, '
                'dusty laid-back drums, a little wah guitar and constant warm vinyl record crackle. A cluttered workshop full of '
                'old records and gadgets, cookies in the oven, relaxed and homely with a smile.' + NO_VOICE),
    dict(id='dante-melancholie', kind='loop', bpm=70, loop=(60, 100), use='Dantes Schallplatte (traurige Szenen, Erinnerungen an Raven)',
         prompt='A tender, sad instrumental ballad at 70 BPM for felt piano and soft analog synth strings, a slow simple melody, '
                'subtle tape warmth and light vinyl crackle. Bittersweet memories, longing for a lost friend, gentle and '
                'heartfelt.' + NO_VOICE),
    dict(id='mittelring', kind='loop', bpm=104, loop=(60, 100), use='Mittelring: Stufenplatz, Glasarkaden, Eisenhof (außen)',
         prompt='A bright, bouncy instrumental city pop track at 104 BPM with glossy electric piano, funky muted guitar, '
                'a groovy bass, light synth brass and a polished drum machine. A busy plaza with TV screens, holograms and '
                'pretzel stands, lively and slightly cheesy like a morning show.' + NO_VOICE),
    # ---- Oberstadt und Quantum ------------------------------------------------------------------------------------
    dict(id='oberstadt', kind='loop', bpm=96, loop=(60, 100), use='Oberstadt: Chrome-Boulevard, Himmelsgarten, Digitech-Areal',
         prompt='A cool, sleek instrumental corporate synth track at 96 BPM. Clean glassy FM bells, smooth pads, a precise '
                'sequenced bass, minimal polished percussion. Spotless chrome towers, luxury and distance, elegant, slightly '
                'cold and quietly ironic.' + NO_VOICE),
    dict(id='quantum-labor', kind='loop', bpm=118, loop=(50, 90), use='Quantum-Campus innen, Quantum-Labor, Server-Kern',
         prompt='A sterile, tense instrumental electronic track at 118 BPM built on fast interlocking synth arpeggios, a cold '
                'pulsing bass, clicking glitch percussion and thin high pads. A spotless high-tech laboratory, nervous suspense, '
                'something is about to go wrong.' + NO_VOICE),
    dict(id='releaseparty', kind='loop', bpm=120, loop=(60, 100), use='Quantum-Releaseparty (Akt 2/3)',
         prompt='A glamorous, glittering instrumental electro pop track at 120 BPM with sparkling synth leads, funky disco bass, '
                'lush string-like synth pads, handclaps and a shiny four-on-the-floor beat. A flashy corporate launch party with '
                'champagne-coloured lights, show-off and over the top.' + NO_VOICE),
    dict(id='ki-nexus', kind='loop', bpm=84, loop=(50, 90), use='Begegnungen mit der KI Nexus, Datentunnel',
         prompt='An eerie, otherworldly instrumental ambient electronic track at 84 BPM with glassy shimmering synth pads that '
                'sound like a synthetic choir, slow crystalline arpeggios, a deep humming drone and digital glitches. An '
                'artificial mind that is curious and a little uncanny, mysterious, not scary.' + NO_VOICE),
    # ---- Unterwelt, Ödnis, Justiz ---------------------------------------------------------------------------------
    dict(id='kanalisation', kind='loop', bpm=70, loop=(50, 90), use='Kanalisation: Kanal-Sammler, Pumpwerk Sieben',
         prompt='A dark instrumental ambient track at 70 BPM with a rhythm made of echoing water drips and metallic pipe knocks, '
                'a low rumbling drone, dub-style delays and murky filtered pads. Damp tunnels under the city, mysterious and '
                'adventurous with a hint of humour.' + NO_VOICE),
    dict(id='oednis', kind='loop', bpm=92, loop=(60, 100), use='Ödnis: Staubstraße, Aussiedlerhof, Funkturm-Ruine, Glasdünen',
         prompt='A dusty instrumental desert synth western track at 92 BPM with twangy reverb guitar, a lonely whistling-like synth '
                'lead, a loping bass, sparse dry drums and warm analog pads. Hot red sand, wind turbines on the horizon, wide open '
                'and adventurous.' + NO_VOICE),
    dict(id='gefaengnis', kind='loop', bpm=76, loop=(50, 90), use='Eisenhof innen: Zellentrakt, Gerichtssaal',
         prompt='A sparse, metallic instrumental track at 76 BPM with clanking percussion, a slow muted bass pulse, cold bell '
                'tones and thin bowed-metal textures. A bleak prison corridor, waiting and boredom, restrained and a little '
                'gloomy.' + NO_VOICE),
    dict(id='flutmauer', kind='loop', bpm=84, loop=(60, 100), use='Küste: Flutmauer, Brackbucht',
         prompt='A wistful instrumental synth track at 84 BPM with airy pads, a soft echoing guitar melody, a gentle bass and '
                'light brushed electronic drums. A huge sea wall with a distant grey ocean, seagulls and wind, longing for '
                'something beyond the horizon.' + NO_VOICE),
    # ---- Spannung und Kampf ---------------------------------------------------------------------------------------
    dict(id='schleichen', kind='loop', bpm=90, loop=(50, 90), use='Schleichaufträge, Einbruch',
         prompt='A tense, muted instrumental stealth track at 90 BPM with a ticking hi-hat pulse, plucked muted synth bass, '
                'soft staccato strings, low pads and occasional quiet stingers. Sneaking through shadows, careful and suspenseful '
                'with a playful heist feel.' + NO_VOICE),
    dict(id='kampf', kind='loop', bpm=140, loop=(50, 90), use='Rundenkampf',
         prompt='A driving instrumental darksynth battle track at 140 BPM with a gritty distorted synth bass, punchy drums, fast '
                'arpeggios and an urgent lead melody. Cartoonish street fight, energetic and exciting, not grim.' + NO_VOICE),
    dict(id='boss', kind='loop', bpm=150, loop=(50, 90), use='Bosskämpfe',
         prompt='An epic, aggressive instrumental darksynth boss battle track at 150 BPM with massive distorted synth bass, '
                'pounding drums, dramatic orchestral-style synth brass and choir-like pads, and a heroic lead melody. A big '
                'showdown, intense and triumphant.' + NO_VOICE),
    # ---- Finale ---------------------------------------------------------------------------------------------------
    dict(id='meer', kind='loop', bpm=90, loop=(60, 110), use='Das Meer (Epilog), Finale',
         prompt='A warm, hopeful instrumental sunset synth track at 90 BPM with golden analog pads, a gentle clean guitar, '
                'a soft melodic lead, relaxed drums and the feeling of ocean waves. Arriving at the sea at last with friends, '
                'joyful, peaceful and emotional.' + NO_VOICE),
    # ---- Stinger --------------------------------------------------------------------------------------------------
    dict(id='herz-ereignis', kind='stinger', bpm=76, length=(8, 14), use='Herz-Ereignis beginnt',
         prompt='A short, warm and emotional instrumental cue at 76 BPM: a gentle electric piano and soft synth strings play a '
                'tender rising phrase that resolves on a sweet held major chord. Heartfelt friendship.' + NO_VOICE),
    dict(id='nachrichten-jingle', kind='stinger', bpm=120, length=(5, 8), use='Nachrichten von NX-1 (Stadt-TV)',
         prompt='A short instrumental TV news jingle at 120 BPM: punchy synth brass fanfare, ticking sequencer, a timpani-like '
                'hit and a confident final chord. Breaking news from a futuristic TV channel, a bit pompous.' + NO_VOICE),
    dict(id='sieg-stinger', kind='stinger', bpm=130, length=(3, 5), use='Kampf gewonnen',
         prompt='A very short triumphant instrumental victory fanfare at 130 BPM with bright synth brass, a quick arpeggio run '
                'and a final big major chord. Cheerful, cartoonish win.' + NO_VOICE),
    dict(id='quest-stinger', kind='stinger', bpm=120, length=(2, 4), use='Quest abgeschlossen',
         prompt='A very short instrumental reward jingle at 120 BPM: sparkling synth bells play a quick rising motif ending on '
                'a bright chord. Quest complete, satisfying.' + NO_VOICE),
]

BY_ID = {t['id']: t for t in TRACKS}
assert len(BY_ID) == len(TRACKS), 'doppelte id'
