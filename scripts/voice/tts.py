#!/usr/bin/env python3
"""Hintergrundstimmen für Nexus (design.md §7) mit gemini-3.8-flash-lite-tts.

Quelle:   design/assets/voices.json
Roh:      output/voice/raw/<snippet>-<n>.wav   (24 kHz, 16 bit, mono)
Gebaut:   game/public/assets/voices/<snippet>-<n>.m4a  (AAC mono 64 kbit/s, Stille getrimmt, -20 LUFS, TP -2 dB)
Manifest: design/assets/voices.manifest.json und game/public/assets/voices/manifest.json

Aufruf:   python3 scripts/voice/tts.py all            alle fehlenden Zeilen erzeugen und bauen
          python3 scripts/voice/tts.py hv-001 kanal-  einzelne IDs oder ID-Präfixe
          --force   Rohdateien neu erzeugen          --build-only  nur aus vorhandenen Rohdateien bauen
          --check   Ausreißer (Dauer vs. Textlänge) einmal neu erzeugen

Der API-Schlüssel kommt nur zur Laufzeit aus dem macOS-Schlüsselbund (Dienst 'google-api-key') und geht
per stdin als curl-Konfiguration an curl – nie in Argumente, Dateien oder Logs.
"""
import base64, json, pathlib, random, re, subprocess, sys, tempfile, threading, time, wave
from concurrent.futures import ThreadPoolExecutor

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / 'design/assets/voices.json'
RAW = ROOT / 'output/voice/raw'
OUT = ROOT / 'game/public/assets/voices'
MANIFEST = ROOT / 'design/assets/voices.manifest.json'
MODEL = 'gemini-3.8-flash-lite-tts'
URL = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent'
PARALLEL = 4
TRIES = 6
LOCK = threading.Lock()


def log(*a):
    with LOCK: print(*a, flush=True)


def key():
    try:
        k = subprocess.check_output(['security', 'find-generic-password', '-s', 'google-api-key', '-w'], text=True,
                                    stderr=subprocess.DEVNULL).strip()
    except subprocess.CalledProcessError:
        sys.exit('Schlüssel "google-api-key" nicht im Schlüsselbund gefunden')
    if not k: sys.exit('Schlüssel "google-api-key" ist leer')
    return k


def scrub(s, k):
    return s.replace(k, '***') if k else s


def prompt_for(style, text):
    return ("## DIRECTOR'S NOTES\nLanguage: German (Germany), natural street speech.\n"
            f'Character and delivery: {style}.\nPerform only the transcript below, nothing else.\n\n'
            f'## TRANSCRIPT\n{text}')


def call(body, k):
    cfg = 'header = ' + json.dumps('x-goog-api-key: ' + k) + '\n'
    with tempfile.NamedTemporaryFile('w', suffix='.json', dir=RAW, delete=False) as f:
        f.write(json.dumps(body)); tmp = pathlib.Path(f.name)
    try:
        r = subprocess.run(['curl', '--config', '-', '-sS', '-m', '120', '-H', 'content-type: application/json',
                            '--data-binary', f'@{tmp}', '-w', '\n%{http_code}', URL], input=cfg, text=True,
                           capture_output=True)
    finally:
        tmp.unlink(missing_ok=True)
    out, _, code = r.stdout.rpartition('\n')
    if r.returncode and not out: out = 'curl: ' + r.stderr.strip()
    return int(code or 0), scrub(out, k)


def synth(name, voice, style, text, k):
    body = {'contents': [{'parts': [{'text': prompt_for(style, text)}]}],
            'generationConfig': {'responseModalities': ['AUDIO'],
                                 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}}}
    for attempt in range(TRIES):
        code, out = call(body, k)
        if code == 200:
            try:
                data = json.loads(out)
                part = next(p for p in data['candidates'][0]['content']['parts'] if 'inlineData' in p)['inlineData']
                pcm = base64.b64decode(part['data'])
                m = re.search(r'rate=(\d+)', part.get('mimeType', ''))
                rate = int(m.group(1)) if m else 24000
            except Exception as e:
                log(f'  {name}: unerwartete Antwort ({e}): {out[:300]}')
                code = 0
            else:
                dst = RAW / f'{name}.wav'
                with wave.open(str(dst), 'wb') as w:
                    w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(pcm)
                return True
        if code in (400, 403, 404):
            log(f'  {name}: HTTP {code}: {out[:400]}'); return False
        m = re.search(r'"retryDelay":\s*"(\d+(?:\.\d+)?)s"', out)
        delay = float(m.group(1)) if m else min(60, 2 ** attempt * 3) + random.random() * 2
        if delay > 300:
            q = re.search(r'"quotaId":\s*"([^"]+)"', out)
            log(f'  {name}: Kontingent erschöpft ({q.group(1) if q else "?"}), erneut in {delay / 3600:.1f} h – übersprungen')
            return False
        log(f'  {name}: HTTP {code}, neuer Versuch in {delay:.0f} s')
        time.sleep(delay)
    return False


def duration_ms(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)],
                       capture_output=True, text=True)
    try: return round(float(r.stdout.strip()) * 1000)
    except ValueError: return 0


def build(name):
    src, dst = RAW / f'{name}.wav', OUT / f'{name}.m4a'
    trim = ('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,'
            'areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,')
    af = trim + 'loudnorm=I=-20:TP=-2:LRA=11,aresample=24000'
    r = subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(src), '-af', af, '-ac', '1', '-c:a', 'aac',
                        '-b:a', '64k', '-movflags', '+faststart', str(dst)], capture_output=True, text=True)
    if r.returncode: log(f'  {name}: ffmpeg-Fehler {r.stderr.strip()[:300]}'); return 0
    return duration_ms(dst)


def plausible(text, ms):
    """Grobe Sprechdauer: ~13–14 Zeichen pro Sekunde, großzügige Spanne."""
    n = len(text)
    return n / 30 * 1000 <= ms <= n / 5 * 1000 + 1500


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    force, build_only, check = '--force' in sys.argv, '--build-only' in sys.argv, '--check' in sys.argv
    if not args: sys.exit(__doc__)
    cfg = json.loads(SRC.read_text())
    voices, snippets = cfg['voices'], cfg['snippets']
    pick = snippets if 'all' in args else [s for s in snippets if any(s['id'] == a or s['id'].startswith(a) for a in args)]
    jobs = []
    for s in pick:
        for i, line in enumerate(s['lines'], 1):
            sp = line['speaker']
            if sp not in voices: sys.exit(f'{s["id"]}: unbekannter Sprecher {sp}')
            if len(line['text']) > 90: log(f'WARNUNG {s["id"]}-{i}: Zeile > 90 Zeichen')
            jobs.append((f'{s["id"]}-{i}', sp, line['text']))
    RAW.mkdir(parents=True, exist_ok=True); OUT.mkdir(parents=True, exist_ok=True)
    k = None if build_only else key()
    failed = []

    def gen(job, again=False):
        name, sp, text = job
        if build_only and not (RAW / f'{name}.wav').exists(): failed.append(name); return
        if not build_only and (force or again or not (RAW / f'{name}.wav').exists()):
            if not synth(name, voices[sp]['voice'], voices[sp]['style'], text, k):
                failed.append(name); return
        ms = build(name)
        if not ms: failed.append(name); return
        if check and not again and not plausible(text, ms):
            log(f'  {name}: Dauer {ms} ms unplausibel für {len(text)} Zeichen, neu')
            return gen(job, True)
        log(f'{name} {ms} ms')

    with ThreadPoolExecutor(PARALLEL) as ex:
        list(ex.map(gen, jobs))

    # Manifest aus allen vorhandenen gebauten Dateien
    old = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    entries = {e['file']: e for e in old.get('lines', [])}
    outliers = []
    for s in snippets:
        for i, line in enumerate(s['lines'], 1):
            name = f'{s["id"]}-{i}'; f = OUT / f'{name}.m4a'
            if not f.exists(): continue
            rel = f'assets/voices/{name}.m4a'
            if name in {j[0] for j in jobs} or rel not in entries or entries[rel].get('text') != line['text']:
                ms = duration_ms(f)
            else:
                ms = entries[rel]['durationMs']
            if not plausible(line['text'], ms): outliers.append(name)
            entries[rel] = {'file': rel, 'snippet': s['id'], 'line': i, 'speaker': line['speaker'],
                            'voice': voices[line['speaker']]['voice'], 'durationMs': ms, 'text': line['text']}
    order = {f'assets/voices/{s["id"]}-{i}.m4a': n for n, (s, i) in
             enumerate((s, i) for s in snippets for i in range(1, len(s['lines']) + 1))}
    lines = sorted((e for e in entries.values() if e['file'] in order), key=lambda e: order[e['file']])
    built = {e['snippet'] for e in lines}
    meta = {s['id']: {k: s[k] for k in ('district', 'zones', 'when') if k in s}
            for s in snippets if s['id'] in built
            and all(f'assets/voices/{s["id"]}-{i}.m4a' in entries for i in range(1, len(s['lines']) + 1))}
    man = {'model': MODEL, 'format': 'm4a aac mono 64k, -20 LUFS, TP -2 dB', 'snippets': meta, 'lines': lines}
    MANIFEST.write_text(json.dumps(man, ensure_ascii=False, indent=1) + '\n')
    (OUT / 'manifest.json').write_text(json.dumps(man, ensure_ascii=False) + '\n')
    total = sum(f.stat().st_size for f in OUT.glob('*.m4a'))
    print(f'\nFertig: {len(lines)} Zeilen im Manifest, {total / 1024:.0f} KiB, '
          f'Ausfälle: {len(failed)} {sorted(failed)}, unplausibel: {outliers}')


if __name__ == '__main__':
    main()
