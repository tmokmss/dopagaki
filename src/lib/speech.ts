// ブラウザ内蔵の読み上げ (speechSynthesis)。音声ファイル不要でオフラインでも動く
// 日本語の声が入っていない端末 (海外版 Android など) では false を返すので、呼び出し側で効果音に切り替える

let jaVoice: SpeechSynthesisVoice | null = null;

function pickVoice() {
  const voices = speechSynthesis.getVoices();
  jaVoice = voices.find((v) => v.lang.replace('_', '-').toLowerCase().startsWith('ja')) ?? null;
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
    u.rate = 0.85;
    u.pitch = 1.1;
    speechSynthesis.speak(u);
  }
  return true;
}
