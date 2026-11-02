#!/usr/bin/env node
// The voice-over, one command per step: a free system voice for a draft, a page to pick takes by ear, and a voice track
// laid out at its times with the music ducked under it. A take can be any audio file saved as vo/takes/<id>-<take>.<ext>,
// such as the developer's own recording. This copy, in the Playgama plugin, calls no text-to-speech service; the same
// skill in github.com/Playgama/gamedev-skills does.
//
//   node voice.mjs make vo/lines.json [--takes 1] [--only v1,v4] [--voice <name>]
//                                      draft takes -> vo/takes/<id>-<take>.wav, added after the ones already there
//   node voice.mjs review vo/lines.json
//                                      vo/review.html: every take with a player
//   node voice.mjs lay vo/lines.json --length 32.3 [--pick v1=2,v4=3] [--music audio/music.wav] [--out audio]
//                                      the picked takes (take 1 if not picked) at their times -> <out>/voice.wav, and
//                                      with --music, the music ducked under the voice -> <out>/music-ducked.wav
//
// vo/lines.json:
//   { "voice": "<optional: a system voice's name>", "spoken": { "Playgama": "play-GAH-ma" },
//     "lines": [ { "id": "v1", "at": 3.5, "text": "This is Sky Shift: a race high above the sea." } ] }
// "text" is what captions show; the voice reads it with each "spoken" name swapped in ("say" on a line replaces it all).
// Needs Node 22+ and ffmpeg.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OS, need, hint } from './system.mjs';

const [cmd, file] = process.argv.slice(2);
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };

if (!file || !['make', 'review', 'lay'].includes(cmd)) {
  console.error('usage: node voice.mjs make|review|lay <lines.json> [options]'); process.exit(2);
}
need('ffprobe');
const cfg = JSON.parse(readFileSync(file, 'utf8'));
const dir = path.dirname(path.resolve(file));
const takesDir = path.join(dir, 'takes');
const voice = arg('voice', cfg.voice) || '';
const spoken = (l) => l.say || Object.entries(cfg.spoken || {}).reduce((t, [a, b]) => t.split(a).join(b), l.text);
const dur = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();
const num = (id, f) => parseInt(f.slice(id.length + 1), 10);
const takesOf = (id) => (existsSync(takesDir) ? readdirSync(takesDir) : [])
  .filter((f) => f.startsWith(id + '-') && !Number.isNaN(num(id, f))).sort((a, b) => num(id, a) - num(id, b));

// one take of one line in a system voice, free and offline, for timing the edit: macOS's say, Windows' own voices
// (System.Speech, through draft-voice.ps1), espeak-ng on Linux
const draft = (text, out) => {
  if (OS === 'macOS') {
    execFileSync('say', [...(voice ? ['-v', voice] : []), '--file-format=WAVE', '--data-format=LEI16@24000', '-o', out, text]);
  } else if (OS === 'Windows') {
    try {
      execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', fileURLToPath(new URL('./draft-voice.ps1', import.meta.url))],
        { env: { ...process.env, PGV_DRAFT_TEXT: text, PGV_DRAFT_OUT: out, PGV_DRAFT_VOICE: voice } });
    } catch (e) {
      throw new Error(`${String(e.stderr || e.message).trim().split('\n')[0]} (PowerShell has to allow local scripts, execution policy RemoteSigned; or record the lines yourself)`);
    }
  } else {
    try { execFileSync('espeak-ng', [...(voice ? ['-v', voice] : []), '-w', out, text]); } catch (e) {
      throw new Error(e.code === 'ENOENT' ? `espeak-ng is not installed: ${hint('espeak-ng')}` : String(e.message).split('\n')[0]);
    }
  }
};

if (cmd === 'make') {
  if ((arg('provider', cfg.provider) || 'draft') !== 'draft') {
    console.error('this copy of the skill only makes the free draft voice. Save takes from a service yourself as vo/takes/<id>-<take>.<ext>, or use the same skill in github.com/Playgama/gamedev-skills');
    process.exit(2);
  }
  const only = new Set(arg('only', '').split(',').filter(Boolean));
  const N = +arg('takes', 1);
  mkdirSync(takesDir, { recursive: true });
  let failed = 0;
  for (const line of cfg.lines) {
    if (only.size && !only.has(line.id)) continue;
    const from = takesOf(line.id).reduce((m, f) => Math.max(m, num(line.id, f)), 0);
    for (let n = from + 1; n <= from + N; n++) {
      const out = path.join(takesDir, `${line.id}-${n}.wav`);
      try {
        draft(spoken(line), out);
        console.log(`${path.basename(out)}  ${dur(out).toFixed(2)} s`);
      } catch (e) { failed++; console.error(`${line.id}-${n}: ${e.message}`); }
    }
  }
  process.exit(failed ? 1 : 0);
}

if (cmd === 'review') {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const rows = cfg.lines.map((l) => {
    const takes = takesOf(l.id).map((f) => `<li><span>take ${num(l.id, f)} · ${dur(path.join(takesDir, f)).toFixed(2)} s</span>` +
      `<audio controls preload="none" src="takes/${encodeURIComponent(f)}"></audio></li>`).join('');
    return `<section><h2>${esc(l.id)}${l.at != null ? ` · at ${l.at} s` : ''}</h2><p>${esc(l.text)}</p><ol>${takes || '<li>no takes yet</li>'}</ol></section>`;
  }).join('\n');
  const page = path.join(dir, 'review.html');
  writeFileSync(page, `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>Voice takes</title>
<style>
  body { font: 16px/1.5 system-ui, sans-serif; max-width: 760px; margin: 24px auto; padding: 0 16px; background: #111114; color: #eee; }
  h1 { font-size: 22px; } h2 { font-size: 14px; color: #9aa0a6; margin: 28px 0 4px; } p { margin: 0 0 8px; font-size: 18px; }
  ol { list-style: none; padding: 0; margin: 0; } li { display: flex; align-items: center; gap: 12px; margin: 6px 0; }
  li span { min-width: 130px; color: #9aa0a6; font-size: 14px; } audio { flex: 1; min-width: 0; }
  code { background: #222; padding: 2px 6px; border-radius: 4px; overflow-wrap: anywhere; }
</style></head><body>
<h1>Voice takes</h1>
<p>Listen to every take and pick one per line, then: <code>node voice.mjs lay ${esc(path.basename(file))} --pick ${cfg.lines.map((l) => `${esc(l.id)}=1`).join(',')} --length …</code></p>
${rows}
</body></html>
`);
  console.log(page);
}

if (cmd === 'lay') {
  const L = +arg('length', 0);
  if (!L) { console.error('--length <the video\'s length in seconds> is needed'); process.exit(2); }
  const pick = Object.fromEntries(arg('pick', '').split(',').filter(Boolean).map((p) => p.split('=')));
  const outDir = path.resolve(arg('out', 'audio'));
  mkdirSync(outDir, { recursive: true });
  const parts = cfg.lines.filter((l) => l.at != null).map((l) => {
    const f = takesOf(l.id).find((t) => num(l.id, t) === +(pick[l.id] || 1));
    if (!f) { console.error(`${l.id}: no take ${pick[l.id] || 1} in ${takesDir}`); process.exit(1); }
    return { l, f: path.join(takesDir, f), d: dur(path.join(takesDir, f)) };
  });
  parts.forEach((p, i) => {
    const nx = parts[i + 1];
    if (nx && p.l.at + p.d > nx.l.at) console.log(`${p.l.id} runs ${(p.l.at + p.d - nx.l.at).toFixed(2)} s into ${nx.l.id}: move ${nx.l.id} later or pick a shorter take`);
    if (p.l.at + p.d > L) console.log(`${p.l.id} runs past the end of the video`);
  });
  const voiceOut = path.join(outDir, 'voice.wav');
  const chains = parts.map((p, i) => `[${i}]aformat=sample_rates=48000:channel_layouts=stereo,adelay=${Math.round(p.l.at * 1000)}:all=1[a${i}]`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...parts.flatMap((p) => ['-i', p.f]), '-filter_complex',
    `${chains.join(';')};${parts.map((_, i) => `[a${i}]`).join('')}amix=inputs=${parts.length}:normalize=0,apad=whole_dur=${L},atrim=0:${L}`,
    voiceOut]);
  console.log(voiceOut);
  const music = arg('music');
  if (music) {
    // each HyperFrames <audio> plays at one volume, so the music is ducked here, under the voice, before it goes in
    const ducked = path.join(outDir, 'music-ducked.wav');
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', music, '-i', voiceOut, '-filter_complex',
      `[0]aformat=sample_rates=48000:channel_layouts=stereo[m];[m][1]sidechaincompress=threshold=0.015:ratio=8:attack=25:release=350,apad=whole_dur=${L},atrim=0:${L}`,
      ducked]);
    console.log(ducked);
  }
}
