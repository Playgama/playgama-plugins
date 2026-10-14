#!/usr/bin/env python3
"""For maintainers: builds the next version of Playgama's plugin for OpenAI (ChatGPT and Codex) from the release ZIP
that is live there, so the skills go into the same plugin instead of a second one.

    python3 tools/build_openai_zip.py --base playgama_openai_plugin.zip --version 1.4.0

Keeps everything in the base ZIP (plugin.json's name, mcp.json, the review cases, the assets), adds this repository's
skills/ folder, raises the version and applies tools/openai-plugin.patch.json to the descriptions and release notes.
Writes dist/playgama-openai-plugin-<version>.zip. Refuses what OpenAI's public directory refuses: hooks and app files.
"""
import argparse
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKIP = re.compile(r'(^|/)(\.DS_Store|Thumbs\.db|__MACOSX|node_modules|\.git)(/|$)')

ap = argparse.ArgumentParser()
ap.add_argument('--base', required=True, help='the release ZIP that is live in OpenAI (Download release ZIP)')
ap.add_argument('--version', required=True, help='the new version, higher than the live one')
ap.add_argument('--patch', default=str(ROOT / 'tools' / 'openai-plugin.patch.json'))
ap.add_argument('--out', default=None)
args = ap.parse_args()


def version_tuple(v):
    return tuple(int(x) for x in re.findall(r'\d+', v)[:3])


base = zipfile.ZipFile(args.base)
names = base.namelist()
if 'plugin.json' not in names:
    sys.exit('the base ZIP has no plugin.json at its root')
manifest = json.loads(base.read('plugin.json'))
old = manifest.get('version', '0.0.0')
if version_tuple(args.version) <= version_tuple(old):
    sys.exit(f'--version {args.version} must be higher than the live {old}')
for n in names:
    if n.startswith('hooks/') or n == '.app.json' or n.endswith('/hooks.json'):
        sys.exit(f'{n}: OpenAI does not accept plugins with hooks or app files in the public directory')

patch = json.loads(Path(args.patch).read_text())
openai = manifest.setdefault('extensions', {}).setdefault('com.openai', {})
ui = openai.setdefault('interface', {})
manifest['version'] = args.version
if patch.get('description'):
    manifest['description'] = patch['description']
long = ui.get('longDescription', '')
for a, b in patch.get('longDescription', {}).get('replace', []):
    long = long.replace(a, b)
if patch.get('longDescription', {}).get('append') and patch['longDescription']['append'] not in long:
    long = long.rstrip() + '\n\n' + patch['longDescription']['append']
ui['longDescription'] = long
caps = ui.setdefault('capabilities', [])
caps += [c for c in patch.get('capabilitiesAppend', []) if c not in caps]
if patch.get('releaseNotes'):
    openai.setdefault('publication', {})['release_notes'] = patch['releaseNotes']

skills = sorted(p for p in (ROOT / 'skills').rglob('*') if p.is_file() and not SKIP.search(p.relative_to(ROOT).as_posix()))
if not skills:
    sys.exit('no skills found in skills/')

out = Path(args.out or ROOT / 'dist' / f'playgama-openai-plugin-{args.version}.zip')
out.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for n in names:
        if n == 'plugin.json' or n.startswith('skills/') or n.endswith('/'):
            continue
        z.writestr(base.getinfo(n), base.read(n))
    z.writestr('plugin.json', json.dumps(manifest, indent=2, ensure_ascii=False) + '\n')
    for p in skills:
        z.write(p, p.relative_to(ROOT).as_posix())

kept = [n for n in names if not n.endswith('/') and not n.startswith('skills/')]
print(f'{out}\n{manifest["name"]} {old} -> {args.version}: kept {len(kept)} files from the live ZIP, '
      f'added {len(skills)} skill files ({len({p.relative_to(ROOT / "skills").parts[0] for p in skills})} skills), '
      f'{out.stat().st_size} bytes')
