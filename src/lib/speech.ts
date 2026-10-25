// ブラウザ内蔵の読み上げ (speechSynthesis)。音声ファイル不要でオフラインでも動く
// 日本語の声が入っていない端末 (海外版 Android など) では false を返すので、呼び出し側で効果音に切り替える

let jaVoice: SpeechSynthesisVoice | null = null;

// 声の良さの順位。大きいほど優先する
// Mac/iOS の Eddy, Flo, Grandma などは簡易音声(Eloquence)で質が低いので後回しにする
const LOW_QUALITY = /^(Eddy|Flo|Grandma|Grandpa|Reed|Rocko|Sandy|Shelley)\b/;
function score(v: SpeechSynthesisVoice) {
  if (/Google/.test(v.name)) return 50; // Chrome / Android の Google 音声
  if (/Premium|プレミアム/.test(v.name)) return 40;
  if (/Enhanced|拡張/.test(v.name)) return 30;
  if (/O-?ren|Kyoko|Otoya|Hattori/.test(v.name)) return 20;
  if (LOW_QUALITY.test(v.name)) return 0;
  return v.default ? 15 : 10;
}

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  const ja = voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith('ja'));
  jaVoice = ja.sort((a, b) => score(b) - score(a))[0] ?? null;
  return voices;
}

if (typeof speechSynthesis !== 'undefined') {
  pickVoice();
  // 声の一覧は非同期で読み込まれることがある
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

// iOS / iPadOS は、タップ (touchend など) の処理中に一度 speak するまで、読み上げを何も言わずに捨てる。
// タップは pointerdown で受けるので、最初のタップの読み上げは捨てられる。発話が始まるまでは、指を離すたびに
// 捨てられた発話を読み直す。読み上げ中なら二重にならないよう、代わりに無音の発話を speak して制限だけ外す。
// iPad の Safari は UA が Mac と同じなので、タッチ点の数で見分ける
const IOS = typeof navigator !== 'undefined'
  && (/iPhone|iPad|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1));
let unlocked = !IOS;
let dropped: SpeechSynthesisUtterance[] = [];
const UNLOCK = ['touchend', 'pointerup', 'keydown'];
function unlock() {
  const busy = speechSynthesis.speaking || speechSynthesis.pending;
  const us = !busy && dropped.length ? dropped : [Object.assign(new SpeechSynthesisUtterance(''), { volume: 0 })];
  dropped = [];
  for (const u of us) speechSynthesis.speak(u);
}
function started() {
  unlocked = true;
  for (const type of UNLOCK) removeEventListener(type, unlock, true);
}
if (IOS && typeof speechSynthesis !== 'undefined') {
  for (const type of UNLOCK) addEventListener(type, unlock, true);
}

/**
 * 読み上げられそうか。声の一覧がまだ空のときは試してみる。
 * iPad で、声の一覧に日本語が無いのに lang = 'ja-JP' なら日本語で読み上げる端末があったので、iOS / iPadOS では常に試す
 */
export function canSpeak(): boolean {
  if (typeof speechSynthesis === 'undefined') return false;
  const voices = pickVoice();
  return IOS || voices.length === 0 || jaVoice !== null;
}

// 読み上げエンジンは単語に区切って辞書を引くので、ひらがなだけの文は区切りや読み・アクセントを誤りやすい
// (そふとくりーむ→「ソート…」、あり→「有り」)。開発中と ?debug のときは、漢字・カタカナ・数字を 1 文字も含まない
// 2 文字以上の文を読み上げたら画面上に警告を出す。1 文字だけ (ひらがなの「あ」など) は文字の名前なので対象外
const WARN = typeof location !== 'undefined' && (import.meta.env.DEV || new URLSearchParams(location.search).has('debug'));
let warnBar: HTMLDivElement | null = null;
let warnTimer = 0;
function checkKana(text: string) {
  const body = text.replace(/[\s、。！？!?,.・「」ー〜]/g, '');
  if (body.length < 2 || !/^[ぁ-ゟ]+$/.test(body)) return;
  const msg = `読み上げがひらがなだけ: 「${text}」 漢字・カタカナで書く`;
  console.warn('[speech]', msg);
  warnBar ??= Object.assign(document.createElement('div'), {
    style: 'position:fixed;left:0;right:0;top:0;z-index:9999;padding:6px 8px;font:12px/1.4 monospace;background:#E24B4A;color:#fff;pointer-events:none;white-space:pre-wrap',
  });
  warnBar.textContent = msg;
  document.body.appendChild(warnBar);
  clearTimeout(warnTimer);
  warnTimer = window.setTimeout(() => warnBar?.remove(), 4000);
}

/** texts を順に読み上げ、最後の発話を返す。前の読み上げは止める */
function utter(texts: string[]): SpeechSynthesisUtterance | null {
  if (WARN) texts.forEach(checkKana);
  if (!canSpeak()) return null;
  speechSynthesis.cancel();
  const us = texts.map((text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    if (jaVoice) u.voice = jaVoice;
    // pitch をいじると音質が落ちやすいのでそのまま。少しだけゆっくり
    u.rate = 0.9;
    if (!unlocked) u.addEventListener('start', started);
    speechSynthesis.speak(u);
    return u;
  });
  if (!unlocked) dropped = us;
  return us.at(-1) ?? null;
}

/**
 * texts を順に読み上げる。前の読み上げは止める
 *
 * texts は画面の表示と同じひらがなにせず、ふつうの漢字かな交じり・カタカナで書く
 * (例: 表示「りんごを かぞえよう」→ 読み上げ「リンゴを 数えよう」)。表示用と読み上げ用の文字列を分けて持つ
 */
export function speak(...texts: string[]): boolean {
  return utter(texts) !== null;
}

/** speak と同じだが、読み終わったら解決する。読み上げられないときは false で解決する */
export function speakWait(...texts: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    const u = utter(texts);
    if (!u) return resolve(false);
    let timer = 0;
    const fin = () => {
      clearTimeout(timer);
      resolve(true);
    };
    u.onend = fin;
    u.onerror = fin;
    // onend が来ない端末があるので、長さの目安で打ち切る
    timer = window.setTimeout(fin, 1500 + texts.join('').length * 300);
  });
}
