# こどもの待ち時間ゲーム

お店で料理を待つ間など、ちょっとした待ち時間に子どもがスマホで遊べるミニゲーム集。

公開先: https://tmokmss.github.io/omocha/

## コンセプト

- 対象: 3歳前後。文字が読めなくても遊べる
- 操作: タップだけ。1タップで必ず見た目と音が反応する
- 失敗なし・終わりなし: 時間制限やゲームオーバーがなく、親がいつでも止められる
- 数を数える要素: 「なんさら?」「なんこ?」と親子の会話のきっかけになる
- 場所ネタ: 回転寿司ならお寿司、ハンバーガー屋ならハンバーガー、のようにその場に合わせたテーマ
- 実在のブランドのロゴやキャラクターは使わず、オリジナルの絵で作る
- 画像ファイルや外部 CDN に頼らず、絵は SVG / CSS、音は Web Audio で作る

## ゲーム一覧

| ページ | 名前 | 遊び方 |
|---|---|---|
| `src/pages/sushi.astro` | かいてんずし | 流れてくるお寿司をタップして食べる。食べたお皿が下に積み上がる |
| `src/pages/burger.astro` | ハンバーガーづくり | 具をタップして積む。「ふた」をのせると完成してジャンプする |
| `src/pages/hiragana.astro` | あいうえお ぱっ | ひらがなをタップすると読み上げて、その字ではじまる絵(あ→あり)が出てくる |

## 開発

```sh
npm install
npm run dev      # http://localhost:4321/omocha/
npm run build    # 型チェック + dist/ に静的出力
npm run preview  # ビルド結果を確認
```

[Astro](https://astro.build/) で静的サイトとしてビルドし、`main` への push で GitHub Actions (`.github/workflows/deploy.yml`) が GitHub Pages にデプロイする。

### 構成

```
src/
  games.ts                 ゲーム一覧(トップページに並ぶ)
  layouts/GameLayout.astro 共通の <head>、色変数、ダークモード、ボタン、もどるリンク、画面固定
  lib/tap.ts               子ども向けタップ処理 onTap (pointerdown で反応)
  lib/audio.ts             Web Audio の共通処理 (tone / chirp)
  lib/speech.ts            読み上げ (speechSynthesis)。質の高い日本語の声を選ぶ
  lib/url.ts               base (/omocha/) を考慮したリンク生成
  pages/index.astro        トップページ
  pages/<slug>.astro       各ゲーム
public/                    PWA の manifest とアイコン
```

### ゲームの追加手順

1. `src/pages/<slug>.astro` を作る。`GameLayout` で包み、ロジックは `<script>` に書く(TypeScript 可)
   - JS で動的に作る要素のスタイルは Astro のスコープが効かないので `<style is:global>` に書く
   - 音は `../lib/audio` の `tone()` / `chirp()`、読み上げは `../lib/speech` の `speak()` を使う
2. `src/games.ts` に 1 件追加する

### タップとレイアウトのルール

子どもの指はタップ中にずれやすく、ブラウザにスクロール扱いされてタップが効かないことがある。全ゲーム共通で次のようにしている。

- **タップは `onTap()` で受ける。`click` は使わない**
  - `click` は指が少し動くと発火しないため。`onTap` は触れた瞬間 (`pointerdown`) に反応する
  - `onTap('.btn', (el) => ...)` のようにセレクタ・要素・要素の集まりを渡せる
- **ゲーム画面はスクロールしない**
  - `GameLayout` は既定で画面ぴったりに固定し、スクロール・ズーム・iOS のバウンス・長押しメニューを止める
  - `main` は縦並びの flex。残りの高さを埋めたい要素に `class="grow"` を付け、小さい画面(iPhone SE: 375×667)でもはみ出さないようにする
  - スクロールが必要なページ(トップなど)だけ `<GameLayout scroll>` にする
- **ホーム画面に追加して遊ぶのがおすすめ**
  - Safari の端スワイプで「戻る」してしまう事故は Web 側では防げない。ホーム画面に追加すると全画面(standalone)で開くので起きない
  - さらに確実にしたいときは iPhone の「アクセスガイド」、Android の「アプリ固定」を使う

### メモ

- 音は最初のタップで AudioContext を作るので、iOS の自動再生制限には引っかからない
- 読み上げは端末の声に依存する。Mac/iOS は「設定 → アクセシビリティ → 読み上げコンテンツ」で Kyoko(拡張) や O-ren(プレミアム) を入れると音質が上がる
- iPhone ではマナーモード(消音スイッチ)だと Web Audio の音が出ないことがある
- お店で遊ぶので音量は小さめ推奨
