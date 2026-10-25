import { audio } from './audio';

type Voice = {
  type: OscillatorType;
  d: number;
  vol: number;
  /** 音の高さの何倍から何倍へ、ローパスを閉じていくか。はじいた弦の音になる */
  filter?: number;
  /** 前の音から滑らせて上がる */
  slide?: boolean;
  /** 揺らす幅 (音の高さに対する割合) */
  vibrato?: number;
};

// steps は base からの半音の数。12 音になるまでオクターブ上へ繰り返す
const SCALES: { steps: number[]; base: number; voice: Voice }[] = [
  // ド レ ミ ソ ラ
  { steps: [0, 2, 4, 7, 9], base: 523, voice: { type: 'sine', d: 0.18, vol: 0.2 } },
  // ハワイアン: ドレミソラをスチールギターのように滑らせる
  { steps: [0, 2, 4, 7, 9], base: 392, voice: { type: 'triangle', d: 0.45, vol: 0.25, slide: true, vibrato: 0.012 } },
  // 沖縄 (琉球音階): ド ミ ファ ソ シ を三線のようにはじく
  { steps: [0, 4, 5, 7, 11], base: 523, voice: { type: 'sawtooth', d: 0.3, vol: 0.12, filter: 6 } },
  // アラビアン (ヒジャーズ): レ ミ♭ ファ♯ ソ ラ シ♭ ド を笛のように揺らす
  { steps: [0, 1, 4, 5, 7, 8, 10], base: 294, voice: { type: 'sawtooth', d: 0.3, vol: 0.1, filter: 3, vibrato: 0.02 } },
];

function play(v: Voice, f: number, from: number, t: number) {
  const c = audio();
  if (!c) return;
  const at = c.currentTime + t;
  const o = c.createOscillator(), g = c.createGain();
  o.type = v.type;
  o.frequency.setValueAtTime(v.slide ? from : f, at);
  if (v.slide) o.frequency.exponentialRampToValueAtTime(f, at + 0.08);
  if (v.vibrato) {
    const lfo = c.createOscillator(), depth = c.createGain();
    lfo.frequency.value = 6;
    depth.gain.value = f * v.vibrato;
    lfo.connect(depth).connect(o.frequency);
    lfo.start(at);
    lfo.stop(at + v.d);
  }
  let out: AudioNode = o;
  if (v.filter) {
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(f * v.filter, at);
    lp.frequency.exponentialRampToValueAtTime(f * 1.5, at + v.d);
    out = o.connect(lp);
  }
  g.gain.setValueAtTime(0.001, at);
  g.gain.exponentialRampToValueAtTime(v.vol, at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, at + v.d);
  out.connect(g).connect(c.destination);
  o.start(at);
  o.stop(at + v.d);
}

let last = -1;

/** 前と別の音階を 1 つ選ぶ。play(i) で下から i 番目の音を鳴らす */
export function pickScale() {
  let k = Math.floor(Math.random() * (SCALES.length - (last < 0 ? 0 : 1)));
  if (last >= 0 && k >= last) k++;
  last = k;
  const { steps, base, voice } = SCALES[k];
  const notes = Array.from({ length: 12 }, (_, i) => base * 2 ** ((steps[i % steps.length] + 12 * Math.floor(i / steps.length)) / 12));
  let prev = notes[0] * 0.9;
  return {
    notes,
    play(i: number, t = 0) {
      play(voice, notes[i], prev, t);
      prev = notes[i];
    },
  };
}
