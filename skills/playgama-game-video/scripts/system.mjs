// What the scripts need from the machine, the same way on macOS, Linux and Windows: the command-line tools and what to
// install when one is missing, puppeteer (found next to these scripts or in the folder they run from) and Chrome's flags.
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const OS = process.platform === 'darwin' ? 'macOS' : process.platform === 'win32' ? 'Windows' : 'Linux';

// the exact puppeteer the kit was checked with is in every command below: change them together
const HINTS = {
  node: { macOS: 'brew install node', Linux: 'nvm install 22 (github.com/nvm-sh/nvm)', Windows: 'winget install OpenJS.NodeJS.LTS' },
  ffmpeg: { macOS: 'brew install ffmpeg', Linux: 'sudo apt install ffmpeg', Windows: 'winget install Gyan.FFmpeg, then open a new terminal' },
  puppeteer: { macOS: 'npm i -D puppeteer@25.14.0', Windows: 'npm i -D puppeteer@25.14.0',
    // Chrome for Testing has no Linux ARM build: there, the distribution's Chromium drives puppeteer-core
    Linux: process.arch === 'arm64' ? 'sudo apt install chromium; npm i -D puppeteer-core@25.14.0; CHROME=/usr/bin/chromium'
      : 'npm i -D puppeteer@25.14.0, then sudo npx puppeteer@25.14.0 browsers install chrome --install-deps' },
  'espeak-ng': { Linux: 'sudo apt install espeak-ng' },
};
export const hint = (tool) => HINTS[tool === 'ffprobe' ? 'ffmpeg' : tool]?.[OS] || '';

export const has = (cmd, args = ['-version']) => {
  try { execFileSync(cmd, args, { stdio: 'ignore' }); return true; } catch { return false; }
};
// stop with what to install when a command-line tool is missing
export const need = (cmd) => {
  if (!has(cmd)) { console.error(`${cmd} is not on the PATH. Install it: ${hint(cmd)}`); process.exit(1); }
};

// puppeteer, or puppeteer-core with CHROME=/path/to/chrome: next to these scripts first, then in the folder they run
// from (the game's own project), so a skill installed as a plugin needs nothing in its own folder
export async function loadPuppeteer() {
  for (const name of ['puppeteer', 'puppeteer-core']) {
    try { return { name, lib: (await import(name)).default }; } catch { /* not next to the scripts */ }
    try {
      const m = await import(pathToFileURL(createRequire(path.join(process.cwd(), 'index.js')).resolve(name)).href);
      return { name, lib: m.default?.launch ? m.default : m.default?.default || m };
    } catch { /* not in the current folder either */ }
  }
  return null;
}

// the GPU where there is one, plus CHROME_ARGS and --chrome-args. On a Linux server: "--no-sandbox" (in a container, or
// where AppArmor blocks Chrome's sandbox) and "--enable-unsafe-swiftshader" (WebGL without a GPU)
export const chromeArgs = (extra = '') => ['--hide-scrollbars', '--mute-audio', '--enable-gpu', '--ignore-gpu-blocklist',
  '--autoplay-policy=no-user-gesture-required', ...(OS === 'macOS' ? ['--use-angle=metal'] : []),
  ...`${process.env.CHROME_ARGS || ''} ${extra}`.split(/\s+/).filter(Boolean)];

export const launchHint = () => (OS === 'Linux'
  ? 'sudo npx puppeteer@25.14.0 browsers install chrome --install-deps; in a container or under AppArmor, CHROME_ARGS="--no-sandbox"'
  : 'npx puppeteer@25.14.0 browsers install chrome');
