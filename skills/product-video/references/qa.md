# Checking a video

Gates catch broken, not boring (PLM law 9). Run the tools, then look.

| Step | Command | What it proves |
|---|---|---|
| Stills | `bun tools/stills.ts [--preset x]` | each beat just after it settles and at its middle; one bundle, seconds per run |
| Draft | `bun tools/render.ts --draft` | timing and pacing at half scale |
| Final | `bun tools/render.ts [--preset x]` | the deliverable, motion blur on |
| Check | `bun tools/check.ts [--preset x]` | size, fps, frame count, pixel format, App Store rules, a contact sheet, pops |

`check.ts` flags a pop when one frame differs from the previous far more than the clip's
norm outside a beat boundary. Look at a dense contact sheet around each flagged frame
before calling it a false alarm.

## Look at these every time

- Every still, opened, before a full render.
- The contact sheet `out/sheet.png` of the delivered file, not the source.
- Any frame where a capture meets its frame: nothing of the UI cropped, no halo.
- The first and last frame of every beat: nothing still arriving when it cuts (PLM law 7).
- Caption timing against the reading-speed rule in `copy.md`.

## Sound

- Loudness of the delivered file: -14 LUFS plus or minus 0.5, true peak at most -1 dBTP
  (PLM definition of done). Measure with
  `ffmpeg -i out.mp4 -af loudnorm=print_format=summary -f null -`.
- A sound effect must be measurably present in the delivered file, not only in the source.
- You cannot hear the result. Say so to the owner, with the numbers.

## Handing over

The MP4, the project folder, what was checked, what was fixed, and what was not checked.
