# Changelog

## 1.4.4

From an audit of the skills against the live Playgama tools.

- playgama-publish follows a sandbox publication the way `publish_sandbox` now describes it: `get_publications`,
  read after its `retryAfterSeconds`, until PUBLISHED or FAILED, and a FAILED one is told to the developer. It also
  presents a free traffic boost without a dollar amount, as the traffic tools ask.
- `serve.mjs` sends a folder asked for without its closing slash on to the slash, so that page's relative paths load.

## 1.4.3

From the checks in Anthropic's submission portal.

- The plugin's listing carries an icon and its links: documentation, support, privacy policy and terms (`icon`,
  `documentationUrl`, `supportUrl`, `privacyPolicyUrl`, `termsOfServiceUrl`). The portal had warned that the
  privacy policy URL was missing.
- playgama-publish serves the build for the QA Tool with its own `scripts/serve.mjs` instead of `npx serve`, which
  downloaded and ran a package. It serves on 127.0.0.1 only, moves to the next port when one is busy, sends
  pre-compressed `.br` and `.gz` files with their encoding, and `--isolate` adds the cross-origin isolation headers
  that a threaded export needs.
- TRADEMARKS.md and NOTICE describe the logo files, the sting and the fonts in words instead of file paths, and the
  Codex manifest no longer points at the logo picture. The portal held the plugin for files that name a bundled
  picture or font.
- The video skill's Windows draft voice creates its speech synthesizer with `::new()`. The portal had read the old
  form as the start of a download command.

## 1.4.2

- Codex now reads the plugin from `.codex-plugin/plugin.json`, its own format, instead of the Agent Plugins
  `plugin.json` and `mcp.json` at the root. For a plugin in the Agent Plugins format, Codex shows only as many MCP
  tools as fit in 8,000 bytes each and 64,000 bytes in all. Playgama's 33 tools take about 227,000, so Codex hid five
  of them: `update_application_form`, `start_cover_upload`, `start_sandbox_traffic`, `replace_in_app_products` and
  `update_leaderboard`. Without the form and the covers a game couldn't reach its sandbox. In its own format Codex
  shows all 33.

## 1.4.1

From a full test run, in which an agent with only this plugin made a game, uploaded it and published its sandbox.

- playgama-publish names the fixed values `create_application` takes: `js` for a game without an engine,
  `claude-code` and `claude-opus`, and `modelId`. The test's first call failed on a free-text engine.
- It says that `get_launch_steps` answers once the game exists, so the game is found or created first.
- `covers.mjs --title-at top` puts the title at the top, off the player when the action sits at the bottom.
- The skill says where to run `covers.mjs`: in the folder where puppeteer is installed, with `CHROME` set for
  puppeteer-core. It also says `--font` is only for a game with a font of its own.
- playgama-bridge spells the engine the way `get_bridge_sdk_docs` does (`Plain JS`). The tool ignores an unknown name
  without an error.

## 1.4.0

Named and described like Playgama's plugin in OpenAI's directory, so both catalogs show "Playgama for Developers"
and the plugin has one name everywhere: `playgama-developer-cabinet` in Claude Code, ChatGPT and Codex alike. That
name is the OpenAI plugin's id, which a new version can't change. Its MCP server is called `playgama`, as in the OpenAI
plugin; this folder's marketplace is `playgama-plugins`. The texts say developer console, the English word for the
cabinet. The version follows the OpenAI plugin, whose 1.4.0 adds these same three skills. The README opens with the
listing's own words.

## 0.1.1: test build

- The video skill's sting preview is an animated WebP picture instead of an MP4, and its bundled pictures are named
  in plain text, as the plugin directories ask.
- playgama-publish no longer depends on the MCP server's name: the OpenAI plugin calls it `playgama`.
- tools/build_openai_zip.py builds the next version of Playgama's OpenAI plugin from its live ZIP plus these skills.
- The README says how to keep the plugin updated in Claude Code.

## 0.1.0: test build

The first build of Playgama's plugin for AI coding agents, under placeholder names.

- Connects the Playgama MCP server (`playgama-developer-console`) in Claude Code (`.mcp.json`) and in clients that
  read the Agent Plugins format, Codex among them (`plugin.json` and `mcp.json`).
- `playgama-publish`: the way from a project to a playable sandbox link, with three scripts: `precheck.mjs` checks a
  build against the game checklist, `pack.mjs` makes the zip and prints its exact size, `covers.mjs` renders the three
  covers from screenshots of the game.
- `playgama-bridge`: integrating the Bridge SDK in any engine from the live documentation.
- `playgama-game-video`: the video skill as released in Playgama/gamedev-skills 1.1.0.
