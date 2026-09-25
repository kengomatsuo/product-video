# Cutling promo audio — research and candidates

25s App Store preview + promo for Cutling (iOS clipboard manager, custom keyboard). Research is
read-only: nothing below has been downloaded yet. All page loads were verified live on
2026-09-24.

## 1. Craft: what the primary sources actually say

### Apple's own App Preview audio spec

Fetched directly from Apple Developer (`developer.apple.com/help/app-store-connect/reference/app-preview-specifications/`):

- Audio is **optional**, but if present: **stereo, AAC, 256 kbps or higher, 44.1 kHz or 48 kHz**.
- Either 1 track with 2-channel stereo (L+R) or 2 tracks with 1-channel stereo each.
- All audio tracks must be enabled.
- Video: H.264 or ProRes 422 HQ, 10–12 Mbps target bitrate, up to 30 fps, 15–30s duration,
  500 MB max, `.mov/.m4v/.mp4`.
- Apple does **not** publish a LUFS target for App Preview audio — that constraint comes from
  where the video is watched (App Store playback, but also re-cut for social), so the practical
  move is to master to the universal social/streaming target below rather than guess.

### Loudness target: −14 LUFS / −1 dBTP

Confirmed on the platforms' own pages:

- **Spotify** (`support.spotify.com/us/artists/article/loudness-normalization/`): *"We adjust
  tracks to −14 dB LUFS, according to the ITU 1770 standard."*
- YouTube and Amazon Music normalize to the same −14 LUFS; Apple Music targets −16 LUFS but only
  turns a −14 LUFS file down ~2 dB, which is a negligible dynamics cost. −1 dBTP true peak is the
  standard ceiling so AAC/lossy transcodes on any of these platforms don't produce inter-sample
  overs.
- This matches the `product-launch-motion` skill's own mastering target (see below), so −14 LUFS
  integrated / ≤ −1.0 dBTP is the number to hit for both the App Store Connect upload and any
  social cut (Instagram/TikTok/YouTube Shorts) made from the same master.

### `product-launch-motion` skill — `references/07-sound-and-master.md`

Read in full at `<refs>/skills/AbubakrChan-product-launch-motion--root/references/07-sound-and-master.md`.
Key rules, verbatim numbers:

- **Three layers**: narration (loudest, N/A here — Cutling's promo has no VO), **music bed at
  ~0.1 of full scale** ("if you notice it, it is too loud"), **SFX individually placed and
  measured**.
- **Volume-arithmetic law**: a cue's gain cannot rescue a quiet source file — summing a −38 dB
  asset into a −17 dB bed changes the total by ~0.01 dB. Level the *asset* (trim to the first
  transient, gain, limit), don't just crank the cue volume.
- **Cut from the first transient, not from zero** — trimming field-recorded SFX from `-ss 0`
  bakes in room-tone silence and the cue lands late.
- **Sub-bass + silence on the hero beat**: one low hit (1.7–1.8s, gain 0.2–0.22) under the logo
  reveal/CTA, preceded by ~0.3s of near-silence. Never on a regular product beat.
- **Mastering is two ffmpeg passes** because `loudnorm` must measure before it can correct:
  ```bash
  # pass 1 — measure
  ffmpeg -i raw.mp4 -af loudnorm=I=-14:print_format=json -f null -
  # pass 2 — correct + limit + re-encode (video re-encoded too, not copied)
  ffmpeg -i raw.mp4 \
    -c:v libx264 -preset slow -crf 19 -tune film -pix_fmt yuv420p \
    -af "loudnorm=I=-14:TP=-1.0:LRA=7:linear=true:measured_I=…:measured_TP=…:measured_LRA=…:measured_thresh=…,alimiter=limit=0.891:level=disabled:attack=5:release=50" \
    -c:a aac -b:a 192k -movflags +faststart out.mp4
  ```
  Two traps: `linear=true` computes one gain from pass-1 measurements, so a cue added *after*
  measuring can clip — a limiter after `loudnorm` catches it. And `alimiter` applies makeup gain
  unless `level=disabled` is passed, or it quietly raises the whole mix ~1 dB.
- **Verify the delivered file**, not the filter graph's own report:
  `ffmpeg -i out.mp4 -af ebur128=peak=true:framelog=quiet -f null -` should read
  `I: -14.0 LUFS`, `Peak: ≤ -0.8 dBFS`.
- **Licensing**: freeze the SFX/music kit locally, record the licence, prefer sources with a
  blanket commercial licence — "a launch film that has to be pulled because a bed was licensed
  for personal use only is an expensive way to learn this."

### Remotion `@remotion/media` `<Audio>` — volume curves and ducking

Fetched from `remotion.dev/docs/media/audio` and `remotion.dev/docs/audio/volume` (primary
docs):

- `<Audio src волume={...}>` — `volume` accepts either a static 0–1 number or **a function of
  frame** for a per-frame curve: `volume={(f) => interpolate(f, [0, fps], [0, 1], {extrapolateLeft: 'clamp'})}`.
  `f` restarts at 0 when that `<Audio>` mounts (not `useCurrentFrame()`), which matters when the
  music bed and a cue start at different points on the timeline.
- Passing a function (rather than reading `useCurrentFrame()` inside the component) lets
  Remotion draw the volume curve in Studio and is more performant — this is the documented way
  to do fades and ducking (duck the bed under a cue by dipping the interpolated value for that
  cue's window, then returning to the bed floor).
  Other relevant props: `trimBefore/trimAfter` (frame-based trim), `playbackRate`, `loop`,
  `muted`. Default output is capped at volume 1 in Remotion Studio (browser can't amplify);
  `useWebAudioApi: true` (+ `crossOrigin="anonymous"` + CORS-enabled source) removes that cap for
  rendering.
- Practical mapping for Cutling: music bed volume curve stays near the skill's ~0.1 floor, dips
  further (duck) under any transition whoosh/riser, and the two SFX layers (taps/clicks vs.
  whoosh/riser/hit) get separate `<Audio>` tracks so their gains can be tuned independently
  without touching the bed.

### BPM choice for a tech promo

Tempo-by-genre references (Chosic, Ableton's own Learning Music tempo guide, and DJ/tempo
references) converge on: pop sits ~118–128 BPM, house/dance-pop ~120–130, **tech house has one
of the tightest bands at 124–132**, and general "upbeat corporate" mid-tempo material sits
100–120 BPM (walking-pace energy without being exhausting). **100–124 BPM is the sweet spot for
a clean, minimal, non-cheesy tech product cut** — high enough to read as "upbeat," low enough to
stay out of club/EDM territory that would clash with a calm UI demo.

### Cutting on beats / structure for a 25s cut

Cross-referencing `07-sound-and-master.md`'s cue-table method with the tempo above: build a
frame-relative cue table keyed to the *word or beat it punctuates* (not raw seconds, since a
re-cut moves seconds but not beats), one cue per visible event (not one per element — six cards
landing get one staggered pop, not six), nothing repeating more than twice in 25s, and a
deliberate ~0.3s near-silence before the final riser + hit on the logo reveal.

## 2. Sourcing: licence comparison (verified on each provider's own page, 2026-09-24)

| Provider | Commercial use | Attribution | Account needed | App Store preview / social ads | Source checked |
|---|---|---|---|---|---|
| **Mixkit** (Envato) | Yes — "commercial and non-commercial projects for free" | **Not required** (appreciated, not mandatory) | **No** — direct download, no login | Music: Podcasts, Social Media, **Online marketing ads**, Educational, YouTube (not TV/radio/CD/DVD/games). SFX: broader — also games, film, CD/DVD, TV/radio. Both cover an App Store preview and social ad cut. | Live "View License" modal on [mixkit.co/license](https://mixkit.co/license/) |
| **Pixabay** | Yes, "for commercial or non-commercial purposes" | **Not required** (appreciated) | **No** — confirmed live: clicked Download on a track page while logged out, download started immediately | Not itemised by use-case; general grant covers marketing/promo video. Cannot be sold standalone/unmodified, and can't use content with recognisable trademarks in ads for goods/services (not relevant to Cutling — it's user-uploaded generic music). | [pixabay.com/service/license-summary](https://pixabay.com/service/license-summary/) |
| **Freesound — CC0 only** | Yes, "you could even sell the sound" | **Not required for CC0** ("zero" license) | **Yes — account required to download**, even for CC0 sounds ("To download a sound, first make sure you are logged into your registered account"). Free to create, but this fails a strict "no account" bar. | CC0 has no restriction, but every non-CC0 sound on the site (CC-BY, CC-BY-NC) does require attribution/excludes commercial use — must filter to CC0 specifically, which the search URL below does. | [freesound.org/help/faq](https://freesound.org/help/faq/) |
| **Uppbeat** | Free plan: yes, but conditional | Free plan **requires** a per-video attribution code pasted into the description; only paid plans remove it | Account required for the free credit system | Excluded — attribution requirement fails the "no attribution" bar for a polished App Store preview | Uppbeat's own commercial-license FAQ |
| **YouTube Audio Library** | Standard-licence tracks are **YouTube-only** (can't be reused in an App Store preview or on other socials); only the CC-BY subset is portable, and that subset requires attribution | Depends on track (mixed) | **Requires a Google account** | Excluded — fails "no account" bar outright, and most tracks fail "usable anywhere" for an App Store preview | YouTube Studio's own Audio Library terms |
| **Apple** | N/A | — | — | Apple doesn't provide a royalty-free music/SFX library for developers to use in App Previews | — |

**Conclusion: Mixkit and Pixabay are the only two sources that clear every bar** (no attribution,
no account, commercial use, safe for an App Store preview and social ads) with zero conditions.
Freesound CC0 is added as a third source for SFX variety, with the account-for-download caveat
flagged wherever it's used below — decide per-asset whether that's acceptable.

## 3. Candidates

All links verified loading live on 2026-09-24. Mixkit direct MP3 URLs were read straight out of
the page's audio-player data attributes (`data-audio-player-preview-url-value`) — these are the
actual preview/stream files Mixkit serves, not scraped guesses. Pixabay and Freesound don't
expose a static download URL in the page markup (Pixabay generates it on click; Freesound
requires login), so only the page URL is given for those — open the page and use the on-page
Download button.

None of Mixkit/Pixabay list BPM on the track page; where noted "BPM not listed," verify by ear
or with a beat detector before locking the edit to it.

### Music (5 candidates, minimal/upbeat tech, 100–124 BPM target, avoiding corporate-cheese)

| # | Title | Provider | Page | Direct file | Duration | BPM | Licence |
|---|---|---|---|---|---|---|---|
| 1 | **Minimal Techno 01** — Alejandro Magaña (A.M.) | Mixkit | [mixkit.co/free-stock-music/tag/technology](https://mixkit.co/free-stock-music/tag/technology/) | [assets.mixkit.co/music/162/162.mp3](https://assets.mixkit.co/music/162/162.mp3) | 2:04 | not listed (Tech House genre tag — genre band is 124–132, likely near top of our range) | Mixkit Stock Music Free License |
| 2 | **Cat Walk** — Arulo | Mixkit | same tag page | [assets.mixkit.co/music/371/371.mp3](https://assets.mixkit.co/music/371/371.mp3) | 2:04 | not listed (House/EDM tags) | Mixkit Stock Music Free License |
| 3 | **Hazy After Hours** — Alejandro Magaña (A.M.) | Mixkit | same tag page | [assets.mixkit.co/music/132/132.mp3](https://assets.mixkit.co/music/132/132.mp3) | 2:07 | not listed (Electronica) | Mixkit Stock Music Free License |
| 4 | **Techno Fest Vibes** — Alejandro Magaña (A.M.) | Mixkit | same tag page | [assets.mixkit.co/music/124/124.mp3](https://assets.mixkit.co/music/124/124.mp3) | 2:14 | not listed (EDM/House) | Mixkit Stock Music Free License |
| 5 | **Technology Upbeat** — The_Mountain | Pixabay | [pixabay.com/music/corporate-technology-upbeat-199140](https://pixabay.com/music/corporate-technology-upbeat-199140/) | not exposed — use on-page Download (verified: works logged-out) | 2:02 | not listed | Pixabay Content License |

**Top pick: #1, Minimal Techno 01 (Mixkit).** It's the only one whose own genre tag ("Tech
House") lands inside a well-documented BPM band, it's licensed with zero attribution/account
friction, and "minimal" is literally in the title — matches the "clean electronic, avoid
corporate-cheese" brief better than the House/EDM-tagged alternatives, which trend more festival
than product-demo. Confirm the actual BPM by ear (or `aubio`/beat-detector) before cutting cues
to it — Mixkit doesn't publish tempo metadata.

### SFX (15 candidates)

| # | Title | Provider | Page / file | Duration | Licence | Use |
|---|---|---|---|---|---|---|
| 1 | Select click | Mixkit | [assets.mixkit.co/active_storage/sfx/1109/1109-preview.mp3](https://assets.mixkit.co/active_storage/sfx/1109/1109-preview.mp3) ([category page](https://mixkit.co/free-sound-effects/click/)) | short | Mixkit SFX Free License | soft UI tap |
| 2 | Modern technology select | Mixkit | [assets.mixkit.co/active_storage/sfx/3124/3124-preview.mp3](https://assets.mixkit.co/active_storage/sfx/3124/3124-preview.mp3) | short | Mixkit SFX Free License | soft UI tap (alt) |
| 3 | Soft UI Pop – light, minimal click — humordome | Pixabay | [pixabay.com/sound-effects/technology-soft-ui-pop-light-minimal-click-451232](https://pixabay.com/sound-effects/technology-soft-ui-pop-light-minimal-click-451232/) | short | Pixabay Content License | soft UI tap (alt) |
| 4 | Single key type | Mixkit | [assets.mixkit.co/active_storage/sfx/2533/2533-preview.mp3](https://assets.mixkit.co/active_storage/sfx/2533/2533-preview.mp3) ([category page](https://mixkit.co/free-sound-effects/keyboard/)) | short | Mixkit SFX Free License | keyboard key click |
| 5 | Keyboard typing | Mixkit | [assets.mixkit.co/active_storage/sfx/1386/1386-preview.mp3](https://assets.mixkit.co/active_storage/sfx/1386/1386-preview.mp3) | short | Mixkit SFX Free License | keyboard typing bed |
| 6 | click.mp3 — willy_ineedthatapp_com (CC0) | Freesound | [freesound.org/people/willy_ineedthatapp_com/sounds/167326](https://freesound.org/people/willy_ineedthatapp_com/sounds/167326/) | 0.11s | **CC0** (account needed to download) | keyboard key click (alt, ultra-short) |
| 7 | Fast whoosh transition | Mixkit | [assets.mixkit.co/active_storage/sfx/1490/1490-preview.mp3](https://assets.mixkit.co/active_storage/sfx/1490/1490-preview.mp3) ([category page](https://mixkit.co/free-sound-effects/whoosh/)) | short | Mixkit SFX Free License | swipe/whoosh transition |
| 8 | Arrow whoosh | Mixkit | [assets.mixkit.co/active_storage/sfx/1491/1491-preview.mp3](https://assets.mixkit.co/active_storage/sfx/1491/1491-preview.mp3) | short | Mixkit SFX Free License | swipe/whoosh (alt) |
| 9 | Fast swipe zoom | Mixkit | [assets.mixkit.co/active_storage/sfx/2627/2627-preview.mp3](https://assets.mixkit.co/active_storage/sfx/2627/2627-preview.mp3) ([category page](https://mixkit.co/free-sound-effects/swipe/)) | short | Mixkit SFX Free License | swipe (card/paste motion) |
| 10 | Short Woosh 03.wav — ironcross32 (CC0) | Freesound | [freesound.org/people/ironcross32/sounds/582896](https://freesound.org/people/ironcross32/sounds/582896/) | 0.85s | **CC0** (account needed to download) | swipe/whoosh (alt, descending — good for a screen exit) |
| 11 | Bubble pop up alert notification | Mixkit | [assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3](https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3) ([category page](https://mixkit.co/free-sound-effects/pop/)) | short | Mixkit SFX Free License | pop (snippet saved / pasted) |
| 12 | Tech choir cinematic riser | Mixkit | [assets.mixkit.co/active_storage/sfx/794/794-preview.mp3](https://assets.mixkit.co/active_storage/sfx/794/794-preview.mp3) ([category page](https://mixkit.co/free-sound-effects/riser/)) | short (1–2s range) | Mixkit SFX Free License | subtle riser before logo |
| 13 | Short space stutter intro riser | Mixkit | [assets.mixkit.co/active_storage/sfx/1144/1144-preview.mp3](https://assets.mixkit.co/active_storage/sfx/1144/1144-preview.mp3) | short | Mixkit SFX Free License | riser (alt) |
| 14 | Movie impact intro presentation | Mixkit | [assets.mixkit.co/active_storage/sfx/2902/2902-preview.mp3](https://assets.mixkit.co/active_storage/sfx/2902/2902-preview.mp3) ([category page](https://mixkit.co/free-sound-effects/impact/)) | short | Mixkit SFX Free License | soft impact / final hit on logo |
| 15 | Bell notification | Mixkit | [assets.mixkit.co/active_storage/sfx/933/933-preview.mp3](https://assets.mixkit.co/active_storage/sfx/933/933-preview.mp3) ([category page](https://mixkit.co/free-sound-effects/notification/)) | short | Mixkit SFX Free License | notification tick |

Trim every SFX from its first transient (not from 0:00) before levelling, per the skill's rule —
several of these (especially the CC0 Freesound ones and any "cinematic" Mixkit riser) likely
have lead-in room tone or fade.

## 4. Recommendation

- **Music bed: Minimal Techno 01** (Mixkit, `assets.mixkit.co/music/162/162.mp3`) — mixed near
  0.1 gain, volume-curve-ducked under every whoosh/riser cue via `@remotion/media`'s
  frame-function `volume` prop.
- **SFX**: soft UI tap → *Select click*; keyboard → *Single key type* (per-key) or *Keyboard
  typing* (typing bursts); transitions → *Fast whoosh transition* / *Fast swipe zoom*; snippet
  save/paste pop → *Bubble pop up alert notification*; pre-logo riser → *Tech choir cinematic
  riser* (trimmed to 1–2s, sub-bass-style low gain 0.2–0.22 per the skill's silence-then-hit
  rule); final hit → *Movie impact intro presentation*; misc state-change tick → *Bell
  notification*.
- **Master** the final render with the two-pass `loudnorm` command in section 1, target
  `I=-14:TP=-1.0`, verify with `ebur128` on the delivered file before calling it done.

Nothing has been downloaded — this file is the shortlist. Say the word and I'll pull the actual
files (Mixkit direct MP3s can be fetched without a login prompt; Pixabay needs the on-page
Download click; Freesound CC0 picks need a free Freesound account first).
