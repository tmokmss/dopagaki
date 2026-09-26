// 最初のタップ時に AudioContext を作るので iOS の自動再生制限に引っかからない
let ac: AudioContext | null = null;

export function audio(): AudioContext | null {
  try {
    ac ??= new (window.AudioContext || (window as any).webkitAudioContext)();
    return ac;
  } catch {
    return null;
  }
}

/** 単音を鳴らす。t: 開始までの秒数, d: 長さ(秒) */
export function tone(freq: number, t = 0, d = 0.15, vol = 0.25) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, c.currentTime + t);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + t + d);
  o.connect(g);
  g.connect(c.destination);
  o.start(c.currentTime + t);
  o.stop(c.currentTime + t + d);
}

/** 「ぴゅっ」と上がる音 */
export function chirp(from: number, to = 1200, d = 0.25, vol = 0.3) {
  const c = audio();
  if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(from, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(to, c.currentTime + d * 0.6);
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d);
  o.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + d);
}
