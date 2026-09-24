# Capture: real app motion, never stills where motion exists

A screenshot inside a moving frame still reads as a slideshow. Every shot that shows the
product doing something is a recording of the product doing it.

| Platform | How | Script |
|---|---|---|
| iOS / iPadOS | Record the booted Simulator's screen, then drive the app: goldie/argent flows (repeatable), the iOS Simulator tool, or by hand | `scripts/capture-ios.sh <out.mov> <seconds>` |
| macOS app | Record the app's own window at Retina size | `scripts/capture-mac.sh "<App Name>" <out.mov> <seconds>` |
| Web app (solute) | Open the app in a browser window at 1440 x 900, record that window | `capture-mac.sh "Google Chrome" ...` |

`capture-ios.sh` sets the status bar to 9:41, full Wi-Fi and battery before recording and
clears it after. It records with `simctl io recordVideo`, which captures the device
display only. A recording of the Simulator WINDOW (toolbar, "Press esc to stop capture")
is never usable: the first Cutling test had one and the frame wrapped a second phone.

Playwright's own `recordVideo` writes compressed WebM (its types say it scales to fit
800 x 800 by default), which is too soft for a promo. Record the real window instead.

## Traps from the Cutling session (2026-09-24)

- With more than one Simulator booted, `booted` records whichever it picks: the first
  Cutling take recorded an idle iPad. Pass the UDID as the third argument.
- `simctl recordVideo` writes variable frame rate, only when pixels change. Convert
  before editing: `ffmpeg -i take.mov -vf fps=60,format=yuv420p -c:v libx264 -crf 12 take.mp4`.
- Start each take from the home screen: launching one app from another leaves a
  "◀ Settings" back link in the status bar.
- Seed demo data the way the app's own UI tests do (Cutling: launch argument
  `-SNAPSHOT_MODE`, which also resets data on every launch).
- A keyboard extension has to be added in Settings > General > Keyboard > Keyboards
  first. Turn on "Allow Full Access" in the Simulator yourself, or the keyboard shows a
  Full Access banner in every frame.
- Start the recorder under bash, never zsh: a zsh glob with no match aborts the `&&`
  chain and the take records nothing.
- Keep other tool calls out of a take: an agent launched mid-take delayed the last tap
  past the end of the recording.
- Never launch a Debug build of a Mac app that shares the shipping bundle id with seed
  data: it writes into the owner's real library.
- Taps land when the UI reacts, not when the tool call returns. Find each onset with
  `bun tools/onsets.ts take.mp4` (frames where motion starts after 0.3 s of stillness)
  and place the touch dot 2-3 frames before it.
- Tool latency makes waits long (a menu open for 4 s). Cut them out with segments and
  `rate`, on beats, instead of re-recording faster.

## Warm up, then record (owner, 2026-09-24)

The first time a view appears in a process (menus, sheets, the colour picker, Liquid
Glass) iOS hitches, and `simctl recordVideo` shows it as frames held 200-360 ms. Run the
whole flow once before recording, reset the data inside the same process (delete the
test item through the app's own UI, reopen the app from the Home Screen so no back link
shows), then record. The Cutling warm take had 16 hitches over 40 ms, against 36 cold.
The warm-up also surfaces one-off prompts (a review request appeared) off camera.
Find the remaining hitches with the packet-time scan in the Cutling session: gaps of
45-600 ms right after a 16 ms interval are hitches; cut around them or leave them static.

Record one take per story in the order the film tells it (Cutling: name, text, colour,
save), so the result the viewer waits for, the new card, is in the same take.

## Showing sync without faking it

A sync scene shows the item arriving on the second device through the app's own code
path, recorded, never painted onto a screenshot (owner, 2026-09-24). Cutling reloads its
grid when its shared store changes and the Darwin notification
`com.matsuokengo.Cutling.cutlingsChanged` fires, the path keyboard edits and iCloud merges
take. On the iPad Simulator: read the new item from the iPhone Simulator's app-group plist,
append it with `simctl spawn <iPad> defaults write <group plist> savedCutlings -data <hex>`,
post the notification with `simctl spawn <iPad> notifyutil -p <name>`, and record the grid
as the card fades in. Simulator demo data only; snapshot mode re-seeds it on launch.

## Repeatable flows

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
