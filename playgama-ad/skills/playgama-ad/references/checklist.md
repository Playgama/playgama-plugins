# Integration checklist

Run the project the way it runs for a player (its dev server or a static server over the build), open it in a
browser and watch the console and the network panel. Answer in two parts: what you verified here, and what needs the
real environment. A line you could not check goes into the second part with the reason, never into the first.

## 1. The ad code loads

- **Ad SDK:** the SDK script request answers 200 and carries the account's CLID; `window.pgAds` exists afterwards.
- **Prebid.js:** the site's Prebid.js build includes the `playgama` bidder (`pbjs.installedModules` lists
  `playgamaBidAdapter`, or the build's imports or module list do), and every ad unit that should sell to Playgama
  carries a `playgama` bid. Where the build has the consent or storage modules the bidder page names, their settings
  let `playgama` through.
- The CLID and every ad unit id in the code are the ones `get_ad_account` answers. No placeholder is left.

## 2. Initialization

- **Ad SDK:** initialization runs once, before any request, and its promise resolves. A second initialization on
  navigation inside a single-page app is a bug.
- Nothing of the site waits for an ad to start: with the ad code blocked, the page still loads and works.

## 3. Showing ads

For each format the project uses:

- **Banner:** the request names a placement the account serves and an element that exists and has a size; the slot
  keeps its space.
- **Interstitial:** requested at a natural pause, shown from its ready event; what plays (a game, a video) pauses
  and mutes, and resumes on the closed event.
- **Rewarded:** started by the visitor's button; the reward is given on the reward event only; closing early gives
  nothing.
- **Prebid.js:** with `?pbjs_debug=true` on the page, the console shows the `playgama` bid request for each ad unit
  and what came back.
- **Ad SDK:** `?pg_devtools=1` on the page opens the ad panel, with every placement and its impressions as they
  happen.

## 4. When things go wrong

- **No ad.** The empty event leaves the page usable at once: no frozen screen, no endless spinner, no reward.
- **The script fails to load** (block its request, or go offline): no uncaught error, the page works, ad buttons
  hide or say there is no ad.
- **Repeated calls.** Pressing an ad button twice, or reaching two pauses quickly, does not stack two ads or two
  rewards. A request in flight is not started again.
- **Listeners.** Event handlers are attached once per ad, not once more on every request.

## 5. The account side

- `get_ad_account` shows the site with the integration the code uses.
- `check_ads_txt` reports no missing lines for the site, once it is deployed.
- No integration of the site is waiting for its terms (`terms_to_accept`).

## What needs the real environment

Say these plainly instead of guessing them:

- **Real ads and fill.** A local page or a domain that is not registered in the account may get no ads at all. Empty
  answers there say nothing about the live site.
- **ads.txt.** It is checked on the registered domain, after deployment.
- **Revenue and impressions.** They appear in `get_ad_revenue` only after real traffic, with a delay.
- **The consent banner.** Whether it shows depends on the visitor's region.
- **Other devices and browsers** than the one you ran.
