---
name: playgama-ad
description: Monetize a website with Playgama Ad and keep it earning. Proposes the Playgama Ad SDK or Prebid.js with the playgama bidder and follows the user's choice, registers the site, sets up ad units and formats (banner, interstitial, rewarded), publishes ads.txt, wires the ads into the project, checks the integration and explains revenue changes from the account's own numbers. Use it whenever the user wants to add ads or monetization to a site, a web app or a web game, add or configure ad formats, check that Playgama ads work, or asks why ad revenue, CPM, fill or impressions changed, even if they never say "Playgama Ad", "SDK" or "MCP".
---

# Playgama Ad on a site

The Playgama Ad MCP server (`https://ads.playgama.com/mcp`, called `playgama-ad` in this plugin) is the account side:
the user's ad account and its CLID, sites, ad units, ads.txt, consent banner, banner refresh and revenue. Its tool
descriptions are the authority: read them and follow them. This skill is the other half: the work in the user's
project, and the order to do it in.

## Two ways to show the ads

| | Playgama Ad SDK (`ad_sdk`) | Prebid.js (`prebid`) |
|---|---|---|
| What runs on the site | Playgama's script | the site's own Prebid.js with the `playgama` bidder |
| Fits | a site with no ad stack of its own | a site that already runs Prebid.js |
| Ad units | placements are set up on Playgama's side | you create them with `create_ad_unit` |
| The CLID goes | into the SDK script's URL | into the bid's `publisherId` |

Each site has one integration; an account can hold sites of both. Look at the project first, say which one fits and
why, and let the user choose. Don't choose for them, and don't move a site to the other integration without asking:
`switch_site_integration` changes the lines the site must publish in its ads.txt.

## Read the live docs, not your memory

Both integrations change between releases. Read the current pages every time:

- **Playgama Ad:** `https://wiki.playgama.com/playgama-ad/llms.txt` indexes every page of its documentation, and
  adding `.md` to a page's URL gives its Markdown. The Standalone SDK page
  (`https://wiki.playgama.com/playgama-ad/integration/standalone-sdk.md`) has the script, initialization, every
  request method and the ad's states and events; the index also lists the pages on ads.txt, banner refresh and
  policy.
- **Prebid.js:** `https://docs.prebid.org/dev-docs/bidders/playgama.html` has the bid params, consent notes and what
  the adapter stores. The site's Prebid.js build must include the `playgamaBidAdapter` module: a build from npm
  imports it next to the site's other adapters (`prebid.js/modules/playgamaBidAdapter`), a downloaded build is made
  again with it selected. An old Prebid.js may not have the module yet; then the upgrade comes first, and it is the
  user's call.

## Before you start: the user signs in

If you see none of the server's tools (`get_ad_account`, `add_site` and the rest), the user connects it once: they
start the sign-in for the `playgama-ad` server from their agent's MCP settings, sign in to their Playgama account in
the browser that opens, or create one there and confirm its email, and allow the connection. There is no token to copy. Never ask for a password or a token in
the chat.

**The user can't sign in now.** Say what signing in is for (the account, its CLID, ad units, the ads.txt lines), and
do the part that needs no account: study the project, propose the integration, and prepare the code with a clearly
named placeholder where the CLID and the ad unit ids go. Never make up a CLID or an ad unit id. End with what is left:
sign in, add the site, put the real ids in, publish ads.txt.

## Adding monetization

1. **Study the project.** Find the site's HTML entry and the pages that will carry ads, any ad code already there
   (`pgAds`, `pbjs`, `googletag`, another network's tags), a consent platform, an existing `ads.txt`, and the domain
   the site is served from (ask if the project doesn't say). Note the natural pauses where a full-screen ad could go
   and the places a banner would fit without covering the content.
2. **Propose the integration and get the choice** (the table above). Say which formats you plan to place and where.
3. **Find or create the account.** `get_ad_account` answers the user's accounts. With none and
   `add_site_creates_account: true`, `add_site` with a `name`, the `domain` and the `integration`, and no `clid`,
   creates the account with its first site, in the user's cabinet when they own one. With none and
   `add_site_creates_account: false`, the user's cabinet has no publisher account and they may not add it: its Owner
   adds one in the cabinet, or Playgama does (partners@playgama.com). Tell them so and carry on with the part that
   needs no account. With one, `add_site`
   with its `clid` adds the site, unless the account lists it already. With several, ask which account the site
   belongs to.
4. **Terms.** When a tool answers `terms_required`, give the user the `terms_url` from the answer, wait until they
   say they have accepted, and call the tool again. You can't accept for them, and nothing else works around it.
5. **Ad units and the CLID.** Read `get_ad_account` again.
   - *Ad SDK:* `placements` lists the names the site may request as an ad's `type`; `any_placement: true` means every
     name is served. Use those names in the code. If a format the user wants has no placement, tell them: placements
     of an Ad SDK site are added on Playgama's side.
   - *Prebid.js:* create one ad unit for each slot with `create_ad_unit` (its description says which fields a Prebid
     account takes). The answer carries the generated id for the bid's `adUnitId`.
6. **Wire the ads in**, from the live docs, in the project's own style.
   - *Ad SDK:* the script with the account's CLID, one initialization, then the requests. Follow
     [references/placements.md](references/placements.md) for where each format goes. If the site already runs a
     consent platform, `set_cmp_source` with `partner`, so Playgama shows no second banner.
   - *Prebid.js:* add the `playgama` bid to each ad unit of the page, with the CLID as `publisherId` and the unit's id
     as `adUnitId`, the way the site's other bidders are added. Apply the bidder page's consent and storage notes to
     the site's Prebid config. Leave the other bidders, the price settings and the ad server calls as they are.
7. **ads.txt.** Each site in `get_ad_account` has `ads_txt.expected`: the lines to publish at
   `https://<domain>/ads.txt`. Add them to the file the site already has and keep every other seller's line. Or,
   when the account has an `ads_txt_url`, the site redirects `/ads.txt` to it and the user's other lines are kept
   there with `set_ads_txt_own_lines`. After the site is deployed, `check_ads_txt` says which expected lines are
   still missing.
8. **Check** against [references/checklist.md](references/checklist.md).
9. **Report** what you changed and where, what you checked and how, what only the live site can show, and what the
   user still has to do (deploy, publish ads.txt, accept terms).

## Changing formats on a site that already shows the ads

Start from `get_ad_account`, not from the code: it says what the account serves. Change ad units with
`create_ad_unit`, `update_ad_unit` and `delete_ad_unit`, and banner refresh with `set_ad_refresh`, which replaces the
whole map. Then make the code match. A unit deleted in the account while the page still requests it earns nothing, so
change the two together and say which one the user must deploy.

## Checking an integration

Go through [references/checklist.md](references/checklist.md) and answer in its two parts: what you verified, and
what needs the real environment. A check you could not run is not a pass.

## Revenue questions

"Why did revenue drop", "is this CPM normal", "what changed last week": follow
[references/revenue.md](references/revenue.md). Numbers come from `get_ad_revenue` and statuses from
`get_ad_account`. Keep what the numbers establish apart from what you suppose.

## What trips integrations up

- **A made-up id.** The CLID and ad unit ids come from the tools. A guessed one requests ads nobody serves.
- **Ads before initialization.** The Ad SDK takes requests only after its initialization has finished.
- **A reward without the event.** A rewarded ad's reward is given on the event the docs name for it, never on close
  or on a timer.
- **Showing an ad that isn't ready.** A full-screen ad is shown from its ready event; an empty answer must leave the
  page usable.
- **ads.txt replaced instead of extended.** Dropping the site's other sellers cuts their revenue.
- **Code and account out of step.** After switching integration or deleting a unit, the page still requests what the
  account no longer serves until the code changes too.
