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

## Sound complaints

When the owner says the music sounds wrong, measure before blaming either side: RMS per
band (<90 Hz, 90-250, 250-2k, >2k) of the source track at the used offset against the
delivered file. Cutling v4 matched within 0.3 dB in every band, so the render was clean
and the track's kick was the problem. Say which it is with the numbers.

## Handing over (learned 2026-09-24)

The owner watches on a phone, through the app's file card:
- The inline player starts muted: say "unmute" in the caption, every time.
- Send a phone copy under ~4 MB (720p, 30 fps, CRF 26, AAC 160k). A 7.4 MB file timed
  out after 30 s and never reached the phone; the master stays in `out/` for upload.
- Music choices go as one audio reel (m4a), a spoken number before each 15-20 s sample
  (`say -v Samantha "<n>. <title>"`), cut from the track's main section, never its intro.
- Report the loudness and peak of the delivered file; you cannot hear it.

The MP4, the project folder, what was checked, what was fixed, and what was not checked.
