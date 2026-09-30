# Phantom Demo — Build 138

A demo/LARP wallet UI. Not a real wallet: no keys, no chain, no custody.
Balances are local set dressing; only market prices are real.

## What is here
- `www/` — the built web app (open `index.html`, or `www/phantom-standalone.html` as a single file)
- `App.jsx` — full React source
- `.github/workflows/main.yml` — builds an unsigned **Phantom Demo.ipa** and attaches it to a release

## Build 138 changes
- Face ID removed again; the app opens straight to Home as before.
- Chart smoothing: the line is drawn as a Catmull-Rom spline, and the synthetic
  series carries momentum so it moves in runs instead of alternating every
  sample. Direction-reversals along the rendered path dropped from ~90 to 2.
- The series now starts from base/(1+chg) and lands on the live price by linear
  detrend, so it agrees with the header percentage (it could previously trend
  down on a token showing +4%) and no longer has a cliff at the right edge.
- The Trade button on any crypto token page now expands into Long/Short, as well
  as the Perps cards. Spot swap moved to the FAB's Trade option on Home.
- Perps Long/Short chooser. Tapping a Perps card opens that asset's page with the
  Trade button expanded in place: Long and Short stack above it at the same
  161x48 with 6pt gaps, and it becomes the close button (all measured off the
  app). Either side opens the amount screen titled 'Long BTC' / 'Short BTC'.
  Spot tokens are untouched - they still show Trade.
- Token page footer is now progressively frosted like the real app: content blurs
  and fades out underneath instead of meeting a hard black edge. Geometry taken
  from a 60fps capture - 32pt side padding, 161x48 pill, 38pt beneath it.
- Removed the fake time-axis labels under the chart; the real app draws none.
- Up/down colours are now Display-P3 aware. The reference screenshots are P3, so
  values sampled from them rendered dull as sRGB; red is out of sRGB gamut
  entirely. CSS custom properties serve color(display-p3 ...) on wide-gamut
  screens with sRGB fallbacks (#FF0029 / #00EB4B), and the charts, sparklines
  and arrow icons were unified onto the same two colours.
- Explore Markets removed from Home: it now runs holdings -> Perps ->
  Predictions -> Watchlist, matching the app.
- Bump stretched to 4x the reference: handoff at 932ms (tau1 400), settling by
  ~1.4s. Phase 1 is nearly stationary by the handoff, so the lurch is ~16x the
  preceding velocity. Clean (non-refreshing) releases still run tau 100.
- Release is now the real app's exponential decay (tau 100ms, measured 96-103ms
  across three releases) driven imperatively, so dragging never re-renders Home.
- Reproduces the mid-collapse bump: for 233ms the release settles toward a point
  25.6% of the travel above rest, then re-targets to rest and decays again. Only
  on a pull that refreshes, matching its cause (a reflow when data lands).
- Pull-to-refresh retimed against a 60fps capture of the real app: release runs
  600ms on cubic-bezier(.05,.25,.4,1) (halfway ~135ms, 90% ~380ms, long settle),
  and the pull now uses the real iOS rubber band L*d/(d+L), L = 0.55 x viewport
  height, so a hard pull reaches ~230pt instead of hitting a 180pt ceiling.
- Token page: real "Price history unavailable for this time range" empty state
  (line art + sparkles, measured off the app) instead of inventing a chart for a
  token with no price. Holding card now shows symbol + Open pill, value, amount
  and Today's Return; Send/Receive pair; Market Cap and Network rows.
- Pull-to-refresh: no spinner and no loading state. Pulling slides content over
  black with progressive rubber-band resistance (tops out ~173pt, measured off the
  real app frame-by-frame); releasing glides it back over ~520ms on a soft
  decelerate and prices update in place. The screen never blanks.
- Orientation locked to portrait on every path (native Info.plist, web manifest,
  Screen Orientation API, and a CSS counter-rotation fallback for iOS Safari).

## Running the IPA workflow
Actions → *Build Phantom Demo IPA* → **Run workflow**. The IPA lands in the run's
artifacts and in a release tagged `build-126`. It is unsigned, so it needs
sideloading with your own Apple ID.
