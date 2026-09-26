# コンセプト

- 対象: 3歳前後。文字が読めなくても遊べる
- 操作: タップだけ。1タップで必ず見た目と音が反応する
- 失敗なし・終わりなし: 時間制限やゲームオーバーがなく、親がいつでも止められる
- 数を数える要素: 「なんさら?」「なんこ?」と親子の会話のきっかけになる
- 場所ネタ: 回転寿司ならお寿司、ハンバーガー屋ならハンバーガー、のようにその場に合わせたテーマ
- 実在のブランドのロゴやキャラクターは使わず、オリジナルの絵で作る
- 画像ファイルや外部 CDN に頼らず、絵は SVG / CSS、音は Web Audio で作る

# 開発

```sh
npm install
npm run dev      # http://localhost:4321/omocha/
npm run build    # 型チェック + dist/ に静的出力
npm run preview  # ビルド結果を確認
```

Astro で静的サイトとしてビルドし、`main` への push で GitHub Actions (`.github/workflows/deploy.yml`) が GitHub Pages にデプロイする。

# ゲームの追加手順

1. `src/pages/<slug>.astro` を作る。`GameLayout` で包み、ロジックは `<script>` に書く(TypeScript 可)
   - タップはすべて `src/lib/tap.ts` の `onTap()` で受ける。`click` は使わない(子どもの指はタップ中にずれやすく、click だと反応しないため)
   - `GameLayout` は既定でスクロール・ズーム・バウンスを止めて画面ぴったりに固定する。伸び縮みさせる領域に `class="grow"` を付け、375×667 でもはみ出さないレイアウトにする。スクロールが必要なページだけ `<GameLayout scroll>` にする
   - JS で動的に作る要素のスタイルは Astro のスコープが効かないので `<style is:global>` に書く
   - 音は `src/lib/audio.ts` の `tone()` / `chirp()`、読み上げは `src/lib/speech.ts` の `speak()` を使う。文字を使うなら読み上げを付ける
2. `src/games.ts` に 1 件追加する
3. 確認: `npm run build`(型チェック込み)が通ること。ブラウザで 375×667 と 390×844 の両方で、スクロールが出ずにタップが効くこと
