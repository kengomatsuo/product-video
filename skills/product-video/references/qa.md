# Checking a video

Gates catch broken, not boring (product-launch-motion law 9). Run the tools, then look.

| Step | Command | What it proves |
|---|---|---|
| Stills | `bun tools/stills.ts [--preset x]` | each beat just after it settles and at its middle; one bundle, seconds per run |
| Draft | `bun tools/render.ts --draft` | timing and pacing at half scale |
| Final | `bun tools/render.ts [--preset x]` | the deliverable, motion blur on |
| Check | `bun tools/check.ts [--preset x]` | size, fps, frame count, pixel format, App Store rules, a contact sheet, pops |

Each row is a loop: run it, fix every problem it reports in the composition or the render
settings, render the next version, run it again, and go on only when it passes. A final
master is a new version every time (`master.sh` never overwrites).

`check.ts` flags a pop when one frame differs from the previous far more than the clip's
norm outside a beat boundary. Look at a dense contact sheet around each flagged frame
before calling it a false alarm.

## Look at these every time

- Every still, opened, before a full render.
- No device or card reaches the frame edge in any cut: render with a transparent background and measure the
  content box per frame (3% margin, each cut placed on its own, a phone-width cut included).
- The contact sheet `out/sheet.png` of the delivered file, not the source.
- Any frame where a capture meets its frame: nothing of the UI cropped, no halo.
- The first and last frame of every beat: nothing still arriving when it cuts (product-launch-motion law 7).
- Caption timing against the reading-speed rule in `copy.md`.
- Every delivered file comes out of `tools/master.sh` and passes `tools/check.ts`. A
  hand-written master can pass Remotion's full-range `yuvj420p` through, and App Store
  Connect then fails the previews with a bare `ASSET_FAILED`.
- Overlays (chips, captions, routes) keep a measured gap from every device's bounding
  box in every frame.
- Captures match what viewers see: the layout the user names (for example a browser's
  bottom-bar layout) and a key, frontmost Mac window so selections show the accent colour.
- A device's pose is proved in the film's own full frames at every state change (closed,
  opening, open), never only in a separate side view.
- After removing or changing any camera key, step through every frame (30 fps) across
  the edited beat; a deleted zoom can leave a one-frame snap.
- Every screen shows its planned content: no browser error page, blank panel or
  development address (`localhost`, `.test`, a port). OCR each second for them, and
  after a recapture compare every scene against the last approved cut; a scan for
  `localhost` alone misses an error page.

## Sound

- Loudness of the delivered file: -14 LUFS plus or minus 0.5, true peak at most -1 dBTP
  (product-launch-motion definition of done). Measure with
  `ffmpeg -i out.mp4 -af loudnorm=print_format=summary -f null -`.
- A sound effect must be measurably present in the delivered file, not only in the source.
- You cannot hear the result. Say so to the user, with the numbers.

## Sound complaints

When the user says the music sounds wrong, measure before blaming either side: RMS per
band (<90 Hz, 90-250, 250-2k, >2k) of the source track at the used offset against the
delivered file. A match within 0.3 dB in every band means the render is clean and the
track is the problem. Say which it is with the numbers.

## Handing over

The user watches on a phone, through the app's file card:
- The inline player starts muted: say "unmute" in the caption, every time.
- Send a phone copy under ~4 MB (720p, 30 fps, CRF 26, AAC 160k), named `<master>.phone.mp4` beside the master so the house hook finds the master's check.ts pass. A larger file can time
  out and never reach the phone; the master stays in `out/` for upload.
- Music choices go as one audio reel (MP3; an `.m4a` does not play in the remote app), a spoken number before each 15-20 s sample
  (`say -v Samantha "<n>. <title>"`), cut from the track's main section, never its intro.
- Report the loudness and peak of the delivered file; you cannot hear it.

The MP4, the project folder, what was checked, what was fixed, and what was not checked.
