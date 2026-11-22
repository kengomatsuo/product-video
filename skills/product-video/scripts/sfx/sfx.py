"""Finds and judges sound effects for a film moment, for an agent that cannot hear.

    PY=~/.cache/audio-tools/venv/bin/python       # made by setup.sh, beside this file
    $PY -I sfx.py find "a thin glass pane cracks then shatters, close, dry, no reverb" \
        --query "glass shatter" --query "glass break" --out picks/shatter --caption 5
    $PY -I sfx.py describe some.wav other.mp3 --caption
    $PY -I sfx.py rank "a soft fingertip tap on glass" folder/*.wav
    $PY -I sfx.py batch moments.json --out picks        # every moment of a film, models loaded once

`find` collects candidates whose licence allows a commercial film with no credit (Openverse: Freesound and Wikimedia
sounds marked CC0 or public domain; Mixkit sound effects; any folder given with --dir), cuts each recording into its
separate sound events, ranks every event against the description with LAION-CLAP, and writes for the best ones what
was heard: AudioSet labels from a second model that never saw the description (AST), measured numbers (length,
attack, decay, spectrum), and the three nearest sentences people wrote after listening to real sounds (AudioCaps).
--caption N adds one generated sentence from Qwen2-Audio for the best N; it holds 7 GB of memory, so it is for a Mac
with nothing else running (with other sessions working it produced one word in 50 s). Results: <out>/ranked.md to
read, <out>/ranked.json, and <out>/seg/NN-<key>.wav, each cut from 5 ms before its onset, 48 kHz stereo, peak -3 dBFS.

How to read a row
  fit    cosine between the description and the sound in CLAP space, comparable only between candidates of one
         description. 0.45 and up is a clear match, under 0.25 is not it.
  z      how the description scores for this sound against 60 other everyday sound descriptions (VOCAB). Under 1.5
         the model would call the sound something else: `CLAP nearest` says what.
  avoid  cosine against the --avoid text (default: cartoon, synthetic, music, speech); the rank subtracts half of it.
  AST    what the second model calls it. "Glass 0.39, Shatter 0.40" beside a top fit for "glass shatters" is two
         models agreeing; "Sound effect 0.07" alone means the tagger has no opinion, which is common under 0.2 s.
  listeners described ...   human sentences nearest the sound, with their cosine. From 0.45 up they describe it;
         under 0.40 no listener's sentence fits and the line is noise (a card riffle came back as "ducks quacking").
  -20 dB in, -40 dB in   seconds from the peak to 20 and 40 dB under it. A dry close sound falls 40 dB in under 0.3 s;
         a room or a long tail takes longer. Measured, so trust it over any caption.
  bands  share of energy under 150 Hz / 150 Hz-2 kHz / 2-6 kHz / over 6 kHz. Pick, among the clear matches, the take
         that lives where the film's track is thin (`mix.py bands <track>` prints that): it is then heard at a level
         far under the music. A take in a band the track fills has to be loud to be heard at all.
The models are hints, the numbers are measurements, and neither is the owner's ear: send him the kept sounds.
"""
import argparse, hashlib, html, json, os, re, subprocess, sys, urllib.parse, urllib.request
import numpy as np

HOME = os.path.expanduser(os.environ.get('SFX_HOME', '~/.cache/audio-tools'))
CLAP_DIR = os.environ.get('CLAP_MODEL', f'{HOME}/models/clap-htsat-unfused')
AST_DIR = os.environ.get('AST_MODEL', f'{HOME}/models/ast-audioset')
QWEN_DIR = os.environ.get('QWEN_AUDIO_MODEL', f'{HOME}/models/qwen2-audio-4bit')
CACHE = f'{HOME}/sfx-cache'
SR = 48000
UA = 'sfx-pick/1.0'
BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'

# Everyday sounds the description is scored against: `z` is the description's place among these for one sound.
VOCAB = [
    'a dog barking', 'a door slamming shut', 'a car engine', 'rain falling', 'a person speaking', 'music playing',
    'a bell ringing', 'footsteps on a floor', 'water pouring', 'a bird singing', 'wind blowing', 'applause',
    'a keyboard being typed on', 'a single mouse click', 'a camera shutter', 'paper rustling', 'a zipper',
    'a glass breaking', 'glasses clinking', 'a wooden knock', 'a metal clang', 'a coin dropping', 'a light switch',
    'a whoosh of air', 'a swish through the air', 'an explosion', 'a low boom', 'a gunshot', 'a balloon popping',
    'a bubble pop', 'a cartoon boing', 'a synthesizer note', 'an electronic beep', 'a notification chime',
    'a drum hit', 'a snare drum', 'a kick drum', 'a cymbal', 'a guitar strum', 'a piano note', 'static noise',
    'a crowd talking', 'a baby crying', 'laughter', 'a cough', 'a clock ticking', 'a stapler', 'scissors cutting',
    'a pen writing on paper', 'a book closing', 'a drawer closing', 'a plastic click', 'a finger tapping on a table',
    'a finger tapping on glass', 'ice cracking', 'a twig snapping', 'a cork popping', 'a spray can', 'a match striking',
    'a heavy object dropped on the floor',
]
AVOID = 'a cartoon sound effect, a synthesizer, music, a voice speaking'
QWEN_PROMPT = ('You are describing one sound effect for a film sound editor who cannot hear it. In one sentence of at most '
               '35 words say what makes the sound, the material, whether it is close or far, dry or with room echo, '
               'bright or dull, and how it starts and ends. Do not mention music unless there is music.')


# ---------- fetching

def http(url, ua=UA, timeout=60):
    return urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': ua}), timeout=timeout).read()


def cached(url, ua=UA, ext=None):
    """Downloads a file once into CACHE/audio (a folder that holds nothing but downloads) and returns its path."""
    os.makedirs(f'{CACHE}/audio', exist_ok=True)
    ext = ext or (os.path.splitext(urllib.parse.urlparse(url).path)[1] or '.bin')
    p = f"{CACHE}/audio/{hashlib.sha1(url.encode()).hexdigest()[:16]}{ext}"
    if not (os.path.exists(p) and os.path.getsize(p) > 500):
        open(p, 'wb').write(http(url, ua))
    return p


def cached_json(url):
    os.makedirs(f'{CACHE}/search', exist_ok=True)
    p = f"{CACHE}/search/{hashlib.sha1(url.encode()).hexdigest()[:16]}.json"
    if not os.path.exists(p):
        open(p, 'wb').write(http(url))
    return json.load(open(p))


def openverse(query, pages=2, max_dur=30, allow_by=False):
    """Openverse audio search, no key. CC0 and public-domain sounds only unless allow_by adds CC BY (credit needed)."""
    lic = 'cc0,pdm' + (',by' if allow_by else '')
    out = []
    for page in range(1, pages + 1):
        q = urllib.parse.urlencode({'q': query, 'license': lic, 'page_size': 20, 'page': page})
        try:
            d = cached_json(f'https://api.openverse.org/v1/audio/?{q}')
        except Exception as e:
            print('openverse:', query, 'page', page, e, file=sys.stderr)
            break
        for r in d.get('results', []):
            dur = (r.get('duration') or 0) / 1000
            if not r.get('url') or dur > max_dur or r.get('source') == 'jamendo' or (not dur and (r.get('filesize') or 0) > 600000):
                continue
            out.append(dict(key=f"{r['source']}-{r['foreign_landing_url'].rstrip('/').split('/')[-1][:40]}",
                            title=r.get('title') or '', url=r['url'], page=r['foreign_landing_url'],
                            source=f"Openverse ({r['source']})", creator=r.get('creator') or '',
                            licence=f"{r['license'].upper()} {r.get('license_version') or ''}".strip(),
                            licence_url=r.get('license_url') or '', credit=r.get('attribution') if r['license'] == 'by' else None,
                            tags=[t['name'] for t in (r.get('tags') or [])][:8], listed_dur=dur))
        if page >= (d.get('page_count') or 1):
            break
    return out


def mixkit(query):
    """Mixkit sound effects from the category page named like the query ("glass", "keyboard", "click")."""
    out = []
    slug = re.sub(r'[^a-z0-9]+', '-', query.lower()).strip('-')
    try:
        h = http(f'https://mixkit.co/free-sound-effects/{slug}/', BROWSER_UA).decode('utf-8', 'replace')
    except Exception as e:
        print('mixkit:', slug, e, file=sys.stderr)
        return out
    for card in h.split('class="item-grid__item"')[1:]:
        i = re.search(r'item-id-value="(\d+)"', card)
        t = re.search(r'item-grid-card__title[^>]*>\s*(?:<a[^>]*>)?\s*([^<]+)', card)
        if not i:
            continue
        n = i.group(1)
        out.append(dict(key=f'mixkit-{n}', title=html.unescape(t.group(1).strip()) if t else '',
                        url=f'https://assets.mixkit.co/active_storage/sfx/{n}/{n}-preview.mp3',
                        page=f'https://mixkit.co/free-sound-effects/{slug}/', source='Mixkit', creator='Mixkit',
                        licence='Mixkit Sound Effects Free License', licence_url='https://mixkit.co/license/#sfxFree',
                        credit=None, tags=[]))
    return out


def local(folder):
    out = []
    for f in sorted(os.listdir(folder)):
        if f.lower().endswith(('.wav', '.mp3', '.ogg', '.flac', '.m4a', '.aiff', '.aif')):
            out.append(dict(key='local-' + re.sub(r'\W+', '-', os.path.splitext(f)[0])[:40], title=f, file=os.path.join(folder, f),
                            page=os.path.abspath(folder), source='local folder', creator='', licence='as recorded for that folder',
                            licence_url='', credit=None, tags=[]))
    return out


# ---------- signal

def decode(path, sr=SR, ch=1):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(sr), '-f', 'f32le', '-'],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    return x.reshape(-1, ch) if ch > 1 else x


def envelope(x, hop=0.002, win=0.008):
    """RMS envelope every 2 ms."""
    h, w = int(hop * SR), int(win * SR)
    c = np.concatenate([[0.0], np.cumsum(x.astype(np.float64) ** 2)])
    idx = np.arange(0, max(1, len(x) - w), h)
    return np.sqrt((c[idx + w] - c[idx]) / w + 1e-12), hop


def events(x, max_len=6.0, max_events=6):
    """Cuts a recording into its separate sounds: a start is where the level climbs out of a 60 ms quiet stretch; the
    sound ends when it has stayed 35 dB under its own peak for 120 ms, or the next one starts. Returns (start, end)
    in seconds, loudest first. The whole recording (silence trimmed, at most 10 s) is always the first entry."""
    e, hop = envelope(x)
    if len(e) < 10:
        return [(0.0, len(x) / SR)]
    db = 20 * np.log10(e + 1e-9)
    top = db.max()
    floor = max(top - 50, np.percentile(db, 10) + 6)
    loud = db > max(floor, top - 30)
    nz = np.flatnonzero(db > top - 45)
    whole = (max(0.0, nz[0] * hop - 0.005), min(len(x) / SR, nz[-1] * hop + 0.05, nz[0] * hop + 10.0))
    q = int(0.06 / hop)
    starts = [i for i in np.flatnonzero(loud[1:] & ~loud[:-1]) + 1 if not loud[max(0, i - q):i].any()]
    if loud[0]:
        starts = [0] + starts
    out = []
    for n, s in enumerate(starts):
        nxt = starts[n + 1] if n + 1 < len(starts) else len(db)
        seg = db[s:min(nxt, s + int(max_len / hop))]
        pk = seg.max()
        under = seg < pk - 35
        end = len(seg)
        run = int(0.12 / hop)
        ip = int(seg.argmax())
        for i in range(ip, len(seg) - run):
            if under[i:i + run].all():
                end = i + int(0.03 / hop)
                break
        out.append((pk, max(0.0, s * hop - 0.005), min(len(x) / SR, (s + end) * hop)))
    out.sort(key=lambda t: -t[0])
    segs = [whole] + [(a, b) for _, a, b in out[:max_events] if b - a >= 0.02 and not (abs(a - whole[0]) < 0.02 and abs(b - whole[1]) < 0.05)]
    return segs


def measure(x):
    """Numbers an agent can trust without hearing: length, where the peak is, attack, decay, spectrum, level."""
    e, hop = envelope(x, win=0.01)
    db = 20 * np.log10(e + 1e-9)
    ip = int(db.argmax())
    pk = db[ip]
    first = int(np.argmax(db > pk - 20))

    def fall(d):
        below = np.flatnonzero(db[ip:] < pk - d)
        return round(float(below[0] * hop), 3) if len(below) else None
    n = 1 << int(np.ceil(np.log2(max(len(x), 2048))))
    spec = np.abs(np.fft.rfft(x, n)) ** 2                       # the whole event, its first milliseconds included
    f = np.fft.rfftfreq(n, 1 / SR)
    tot = spec.sum() + 1e-20
    share = lambda lo, hi: round(float(spec[(f >= lo) & (f < hi)].sum() / tot), 2)
    loud = db > pk - 30
    q = int(0.06 / hop)
    onsets = [i for i in np.flatnonzero(loud[1:] & ~loud[:-1]) + 1 if not loud[max(0, i - q):i].any()] + ([0] if loud[0] else [])
    return dict(dur=round(len(x) / SR, 3), peak_at=round(ip * hop, 3), attack_ms=round((ip - first) * hop * 1000, 1),
                t20=fall(20), t40=fall(40), centroid_hz=int((f * spec).sum() / tot),
                bands=[share(0, 150), share(150, 2000), share(2000, 6000), share(6000, SR)],
                peak_dbfs=round(float(20 * np.log10(np.abs(x).max() + 1e-9)), 1),
                rms_dbfs=round(float(10 * np.log10((x ** 2).mean() + 1e-12)), 1), hits=len(onsets))


# ---------- models

class Clap:
    def __init__(self):
        import torch
        from transformers import ClapModel, ClapProcessor
        self.t = torch
        self.dev = 'mps' if torch.backends.mps.is_available() else 'cpu'
        self.m = ClapModel.from_pretrained(CLAP_DIR).to(self.dev).eval()
        self.p = ClapProcessor.from_pretrained(CLAP_DIR)
        self.caps = human_captions(self)

    def _unit(self, e):
        e = e.pooler_output if hasattr(e, 'pooler_output') else e
        return self.t.nn.functional.normalize(e, dim=-1).cpu().numpy()

    def audio(self, segs, bs=16):
        out = []
        with self.t.no_grad():
            for i in range(0, len(segs), bs):
                f = self.p(audio=[s[:SR * 10] for s in segs[i:i + bs]], sampling_rate=SR, return_tensors='pt')
                out.append(self._unit(self.m.get_audio_features(**{k: v.to(self.dev) for k, v in f.items()})))
        return np.concatenate(out)

    def text(self, prompts):
        with self.t.no_grad():
            f = self.p(text=prompts, return_tensors='pt', padding=True)
            return self._unit(self.m.get_text_features(**{k: v.to(self.dev) for k, v in f.items()}))


CAPS_URL = 'https://raw.githubusercontent.com/cdjkim/audiocaps/master/dataset/train.csv'


def human_captions(clap):
    """Sentences people wrote after listening to real sounds (AudioCaps train set, MIT licence, about 45,000 distinct
    ones), embedded once with CLAP. The nearest of them to a sound are a caption no model had to generate: what
    listeners said about sounds like this one. Returns (texts, unit vectors)."""
    p = f'{CACHE}/audiocaps-clap.npz'
    if not os.path.exists(p):
        import csv, io
        os.makedirs(CACHE, exist_ok=True)
        rows = csv.DictReader(io.StringIO(http(CAPS_URL).decode('utf-8')))
        caps = sorted({re.sub(r'\s+', ' ', r['caption']).strip() for r in rows if r.get('caption')})
        print(f'embedding {len(caps)} human captions once', flush=True)
        V = np.concatenate([clap.text(caps[i:i + 256]) for i in range(0, len(caps), 256)]).astype(np.float16)
        np.savez(p, caps=np.array(caps), V=V)
    d = np.load(p)
    return d['caps'], d['V'].astype(np.float32)


def like(E, caps, V, k=3):
    """The k nearest human captions to one sound vector, skipping near-identical wordings."""
    out, seen = [], []
    for i in np.argsort(-(V @ E))[:40]:
        w = set(str(caps[i]).lower().split())
        if any(len(w & s) / max(1, len(w | s)) > 0.6 for s in seen):
            continue
        seen.append(w); out.append(f"{caps[i]} ({float(V[i] @ E):.2f})")
        if len(out) == k:
            break
    return out


class Ast:
    """AudioSet tagger: 527 labels a second model gives the sound, with probabilities."""
    def __init__(self):
        import torch
        from transformers import ASTFeatureExtractor, ASTForAudioClassification
        self.t = torch
        self.fx = ASTFeatureExtractor.from_pretrained(AST_DIR)
        self.m = ASTForAudioClassification.from_pretrained(AST_DIR).eval()

    def labels(self, x48, k=4):
        idx = np.round(np.arange(0, len(x48), 3)).astype(int)        # 48 kHz to 16 kHz after a simple low-pass
        y = np.convolve(x48, np.ones(3) / 3, mode='same')[idx]
        if len(y) < 16000:                                            # a tap alone gives the tagger nothing: say it twice
            y = np.concatenate([y, np.zeros(4000, dtype=y.dtype), y, np.zeros(max(0, 16000 - 2 * len(y) - 4000), dtype=y.dtype)])
        with self.t.no_grad():
            p = self.t.sigmoid(self.m(**self.fx(y, sampling_rate=16000, return_tensors='pt')).logits)[0].numpy()
        return [f"{self.m.config.id2label[int(i)]} {p[i]:.2f}" for i in np.argsort(-p)[:k]]


def captions(paths):
    """One sentence per file from Qwen2-Audio (MLX 4-bit, about 8 GB of memory while it runs)."""
    from mlx_audio.stt import load
    m = load(QWEN_DIR)
    out = []
    for p in paths:
        r = m.generate(p, prompt=QWEN_PROMPT, max_tokens=90, temperature=0.0)
        out.append(re.sub(r'\s+', ' ', r.text).strip())
        print('  caption', os.path.basename(p), '|', out[-1], flush=True)
    return out


def qwen_wav(x, path):
    """Qwen reads 16 kHz files; a sound under 1.5 s is given twice with a gap so the model has something to hold."""
    y = x / (np.abs(x).max() + 1e-9) * 0.7
    if len(y) < 1.5 * SR:
        y = np.concatenate([np.zeros(SR // 5), y, np.zeros(SR // 2), y, np.zeros(SR // 5)])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-i', '-', '-ar', '16000', path],
                   input=y.astype(np.float32).tobytes(), check=True)


# ---------- commands

def write_seg(path, stereo, a, b):
    s = stereo[int(a * SR):int(b * SR)].astype(np.float64).copy()
    n = min(len(s), int(0.03 * SR))
    s[-n:] *= np.linspace(1, 0, n)[:, None]
    s[:int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))[:, None]
    s *= 10 ** (-3 / 20) / (np.abs(s).max() + 1e-9)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', '-c:a', 'pcm_s24le', path],
                   input=s.astype(np.float32).tobytes(), check=True)


def score_all(clap, desc, avoid, items):
    """Adds to every item its events and, per event, fit, z, avoid and what else it sounds like."""
    alts = [d.strip() for d in desc.split('|') if d.strip()]
    tv = clap.text(alts).mean(0)
    tv /= np.linalg.norm(tv)
    V = clap.text(VOCAB)
    av = clap.text([avoid])[0] if avoid else None
    rows = []

    def fetch(it):
        try:
            return it.get('file') or cached(it['url'], BROWSER_UA if 'mixkit' in it.get('url', '') else UA, '.mp3')
        except Exception as e:
            print('skip', it['key'], e, file=sys.stderr)
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(16) as ex:
        paths = list(ex.map(fetch, items))
    for it, path in zip(items, paths):
        if not path:
            continue
        try:
            x = decode(path)
        except Exception as e:
            print('skip', it['key'], e, file=sys.stderr)
            continue
        if len(x) < 0.02 * SR or np.abs(x).max() < 1e-4:
            continue
        segs = events(x)
        E = clap.audio([x[int(a * SR):int(b * SR)] for a, b in segs])
        fit = E @ tv
        vs = E @ V.T
        for j, (a, b) in enumerate(segs):
            z = float((fit[j] - vs[j].mean()) / (vs[j].std() + 1e-9))
            avd = float(E[j] @ av) if av is not None else 0.0
            rows.append(dict(it, vec=E[j], path=path, start=round(a, 3), end=round(b, 3), whole=j == 0, fit=round(float(fit[j]), 3), z=round(z, 2),
                             avoid=round(avd, 3), score=round(float(fit[j]) - 0.5 * max(0.0, avd), 3),
                             heard_as=[f"{VOCAB[i]} {vs[j][i]:.2f}" for i in np.argsort(-vs[j])[:3]]))
    rows.sort(key=lambda r: -r['score'])
    return rows


def collect(a):
    items, seen = [], set()
    for q in a.query or [a.description.split(',')[0]]:
        got = []
        if 'openverse' in a.sources:
            got += openverse(q, a.pages, a.max_source_dur, a.allow_by)
        if 'mixkit' in a.sources:
            for w in dict.fromkeys([q] + q.split()):
                got += mixkit(w)
        for it in got:
            if it['key'] not in seen:
                seen.add(it['key']); items.append(dict(it, query=q))
    for d in a.dir or []:
        items += local(d)
    return items


def find_one(a, clap, ast):
    """Everything but the captions for one description. Returns (kept rows, candidates, events scored)."""
    os.makedirs(f'{a.out}/seg', exist_ok=True)
    items = collect(a)
    print(f'{a.description}: {len(items)} candidates', flush=True)
    rows = score_all(clap, a.description, a.avoid, items)
    lo, hi = a.dur
    keep, per = [], {}
    for r in rows:
        d = r['end'] - r['start']
        if not (lo <= d <= hi) or per.get(r['key'], 0) >= a.per_source:
            continue
        per[r['key']] = per.get(r['key'], 0) + 1
        keep.append(r)
        if len(keep) == a.top:
            break
    for n, r in enumerate(keep, 1):
        st = decode(r['path'], ch=2)
        mono = st.mean(1)[int(r['start'] * SR):int(r['end'] * SR)]
        r['n'] = n
        r['seg'] = f"{a.out}/seg/{n:02d}-{r['key']}.wav"
        write_seg(r['seg'], st, r['start'], r['end'])
        r['measure'] = measure(mono)
        r['ast'] = ast.labels(mono)
        r['like'] = like(r['vec'], *clap.caps)
    for r in rows:
        r.pop('vec', None)
    return keep, len(items), len(rows)


def caption_rows(jobs):
    """jobs: [(out_dir, rows to caption)]. One load of Qwen2-Audio for all of them."""
    ps, rs = [], []
    for out, rows in jobs:
        tmp = f'{out}/seg/.q'
        os.makedirs(tmp, exist_ok=True)
        for r in rows:
            p = f"{tmp}/{r['n']:02d}.wav"
            qwen_wav(decode(r['seg']), p); ps.append(p); rs.append(r)
    if ps:
        for r, c in zip(rs, captions(ps)):
            r['caption'] = c
        for p in ps:
            os.remove(p)
    for out, _ in jobs:
        if os.path.isdir(f'{out}/seg/.q'):
            os.rmdir(f'{out}/seg/.q')


def finish(a, keep, n_items, n_events):
    json.dump(dict(description=a.description, queries=a.query, avoid=a.avoid, candidates=n_items, events=n_events, top=keep),
              open(f'{a.out}/ranked.json', 'w'), ensure_ascii=False, indent=1)
    report(a, keep, n_items, n_events)


def find(a):
    clap, ast = Clap(), Ast()
    keep, ni, ne = find_one(a, clap, ast)
    del clap, ast
    if a.caption:
        caption_rows([(a.out, keep[:a.caption])])
    finish(a, keep, ni, ne)


def batch(b):
    """Many moments in one go: a JSON list of {name, description, query: [...], dur: [min, max], top, caption, ...}, each
    key the same as a `find` option. Models load once; results land in <out>/<name>/."""
    moments = json.load(open(b.moments))
    clap, ast = Clap(), Ast()
    done = []
    for m in moments:
        if b.only and m['name'] not in b.only:
            continue
        a = argparse.Namespace(description=m['description'], query=m.get('query'), out=f"{b.out}/{m['name']}", sources=m.get('sources', ['openverse', 'mixkit']),
                               dir=m.get('dir'), top=m.get('top', 6), caption=m.get('caption', b.caption), dur=m.get('dur', [0.02, 6.0]),
                               max_source_dur=m.get('max_source_dur', 30), pages=m.get('pages', 2), avoid=m.get('avoid', AVOID),
                               allow_by=m.get('allow_by', False), per_source=m.get('per_source', 1))
        done.append((a,) + find_one(a, clap, ast))
        finish(*done[-1])                           # each moment is on disk as soon as it is ranked
    del clap, ast
    jobs = [(a.out, keep[:a.caption]) for a, keep, _, _ in done if a.caption]
    if jobs:
        caption_rows(jobs)
        for a, keep, ni, ne in done:
            finish(a, keep, ni, ne)


def line(r):
    m = r['measure']
    return (f"fit {r['fit']:.2f} z {r['z']:+.1f} avoid {r['avoid']:.2f} | {m['dur']:.2f} s, peak at {m['peak_at']:.2f} s, attack {m['attack_ms']:.0f} ms, "
            f"-20 dB in {m['t20']} s, -40 dB in {m['t40']} s, {m['hits']} hit(s) | centroid {m['centroid_hz']} Hz, bands "
            f"{'/'.join(f'{int(b * 100)}' for b in m['bands'])} % | AST: {', '.join(r['ast'])} | CLAP nearest: {', '.join(r['heard_as'])}")


def report(a, keep, n_items, n_events):
    L = [f'# {a.description}', '', f'{n_items} candidates, {n_events} sound events scored; queries: {", ".join(a.query or [])}; avoid: {a.avoid}', '']
    for r in keep:
        L += [f"## {r['n']}. {r['title'] or r['key']} ({r['source']})",
              f"- file: `{r['seg']}` (from {r['start']} s to {r['end']} s of the source{', the whole recording' if r['whole'] else ''})",
              f"- licence: {r['licence']}{' (credit: ' + r['credit'] + ')' if r.get('credit') else ', no credit'}; page: {r['page']}; file: {r.get('url') or r.get('file')}",
              f"- {line(r)}", f"- listeners described sounds like it as: {'; '.join(r['like'])}"] + \
             ([f"- caption (Qwen2-Audio): {r['caption']}"] if r.get('caption') else []) + ['']
    open(f'{a.out}/ranked.md', 'w').write('\n'.join(L))
    print('\n'.join(L))


def describe(a):
    clap, ast = Clap(), Ast()
    V = clap.text(VOCAB)
    rows = []
    for f in a.files:
        x = decode(f)
        s, e = events(x)[0]
        seg = x[int(s * SR):int(e * SR)]
        E = clap.audio([seg])[0]
        vs = E @ V.T
        rows.append(dict(file=f, measure=measure(seg), ast=ast.labels(seg), heard_as=[f"{VOCAB[i]} {vs[i]:.2f}" for i in np.argsort(-vs)[:3]],
                         like=like(E, *clap.caps), seg=seg))
    del clap, ast
    if a.caption:
        tmp = [f'{CACHE}/q-{i}.wav' for i in range(len(rows))]
        os.makedirs(CACHE, exist_ok=True)
        for r, p in zip(rows, tmp):
            qwen_wav(r['seg'], p)
        for r, c in zip(rows, captions(tmp)):
            r['caption'] = c
        for p in tmp:
            os.remove(p)
    for r in rows:
        m = r['measure']
        print(f"{r['file']}\n  {m['dur']:.2f} s, peak at {m['peak_at']:.2f} s, attack {m['attack_ms']:.0f} ms, -20 dB in {m['t20']} s, -40 dB in {m['t40']} s, "
              f"{m['hits']} hit(s), centroid {m['centroid_hz']} Hz, bands {'/'.join(str(int(b * 100)) for b in m['bands'])} %, peak {m['peak_dbfs']} dBFS\n"
              f"  AST: {', '.join(r['ast'])}\n  CLAP nearest: {', '.join(r['heard_as'])}\n  listeners described sounds like it as: {'; '.join(r['like'])}"
              + (f"\n  caption (Qwen2-Audio): {r['caption']}" if r.get('caption') else ''))
        r.pop('seg')
    if a.json:
        json.dump(rows, open(a.json, 'w'), ensure_ascii=False, indent=1)


def rank(a):
    clap = Clap()
    items = [dict(key=os.path.basename(f), title=os.path.basename(f), file=f) for f in a.files]
    rows = [r for r in score_all(clap, a.description, a.avoid, items) if r['whole']]
    for r in rows:
        r.pop('vec', None)
        print(f"{r['score']:.3f}  fit {r['fit']:.2f} z {r['z']:+.1f} avoid {r['avoid']:.2f}  {r['file']}  | nearest: {', '.join(r['heard_as'])}")


if __name__ == '__main__':
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    f = sub.add_parser('find')
    f.add_argument('description', help='the sound in words; "a | b" averages two wordings')
    f.add_argument('--query', action='append', help='search words for the libraries (repeatable); default: the description up to its first comma')
    f.add_argument('--out', required=True)
    f.add_argument('--sources', default='openverse,mixkit', type=lambda s: s.split(','))
    f.add_argument('--dir', action='append', help='a folder of your own files to rank with the rest (repeatable)')
    f.add_argument('--top', type=int, default=8)
    f.add_argument('--caption', type=int, default=0, metavar='N', help='Qwen2-Audio sentence for the best N')
    f.add_argument('--dur', type=float, nargs=2, default=[0.02, 6.0], metavar=('MIN', 'MAX'), help='length of the event wanted, seconds')
    f.add_argument('--max-source-dur', type=float, default=30)
    f.add_argument('--pages', type=int, default=2, help='Openverse pages of 20 per query')
    f.add_argument('--avoid', default=AVOID)
    f.add_argument('--allow-by', action='store_true', help='also CC BY sounds; the credit line is written with each')
    f.add_argument('--per-source', type=int, default=1, help='how many events one recording may place in the list')
    f.set_defaults(fn=find)
    d = sub.add_parser('describe'); d.add_argument('files', nargs='+'); d.add_argument('--caption', action='store_true'); d.add_argument('--json'); d.set_defaults(fn=describe)
    r = sub.add_parser('rank'); r.add_argument('description'); r.add_argument('files', nargs='+'); r.add_argument('--avoid', default=AVOID); r.set_defaults(fn=rank)
    b = sub.add_parser('batch'); b.add_argument('moments'); b.add_argument('--out', required=True); b.add_argument('--caption', type=int, default=3); b.add_argument('--only', nargs='*'); b.set_defaults(fn=batch)
    a = ap.parse_args()
    a.fn(a)
