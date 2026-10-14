# Changelog

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
