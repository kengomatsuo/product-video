const f = process.argv[2];
const W = 110, H = 240, N = W * H;
const raw = Bun.spawnSync(['ffmpeg', '-v', 'error', '-i', f, '-vf', `scale=${W}:${H},format=gray`, '-f', 'rawvideo', '-'], { maxBuffer: 1 << 30 }).stdout;
const n = raw.length / N, d: number[] = [0];
for (let i = 1; i < n; i++) { let s = 0; for (let k = 0; k < N; k++) s += Math.abs(raw[i * N + k] - raw[(i - 1) * N + k]); d.push(s / N); }
// onsets: frame where motion starts after >= 0.3 s of stillness
const out: string[] = []; let still = 0;
for (let i = 1; i < n; i++) { if (d[i] > 0.6 && still >= 18) out.push(`${(i / 60).toFixed(2)}s(${d[i].toFixed(1)})`); still = d[i] < 0.3 ? still + 1 : 0; }
console.log(f, (n / 60).toFixed(2) + 's', out.join(' '));
