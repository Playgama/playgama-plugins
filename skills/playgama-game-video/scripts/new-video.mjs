#!/usr/bin/env node
// A new video folder from the skill's template, the same on macOS, Linux and Windows: the template (index.html, a
// .gitignore), a package.json, gsap.min.js and the placeholder fonts from jsDelivr, and empty clips/, audio/, vo/ and
// stills/ folders.
//
//   node new-video.mjs my-game-video
//
// It installs nothing. Filming needs puppeteer in that folder: this prints the command for this system. Run every later
// command from that folder: film.mjs finds puppeteer there.
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { hint } from './system.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const dest = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!dest) { console.error('usage: node new-video.mjs <new folder>'); process.exit(2); }
const out = path.resolve(dest);
if (existsSync(out) && readdirSync(out).length) { console.error(`${out} is not empty: pick a new folder`); process.exit(1); }

cpSync(path.join(here, '..', 'assets', 'template'), out, { recursive: true });
for (const d of ['clips', 'audio', 'vo', 'stills', 'fonts']) mkdirSync(path.join(out, d), { recursive: true });
// npm installs into the nearest package.json: this one keeps puppeteer in the video's folder
writeFileSync(path.join(out, 'package.json'), '{ "private": true }\n');

// exact versions, each checked against the bytes this kit was tested with. DM Mono only holds the places of the game's
// own fonts until they are in
const CDN = 'https://cdn.jsdelivr.net/npm/';
const DOWNLOADS = [
  [`${CDN}gsap@3.14.2/dist/gsap.min.js`, 'gsap.min.js', 'c174bfce53a729418d57a8ad8625e7247c793a22fef8e2851e3cfa3de9cd8280'],
  [`${CDN}@fontsource/dm-mono@5.2.7/files/dm-mono-latin-400-normal.woff2`, 'fonts/dm-mono-400-latin.woff2', 'e1896b13b2b1bb112fac2f9571bd6c40e118746e77a4511edbf43fbb41bf3e1e'],
  [`${CDN}@fontsource/dm-mono@5.2.7/files/dm-mono-latin-500-normal.woff2`, 'fonts/dm-mono-500-latin.woff2', '9964608a849396bd00c4bfd7034afe03486469dcf20b4f6b8cbdfdd310369951'],
  [`${CDN}@fontsource/dm-mono@5.2.7/LICENSE`, 'fonts/OFL.txt', 'd2766c396a8534cba53340f8af2037749b6a0a1dd3587348c917a70e779d2e32'],
];
for (const [url, file, sha256] of DOWNLOADS) {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const bytes = Buffer.from(await r.arrayBuffer());
    if (createHash('sha256').update(bytes).digest('hex') !== sha256) throw new Error('not the file this kit was tested with');
    writeFileSync(path.join(out, file), bytes);
  } catch (e) {
    console.error(`${file} didn't download (${e.message}): save ${url} as ${path.join(out, file)} by hand`);
  }
}

console.log(`${out}
next, from that folder:
  1. for filming, install puppeteer and its Chrome (about 150 MB, once): ${hint('puppeteer')}
  2. fill THE GAME'S LOOK at the top of index.html (references/game-look.md)
  3. film into clips/ (scripts/film.mjs), voice into audio/ (scripts/voice.mjs)
  4. npx hyperframes@0.8.38 check .
  5. npx hyperframes@0.8.38 render . -o renders/video.mp4 --quality high`);
