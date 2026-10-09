# 紹介動画

dopagaki の縦型紹介動画（1080×1920・24 秒）を [Remotion](https://www.remotion.dev/) で作る。書き出した動画は `dopagaki-promo.mp4`。

```sh
cd video
npm install
npx playwright install chromium
node scripts/record.mjs             # 公開サイトを遊んで public/clips/*.mp4 を録画する
node scripts/bgm.mjs                # BGM を合成して public/bgm.mp3 に書き出す(ffmpeg が必要)
npx remotion studio                 # プレビューと編集: http://localhost:3000
npx remotion render DopagakiPromo   # out/DopagakiPromo.mp4 に書き出す
```

`node scripts/record.mjs sushi` のようにゲーム名を渡すと、その 1 本だけ録画し直す。

## 構成

- `src/Promo.tsx` — シーンの並び・尺・各ゲームのテロップと色
- `src/Opening.tsx` / `src/GameScene.tsx` / `src/Ending.tsx` — 各シーン
- `src/fx.tsx` — 背景・紙吹雪・フラッシュなどの演出。`BEAT`(12 フレーム = 150 BPM の 1 拍) にシーンの切り替えを合わせている
- `scripts/bgm.mjs` — BGM と効果音。効果音の位置はシーンの切り替え時刻に合わせて書いているので、尺を変えたらここの時刻も直す

## Claude Code で編集する

Remotion 公式のスキルを入れると、Claude Code が Remotion の書き方に沿って編集できる。

```sh
npx skills experimental_install    # skills-lock.json から .claude/skills に復元する
```
