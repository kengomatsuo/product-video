"""Where a rendered film's picture changes, frame by frame, beside the level of its voice band.
A hit that is meant to land on a sung or spoken syllable shows as the largest picture change on the frame where the
voice level rises; a hit that leads or trails it shows the gap in frames. Run it on the delivered file.
  ~/.cache/audio-tools/venv/bin/python -I hit-sync.py <film.mp4> <from seconds> <to seconds> [--at 8.565,8.865,...]
--at marks the times the syllables were measured at (words.py), so each row beside one is easy to find."""
import subprocess, sys
import numpy as np
from numpy.fft import irfft, rfft, rfftfreq

args = sys.argv[1:]
marks = []
if '--at' in args:
    i = args.index('--at'); marks = [float(x) for x in args[i + 1].split(',')]; del args[i:i + 2]
film, t0, t1 = args[0], float(args[1]), float(args[2])
probe = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate,width,height', '-of', 'csv=p=0', film], capture_output=True, text=True).stdout.strip().split(',')
w, h = int(probe[0]), int(probe[1]); n, d = map(int, probe[2].split('/')); fps = n / d
SR = 22050
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', film, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout, dtype=np.float32)
X = rfft(x); fr = rfftfreq(len(x), 1 / SR); X[(fr < 500) | (fr > 3500)] = 0; v = irfft(X, len(x))
hop = int(SR / fps); k = len(v) // hop
level = np.sqrt(np.mean(v[:k * hop].reshape(k, hop) ** 2, axis=1)); level /= level.max()
W, H = (180, 320) if h > w else (320, 180)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', film, '-vf', f'scale={W}:{H},format=gray', '-fps_mode', 'passthrough', '-f', 'rawvideo', '-'], capture_output=True).stdout
frames = np.frombuffer(raw, dtype=np.uint8).reshape(-1, H, W).astype(np.int16)
change = np.concatenate([[0], np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))])
print('frame   sec  voice-band level                picture change')
for i in range(int(t0 * fps), min(int(t1 * fps), len(change), len(level))):
    mark = ' <' if any(round(m * fps) == i for m in marks) else ''
    print(f"{i:5d} {i / fps:6.3f} {'#' * int(30 * level[i]):30s} {'*' * int(min(40, change[i] * 2)):40s} {change[i]:5.1f}{mark}")
