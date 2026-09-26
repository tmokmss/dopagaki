import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  }));
  return files.flat();
}

/**
 * ビルド後に dist/ の全ファイルを precache する sw.js を生成する。
 * ゲームを追加しても自動で対象になるので、一覧を手で管理しなくてよい。
 */
export default function serviceWorker(): AstroIntegration {
  let base = '/';
  return {
    name: 'omocha-service-worker',
    hooks: {
      'astro:config:done': ({ config }) => {
        base = config.base.endsWith('/') ? config.base : config.base + '/';
      },
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = (await walk(root)).filter((f) => !f.endsWith(`${sep}sw.js`)).sort();

        const hash = createHash('sha256');
        const urls: string[] = [];
        for (const f of files) {
          const rel = relative(root, f).split(sep).join('/');
          hash.update(rel).update(await readFile(f));
          // trailingSlash: 'always' なので foo/index.html は foo/ で配信される
          urls.push(base + rel.replace(/(^|\/)index\.html$/, '$1'));
        }
        // SW 本体の変更でもキャッシュが入れ替わるよう、本体もハッシュに含める
        const version = hash.update(SW_BODY).digest('hex').slice(0, 12);

        const sw = `// 自動生成 (integrations/service-worker.ts)
const CACHE = 'omocha-${version}';
const URLS = ${JSON.stringify(urls)};
${SW_BODY}`;
        await writeFile(join(root, 'sw.js'), sw);
        logger.info(`sw.js を生成しました (${urls.length} files, ${version})`);
      },
    },
  };
}

const SW_BODY = `
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(URLS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('omocha-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// お店の電波が弱くてもすぐ開けるよう、キャッシュ優先で返す。
// 新しい版は次回起動時に sw.js の更新で入れ替わる。
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    // module script は Origin 付きで要求されるので、Vary: Origin 等で外れないよう ignoreVary
    caches.match(e.request, { ignoreSearch: true, ignoreVary: true }).then((hit) => hit || fetch(e.request)),
  );
});
`;
