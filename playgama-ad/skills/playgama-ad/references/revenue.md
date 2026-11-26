# Reading revenue

Every figure comes from the tools. `get_ad_revenue` answers, for each account: totals, a row per UTC day, and a row
per ad unit with its placement — requests, impressions, clicks and net revenue, with fill and net CPM in the totals.
`get_ad_account` answers the statuses: each site's ads.txt check, the account's stage and its ad units.

## The method

1. **Name the measure and the two periods.** "Revenue dropped" becomes net revenue for one range against another of
   the same length and the same weekdays: last 7 days against the 7 before, not a Monday against a Sunday, and not a
   week with a holiday against a plain one without saying so. The current day is incomplete: leave it out or say it
   is partial. Ask for both ranges with `from` and `to`; a range reaches back 90 days at most.
2. **Split revenue into its parts.** Net revenue = impressions × net CPM ÷ 1000, and impressions = requests × fill.
   For both periods put side by side: requests, impressions, fill, net CPM, revenue. One of them moved first:
   - **requests fell** — fewer ad calls reached Playgama: less traffic, a release that calls ads less often, a
     broken or removed integration, a consent change;
   - **requests held, fill fell** — the calls came and fewer were answered: demand, floors, an ads.txt problem;
   - **impressions held, CPM fell** — the same number of ads sold for less: season, geography or device mix,
     an ads.txt problem, a format mix that moved to cheaper placements.
3. **Find where.** The per-day rows give the day the change began. The per-unit rows show whether one placement
   carries the change or all of them do. A change on one unit points at that unit's code or settings; a change
   everywhere points at traffic, the account or the market.
4. **Read the statuses.**
   - *ads.txt:* a site's `last_check` with missing lines or a fetch error means buyers may not accept the site's
     inventory. Run `check_ads_txt` for a fresh answer.
   - *Stage:* the account's stage sets which demand competes for its impressions. A lower stage has less of it.
   - *Ad units:* a disabled or deleted unit, or a floor raised recently, shows as lost fill on that unit.
5. **Look at the project when the numbers point there.** A drop in requests that begins on a release day sends you
   to the code: what changed in when and how often ads are requested.

## Facts and suppositions

The tools establish what happened to requests, impressions, fill, CPM and revenue, on which days and on which units,
and what the statuses are now. They don't establish why traffic fell, what buyers decided, or what the user changed
on the site. State the first as fact with its figures. Offer the second as something to check, with the check named:
"requests halved on the 14th on every unit — was there a release that day?" Never present a supposition as the cause.

A small account moves a lot from day to day. Before calling a change real, look at whether the earlier days swing as
widely.

## The answer

Four parts, in this order:

1. **What changed, and over which period**: the measure, both ranges, the size of the change.
2. **Which figures explain it**: the part that moved (requests, fill or CPM), where (days, units), with numbers.
3. **What is established and what needs checking**: facts from the tools, then suppositions, each with its check.
4. **What to do next**: the one or two steps that would confirm the cause or fix it, and who does them.

Keep it short. Give figures the user can find in their cabinet, not derived indices of your own.
