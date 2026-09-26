// @ts-check
import { defineConfig } from 'astro/config';
import serviceWorker from './integrations/service-worker.ts';

// GitHub Pages (https://tmokmss.github.io/omocha/) で配信する
export default defineConfig({
  site: 'https://tmokmss.github.io',
  base: '/omocha',
  trailingSlash: 'always',
  // ホーム画面に追加して、オフラインでも遊べるようにする
  integrations: [serviceWorker()],
});
