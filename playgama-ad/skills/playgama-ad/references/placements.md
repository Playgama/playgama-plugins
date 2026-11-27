# Where each format goes

An ad earns when a visitor sees it and the site stays worth coming back to. Place for both.

## Banners

- **In view.** A banner earns when it is on screen: put it where the visitor looks while the page is open, not below
  the fold of a page nobody scrolls, and not in a container that is hidden or collapsed.
- **Never over the content.** A banner that covers controls or what the visitor came for gets accidental clicks and
  loses visitors. Give it its own space beside, above or below the content.
- **A fixed slot.** Reserve the banner's size in the layout, so the page doesn't jump when the ad arrives or when
  nothing comes. Hide or collapse the slot on the ad's empty event if the design needs it.
- **Few and useful.** Each banner is a request and a script running next to the page's own code. Two or three slots
  that are seen beat six that aren't, and a heavy page shows its content later.
- **Refresh is a setting, not a timer of yours.** An Ad SDK banner refreshes at the interval the account sets
  (`set_ad_refresh`) or the request's own `refresh`. Don't re-request banners on a timer: refreshing a banner nobody
  sees lowers what every impression is worth.

## Interstitials

- **At natural pauses**: between pages or sections; in a game, at a level's end or game over. Never in the middle of
  what the visitor is doing, and never on a timer of the site's own.
- **Pause and mute what plays** (a game, a video) while the ad shows, and resume on its closed event.
- **No ad is normal.** On the empty event the visitor goes on at once: no waiting screen, no retry loop.
- **Preroll** (`interstitial_preroll`) goes before the content starts, once.

## Rewarded

- **The visitor chooses.** A rewarded ad starts from a button the visitor presses, and the button says what they
  get. Never start one by itself.
- **The reward follows the reward event**, and only it. A visitor who closes early gets nothing; one who watched
  gets exactly what the button promised.
- **Show the button only when it can work.** When no ad is available, hide or disable it, or say to try later; a
  button that does nothing reads as a bug.
- **Keep the site fair without it.** Rewards that speed things up or give extras work; content that can't be reached
  without watching ads drives visitors away.
