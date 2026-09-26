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
  layouts/GameLayout.astro 共通の <head>、色変数、ダークモード、ボタン、もどるリンク
  lib/audio.ts             Web Audio の共通処理 (tone / chirp)
  lib/url.ts               base (/omocha/) を考慮したリンク生成
  pages/index.astro        トップページ
  pages/<slug>.astro       各ゲーム
```

### ゲームの追加手順

1. `src/pages/<slug>.astro` を作る。`GameLayout` で包み、ロジックは `<script>` に書く(TypeScript 可)
   - JS で動的に作る要素のスタイルは Astro のスコープが効かないので `<style is:global>` に書く
   - 音は `../lib/audio` の `tone()` / `chirp()` を使う
2. `src/games.ts` に 1 件追加する

### メモ

- 音は最初のタップで AudioContext を作るので、iOS の自動再生制限には引っかからない
- iPhone ではマナーモード(消音スイッチ)だと Web Audio の音が出ないことがある
- お店で遊ぶので音量は小さめ推奨
