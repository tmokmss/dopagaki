// @ts-check
import { defineConfig } from 'astro/config';
import serviceWorker from './integrations/service-worker.ts';

// GitHub Pages (https://tmokmss.github.io/dopagaki/) で配信する
export default defineConfig({
  site: 'https://tmokmss.github.io',
  base: '/dopagaki',
  trailingSlash: 'always',
  // ホーム画面に追加して、オフラインでも遊べるようにする
  integrations: [serviceWorker()],
  // 画面下に出る開発用ツールバーは、ローカルで子どもが遊ぶときの誤タップのもとになるので出さない
  devToolbar: { enabled: false },
});
