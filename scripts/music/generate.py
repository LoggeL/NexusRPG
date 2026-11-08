#!/usr/bin/env python3
"""Erzeugt die Spielmusik mit Lyria 3.5 (Gemini API) nach scripts/music/tracks.py. Inkrementell: Stücke mit Rohdatei in
output/music/cache/ werden übersprungen (außer --force). Der Schlüssel kommt nur zur Laufzeit aus dem macOS-Schlüsselbund
(Dienst 'google-api-key') und geht per stdin als curl-Konfiguration an curl – nie in Argumente, Dateien oder Logs.

  python3 scripts/music/generate.py [--only id,id] [--force] [--dry-run]
  danach: python3 scripts/music/build.py

Fehlerbehandlung: 429 mit Tageslimit beendet den Lauf (Rest beim nächsten Lauf); andere 429 warten (retryDelay der API oder
gestaffelt) und versuchen es erneut; 5xx und Zeitüberschreitung werden wiederholt; 400/401/403/404 brechen sofort ab."""
import base64, hashlib, json, pathlib, re, subprocess, sys, time
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from tracks import TRACKS

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / 'output/music/cache'
MODEL = 'lyria-3.5'
URL = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent'
PAUSE = 8            # Sekunden zwischen zwei Stücken
TRIES = 4
EXT = {'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav', 'audio/flac': 'flac', 'audio/ogg': 'ogg',
       'audio/aac': 'aac', 'audio/mp4': 'm4a'}


def key():
    try:
        k = subprocess.check_output(['security', 'find-generic-password', '-s', 'google-api-key', '-w'], text=True,
                                    stderr=subprocess.DEVNULL).strip()
    except subprocess.CalledProcessError:
        sys.exit('Schlüssel "google-api-key" nicht im Schlüsselbund gefunden')
    if not k: sys.exit('Schlüssel "google-api-key" ist leer')
    return k


def scrub(s, k):
    """Sicherheitsnetz: falls die API den Schlüssel je zurückspiegelt, nie ausgeben."""
    return s.replace(k, '***') if k else s


def call(prompt, k):
    cfg = 'header = ' + json.dumps('x-goog-api-key: ' + k) + '\n'
    body = json.dumps({'contents': [{'parts': [{'text': prompt}]}]})
    tmp = CACHE / '.req.json'
    tmp.write_text(body)
    try:
        r = subprocess.run(['curl', '--config', '-', '-sS', '-m', '300', '-H', 'content-type: application/json',
                            '--data-binary', f'@{tmp}', '-w', '\n%{http_code}', URL], input=cfg, text=True, capture_output=True)
    finally:
        tmp.unlink(missing_ok=True)
    out, _, code = r.stdout.rpartition('\n')
    if r.returncode and not out: out = 'curl: ' + r.stderr.strip()
    return int(code or 0), scrub(out, k)


def raw(tid):
    for f in CACHE.glob(f'{tid}.*'):
        if f.suffix[1:] in EXT.values(): return f
    return None


def retry_delay(out):
    m = re.search(r'"retryDelay":\s*"(\d+(?:\.\d+)?)s"', out)
    return float(m.group(1)) if m else None


def main():
    CACHE.mkdir(parents=True, exist_ok=True)
    only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
    force, dry = '--force' in sys.argv, '--dry-run' in sys.argv
    if only and (unknown := only - {t['id'] for t in TRACKS}): sys.exit(f'unbekannte ids: {sorted(unknown)}')
    todo = [t for t in TRACKS if (not only or t['id'] in only) and (force or not raw(t['id']))]
    for t in TRACKS:
        f, meta = raw(t['id']), CACHE / f"{t['id']}.json"
        if f and meta.exists() and json.loads(meta.read_text()).get('promptSha') != hashlib.sha1(t['prompt'].encode()).hexdigest()[:12]:
            print(f"Hinweis: {t['id']}: Prompt geändert seit der Erzeugung (neu mit --only {t['id']} --force)", flush=True)
    print(f'{len(todo)} Stücke zu erzeugen', flush=True)
    if dry or not todo:
        for t in todo: print(' ', t['id'], '|', t['prompt'][:100])
        return
    k = key()
    done = fail = 0
    for n, t in enumerate(todo):
        tid, prompt = t['id'], t['prompt']
        ok = False
        for attempt in range(TRIES):
            t0 = time.time()
            code, out = call(prompt, k)
            dt = time.time() - t0
            if code == 200:
                try: r = json.loads(out)
                except json.JSONDecodeError: print(tid, 'Antwort kein JSON', out[:200], flush=True); time.sleep(20); continue
                cand = r.get('candidates')
                if not cand:
                    print(tid, 'blockiert', json.dumps(r.get('promptFeedback', r))[:300], flush=True); break
                parts = cand[0].get('content', {}).get('parts', [])
                audio = [p['inlineData'] for p in parts if 'inlineData' in p]
                if not audio:
                    print(tid, 'kein Audio, finishReason', cand[0].get('finishReason'), flush=True); time.sleep(15); continue
                mime = audio[0].get('mimeType', 'audio/mpeg')
                for old in CACHE.glob(f'{tid}.*'):
                    if old.suffix != '.json': old.unlink()
                dst = CACHE / f"{tid}.{EXT.get(mime, 'bin')}"
                dst.write_bytes(base64.b64decode(audio[0]['data']))
                text = '\n'.join(p['text'] for p in parts if 'text' in p)
                (CACHE / f'{tid}.json').write_text(json.dumps({
                    'id': tid, 'model': MODEL, 'mimeType': mime, 'prompt': prompt,
                    'promptSha': hashlib.sha1(prompt.encode()).hexdigest()[:12], 'text': text,
                    'finishReason': cand[0].get('finishReason'), 'usage': r.get('usageMetadata'),
                    'created': time.strftime('%Y-%m-%dT%H:%M:%S'), 'seconds': round(dt, 1)}, ensure_ascii=False, indent=1))
                print(f'{tid} ok {mime} {dst.stat().st_size} B in {dt:.0f} s', flush=True)
                done += 1; ok = True
                break
            if code == 429:
                if re.search(r'PerDay|per day|daily', out, re.I):
                    print('Tageslimit erreicht:', out[:400], flush=True)
                    print(f'fertig {done}, Fehler {fail}, offen {len(todo) - n}'); sys.exit(2)
                wait = retry_delay(out) or 60 * (attempt + 1)
                print(f'{tid} HTTP 429 (Rate), warte {wait:.0f} s:', out[:200], flush=True)
                time.sleep(wait + 2); continue
            if code in (400, 401, 403, 404):
                print(f'{tid} HTTP {code} – Abbruch:', out[:600], flush=True)
                print(f'fertig {done}, Fehler {fail + 1}'); sys.exit(3)
            print(f'{tid} HTTP {code} ({dt:.0f} s):', out[:300], flush=True)
            time.sleep(30 * (attempt + 1))
        if not ok: fail += 1
        if n < len(todo) - 1: time.sleep(PAUSE)
    print(f'fertig {done}, Fehler {fail}')
    sys.exit(1 if fail else 0)


main()
