# こどもの待ち時間ゲーム

お店で料理を待つ間など、ちょっとした待ち時間に子どもがスマホで遊べるミニゲーム集。

公開先: https://tmokmss.github.io/omocha/

## 開発

```sh
npm install
npm run dev      # http://localhost:4321/omocha/
npm run build    # 型チェック + dist/ に静的出力
npm run preview  # ビルド結果を確認
```

[Astro](https://astro.build/) で静的サイトとしてビルドし、`main` への push で GitHub Actions (`.github/workflows/deploy.yml`) が GitHub Pages にデプロイする。

### ゲームの追加手順

1. `src/pages/<slug>.astro` を作る。`GameLayout` で包み、ロジックは `<script>` に書く(TypeScript 可)
   - タップは `../lib/tap` の `onTap()` で受ける(`click` は子どもの指がずれると反応しない)
   - ゲーム画面はスクロールしない画面固定になる。残りの高さを埋める要素に `class="grow"` を付ける
   - JS で動的に作る要素のスタイルは Astro のスコープが効かないので `<style is:global>` に書く
   - 音は `../lib/audio` の `tone()` / `chirp()`、読み上げは `../lib/speech` の `speak()` を使う
2. `src/games.ts` に 1 件追加する
