// ゲームのプレイ記録。親が「どれをどのくらい遊んだか」を /stats/ で見られるようにする
//
// サーバーはないので端末の localStorage に日ごと・ゲームごとに貯める。
// 遊んだ回数・時間・タップ数は GameLayout が自動で数える (track)。
// 「おなかいっぱい」「正解」のようなゲームごとの数は、各ゲームから addStat() で足す。
// 名前と表示名は src/games.ts の counters に書く

const KEY = 'dopagaki-stats';
/** 最後に触ってからこれ以上たったら、画面が開いたままでも遊んだ時間に数えない */
const IDLE_MS = 60_000;

export interface Day {
  /** 開いて 1 回以上タップした回数 */
  plays: number;
  /** 画面が見えていて、最後のタップから IDLE_MS 以内だった時間 */
  ms: number;
  taps: number;
  /** ゲームごとの数 (games.ts の counters のキー) */
  counts: Record<string, number>;
}
/** slug → 日付 (YYYY-MM-DD) → その日の記録 */
export type Stats = Record<string, Record<string, Day>>;

export const today = (d = new Date()) => d.toLocaleDateString('sv');
export const emptyDay = (): Day => ({ plays: 0, ms: 0, taps: 0, counts: {} });

export function loadStats(): Stats {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return s && typeof s === 'object' ? s : {};
  } catch {
    return {};
  }
}

export function resetStats() {
  try { localStorage.removeItem(KEY); } catch {}
}

// まだ書き込んでいない増分。書くときに読み直して足すので、別のタブで遊んでいても消し合わない
let slug = '';
let pending: Day = emptyDay();
let timer = 0;

function flush() {
  clearTimeout(timer);
  timer = 0;
  const p = pending;
  if (!slug || (!p.plays && !p.ms && !p.taps && !Object.keys(p.counts).length)) return;
  pending = emptyDay();
  const s = loadStats();
  const days = (s[slug] ??= {});
  const d = (days[today()] ??= emptyDay());
  d.plays += p.plays;
  d.ms += Math.round(p.ms);
  d.taps += p.taps;
  d.counts ??= {};
  for (const [k, n] of Object.entries(p.counts)) d.counts[k] = (d.counts[k] ?? 0) + n;
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

/** タップのたびに書くと重いので、少しまとめてから書く */
function later() {
  if (!timer) timer = window.setTimeout(flush, 2000);
}

/** ゲームごとの数を足す。ゲームのページ以外で呼んでも何もしない */
export function addStat(key: string, n = 1) {
  if (!slug) return;
  pending.counts[key] = (pending.counts[key] ?? 0) + n;
  later();
}

/** このページを slug のゲームとして記録しはじめる (GameLayout から呼ぶ) */
export function track(game: string) {
  slug = game;
  let played = false;
  let lastTap = -Infinity;
  let lastTick = performance.now();

  addEventListener('pointerdown', () => {
    if (!played) { played = true; pending.plays++; }
    pending.taps++;
    lastTap = performance.now();
    later();
  }, { capture: true });

  // 1 秒ごとに、前回からの時間を「遊んでいた」なら足す
  const tick = () => {
    const now = performance.now();
    if (document.visibilityState === 'visible' && now - lastTap < IDLE_MS) {
      pending.ms += Math.min(now - lastTick, 1500);
      later();
    }
    lastTick = now;
  };
  setInterval(tick, 1000);
  document.addEventListener('visibilitychange', () => { tick(); flush(); });
  addEventListener('pagehide', () => { tick(); flush(); });
}
