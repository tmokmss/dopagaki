import { execFileSync } from 'node:child_process';
import { rmSync, writeFileSync } from 'node:fs';

const SR = 44100, BPM = 150, SEC = 24;
const beat = 60 / BPM, bar = 4 * beat;
const n = Math.floor(SR * SEC);
const buf = new Float32Array(n);
const duck = new Float32Array(n).fill(1);
const midi = m => 440 * 2 ** ((m - 69) / 12);
const at = t => Math.floor(t * SR);

const tone = (t0, dur, f0, amp, { f1 = f0, decay = 7, wave = 'sine', pump = true } = {}) => {
  const s0 = at(t0), len = at(dur);
  let ph = 0;
  for (let i = 0; i < len && s0 + i < n; i++) {
    const t = i / SR, f = f0 * (f1 / f0) ** (t / dur);
    ph = (ph + f / SR) % 1;
    const env = Math.min(1, t / 0.004) * Math.exp(-t * decay) * Math.min(1, (len - i) / (0.01 * SR));
    const w = wave === 'saw' ? 2 * ph - 1 : wave === 'tri' ? 1 - 4 * Math.abs(ph - 0.5) : wave === 'square' ? (ph < 0.5 ? 1 : -1) : Math.sin(2 * Math.PI * ph);
    buf[s0 + i] += w * env * amp * (pump ? duck[s0 + i] : 1);
  }
};
const noise = (t0, dur, amp, decay = 40, rise = false) => {
  const s0 = at(t0), len = at(dur);
  let lp = 0;
  for (let i = 0; i < len && s0 + i < n; i++) {
    const t = i / SR, r = Math.random() * 2 - 1;
    lp += (r - lp) * (rise ? 0.05 + 0.9 * (t / dur) : 1);
    buf[s0 + i] += lp * amp * (rise ? (t / dur) ** 2 : Math.exp(-t * decay));
  }
};
const kick = t0 => {
  tone(t0, 0.22, 160, 0.8, { f1: 42, decay: 14, pump: false });
  const s0 = at(t0);
  for (let i = 0; i < at(0.32) && s0 + i < n; i++) duck[s0 + i] = Math.min(duck[s0 + i], 0.25 + 0.75 * (i / at(0.32)) ** 1.5);
};
const supersaw = (t0, dur, m, amp) => [-0.12, 0, 0.12].forEach(d => tone(t0, dur, midi(m + d), amp, { wave: 'saw', decay: 2.5 }));

const SCENES = [3.2, 6.4, 9.6, 12.8, 16.0, 19.2];
const chords = [[62, 66, 69, 74], [57, 64, 69, 73], [59, 66, 71, 74], [55, 62, 67, 71]]; // D A Bm G
const lead = [78, 81, 83, 81, 78, 76, 74, 76, 78, 76, 74, 73, 74, 76, 78, 81];

// 0-3.2s: アイコンのピコッ → タイトルのドーン → ライザー
[0, 0.2, 0.4, 0.6, 0.8].forEach((t, i) => tone(t, 0.12, midi(74 + [0, 2, 4, 7, 9][i]), 0.35, { f1: midi(86 + i * 2), wave: 'square', decay: 18, pump: false }));
for (let k = 0; k < 4; k++) kick(k * beat);
kick(1.6); tone(1.6, 0.9, 90, 0.9, { f1: 35, decay: 3, pump: false }); noise(1.6, 0.8, 0.5, 5);
noise(1.6, 1.6, 0.35, 0, true);
for (let k = 0; k < 16; k++) noise(1.6 + k * (1.6 / 16), 0.05, 0.12 + 0.25 * (k / 16), 50);

// 3.2-19.2s: 本編。4 つ打ち + 裏ハット + 2・4 拍クラップ + ポンプするベースとコード + リード
for (let b = 0; b < 10; b++) {
  const t = 3.2 + b * bar, c = chords[b % 4];
  for (let k = 0; k < 4; k++) {
    kick(t + k * beat);
    noise(t + k * beat + beat / 2, 0.08, 0.18, 35);
    if (k % 2) noise(t + k * beat, 0.15, 0.35, 22);
    tone(t + k * beat + beat / 2, beat / 2, midi(c[0] - 24), 0.45, { wave: 'tri', decay: 4 });
  }
  for (let k = 0; k < 8; k++) tone(t + (k * beat) / 2, beat / 2, midi(c[[0, 1, 2, 3, 2, 3, 1, 2][k]] + 12), 0.1, { wave: 'square', decay: 10 });
  c.slice(1).forEach(m => supersaw(t, bar, m, 0.04));
  for (let k = 0; k < 4; k++) tone(t + k * beat, beat * 0.9, midi(lead[(b % 4) * 4 + k]), 0.13, { wave: 'saw', decay: 5 });
}

// シーン切り替えのシュワッ + クラッシュ
SCENES.forEach(t => {
  tone(t - 0.15, 0.15, 400, 0.25, { f1: 1600, decay: 2, pump: false });
  noise(t, 1.0, 0.3, 4);
});

// 19.2s-: チェックのピコッ ×3、URL のキラーン、最後のジャーン
[19.2, 19.6, 20.0].forEach((t, i) => { kick(t); tone(t, 0.15, midi(81 + i * 4), 0.35, { f1: midi(93 + i * 4), wave: 'square', decay: 14, pump: false }); });
[0, 0.07, 0.14, 0.21].forEach((d, i) => tone(20.4 + d, 0.6, midi(93 + [0, 4, 7, 12][i]), 0.18, { decay: 5, pump: false }));
kick(20.8);
[50, 62, 66, 69, 74, 78].forEach(m => supersaw(20.8, 3.0, m, 0.05));
noise(20.8, 2.5, 0.3, 2);

const fadeOut = 0.8 * SR;
const pcm = Buffer.alloc(44 + n * 2);
for (let i = 0; i < n; i++) pcm.writeInt16LE(Math.round(Math.tanh(buf[i] * Math.min(1, (n - i) / fadeOut) * 0.85) * 32000), 44 + i * 2);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + n * 2, 4); pcm.write('WAVE', 8); pcm.write('fmt ', 12);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(SR, 24);
pcm.writeUInt32LE(SR * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(n * 2, 40);
writeFileSync('public/bgm.wav', pcm);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', 'public/bgm.wav', '-b:a', '192k', 'public/bgm.mp3']);
rmSync('public/bgm.wav');
