export interface Game {
  /** src/pages/<slug>.astro に対応 */
  slug: string;
  title: string;
  /** 親向けの短い説明 */
  description: string;
  /** トップページのアイコン(絵文字) */
  icon: string;
  /** どんなお店向けか */
  place: string;
  /**
   * きろく (/stats/) に出す、ゲームごとの数。キー → 親向けの表示名。
   * ゲームの中で src/lib/stats.ts の addStat(キー) を呼んで足す
   */
  counters: Record<string, string>;
}

// 新しいゲームを作ったらここに追加する
export const games: Game[] = [
  {
    slug: 'sushi',
    title: 'かいてんずし',
    description: '流れてくるお寿司をタップして食べる。食べたお皿が下に積み上がる',
    icon: '🍣',
    place: '回転寿司',
    counters: { plate: '食べたお皿', full: 'おなかいっぱい' },
  },
  {
    slug: 'burger',
    title: 'ハンバーガーづくり',
    description: '具をタップして積む。「ふた」をのせると完成してジャンプする',
    icon: '🍔',
    place: 'ハンバーガー屋',
    counters: { burger: '作ったバーガー' },
  },
  {
    slug: 'hiragana',
    title: 'もじの たまご',
    description: 'ひらがなの書かれたたまごをタップして割ると、その字ではじまるものが出てきてずかんに入る。10 こ集めたらおしまい',
    icon: '🥚',
    place: 'どこでも',
    counters: { egg: '割ったたまご', full: 'ずかんいっぱい' },
  },
  {
    slug: 'kazu',
    title: 'かずあそび',
    description: '数えて・選んで・「○こちょうだい」。できた数だけすごろくが進み、ゴールでその日はおしまい。数の範囲は自動で調整',
    icon: '🔢',
    place: 'どこでも',
    counters: { ok: '正解', ng: 'まちがい', goal: 'ゴール' },
  },
  {
    slug: 'nazori',
    title: 'なぞりがき',
    description: '点線を指でなぞると、にじ・りんご・かたつむりなどの絵に変わる。描けた絵は上に並び、6 まい描けたらおしまい',
    icon: '✏️',
    place: 'どこでも',
    counters: { drawn: '描けた絵', done: 'ぜんぶ描けた' },
  },
];
