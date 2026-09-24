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
