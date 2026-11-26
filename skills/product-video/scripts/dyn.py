"""How a soundtrack breathes: level over time, dims, stops, fullness. dyn.py <label=file> ..."""
import sys, subprocess, json
import numpy as np
SR = 22050
def load(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)
def measure(x):
    hop = int(0.025 * SR); win = int(0.05 * SR)
    n = max(1, (len(x) - win) // hop)
    rms = np.array([np.sqrt(np.mean(x[i * hop:i * hop + win] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(rms + 1e-9)
    k = 16                                     # 0.4 s smoothing
    sm = np.convolve(db, np.ones(k) / k, mode='same')
    body = sm[40:-40] if len(sm) > 200 else sm  # skip first and last second
    ref = np.percentile(body, 90)
    def runs(mask, lo, hi):
        out = []; i = 0
        while i < len(mask):
            if mask[i]:
                j = i
                while j < len(mask) and mask[j]: j += 1
                d = (j - i) * 0.025
                if lo <= d <= hi: out.append((round((i + 40) * 0.025, 1), round(d, 2)))
                i = j
            else: i += 1
        return out
    dims = runs(body < ref - 8, 0.25, 6.0)
    stops = runs((db[40:-40] if len(db) > 200 else db) < ref - 22, 0.08, 3.0)
    # long-window range: 3 s loudness, 10th to 95th percentile
    w3 = 120; l3 = np.array([10 * np.log10(np.mean(rms[i:i + w3] ** 2) + 1e-12) for i in range(0, max(1, len(rms) - w3), 20)])
    rng = float(np.percentile(l3, 95) - np.percentile(l3, 10)) if len(l3) > 3 else 0.0
    # fullness: share of 24 log bands within 25 dB of the loudest band, per frame, averaged over loud frames
    N = 2048; H = 1024; fr = np.lib.stride_tricks.sliding_window_view(x, N)[::H] * np.hanning(N)
    S = np.abs(np.fft.rfft(fr, axis=1)) ** 2; f = np.fft.rfftfreq(N, 1 / SR)
    edges = np.geomspace(50, 10000, 25); B = np.stack([S[:, (f >= a) & (f < b)].sum(1) for a, b in zip(edges[:-1], edges[1:])], 1)
    Bd = 10 * np.log10(B + 1e-12); loud = Bd.max(1) > np.percentile(Bd.max(1), 30)
    full = float(((Bd[loud] > Bd[loud].max(1, keepdims=True) - 25).mean()))
    crest = float(np.median([20 * np.log10(np.max(np.abs(x[i:i + 3 * SR])) / (np.sqrt(np.mean(x[i:i + 3 * SR] ** 2)) + 1e-9) + 1e-9) for i in range(0, max(1, len(x) - 3 * SR), SR)]))
    quiet = float((body < ref - 8).mean())
    return dict(dur=round(len(x) / SR, 1), range_db=round(rng, 1), quiet_share=round(quiet, 2), dims=len(dims), dims_per_min=round(len(dims) / (len(x) / SR / 60), 1),
                stops=len(stops), stops_at=stops[:8], fullness=round(full, 2), crest_db=round(crest, 1)), sm
out = {}
for a in sys.argv[1:]:
    lab, p = a.split('=', 1); m, sm = measure(load(p)); out[lab] = m
    np.save(f'dyn-{lab}.npy', sm)
    print(lab, json.dumps(m))
json.dump(out, open('dyn.json', 'w'), indent=1)
