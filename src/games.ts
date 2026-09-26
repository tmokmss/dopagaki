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
}

// 新しいゲームを作ったらここに追加する
export const games: Game[] = [
  {
    slug: 'sushi',
    title: 'かいてんずし',
    description: '流れてくるお寿司をタップして食べる。食べたお皿が下に積み上がる',
    icon: '🍣',
    place: '回転寿司',
  },
  {
    slug: 'burger',
    title: 'ハンバーガーづくり',
    description: '具をタップして積む。「ふた」をのせると完成してジャンプする',
    icon: '🍔',
    place: 'ハンバーガー屋',
  },
  {
    slug: 'hiragana',
    title: 'あいうえお ぱっ',
    description: 'ひらがなをタップすると読み上げて、その字ではじまる絵が出てくる',
    icon: 'あ',
    place: 'どこでも',
  },
];
