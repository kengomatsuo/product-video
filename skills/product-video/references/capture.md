# Capture: real app motion, never stills where motion exists

## Contents

- Simulator takes
- Warm up, then record
- Checking a take
- Showing sync without faking it
- Build from HEAD, every take
- Repeatable flows
- Demo data
- Measuring

A screenshot inside a moving frame still reads as a slideshow. Every shot that shows the
product doing something is a recording of the product doing it.

| Platform | How | Script |
|---|---|---|
| iOS / iPadOS | Record the booted Simulator's screen with RocketSim at 60 fps, or `simctl` when RocketSim is missing or out of quota; drive the app with `rocketsim do` flows, goldie/argent, or by hand | `scripts/capture-ios.sh <out.mp4> <seconds> [udid]` |
| macOS app | Record the app's own window at Retina size | `scripts/capture-mac.sh "<App Name>" <out.mov> <seconds>` |
| Web app | Open the app in a browser window at 1440 x 900, record that window | `capture-mac.sh "Google Chrome" ...` |

`capture-ios.sh` sets the status bar to 9:41, full Wi-Fi and battery before recording and
clears it after. It records the device display only, through RocketSim's `video record`
when `rocketsim status` answers, and through `simctl io recordVideo` otherwise, with
`CAPTURE_BACKEND=simctl`, or when RocketSim fails (a `quota_exceeded` envelope leaves no
file). RocketSim writes a variable frame rate, so the script conforms it to constant 60
in limited-range `yuv420p`; `simctl` only writes frames when the screen changes. A recording of the Simulator WINDOW (toolbar, "Press esc to stop capture")
is never usable: the frame wraps a second phone.

Playwright's own `recordVideo` writes compressed WebM (its types say it scales to fit
800 x 800 by default), which is too soft for a promo. Record the real window instead.

## Simulator takes

- With more than one Simulator booted, `booted` records whichever it picks, possibly an
  idle one. Pass the UDID as the third argument.
- `simctl recordVideo` writes variable frame rate, only when pixels change. Convert
  before editing: `ffmpeg -i take.mov -vf fps=60,format=yuv420p -c:v libx264 -crf 12 take.mp4`.
- Start each take from the home screen: launching one app from another leaves a
  "◀ Settings" back link in the status bar.
- Seed demo data the way the app's own UI tests do (a launch argument that also resets
  data on every launch).
- A keyboard extension has to be added first: Settings > General > Keyboard > Keyboards >
  Add New Keyboard, then the app's row > Allow Full Access > Allow. Without Full Access
  the keyboard shows a banner in every frame.
- Run capture and the recorder under bash, never zsh. A zsh glob with no match aborts the
  `&&` chain and the take records nothing. Scripts that loop over a space-separated list
  also run under bash, because zsh does not split an unquoted variable.
- In a `while read` loop, ffmpeg reads the loop's stdin and eats the next line: pass
  `-nostdin`.
- Keep other tool calls out of a take: an agent launched mid-take delays the last tap
  past the end of the recording.
- Never launch a Debug build of a Mac app that shares the shipping bundle id: it writes
  seed data into the user's real library. A Mac preview needs a separate macOS user or a
  build with its own bundle id.
- iPad Simulator tool taps are in points: the 13-inch screenshot is 1.4535 px per point.
  A sheet moves up when the keyboard shows; screenshot again before the next tap, or a
  tap outside the sheet dismisses it.

## Warm up, then record

The first time a view appears in a process (menus, sheets, the colour picker, Liquid
Glass) iOS hitches, and `simctl recordVideo` shows it as frames held 200-360 ms. Run the
whole flow once before recording, reset the data inside the same process (delete the
test item through the app's own UI, reopen the app from the Home Screen so no back link
shows), then record. A warm take has far fewer hitches than a cold one, and the warm-up
surfaces one-off prompts (a review request) off camera.
Find the remaining hitches with a packet-time scan: gaps of 45-600 ms right after a 16 ms
interval are hitches; cut around them or leave them static.

Record one take per story in the order the film tells it, so the result the viewer waits
for is in the same take.

## Checking a take

- Taps land when the UI reacts, not when the tool call returns. Find each onset with
  `bun tools/onsets.ts take.mp4` (frames where motion starts after 0.3 s of stillness)
  and place the touch dot 2-3 frames before it.
- Tool latency makes waits long (a menu open for 4 s). Cut them out with segments and
  `rate`, on beats, instead of re-recording faster.
- Tool latency also stretches a flow. Record the flow's own length plus 50%, and check
  the last frame shows the result.
- `simctl recordVideo` can stop writing frames mid-take. Check the take's duration and
  last frame before cutting; retake when it is short.
- Check the facts of demo data before judging it: an IBAN is the number a person
  receives payments at, so a "Bank Account / IBAN" snippet is receiving data, not a card
  number.

## Showing sync without faking it

A sync scene shows the item arriving on the second device through the app's own code
path, recorded, never painted onto a screenshot. When the app reloads on a change
notification from its shared store (a Darwin notification), use that path. On the iPad
Simulator: read the new item from the iPhone Simulator's app-group plist, append it with
`simctl spawn <iPad> defaults write <group plist> <key> -data <hex>`, post the
notification with `simctl spawn <iPad> notifyutil -p <name>`, and record the grid as the
card fades in. Use this for Simulator demo data only; a seeded launch re-seeds it.

## Build from HEAD, every take

Rebuild and reinstall the app from the repository's current commit immediately before
recording any take that shows its UI, and put the short hash in the take's file name. A
build two changes old shows a look that no longer ships.

## Repeatable flows

Drive with RocketSim when it is installed (the `apple-native` skill, `references/rocketsim.md`, covers the `rocketsim` CLI): `rocketsim do --step "interact tap --label
'<control label>' --screen latest" --step "wait element --label '<result label>' --timeout 2"`. A
step names the control by its accessibility label, so one flow runs on iPhone and iPad
and survives a layout change; hand-measured coordinates drift off-frame. Native UI
resolves by name (for example Safari's Page Menu and an extension's row in it); a web page's own links do not appear in RocketSim's elements, so taps inside
a page use raw points with `--screen <hash>`. Record without RocketSim's `--touches` and draw the brand's
own dots from the flow's tap times. Without RocketSim, use the flows below.

goldie (`kacperkapusciak/goldie`, MIT) with argent (`software-mansion/argent`,
Apache-2.0) replays a written flow on the Simulator: the same taps every run, so a
re-capture after a UI change is one command. For more than two iOS shots, write flows.

## Demo data

Seed believable, made-up data before capturing: names, amounts and addresses a real user
would have. `ParthJadhav/ios-marketing-capture` (MIT) documents a demo-data seeder and the
traps: seed once, not per locale; view models set up before the seed hold stale data;
setting a sheet binding to nil does not dismiss it. Never show a real customer's data.

## Measuring

The tools measure every capture with ffprobe before render and pass its aspect in, so
the screen in the frame always matches the capture and no pixel of UI is cropped.
