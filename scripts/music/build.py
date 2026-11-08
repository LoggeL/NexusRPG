#!/usr/bin/env python3
"""Baut die Spielmusik aus output/music/cache/<id>.mp3 nach docs/design.md §7.

Schleifen (kind='loop'): Takterkennung (Onset-Hüllkurve, Autokorrelation mit der Katalog-BPM als Startwert, Takt-Raster),
Suche eines Schleifenpaars (Start s, Ende e = s + n Takte) mit größter Ähnlichkeit der Umgebung (taktsynchrone
Log-Bandenergien und Chroma, je zwei Takte vor und nach der Naht), Feinabgleich auf Frame- und Sample-Ebene
(Kreuzkorrelation) und kurzer Crossfade. Die Datei ist genau ein Schleifendurchlauf: Sie wiederholt sich als Ganzes nahtlos
(loopStart = 0, loopEnd = Dauer). Die Lautheit wird auf drei aneinandergehängten Durchläufen bestimmt und angewandt und der
mittlere Durchlauf übernommen, damit auch Limiter- und Filterzustände an der Naht stetig sind.
Stinger (kind='stinger'): Stille am Anfang weg, Ende auf eine Schlagzeit im Längenfenster, kurze Ausblende, keine Schleife.

Lautheit zweistufig (loudnorm messen, dann linear anwenden) auf −16 LUFS, True Peak −1,5 dBTP (bei Encoder-Überschwingern
stufenweise alimiter davor), AAC-LC 96 kbit/s, 44,1 kHz Stereo, +faststart.
Ausgabe game/public/assets/music/<id>.m4a, manifest.json; Bericht output/music/build.json; Hörseite output/music/review.html.
Inkrementell: unveränderte Stücke werden übersprungen.

  python3 scripts/music/build.py [--only id,id] [--force] [--analyze id]"""
import hashlib, html, json, pathlib, re, subprocess, sys
import numpy as np
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from tracks import TRACKS, BY_ID

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / 'output/music/cache'
OUT = ROOT / 'game/public/assets/music'
REPORT = ROOT / 'output/music/build.json'
REVIEW = ROOT / 'output/music/review.html'
SR, LUFS, TP, LRA, KBPS = 44100, -16.0, -1.5, 11, 96
NFFT, HOP = 2048, 512
XFADE = 0.08            # Crossfade an der Naht (s), bei schlecht passender Wellenform länger:
XFADES = (XFADE, 0.25, 0.5)
CTX_BEATS = 8           # Vergleichsfenster je Seite der Naht (Schläge)
BUDGET_MB = 30
RECIPE = f'v8/{SR}/{LUFS}/{TP}/{LRA}/{KBPS}/{NFFT}/{HOP}/{XFADES}/{CTX_BEATS}'


# ---------------------------------------------------------------- ffmpeg-Helfer
def run(args, inp=None):
    r = subprocess.run(args, input=inp, capture_output=True)
    if r.returncode: raise SystemExit(f'Fehler: {" ".join(map(str, args[:6]))} …\n{r.stderr.decode(errors="replace")[-800:]}')
    return r


def ff(*a, inp=None):
    return run(['ffmpeg', '-hide_banner', '-nostdin', '-y', *map(str, a)], inp)


RAW_IN = ['-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', 'pipe:0']


def decode(f):
    out = ff('-loglevel', 'error', '-i', f, '-map', '0:a:0', '-f', 'f32le', '-ac', '2', '-ar', SR, 'pipe:1').stdout
    return np.frombuffer(out, np.float32).reshape(-1, 2).copy()


def encoder():
    # Der eingebaute ffmpeg-Encoder schreibt eine exakte Edit-Liste (Vorlauf und Auffüllung werden beim Dekodieren entfernt),
    # aac_at (AudioToolbox) füllt auf ganze 1024er-Blöcke auf – das ergäbe eine Lücke an der Schleifennaht.
    return 'aac'


def measure(f):
    log = ff('-loglevel', 'info', '-i', f, '-af', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-').stderr.decode()
    tail = log[log.rindex('Summary:'):]
    return float(re.search(r'I:\s+(-?[\d.]+) LUFS', tail).group(1)), float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', tail).group(1))


def ffprobe_duration(f):
    return float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)]).stdout.decode().strip())


# ---------------------------------------------------------------- Analyse
def mono(x):
    return x.mean(axis=1)


def bands():
    f = np.fft.rfftfreq(NFFT, 1 / SR)
    edges = np.geomspace(30, 16000, 49)
    B = np.zeros((len(f), 48), np.float32)
    for i in range(48): B[(f >= edges[i]) & (f < edges[i + 1]), i] = 1
    for i in range(48):
        if not B[:, i].any(): B[np.argmin(abs(f - (edges[i] + edges[i + 1]) / 2)), i] = 1
    C = np.zeros((len(f), 12), np.float32)
    ok = (f > 55) & (f < 4200)
    pc = np.round(12 * np.log2(f[ok] / 440)).astype(int) % 12
    C[np.where(ok)[0], pc] = 1
    low = (f > 30) & (f < 160)
    return B, C, low


def features(m):
    """Log-Bandenergien (48), Chroma (12), Onset-Hüllkurve, Bass-Onset, RMS (dB) je Frame."""
    B, C, low = bands()
    win = np.hanning(NFFT).astype(np.float32)
    frames = np.lib.stride_tricks.sliding_window_view(m, NFFT)[::HOP]
    LB, CH, LOWE = [], [], []
    for i in range(0, len(frames), 2048):
        spec = np.abs(np.fft.rfft(frames[i:i + 2048] * win, axis=1)).astype(np.float32)
        p = spec ** 2
        LB.append(np.log10(p @ B + 1e-8)); CH.append(spec @ C); LOWE.append(np.log10(p[:, low].sum(1) + 1e-8))
    lb, ch, lowe = np.concatenate(LB), np.concatenate(CH), np.concatenate(LOWE)
    ch /= np.linalg.norm(ch, axis=1, keepdims=True) + 1e-9
    onset = np.r_[0, np.maximum(0, np.diff(lb, axis=0)).sum(1)]
    bass = np.r_[0, np.maximum(0, np.diff(lowe))]
    rms = 10 * np.log10((frames[:, ::4] ** 2).mean(1) + 1e-10) if len(frames) else np.zeros(0)
    return lb, ch, onset, bass, rms


def tempo(onset, prior):
    """Schlagdauer (Frames) und Phase: Autokorrelation nahe der Katalog-BPM, dann Feinsuche über das Raster."""
    o = onset - np.convolve(onset, np.ones(64) / 64, 'same')
    o = np.maximum(o, 0)
    ac = np.correlate(o, o, 'full')[len(o) - 1:]
    ac /= ac[0] + 1e-9
    fps = SR / HOP
    def acv(lag): return np.interp(lag, np.arange(len(ac)), ac)
    best = None
    for bpm in np.arange(55, 200, 0.05):
        lag = 60 * fps / bpm
        w = np.exp(-0.5 * (np.log2(bpm / prior) / 0.3) ** 2)
        sc = w * (acv(lag) + 0.5 * acv(2 * lag) + 0.5 * acv(4 * lag))
        if best is None or sc > best[0]: best = (sc, bpm)
    bpm0 = best[1]
    # Feinsuche: Tempo ± 0,6 % und Phase, Summe der Onsets auf dem Raster
    n = len(o); top = None
    for bpm in np.linspace(bpm0 * 0.994, bpm0 * 1.006, 61):
        P = 60 * fps / bpm
        k = np.arange(int((n - 1) / P))
        for ph in np.arange(0, P, 0.5):
            idx = np.round(ph + k * P).astype(int)
            idx = idx[idx < n]
            sc = o[idx].sum()
            if top is None or sc > top[0]: top = (sc, bpm, ph)
    return 60 * fps / top[1], top[2], top[1]


def norm_feats(lb, ch):
    z = (lb - lb.mean(0)) / (lb.std(0) + 1e-6)
    return z, ch


def beat_sync(z, ch, beats):
    """Mittelwert der Features je Schlag."""
    Zb, Cb = [], []
    for a, b in zip(beats[:-1], beats[1:]):
        a, b = int(round(a)), max(int(round(a)) + 1, int(round(b)))
        Zb.append(z[a:b].mean(0)); c = ch[a:b].mean(0); Cb.append(c / (np.linalg.norm(c) + 1e-9))
    return np.array(Zb), np.array(Cb)


def dist(Za, Zb_, Ca, Cb_):
    return ((Za - Zb_) ** 2).mean() + 2.0 * (1 - (Ca * Cb_).sum(-1)).mean()


def usable(rms):
    """Bereich ohne Intro-Stille und ohne Ausklang: RMS (1 s geglättet) über −8 dB relativ zum Median der Mitte."""
    k = int(SR / HOP)
    sm = np.convolve(rms, np.ones(k) / k, 'same')
    n = len(sm)
    ref = np.median(sm[n // 5: 4 * n // 5])
    good = np.where(sm > ref - 8)[0]
    return good[0], good[-1]


def find_loop(x, t, verbose=False):
    m = mono(x)
    lb, ch, onset, bass, rms = features(m)
    P, ph, bpm = tempo(onset, t['bpm'])
    fps = SR / HOP
    beats = np.arange(ph, len(onset) - 1, P)
    # Taktanfang: Phase mod 4 mit dem stärksten Bass-Onset
    bo = [bass[np.round(beats[j::4]).astype(int)].sum() for j in range(4)]
    down = int(np.argmax(bo))
    z, chn = norm_feats(lb, ch)
    Zb, Cb = beat_sync(z, chn, beats)
    a, b = usable(rms)
    lmin, lmax = t['loop']
    bar = 4
    nb = len(Zb)
    cands = []
    first = int(np.ceil(a / P))
    last_end = int(b / P) - CTX_BEATS - 1
    s_hi = first + int(0.45 * (last_end - first))
    for sb in range(max(first, CTX_BEATS), s_hi):
        if (sb - down) % bar: continue
        for nbar in range(int(np.ceil(lmin * bpm / 60 / bar)), int(lmax * bpm / 60 / bar) + 1):
            eb = sb + nbar * bar
            if eb > last_end or eb + CTX_BEATS > nb: break
            d = dist(Zb[sb - CTX_BEATS:sb + CTX_BEATS], Zb[eb - CTX_BEATS:eb + CTX_BEATS], Cb[sb - CTX_BEATS:sb + CTX_BEATS], Cb[eb - CTX_BEATS:eb + CTX_BEATS])
            d2 = dist(Zb[sb - 2:sb + 2], Zb[eb - 2:eb + 2], Cb[sb - 2:sb + 2], Cb[eb - 2:eb + 2])
            score = d + 0.5 * d2 - 0.04 * (nbar % 4 == 0) - 0.02 * (nbar % 2 == 0) - 0.05 * (nbar * bar / (lmax * bpm / 60))
            cands.append((score, sb, eb, d, d2))
    if not cands: raise SystemExit(f"{t['id']}: kein Schleifenkandidat (Bereich {a / fps:.1f}–{b / fps:.1f} s, Schlag {P / fps:.3f} s)")
    cands.sort()
    if verbose:
        print(f"bpm {bpm:.2f} (Vorgabe {t['bpm']}), Takt-Phase {down}, Bereich {a / fps:.1f}–{b / fps:.1f} s, {len(cands)} Kandidaten")
        for c in cands[:8]: print(f'  score {c[0]:.3f}  s {beats[c[1]] / fps:6.2f}  e {beats[c[2]] / fps:6.2f}  L {(beats[c[2]] - beats[c[1]]) / fps:6.2f}  d {c[3]:.3f} d2 {c[4]:.3f}')
    # Die Länge ist exakt n Takte im gemessenen Tempo (Tempo ist auf ~0,01 BPM genau): der Rhythmus läuft über die Naht durch.
    _, sb, eb, d, d2 = cands[0]
    sf = beats[sb]
    ef = sf + (eb - sb) * P
    fd = d2
    # Sample-Ebene: Kreuzkorrelation der Wellenform um die Naht (± 11 ms, gleicht Phasenlage und Rest-Tempofehler aus)
    s = int(round(sf * HOP)) + NFFT // 2
    e0 = int(round(ef * HOP)) + NFFT // 2
    N, R = 4096, HOP
    seg = m[s - N // 2:s + N // 2]
    win = m[e0 - N // 2 - R:e0 + N // 2 + R]
    cc = np.correlate(win, seg, 'valid')
    en = np.sqrt(np.convolve(win ** 2, np.ones(N), 'valid')) * np.sqrt((seg ** 2).sum()) + 1e-9
    j = int(np.argmax(cc / en))
    e = e0 - R + j
    r = float((cc / en)[j])
    # Crossfade nicht auf den Einsatz legen: beide Punkte gemeinsam (Länge bleibt) bis zu einem halben Schlag vorziehen,
    # dorthin, wo die beiden Überblendstücke am besten übereinstimmen; der Einsatz kommt dann ungeblendet aus x[s:].
    # Länge: kurz (XFADE), wenn die Wellenformen dort übereinstimmen; sonst länger (Flächen, Pads) mit konstanter Leistung.
    for xfs in XFADES:
        xf = int(xfs * SR)
        best_sh = None
        for sh in range(xf + 128, int(P / 2 * HOP) + xf, 128):
            a_, b_ = m[s - sh:s - sh + xf], m[e - sh:e - sh + xf]
            mis = float(((a_ - b_) ** 2).sum() / ((a_ ** 2).sum() + (b_ ** 2).sum() + 1e-9))
            if best_sh is None or mis < best_sh[0]: best_sh = (mis, sh)
        mis, sh = best_sh
        if mis < 0.4: break
    return dict(s=s - sh, e=e - sh, xf=xf, bpm=bpm, beat=P / fps, corr=r, dist=float(d), fine=float(fd), mismatch=mis, shift=sh / SR,
                usable=(a / fps, b / fps))


def bake_loop(x, s, e, xf):
    body = x[s:e].copy()
    a, b = x[s:s + xf], x[e:e + xf]
    r = float((mono(a) * mono(b)).sum() / (np.linalg.norm(mono(a)) * np.linalg.norm(mono(b)) + 1e-9))
    tt = np.linspace(0, 1, xf, dtype=np.float32)[:, None]
    if r > 0.5: fi, fo = tt, 1 - tt                                      # korreliert: konstante Amplitude
    else: fi, fo = np.sin(tt * np.pi / 2), np.cos(tt * np.pi / 2)        # unkorreliert: konstante Leistung
    body[:xf] = a * fi + b * fo
    return body, r


# ---------------------------------------------------------------- Stinger
def cut_stinger(x, t):
    m = mono(x)
    lo, hi = t['length']
    k = 441
    env = np.sqrt(np.convolve(m ** 2, np.ones(k) / k, 'same'))
    pk = env.max()
    st = max(0, int(np.argmax(env > pk * 0.03)) - int(0.005 * SR))
    tail = np.where(env > pk * 0.01)[0][-1]
    natural = (tail - st) / SR
    if natural <= hi:
        end = min(len(m), tail + int(0.25 * SR)); fade = min(0.3, 0.15 * (end - st) / SR)
        info = 'natürliches Ende'
    else:
        lb, ch, onset, bass, rms = features(m[st:])
        P, ph, bpm = tempo(onset, t['bpm'])
        fps = SR / HOP
        best = None
        for i in range(1, 200):
            c = i * P                      # Schläge ab dem ersten Einsatz
            sec = c / fps
            if sec > hi: break
            if sec < lo: continue
            ci = int(round(c))
            sc = onset[ci:ci + 3].max() * (1.5 if i % 4 == 0 else 1.0) * (1 + 0.1 * sec / hi)
            if best is None or sc > best[0]: best = (sc, sec)
        sec = best[1] if best else hi
        end = st + int(sec * SR); fade = min(1.0, max(0.4, 0.25 * sec))
        info = f'Schnitt auf Schlag ({bpm:.0f} BPM)'
    y = x[st:end].copy()
    n_in, n_out = int(0.004 * SR), int(fade * SR)
    y[:n_in] *= np.linspace(0, 1, n_in, dtype=np.float32)[:, None]
    y[-n_out:] *= (np.cos(np.linspace(0, np.pi / 2, n_out, dtype=np.float32)) ** 2)[:, None]
    return y, dict(start=st / SR, end=end / SR, fade=fade, info=info, natural=natural)


# ---------------------------------------------------------------- Lautheit und Kodierung
def loudness(sig, offset, length, limit=None):
    """Zweistufige Lautheitsnormierung von sig (loudnorm messen, dann linear anwenden), Rückgabe out[offset:offset+length]
    mit per Kreuzkorrelation ermitteltem Versatz (Resampler-/Limiter-Latenz)."""
    raw = sig.astype(np.float32).tobytes()
    norm = f'loudnorm=I={LUFS}:TP={TP}:LRA={LRA}'
    log = ff('-loglevel', 'info', *RAW_IN, '-af', norm + ':print_format=json', '-f', 'null', '-', inp=raw).stderr.decode()
    mm = json.loads(log[log.rindex('{'):log.rindex('}') + 1])
    af = (f"{norm}:measured_I={mm['input_i']}:measured_TP={mm['input_tp']}:measured_LRA={mm['input_lra']}"
          f":measured_thresh={mm['input_thresh']}:offset={mm['target_offset']}:linear=true:print_format=json,aresample={SR}")
    if limit is not None: af += f',alimiter=limit={10 ** (limit / 20):.4f}:attack=4:release=60:level=false'
    r = ff('-loglevel', 'info', *RAW_IN, '-af', af, '-f', 'f32le', '-ac', '2', '-ar', SR, 'pipe:1', inp=raw)
    log2 = r.stderr.decode()
    ntype = re.findall(r'"normalization_type"\s*:\s*"(\w+)"', log2)
    out = np.frombuffer(r.stdout, np.float32).reshape(-1, 2)
    D = 4410
    M = min(length, SR)
    a = mono(sig[offset:offset + M])
    b = mono(out[max(0, offset - D):offset + M + D])
    cc = np.correlate(b, a, 'valid')
    lag = int(np.argmax(cc)) - (offset - max(0, offset - D))
    o = offset + lag
    if o < 0 or o + length > len(out): raise SystemExit(f'Versatz {lag} außerhalb')
    return out[o:o + length].copy(), dict(lag=lag, type=ntype[-1] if ntype else '?', input_i=float(mm['input_i']))


def encode(y, dst, enc):
    args = ['-loglevel', 'error', *RAW_IN, '-map_metadata', '-1', '-c:a', enc, '-b:a', f'{KBPS}k']
    args += ['-aac_at_mode', 'cvbr'] if enc == 'aac_at' else ['-profile:a', 'aac_low']
    ff(*args, '-movflags', '+faststart', '-f', 'mp4', dst, inp=y.astype(np.float32).tobytes())


# ---------------------------------------------------------------- Prüfung der Naht
def jump(sig, pos, W=2048):
    """Pegel- (dB) und Spektralsprung zwischen [pos-W, pos) und [pos, pos+W)."""
    B, _, _ = bands()
    win = np.hanning(W).astype(np.float32)
    def spec(seg):
        f = np.abs(np.fft.rfft(seg * win, n=NFFT)) ** 2
        return np.log10(f @ B + 1e-8), 10 * np.log10((seg ** 2).mean() + 1e-10)
    a, ra = spec(mono(sig[pos - W:pos])); b, rb = spec(mono(sig[pos:pos + W]))
    return abs(ra - rb), float(np.sqrt(((a - b) ** 2).mean()))


def seam_check(y, src, s, e, k, xf):
    """Prüft die dekodierte Schleife zirkulär an zwei Stellen: am Dateiwechsel (Ende → Anfang, entspricht Quelle s+k) und an
    der Überblendung (Datei L−k, Quelle e → s). Pegel- und Spektralsprung dürfen nicht größer sein als das 90. Perzentil der
    Sprünge im Stück oder 125 % des natürlichen Sprungs an derselben Stelle der Quelle; die Flankensteilheit (Klick) nicht
    größer als das 99,9. Perzentil bzw. 125 % der Quelle."""
    W, L = 2048, len(y)
    def at(sig, pos, n):  # zirkulärer Ausschnitt
        return np.take(sig, np.arange(pos - n, pos + n), axis=0, mode='wrap')
    rng = np.random.default_rng(1)
    ref = np.array([jump(y, p) for p in rng.integers(W, L - W, 300)])
    p90 = np.percentile(ref, 90, axis=0)
    d999 = np.percentile(np.abs(np.diff(mono(y))), 99.9) + 1e-9
    s999 = np.percentile(np.abs(np.diff(mono(src))), 99.9) + 1e-9
    def steep(sig, pos, ref): return float(np.abs(np.diff(mono(at(sig, pos, 32)))).max() / ref)
    res, ok = {}, True
    for name, pos, nats, offs in (('wrap', 0, [s + k], (0,)), ('xfade', L - k, [e, s], (0, xf // 2, xf))):
        worst = None
        for o in offs:   # an jeder Prüfstelle gegen den natürlichen Sprung an derselben Stelle der Quelle (e+o bzw. s+o)
            sj = np.array(jump(at(y, pos + o, W), W))
            nat = np.max([jump(src, q + o) for q in nats], axis=0)
            lim = np.maximum(p90, 1.25 * nat)
            click = steep(y, pos + o, d999)
            climit = max(1.0, 1.25 * max(steep(src, q + o, s999) for q in nats))
            ratio = max(sj[0] / lim[0], sj[1] / lim[1], click / climit)
            if worst is None or ratio > worst[0]: worst = (ratio, o, sj, lim, click, climit)
        ratio, o, sj, lim, click, climit = worst
        good = bool(ratio <= 1.0)
        ok &= good
        res[name] = dict(ok=good, at=o, rmsJumpDb=round(float(sj[0]), 2), rmsLimDb=round(float(lim[0]), 2), specJump=round(float(sj[1]), 3),
                         specLim=round(float(lim[1]), 3), click=round(click, 2), clickLim=round(climit, 2))
    return dict(ok=ok, **res)


def rotation(body, beat):
    """Dateianfang innerhalb des ersten Schlags auf eine fast stille Stelle (beide Kanäle nahe null, flach) legen: Der
    AAC-Encoder startet aus Stille, ein Sprung am Dateianfang würde sonst als Klick an der Naht hörbar."""
    n = max(1, int(beat * SR))
    mtr = np.abs(body[:n]).sum(1) + 4 * np.abs(body[1:n + 1] - body[:n]).sum(1)
    return int(np.argmin(mtr))


# ---------------------------------------------------------------- Hauptablauf
def src_of(tid):
    for ext in ('mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'):
        f = CACHE / f'{tid}.{ext}'
        if f.exists(): return f
    return None


def build_one(t, src, dst, enc):
    x = decode(src)
    rep = {'src': src.name, 'srcDuration': round(len(x) / SR, 2)}
    if t['kind'] == 'loop':
        lp = find_loop(x, t)
        body, r = bake_loop(x, lp['s'], lp['e'], lp['xf'])
        k = rotation(body, lp['beat'])
        body = np.roll(body, -k, axis=0)
        L = len(body)
        sig, off = np.concatenate([body, body, body]), L
        rep.update(srcStart=round(lp['s'] / SR, 3), srcEnd=round(lp['e'] / SR, 3), bpm=round(lp['bpm'], 2), beat=round(lp['beat'], 4),
                   bars=round((lp['e'] - lp['s']) / SR / lp['beat'] / 4, 2), waveCorr=round(lp['corr'], 3), xfade=round(lp['xf'] / SR, 3), xfadeCorr=round(r, 3),
                   ctxDist=round(lp['dist'], 3), xfadeMismatch=round(lp['mismatch'], 3), shift=round(lp['shift'], 3), rotate=round(k / SR, 4),
                   fileStartSrc=round((lp['s'] + k) / SR, 3), usable=[round(v, 1) for v in lp['usable']])
    else:
        body, info = cut_stinger(x, t)
        L = len(body)
        pad = np.zeros((SR // 2, 2), np.float32)
        sig, off = np.concatenate([pad, body, pad]), len(pad)
        rep.update({k: (round(v, 3) if isinstance(v, float) else v) for k, v in info.items()})
    limit = None
    for attempt in range(5):
        y, ln = loudness(sig, off, L, limit)
        encode(y, dst, enc)
        lufs, peak = measure(dst)
        if abs(lufs - LUFS) > 0.3:         # Restabweichung nach dem Encoder als feste Verstärkung ausgleichen
            y = y * np.float32(10 ** ((LUFS - lufs) / 20))
            encode(y, dst, enc)
            lufs, peak = measure(dst)
        if peak <= TP: break               # §7: True Peak höchstens −1,5 dBTP (ebur128, auf 0,1 dB gerundet)
        limit = (TP - 0.5 if limit is None else limit) - max(0.3, peak - TP)
    rep.update(lufs=lufs, tp=peak, limiter=limit, loudnorm=ln)
    if t['kind'] == 'loop':
        dec = decode(dst)
        rep['decodedSamples'], rep['samples'] = len(dec), L
        rep['seam'] = seam_check(dec, x, lp['s'], lp['e'], k, lp['xf'])
    return rep


def review(manifest, report):
    rows = []
    for m in manifest['tracks']:
        t, r = BY_ID[m['id']], report.get(m['id'], {})
        seam = r.get('seam', {})
        loopinfo = (f"Schleife {m['loopStart']:.2f}–{m['loopEnd']:.2f} s · Quelle {r.get('srcStart', 0):.2f}–{r.get('srcEnd', 0):.2f} s "
                    f"· {r.get('bpm', 0):.1f} BPM · {r.get('bars', 0):g} Takte · Naht {'ok' if seam.get('ok') else 'prüfen'} "
                    + ' · '.join(f"{n}: Pegel {seam[n]['rmsJumpDb']}/{seam[n]['rmsLimDb']} dB, Spektrum {seam[n]['specJump']}/{seam[n]['specLim']}, "
                                 f"Klick {seam[n]['click']}/{seam[n]['clickLim']}" for n in ('wrap', 'xfade') if n in seam)
                    if m['loop'] else f"Stinger · Quelle {r.get('start', 0):.2f}–{r.get('end', 0):.2f} s · {r.get('info', '')}")
        seam_btn = '<button onclick="seam(this)">Naht anhören (4 s vor Ende)</button>' if m['loop'] else ''
        rows.append(f"""<section><h2>{html.escape(m['id'])} <small>{html.escape(t['use'])}</small></h2>
<audio controls preload="none" {'loop' if m['loop'] else ''} src="../../game/public/assets/music/{m['file']}"></audio> {seam_btn}
<p class="meta">{m['duration']:.2f} s · {m['lufs']:.1f} LUFS · {r.get('tp', 0):.1f} dBTP · {m['bytes'] / 1024:.0f} KiB · {loopinfo}</p>
<p class="prompt">{html.escape(t['prompt'])}</p></section>""")
    total = sum(m['bytes'] for m in manifest['tracks']) / 1048576
    return f"""<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nexus Musik-Abnahme</title><style>
:root{{--bg:#120c1e;--fg:#eee8ff;--mut:#a99cc8;--acc:#ff4fd8;--card:#1d1430}}
body{{background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,sans-serif;margin:0 auto;max-width:900px;padding:16px}}
h1{{color:var(--acc)}} section{{background:var(--card);border-radius:10px;padding:12px 16px;margin:12px 0}}
h2{{margin:0 0 8px;font-size:18px}} small{{color:var(--mut);font-weight:400;font-size:13px}} audio{{width:100%;max-width:560px;vertical-align:middle}}
.meta{{color:var(--mut);font-size:13px;margin:6px 0}} .prompt{{font-size:13px;opacity:.8;margin:4px 0}} button{{margin:4px 0}}
</style></head><body><h1>Nexus – Musik-Abnahme</h1>
<p>{len(manifest['tracks'])} Stücke, {total:.1f} MB. Schleifen sind ein ganzer Durchlauf und wiederholen sich als Ganzes
(<code>loop</code>). „Naht anhören“ springt 4 s vor das Ende; die Naht liegt beim Übergang zurück auf 0. Hinweis: Das
<code>&lt;audio loop&gt;</code>-Element mancher Browser setzt beim Zurückspringen kurz aus; im Spiel läuft die Schleife über WebAudio.
Alle Stücke tragen das SynthID-Wasserzeichen von Lyria.</p>
{''.join(rows)}
<script>function seam(b){{const a=b.previousElementSibling;const go=()=>{{a.currentTime=Math.max(0,a.duration-4);a.play()}};
if(isNaN(a.duration)){{a.preload='auto';a.addEventListener('loadedmetadata',go,{{once:true}});a.load()}}else go()}}</script>
</body></html>"""


def main():
    force = '--force' in sys.argv
    only = set(sys.argv[sys.argv.index('--only') + 1].split(',')) if '--only' in sys.argv else None
    if '--analyze' in sys.argv:
        t = BY_ID[sys.argv[sys.argv.index('--analyze') + 1]]
        find_loop(decode(src_of(t['id'])), t, verbose=True); return
    OUT.mkdir(parents=True, exist_ok=True)
    enc = encoder()
    report = json.loads(REPORT.read_text()) if REPORT.exists() else {}
    meta, problems = [], []
    for t in TRACKS:
        tid = t['id']
        src, dst = src_of(tid), OUT / f'{tid}.m4a'
        if not src:
            problems.append(f'{tid}: keine Rohdatei'); continue
        params = json.dumps({k: v for k, v in t.items() if k not in ('use',)}, sort_keys=True)
        sig = hashlib.sha1(f'{src.stat().st_size}/{src.stat().st_mtime_ns}/{RECIPE}/{enc}/{params}'.encode()).hexdigest()[:12]
        if (only is None or tid in only) and (force or not dst.exists() or report.get(tid, {}).get('sig') != sig):
            print('baue', tid, flush=True)
            report[tid] = build_one(t, src, dst, enc) | {'sig': sig}
        r = report.get(tid)
        if not r or not dst.exists():
            problems.append(f'{tid}: nicht gebaut'); continue
        dur = ffprobe_duration(dst)
        exact = r.get('samples', 0) / SR if t['kind'] == 'loop' else dur
        # samples: exakte Länge (dekodiert, 44,1 kHz) – Sekundenwerte sind gerundet; im Spiel ganzen Puffer schleifen
        # (AudioBufferSourceNode.loop = true ohne loopStart/loopEnd) statt loopEnd aus den gerundeten Sekunden zu setzen.
        meta.append({'id': tid, 'file': dst.name, 'kind': t['kind'], 'loop': t['kind'] == 'loop', 'duration': round(exact, 6),
                     'samples': r['samples'] if t['kind'] == 'loop' else None,
                     'loopStart': 0.0 if t['kind'] == 'loop' else None, 'loopEnd': round(exact, 6) if t['kind'] == 'loop' else None,
                     'lufs': r['lufs'], 'bpm': r.get('bpm', t['bpm']), 'bytes': dst.stat().st_size})
        if abs(r['lufs'] - LUFS) > 1.0: problems.append(f"{tid}: {r['lufs']} LUFS")
        if r['tp'] > TP: problems.append(f"{tid}: True Peak {r['tp']} dBTP")
        if t['kind'] == 'loop':
            lo, hi = t['loop']
            if not lo - 1 <= exact <= hi + 1: problems.append(f'{tid}: Schleifenlänge {exact:.1f} s außerhalb {lo}–{hi}')
            if r['decodedSamples'] != r['samples']: problems.append(f"{tid}: dekodiert {r['decodedSamples']} statt {r['samples']} Samples")
            if not r['seam']['ok']: problems.append(f"{tid}: Naht auffällig {r['seam']}")
            if abs(r['bars'] - round(r['bars'])) > 0.02: problems.append(f"{tid}: Schleife {r['bars']} Takte, keine ganze Zahl von Takten")
            if r.get('loudnorm', {}).get('type') not in ('linear', '?'): problems.append(f"{tid}: loudnorm {r['loudnorm']['type']}")
        else:
            lo, hi = t['length']
            if not lo - 0.3 <= dur <= hi + 0.3: problems.append(f'{tid}: Stingerlänge {dur:.2f} s außerhalb {lo}–{hi}')
    keep = {m['id'] for m in meta}
    if only is None:
        for f in OUT.glob('*.m4a'):
            if f.stem not in keep: f.unlink(); report.pop(f.stem, None); print('entfällt', f.stem)
    v = hashlib.sha1(json.dumps(meta, sort_keys=True).encode()).hexdigest()[:10]
    manifest = {'v': v, 'format': f'AAC-LC {KBPS} kbit/s {SR} Hz stereo, {LUFS} LUFS, TP {TP} dBTP',
                'note': 'loop: Datei ist ein ganzer Schleifendurchlauf (loopStart 0, loopEnd = Dauer = samples/44100), nahtlos wiederholbar; im Spiel den ganzen Puffer schleifen.',
                'tracks': meta}
    (OUT / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n')
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=1, default=float))
    REVIEW.write_text(review(manifest, report))
    total = sum(m['bytes'] for m in meta) / 1048576
    print(f'{"id":20} {"Dauer":>7} {"Naht":>5} {"LUFS":>6} {"dBTP":>5} {"KiB":>6}')
    for m in meta:
        r = report[m['id']]
        seam = ('ok' if r['seam']['ok'] else 'PRÜF') if m['loop'] else '–'
        print(f"{m['id']:20} {m['duration']:7.2f} {seam:>5} {m['lufs']:6.1f} {r['tp']:5.1f} {m['bytes'] / 1024:6.0f}")
    print(f'{len(meta)} Stücke, {total:.2f} MB (Budget {BUDGET_MB} MB), Encoder {enc}, Manifest v={v}')
    if total > BUDGET_MB: problems.append(f'über Budget: {total:.1f} MB')
    for p in problems: print('PROBLEM', p)
    sys.exit(1 if problems else 0)


if __name__ == '__main__':
    main()
