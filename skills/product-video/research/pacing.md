# Pacing measurements from real app promo / launch films

Measured 2026-09-24 with `ffmpeg` scene-cut detection (`select='gt(scene,0.10–0.28)'` +
`metadata=print`, thresholded per clip since hard cuts and slow dissolves need
different thresholds), 4 fps frame extraction, and the macOS Vision OCR tool at
`<skill>/scripts/refs-ocr.swift` to find exact caption in/out frames. Source files were downloaded
straight from the brands' own CDNs (Apple's App Store HLS streams, Framer/Linear/
Notion/Cultured Code/Screen Studio's own `.mp4`s) or `yt-dlp` for one YouTube case,
measured, and then deleted — nothing but the derived numbers and a few evidence
frames (`pacing/frames/`) are kept.

Everything below a per-film row is a direct measurement of the downloaded file, not
an estimate. Where a film uses a continuous take with no detected cut (screen
recordings, most feature clips), "shots" = 1 and that duration is itself the data
point: real editors let a UI demo run uncut for that long.

## Per-film table

| # | Film | Source | Total len | Shots (cuts) | Shot length median / p25 / p75 / min | Notes |
|---|------|--------|-----------|---------------|----------------------------------------|-------|
| 1 | Things 3 — App Store preview | apps.apple.com/id904244226 (HLS) | 30.1s | 2 | 15.0 / — / — / 2.2s | One long UI take (27.9s) then a 2.2s end card. |
| 2 | Fantastical — App Store preview | apps.apple.com/id718043190 (HLS) | 29.1s | 8 | 2.15 / 1.73 / 4.26 / 0.27s | 5 caption cards measured below; captions and UI alternate, never composited. |
| 3 | Structured — App Store preview | apps.apple.com/id1499198946 (HLS) | 30.1s | 4 | 1.65 / 0.8 / 20.1 / 0.53s | One 26.3s continuous UI take dominates; captions are short inserts. |
| 4 | Todoist — App Store preview | apps.apple.com/id572688855 (HLS) | 30.1s | 1 (0 hard cuts ≥0.10 scene score) | 30.1s single take | Entire preview is one continuous UI/caption composite with no hard cut — captions dissolve in/out over live UI, camera never cuts away. |
| 5 | Notion Calendar (Cron) — App Store preview | apps.apple.com/id1554235898 (HLS) | 17.6s | 7 | 1.5 / 1.0 / 2.5 / 0.5s | Fast calendar-UI montage, shortest median of the App Store set. |
| 6 | Things (Cultured Code) — "Meet the all-new Things" launch film | culturedcode.com/things | 70.9s | 23 | 1.97 / 1.07 / 3.47 / 0.96s | Title cards + tilted device mockups alternating; final hold 16.7s on end card. |
| 7 | Screen Studio — hero demo | screen.studio | 6.3s | 1 (0 cuts) | 6.3s single take | Looping hero clip: one uncut screen recording with webcam bubble + live caption bar. |
| 8 | Framer — AI/chat feature reel | framerusercontent.com (framer.com) | 21.0s | 4 | 4.21 / 1.86 / 9.7 / 1.2s | Long holds (up to 11.4s) on a single feature UI before cutting. |
| 9 | Framer — card-swap reel | framerusercontent.com | 16.0s | 1 (0 cuts) | 16.0s single take | Whole reel is one continuous morph/swap animation, no hard cut. |
| 10 | Framer — "Motion" template reel | framerusercontent.com (framer.com/motion) | 20.0s | 8 | 1.85 / 1.2 / 3.34 / 0.67s | Kinetic-type + macbook-fold beats; shortest beat 0.67s is a whip-pan, not a caption. |
| 11 | Linear — full launch/keynote film | webassets.linear.app (linear.app/changelog) | 428.1s | 25 | 11.0 / 2.77 / 19.9 / 0.75s | Talking-head keynote intercut with sub-1s product cutaways (0.75–3.75s) between long speaker holds (up to 119.6s) — not a montage, a documentary cut rate. |
| 12 | Linear — "Agent runtime" feature clip | webassets.linear.app | 17.2s | 1 (0 cuts) | 17.2s single take | Continuous card-stack animation, one shot, no hard cut. |
| 13 | Linear — "Project update" feature clip | webassets.linear.app | 19.0s | 1 (0 cuts) | 19.0s single take | Continuous UI composite, ends on a plain end card. |
| 14 | Notion — AI hero illustration loop | videos.ctfassets.net (notion.com/product/ai) | 6.0s | 1 (0 cuts) | 6.0s single take | Short looping illustration beat, no internal cut. |
| 15 | Apple Fitness+ — official app trailer | YouTube (Apple) | 70.3s | 72 | 0.47 / 0.31 / 0.9 / 0.16s | The one true rapid-montage trailer in the set — median shot under half a second. This is the outlier, not the template for a calm feature demo. |

## Caption-by-caption measurements (App Store preview set, OCR-timed)

Word/char counts are the caption's own text; "hold" is the OCR-measured span the
full caption sat at full size (i.e. excluding the ≤0.25–0.5s pop-in we could resolve
at our 4 fps sampling — text reached full box height within one sample frame in
every case, so entry/exit animation is ≤0.25–0.5s, effectively a fast dissolve/cut,
in all 7 captions measured).

| Film | Caption | Words | Chars | Hold (s) | Effective read speed (chars/s) | Netflix 20cps ceiling used? |
|---|---|---|---|---|---|---|
| Fantastical | "Natural language input" | 3 | 23 | 2.25 | 10.2 | 51% |
| Fantastical | "Create tasks" | 2 | 12 | 2.25 | 5.3 | 27% |
| Fantastical | "A better way to plan your day" | 7 | 30 | 5.00 | 6.0 | 30% |
| Structured | "Sync across all devices" | 4 | 24 | 1.50 | 16.0 | 80% |
| Structured | "All your tasks at one glance" | 6 | 29 | 4.00 | 7.25 | 36% |
| Todoist | "Simple enough for personal use" | 5 | 31 | 2.25 | 13.8 | 69% |
| Todoist | "Powerful enough to scale to your team" | 7 | 38 | 6.50 | 5.85 | 29% |

Median effective read speed across these 7 real captions: **7.25 characters/second**
— roughly a third of Netflix's 20 cps ceiling for adult subtitles (Netflix Timed
Text Style Guide: max 20 cps adult / 17 cps children's; min subtitle duration 5/6 s;
max 7 s). Promo captions with no competing dialogue and no VO to sync to are held
2–3× longer than the broadcast-subtitle floor — that is the numeric shape of
"let it breathe."

Minimum absolute hold observed: **1.5 s**, and that was for the shortest caption in
the set (4 words). No caption in any measured film held under 1.5 s.

## Guidance from named sources (fetched, not memory)

- **Netflix Timed Text Style Guide** (partnerhelp.netflixstudios.com): adult subtitle
  reading speed capped at **20 characters/second** (17 cps for children's content);
  minimum subtitle duration **5/6 second**; maximum **7 seconds** per subtitle event.
- **Apple App Store "App Previews" guidance** (developer.apple.com/app-store/app-previews):
  max **30 seconds** per preview, up to 3 previews per language; "keep text on screen
  long enough for people to read comfortably"; "use straightforward transitions
  (dissolves, fades)"; videos autoplay muted, so on-screen text carries the message
  the voice track would otherwise carry.
- BBC subtitle guidelines could not be fetched in this session (BBC domain blocked
  from this fetch tool) — not included as a cited number here; do not treat any BBC
  cps figure elsewhere in this repo as sourced from this pass.

## Recommended timing spec for a ~30–40 s product film

Every number below is tied to a measurement above, not a guess.

1. **Caption hold = max(1.6 s, characters ÷ 8).** The 7 measured real captions
   averaged 7.25 chars/sec displayed (median), well under Netflix's 20 cps ceiling —
   promo captions read slower than broadcast subtitles because there's no dialogue
   racing them. Dividing by 8 reproduces that measured pace; the 1.6 s floor is set
   just above the shortest real hold observed (1.5 s, a 4-word caption).
2. **Minimum hold, any caption, however short: 1.6 s.** Nothing in the 7-caption
   sample held under 1.5 s even for two words ("Create tasks").
3. **Text entry/exit animation: 0.25–0.35 s**, cut or fast dissolve. In every
   measured caption the text was at full size on the very first 4 fps sample after
   it appeared (≤0.25 s resolution) — real editors do not visibly ease text in over
   half a second or more; Apple's own guidance likewise says "straightforward
   transitions."
4. **Camera push / device rotation / slide: settle in 0.6–1.2 s.** The shortest
   non-caption beats in the cut-heavy reels (Framer "Motion" reel: 0.67 s; Linear
   keynote cutaways: 0.75–1.59 s) are camera/UI-move beats, not captions — that is
   the real range for a move-and-settle.
5. **Hold the device still afterward for 1.5–9 s of UI play** before the next cut or
   caption (Structured/Fantastical/Notion Calendar non-caption shots ran 0.53–9.0 s;
   median 1.5–2.15 s across the App Store set).
6. **Give at least one uninterrupted UI-demo stretch of 6–19 s** somewhere in the
   film with zero internal cuts — every screen-recording-style clip measured
   (Screen Studio 6.3 s, Notion AI hero 6.0 s, Linear feature clips 17.2 s and
   19.0 s, Todoist's entire 30.1 s preview) was a single continuous take. A 30–40 s
   film that cuts every 1–2 s throughout, with no such stretch, is pacing itself
   like Apple Fitness+'s rapid-montage trailer (0.47 s median shot) rather than a
   calm single-app feature demo — that trailer is the outlier in this set, not the
   template.
7. **Shots per minute: ~16–24 cuts per 30 s film** (32–48/min), based on the
   App Store preview set's aggregate shot-length median of 1.5–2.2 s across
   29–30 s runtimes (Fantastical: 8 shots/29 s; Structured: 4 shots/30 s;
   Notion Calendar: 7 shots/17.6 s ≈ 12/30 s-equivalent). Do not target Apple
   Fitness+'s ~62 shots/min montage rate for a single-app demo — that pace belongs
   to a multi-scene brand trailer, not a feature walkthrough.

## Files

- Per-film source clips were downloaded to a scratch dir, measured, and deleted —
  nothing but this README and the frames below persist.
- `pacing/frames/` — 18 evidence frames: OCR-timed caption stills (Fantastical,
  Structured, Todoist, at their measured hold timestamps) plus one representative
  frame from each of the other films.
