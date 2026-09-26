// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages (https://tmokmss.github.io/omocha/) で配信する
export default defineConfig({
  site: 'https://tmokmss.github.io',
  base: '/omocha',
  trailingSlash: 'always',
  // 画面下に出る開発用ツールバーは、ローカルで子どもが遊ぶときの誤タップのもとになるので出さない
  devToolbar: { enabled: false },
});
