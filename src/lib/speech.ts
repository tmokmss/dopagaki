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

/** 読み上げられそうか。声の一覧がまだ空のときは試してみる */
export function canSpeak(): boolean {
  if (typeof speechSynthesis === 'undefined') return false;
  const voices = pickVoice();
  return voices.length === 0 || jaVoice !== null;
}

/** texts を順に読み上げる。前の読み上げは止める */
export function speak(...texts: string[]): boolean {
  if (!canSpeak()) return false;
  speechSynthesis.cancel();
  for (const text of texts) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP';
    if (jaVoice) u.voice = jaVoice;
    // pitch をいじると音質が落ちやすいのでそのまま。少しだけゆっくり
    u.rate = 0.9;
    speechSynthesis.speak(u);
  }
  return true;
}
