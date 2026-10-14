#!/usr/bin/env node
// For maintainers: renames the plugin, its marketplace and its display name in every manifest and in the README and
// CHANGELOG at once, so the placeholder names can be swapped for the final ones in one step.
//
//   node tools/rename.mjs --plugin playgama --marketplace playgama-plugins --display "Playgama" [--repo Playgama/plugins]
//
// Any option left out keeps its current value. Prints what changed; run `claude plugin validate --strict .` after.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = (f) => path.join(root, f);
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : undefined; };
const readJson = (f) => JSON.parse(readFileSync(at(f), 'utf8'));
const writeJson = (f, d) => writeFileSync(at(f), JSON.stringify(d, null, 2) + '\n');

const claude = readJson('.claude-plugin/plugin.json');
const market = readJson('.claude-plugin/marketplace.json');
const was = { plugin: claude.name, marketplace: market.name, display: claude.displayName };
const now = { plugin: opt('plugin') || was.plugin, marketplace: opt('marketplace') || was.marketplace, display: opt('display') || was.display };
const repo = opt('repo');
const NAME = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;
for (const k of ['plugin', 'marketplace']) {
  if (!NAME.test(now[k]) || now[k].includes('--') || now[k].length > 64) {
    console.error(`--${k} "${now[k]}": lowercase letters, digits and single hyphens, up to 64 characters`);
    process.exit(2);
  }
}

claude.name = now.plugin;
claude.displayName = now.display;
if (repo) { claude.repository = `https://github.com/${repo}`; }
writeJson('.claude-plugin/plugin.json', claude);

market.name = now.marketplace;
for (const p of market.plugins) if (p.name === was.plugin) p.name = now.plugin;
writeJson('.claude-plugin/marketplace.json', market);

const portable = readJson('plugin.json');
portable.name = now.plugin;
if (repo) portable.repository = `https://github.com/${repo}`;
const ui = portable.extensions?.['com.openai']?.interface;
if (ui) ui.displayName = now.display;
writeJson('plugin.json', portable);

if (existsSync(at('.agents/plugins/marketplace.json'))) {
  const codex = readJson('.agents/plugins/marketplace.json');
  codex.name = now.marketplace;
  if (codex.interface) codex.interface.displayName = now.display;
  for (const p of codex.plugins) if (p.name === was.plugin) p.name = now.plugin;
  writeJson('.agents/plugins/marketplace.json', codex);
}

// the docs: install commands first (plugin@marketplace), then each name on its own
for (const f of ['README.md', 'CHANGELOG.md']) {
  if (!existsSync(at(f))) continue;
  let t = readFileSync(at(f), 'utf8');
  // whole names only, the longer first: the plugin's name can be the start of the marketplace's
  const whole = (s) => new RegExp(`(?<![\\w-])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`, 'g');
  for (const [a, b] of [[was.marketplace, now.marketplace], [was.plugin, now.plugin]].sort((x, y) => y[0].length - x[0].length)) {
    if (a !== b) t = t.replace(whole(a), b);
  }
  if (was.display !== now.display) t = t.split(was.display).join(now.display);
  writeFileSync(at(f), t);
}

console.log(`plugin       ${was.plugin} -> ${now.plugin}
marketplace  ${was.marketplace} -> ${now.marketplace}
display      ${was.display} -> ${now.display}${repo ? `\nrepository   https://github.com/${repo}` : ''}
install:     /plugin install ${now.plugin}@${now.marketplace}
Check the README's title and the test-build notes by hand, then: claude plugin validate --strict .`);
