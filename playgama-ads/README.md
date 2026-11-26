# Playgama Ad

Monetize your site with [Playgama Ad](https://wiki.playgama.com/playgama-ad)
from your coding agent. The plugin connects the agent to the Playgama Ad MCP server, so it works with your ad account:
registers the site, sets up ad units, ads.txt and the consent banner, and reads the revenue. Its skill does the work in
your project: wires the ads in, checks the integration and explains revenue changes.

Try:

- "Add Playgama ads to this site."
- "Check that the Playgama ads on my site are set up correctly."
- "How did my Playgama ad revenue change last week?"

## What's inside

| Part | What it does |
|---|---|
| **Playgama Ad MCP server** (`playgama-ads`) | Your ad account: its CLID, sites and their integration, ad units, the ads.txt lines to publish and the check of them, consent banner source, banner refresh, and requests, impressions, clicks and net revenue by day and by ad unit |
| **playgama-ads** | Looks at the project, proposes the Playgama Ad SDK or Prebid.js with the `playgama` bidder and follows your choice, registers the site, wires the ads in from the live documentation, checks the integration against a checklist, and reads revenue by a fixed method |

## Install

**Claude Code:**

```
/plugin marketplace add Playgama/playgama-plugins
/plugin install playgama-ads@playgama-plugins
```

or for one session only, from a clone of this repository: `claude --plugin-dir /path/to/playgama-plugins/playgama-ads`.

**Codex:**

```bash
codex plugin marketplace add Playgama/playgama-plugins
codex plugin add playgama-ads@playgama-plugins
```

**Google Antigravity:** the manifest is in `.antigravity-plugin/` and the server in `mcp_config.json`.

**First use.** Sign in to Playgama once, in the browser that opens, and allow the connection: in Claude Code run
`/mcp` and choose `plugin:playgama-ads:playgama-ads`; in Codex run `codex mcp login playgama-ads`. There is no token
to copy. A Playgama account without an ad account gets one when the agent adds its first site.

## What it needs

- A Playgama account.
- A site you can change and deploy, and its domain: ads.txt is published there.

## What it runs and sends

- **The MCP server** at `https://ads.playgama.com/mcp` acts on your own ad account only, after you sign in. Through it
  the agent adds, switches and removes sites, creates, edits and deletes ad units, sets the consent banner source,
  banner refresh and your own ads.txt lines, and asks Playgama to fetch a site's public ads.txt. Tools that replace or
  remove something are marked destructive, so your client asks first.
- **Terms.** The agent can't accept an integration's terms: the tool answers a link, and you accept in the browser.
- **The skill** runs nothing of its own: it has no scripts and no hooks. It reads Playgama's public documentation and
  the Prebid.js bidder page, and edits your project's files as any coding task does.

## Licence

The code and texts are licensed under the [Apache License 2.0](../LICENSE). The Playgama names and logos belong to
Playgama and are not covered by that licence: [TRADEMARKS.md](../TRADEMARKS.md) says how you may use them. Changes are
in [CHANGELOG.md](CHANGELOG.md).
