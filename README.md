# Playgama for Developers

Publish and monetize web games on [Playgama](https://playgama.com) from your coding agent. The plugin connects the agent
to the Playgama MCP server, so it can take your game from a local build to a public link: create the game and fill in
its form, upload the build and covers, publish a playable sandbox and bring its first players. Its three skills cover
the work on your machine around that: checking and packing the build, integrating the Bridge SDK, and making a trailer
of the game.

Try:

- "Publish this game to Playgama and give me a public link I can share."
- "Upload the new build of my game and tell me when the analysis is done."
- "Make a 30-second trailer of my game."

In OpenAI's plugin directory, for ChatGPT and Codex, Playgama's plugin goes by the same name, `playgama-developer-cabinet`.

## What's inside

| Part | What it does |
|---|---|
| **Playgama MCP server** (`playgama`) | Playgama's own tools: your games and their forms, build uploads and the build check, covers, the public sandbox, sharing, traffic, leaderboards, in-app products, the QA Tool and your game's analytics |
| **playgama-publish** | Takes the game from your project to a playable link: checks the build against Playgama's game checklist, packs it, makes the three covers from the game itself, fills in the form, uploads, publishes and shares it |
| **playgama-bridge** | Integrates the Playgama Bridge SDK in any engine from Playgama's live documentation, with the steps every game must do |
| **playgama-game-video** | Makes a trailer, a Short or a devlog of your game in the game's own look, filmed from the game frame by frame |

## Install

Works in Claude Code and Codex, on macOS, Linux and Windows.

**Claude Code:**

```
/plugin marketplace add Playgama/playgama-plugins
/plugin install playgama-developer-cabinet@playgama-plugins
```

or for one session only, from a clone of this repository, without installing:
`claude --plugin-dir /path/to/playgama-plugins`.

Claude Code doesn't update plugins from marketplaces like this one by itself. Turn it on in `/plugin` → Marketplaces
(auto-update), or update by hand: `claude plugin marketplace update playgama-plugins`, then
`claude plugin update playgama-developer-cabinet@playgama-plugins`.

**Codex** (0.162 or newer):

```bash
codex plugin marketplace add Playgama/playgama-plugins
codex plugin add playgama-developer-cabinet@playgama-plugins
```

or install it from `/plugins` inside Codex.

**First use.** Sign in to Playgama once, in the browser that opens, and allow the connection: in Claude Code run
`/mcp` and choose `plugin:playgama-developer-cabinet:playgama`; in Codex run `codex mcp login playgama`. There is no
token to copy. You can see and revoke connected agents at [developer.playgama.com/mcp](https://developer.playgama.com/mcp).

## What it needs

- A Playgama developer account, and a game in a web build (anything that runs from an `index.html`).
- Node.js 18 or newer for the publishing scripts; Node.js 22 or newer, ffmpeg and puppeteer for the video skill.
- `curl` for uploads (it ships with macOS, Linux and Windows 10 and newer).

## What it runs and sends

- **The MCP server** at `https://developer.playgama.com/api/mcp` acts on your own organization's games only, after you
  sign in. Through it the agent saves your game's form, uploads builds and covers, publishes the sandbox and starts
  traffic campaigns. The skills tell it to ask you before anything public: publishing, starting traffic.
- **Uploads**: the build's zip and the covers go by HTTPS PUT to the one-hour upload links the server gives.
- **playgama-publish scripts** run on your machine: `precheck.mjs` reads the build's files and sends nothing;
  `pack.mjs` writes the zip; `covers.mjs` renders the covers in a local headless Chrome; `serve.mjs` serves the build
  on this computer only (127.0.0.1) for the QA Tool.
- **playgama-game-video** runs your game in a local headless Chrome to film it. Making a video folder downloads GSAP
  from jsDelivr and puppeteer from npm, and rendering runs HyperFrames through `npx`. A generated voice sends the
  script's lines, with your own key, to the service you choose (ElevenLabs, OpenAI, Google Gemini or Cartesia); the
  draft voice uses your system's speech instead. Its README has the details.

## Licence

The code and texts are licensed under the [Apache License 2.0](LICENSE). The Playgama and Playgama AI names and logos
belong to Playgama and are not covered by that licence: [TRADEMARKS.md](TRADEMARKS.md) says how you may use them.
[NOTICE](NOTICE) lists the copyright and the bundled fonts. Changes are in [CHANGELOG.md](CHANGELOG.md).
