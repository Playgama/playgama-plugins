#!/usr/bin/env node
// Checks this machine for everything the skill uses, and says what to install for each missing piece, on macOS, Linux
// or Windows. Run it first, from the game's project or the video's folder.
//
//   node doctor.mjs                   Node, ffmpeg, puppeteer, Chrome and WebGL, the draft voice
//
// Exits 1 when something the skill can't work without is missing.
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { OS, has, hint, loadPuppeteer, chromeArgs, launchHint } from './system.mjs';

const rows = [];
const check = (name, ok, detail, fix, required = true) => rows.push({ name, ok, detail, fix, required });

const node = process.versions.node;
check('Node.js 22+', +node.split('.')[0] >= 22, node, hint('node'));
check('ffmpeg', has('ffmpeg'), '', hint('ffmpeg'));
check('ffprobe', has('ffprobe'), '', hint('ffmpeg'));

const pp = await loadPuppeteer();
if (!pp) check('puppeteer', false, 'not next to the scripts or in this folder', `in the game's project: ${hint('puppeteer')}`);
else if (pp.name === 'puppeteer-core' && !process.env.CHROME) check('puppeteer', false, 'puppeteer-core without CHROME', `set CHROME=/path/to/chrome, or ${hint('puppeteer')}`);
else {
  check('puppeteer', true, pp.name);
  try {
    const browser = await pp.lib.launch({ headless: true, ...(process.env.CHROME ? { executablePath: process.env.CHROME } : {}),
      args: chromeArgs() });
    const page = await browser.newPage();
    const gl = await page.evaluate(() => { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); });
    await browser.close();
    check('Chrome starts', true, '');
    check('WebGL in Chrome', gl, gl ? '' : 'none', 'without a GPU: CHROME_ARGS="--enable-unsafe-swiftshader"', false);
  } catch (e) {
    check('Chrome starts', false, String(e.message || e).split('\n')[0].slice(0, 110), launchHint());
  }
}

const draft = OS === 'macOS' ? has('say', ['-v', '?'])
  : OS === 'Windows' ? has('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', fileURLToPath(new URL('./draft-voice.ps1', import.meta.url)), '-Check'])
  : has('espeak-ng', ['--version']);
check('draft voice', draft, OS === 'macOS' ? 'say' : OS === 'Windows' ? 'System.Speech' : 'espeak-ng',
  OS === 'Linux' ? hint('espeak-ng') : OS === 'Windows' ? 'PowerShell has to allow local scripts (execution policy RemoteSigned); or record the lines yourself' : '', false);

if (existsSync('.env')) {
  check('footage stays here', false, 'a .env is in reach of HyperFrames', 'pass --describe false to every hyperframes snapshot', false);
}
if (existsSync('index.html')) check('gsap.min.js', existsSync('gsap.min.js'), 'beside index.html', 'node new-video.mjs makes a video folder with it');

for (const r of rows) {
  console.log(`${r.ok ? 'ok  ' : r.required ? 'NO  ' : 'warn'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
  if (!r.ok && r.fix) console.log(`        -> ${r.fix}`);
}
const missing = rows.filter((r) => !r.ok && r.required);
console.log('\nHyperFrames has its own check for rendering: npx hyperframes@0.8.38 doctor (its first run downloads ~370 MB).');
console.log(missing.length ? `${missing.length} to fix on ${OS} before filming.` : `Ready on ${OS}.`);
process.exit(missing.length ? 1 : 0);
