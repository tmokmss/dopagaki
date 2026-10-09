import { chromium } from 'playwright';
import { rm, mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const W = 390, H = 844;
const BASE = 'https://tmokmss.github.io/dopagaki';
const wait = (p, ms) => p.waitForTimeout(ms);
const tapEl = async (p, loc) => {
  const b = await loc.boundingBox();
  if (!b) return false;
  await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
  return true;
};

const plays = {
  async sushi(p) {
    for (let i = 0; i < 9; i++) {
      const xs = await p.$$eval('.sushi', els => els.map(e => e.getBoundingClientRect()).filter(r => r.x > 40 && r.x < 260).map(r => [r.x + r.width / 2, r.y + r.height / 2]));
      if (xs[0]) await p.mouse.click(...xs[0]);
      await wait(p, 750);
    }
  },
  async burger(p) {
    for (const t of ['おにく', 'チーズ', 'レタス', 'トマト', 'おにく', 'チーズ', 'ふた']) {
      await tapEl(p, p.getByRole('button', { name: t, exact: true }));
      await wait(p, 650);
    }
    await wait(p, 600);
    await tapEl(p, p.locator('#burger'));
    await wait(p, 2500);
  },
  async hiragana(p) {
    for (let i = 0; i < 3; i++) {
      const egg = p.locator('.egg').nth(i);
      await tapEl(p, egg);
      await p.locator('.egg.ready').first().waitFor({ timeout: 5000 });
      await tapEl(p, egg);
      await wait(p, 2200);
    }
  },
  async kutsu(p) {
    for (let i = 0; i < 2; i++) {
      await tapEl(p, p.locator('.shoe').first());
      await wait(p, 900);
      await tapEl(p, p.locator('#wear'));
      await wait(p, 2200);
    }
  },
  async nazori(p) {
    for (let k = 0; k < 2; k++) {
      const pts = await p.evaluate(() => {
        const path = document.querySelector('#guide');
        const m = path.getScreenCTM();
        const len = path.getTotalLength();
        return Array.from({ length: 60 }, (_, i) => {
          const q = path.getPointAtLength((len * i) / 59);
          return [q.x * m.a + q.y * m.c + m.e, q.x * m.b + q.y * m.d + m.f];
        });
      });
      await p.mouse.move(...pts[0]);
      await p.mouse.down();
      for (const pt of pts) { await p.mouse.move(...pt); await wait(p, 25); }
      await p.mouse.up();
      await wait(p, 2500);
    }
  },
};

const outDir = 'public/clips';
const tmp = 'scripts/.rec';
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
for (const name of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(plays)) {
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto(`${BASE}/${name}/`);
  await wait(p, 1000);

  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const f = `${tmp}/${String(frames.length).padStart(5, '0')}.jpg`;
    frames.push({ f, t: metadata.timestamp });
    await writeFile(f, Buffer.from(data, 'base64'));
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: W * 2, maxHeight: H * 2 });
  await wait(p, 500);
  await plays[name](p);
  await wait(p, 300);
  await cdp.send('Page.stopScreencast');
  const end = Date.now() / 1000;
  await ctx.close();

  const list = frames.map((fr, i) => `file '${fr.f.split('/').pop()}'\nduration ${((frames[i + 1]?.t ?? end) - fr.t).toFixed(4)}`).join('\n');
  await writeFile(`${tmp}/list.txt`, `${list}\nfile '${frames.at(-1).f.split('/').pop()}'\n`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-i', `${tmp}/list.txt`, '-vf', 'fps=30,scale=780:1688,format=yuv420p', '-c:v', 'libx264', '-crf', '18', `${outDir}/${name}.mp4`]);
  console.log('recorded', name, frames.length, 'frames');
}
await browser.close();
