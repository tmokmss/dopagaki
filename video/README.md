# 紹介動画

dopagaki の縦型紹介動画（1080×1920・24 秒）を [Remotion](https://www.remotion.dev/) で作る。

```sh
cd video
npm install
npx remotion studio                 # プレビューと編集: http://localhost:3000
npx remotion render DopagakiPromo   # out/DopagakiPromo.mp4 に書き出す
```

## 構成

- `src/Promo.tsx` — シーンの並び・尺・各ゲームのテロップと色
- `src/Opening.tsx` / `src/GameScene.tsx` / `src/Ending.tsx` — 各シーン
- `src/fx.tsx` — 背景・紙吹雪・フラッシュなどの演出。`BEAT`(12 フレーム = 150 BPM の 1 拍) にシーンの切り替えを合わせている
- `public/clips/*.mp4` — 公開サイトを遊んだ録画
- `public/bgm.mp3` — 合成した BGM(効果音込み)

## 素材を作り直す

```sh
npx playwright install chromium
node scripts/record.mjs            # 全ゲームを録画し直す
node scripts/record.mjs sushi      # 1 本だけ
node scripts/bgm.mjs && ffmpeg -y -i public/bgm.wav -b:a 192k public/bgm.mp3 && rm public/bgm.wav
```

BGM の効果音の位置はシーンの切り替え時刻に合わせて書いているので、尺を変えたら `scripts/bgm.mjs` の時刻も直す。

## Claude Code で編集する

Remotion 公式のスキルを入れると、Claude Code が Remotion の書き方に沿って編集できる。

```sh
npx skills experimental_install    # skills-lock.json から .claude/skills に復元する
```
