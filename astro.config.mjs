// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages (https://tmokmss.github.io/omocha/) で配信する
export default defineConfig({
  site: 'https://tmokmss.github.io',
  base: '/omocha',
  trailingSlash: 'always',
});
