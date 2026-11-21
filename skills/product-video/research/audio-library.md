# Promo audio — research and candidates

## Contents

1. Craft: what the primary sources actually say
2. Licences: what each free library permits (read 2026-11-21)
3. Music shortlist for the Black stage films (measured 2026-11-21)
4. Sound effects
5. Recommendation

Audio for a 25 s App Store preview and promo of an iOS app. Nothing below is downloaded;
all page loads were verified live.

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

- **Three layers**: narration (loudest, N/A when the promo has no VO), **music bed at
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
- Practical mapping: music bed volume curve stays near the skill's ~0.1 floor, dips
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

## 2. Licences: what each free library permits (read 2026-11-21)

Each row was read on the provider's own page on 2026-11-21, by `curl` or in Chrome where the page needs a browser. The
quotes are the provider's words. "Content ID" means YouTube's fingerprint system and its equivalents (Meta Rights
Manager, TikTok MediaMatch): a track registered there claims or blocks every video that uses it, whatever the download
page said. An App Store preview has no caption or description, so a track that must be credited cannot be used in one
without the provider's paid no-credit licence.

### Travels to every platform, no credit

| Library | Commercial ads | Social posts | App Store preview | Credit | Content ID | Source |
|---|---|---|---|---|---|---|
| **Mixkit** (Envato), Stock Music Free License | Yes: "Online marketing ads"; "commercial and non-commercial projects for free" | Yes: "Social Media video posts", "YouTube videos*"; "download, copy, modify, distribute and publicly perform the Music Items on any web or social media platform, including internet-based video on demand services, podcasts and advertisements" | Not named. A preview is a video on a web platform, so the grant reads as covering it. Not allowed: "CDs & DVDs", "TV & Radio Broadcasts", "Video Games" | None asked | Users may not "register them on any rights management service". "* If you receive a claim, please forward the details to team@mixkit.co" | The "View License" window on https://mixkit.co/license/#musicFree, read in Chrome |
| **Unminus** | Yes: "Commercial and non-commercial purposes"; "an irrevocable, nonexclusive, worldwide copyright license to download, copy, modify, perform and use music from Unminus for free, including for commercial purposes, without permission from or attributing the creator or Unminus" | Yes: "incorporate the music in your own work like Videos, Podcasts, Apps, Intros, Outros, Background music" | Covered by the same sentence ("Videos", "Apps") | None | "Don't add music without modification to Content ID Networks. This will block other users from using it on YouTube, Facebook etc." A claim form is at unminus.com/claim | https://www.unminus.com/license |
| **OpenTracks** (Japan; DOVA-SYNDROME until its rename on 2026-09-15, dova-s.jp redirects) | Yes: commercial and non-commercial, person or company; its own examples list TV programmes and commercials ("テレビ番組、CMにおける利用") | Yes: "YouTube、TikTok、Twitch、IRIAM、Podcast、その他のオンライン映像・コンテンツ配信での利用" | Not named. Background music in a work is the licence's whole scope, and its examples include paid and free apps and web services ("有償・無償のアプリ（iPhone・android等）・WEBサービス等での利用") | None: "著作権表示・提供等の表示は不要です" | Forbidden to register a track with JASRAC or with any fingerprint service ("YouTubeにおいてはContent ID") | https://opentracks.com/help/articles/license/ (each composer may add conditions, shown as 利用条件有 on the profile: read it). A track page plays a preview with downloading switched off; the file itself comes from the page's own download step |
| **魔王魂 Maou Damashii** (Japan) | Yes: "商用利用 YouTube収益化・企業案件・TV・ゲーム販売・CD収録。ぜんぶOK。もちろん無料。" | Yes: "YouTube・TikTok・ニコニコ・Twitch・インスタ。どのプラットフォームでも。" | Not named; "ぜんぶOK" with three exceptions (claiming authorship, redistributing the track itself, AI arrangement or training) | Optional: "必須ではありません" (the line 音楽：魔王魂 is welcome) | "Content IDで著作権侵害と誤検知された場合は、魔王魂側で対応します" | https://maou.audio/rule/ |
| **Free Music Archive, CC0 tracks only**: HoliznaCC0 (79 albums, hip-hop beats, lo-fi, chiptune) | Yes, CC0 has no conditions; each track page reads "is licensed under a CC0 1.0 Universal License" | Yes | Yes | None | Nothing stops a third party registering a CC0 track; check the track before each film | https://freemusicarchive.org/music/holiznacc0/ and each track's page (read 2026-11-22); https://freemusicarchive.org/License_Guide |

### Travels to every platform, credit required

A credit goes in the post's caption or the video's description. None of these can go in an App Store preview unless the paid licence is bought.

| Library | Licence | Credit line | Without credit | Content ID | Source |
|---|---|---|---|---|---|
| **Scott Buckley** | CC BY 4.0: "FREE, even for commercial use, as long as attribution is given" | "[Track Title] by Scott Buckley – released under CC-BY 4.0. www.scottbuckley.com.au"; on YouTube "Credits must be provided in the video description (not in the video itself)" | "use in advertising which doesn't permit attribution, the CC BY license does not apply": Web AUD 40, Standard AUD 75, Full AUD 300 per track | His tracks are fingerprinted: "If you don't do this, you will likely get a copyright claim on the video", released through his claims form | https://www.scottbuckley.com.au/library/using-this-music/ and /library/licensing/ |
| **Incompetech** (Kevin MacLeod) | CC BY 4.0, free; "Yes, AND you can monetize the videos. Be sure to credit me." | "Title Kevin MacLeod (incompetech.com) Licensed under Creative Commons: By Attribution 4.0 https://creativecommons.org/licenses/by/4.0/" | Standard License, bought per title: "radio/TV ads, corporate presentations, on-hold music"; the page shows no price | Its Content ID article was not readable by `curl`; not confirmed | https://incompetech.com/music/royalty-free/faq.html and /licenses/ |
| **Audionautix** (Jason Shaw) | CC BY 4.0: "royalty free - completely free - for you to download and use (even for commercial purposes) as long as you provide credit" | credit to audionautix.com | Not offered on the page | Not stated | https://audionautix.com/ |
| **Silverman Sound Studios** | Creative Commons, credit required; "Both licences cover commercial and non-commercial use", listing "Advertising and marketing materials", "Video games and apps", "TikTok, Instagram, and social media content" | "Credit required for free use" | Pro License US$25 a track, or US$5 a month | "YouTube videos must include credits in description to avoid Content ID claims" | https://www.silvermansound.com/licenses |
| **Free Music Archive, CC BY tracks** | CC BY: "You must credit the artist. You can use it for commercial purposes. You can put this song in a video" | per track | from the artist | per track | https://freemusicarchive.org/License_Guide (CC BY-ND forbids putting a song in a video; NC forbids commercial use) |

### Stays on its own platform

These are added inside the platform when posting, or downloaded for that platform alone. A film cut to one of these tracks is that platform's version and goes nowhere else.

| Library | What the terms grant | Limit | Source |
|---|---|---|---|
| **TikTok Commercial Music Library** | "free for businesses to use": organic content, video ads, branded content | "You may only post or share videos that include Commercial Sounds within TikTok ... Commercial Uses outside of TikTok are not permitted and no rights are granted by TikTok for such uses", naming "posting videos on third party digital platforms". From the Creative Center a sound may be used only on its listed "Usable Placements". If TikTok loses a sound it may take the video down or mute it | https://www.tiktok.com/legal/page/global/commercial-music-library-user-terms/en ; https://ads.tiktok.com/help/article/commercial-music-library |
| **Meta Sound Collection** | "a non-exclusive, royalty-free license to use the SC Audio Content for commercial or non-commercial purposes in content you create, upload, and distribute on the Meta Company Products ... only" | "You may not perform, distribute, make available or otherwise use the SC Audio Content separately from the Meta Company Products." Tracks download as files, so they can be measured and cut to, for Facebook and Instagram posts only | https://www.facebook.com/sound/collection/terms (last modified 16 March 2022), read in Chrome signed in |
| **YouTube Audio Library** | In Studio: "YouTube Audio Library License. You can use this audio track in any of your videos, including videos that you monetize. No attribution is required." Help: "copyright-safe"; downloaded tracks "won't be claimed by a rights holder through the Content ID system" | Neither text names any platform but YouTube, and YouTube's Terms of Service do not mention the library, so use elsewhere is not granted in writing: treat as YouTube only. Tracks marked Creative Commons need the artist credited in the description | YouTube Studio, Audio library, a track's licence icon; https://support.google.com/youtube/answer/3376882 |

### Out

| Library | Why | Source |
|---|---|---|
| **Pixabay Music** | The licence allows free use with no credit and says nothing about Content ID: "It is your responsibility to check whether you require the consent of a third party or a license to use Content." A distributor registered "Revival" and it blocked two Cutling Shorts worldwide (2026-11-18) | https://pixabay.com/service/license-summary/ |
| **StreamBeats** | Free with no credit, but written for streamers: the grant is to "synchronize any StreamBeats track with video content on Twitch, YouTube, podcasts, or equivalent platforms", and the label registers its tracks itself ("We actively work to keep StreamBeats safe on YouTube via Content ID"; a false claim "happens occasionally"). Ads and store previews are not named | https://www.streambeats.com/licensing |
| **NCS** | "Brands and businesses: Content made to promote a product, service or brand" need a paid licence | https://ncs.io/usage-policy |
| **Free To Use** | Under the free licence "Use of the Digital Assets in Commercial Content, Broadcast Content, Digital Products, or Physical Products is strictly prohibited" | https://freetouse.com/license |
| **FreePD** | "permanently closed" (2008-2025) | https://freepd.com/ |
| **Uppbeat**, **Bensound** | Not read this time: Uppbeat's pages did not load without a browser session and Bensound's sat behind its cookie dialog. The earlier reading (free plans require a credit) stands unconfirmed | uppbeat.io, bensound.com |

**Order of choice:** Mixkit first, since its licence names ads and social posts, asks for no credit and forbids registration; Unminus second on the same grounds; a Japanese post may take OpenTracks or 魔王魂, though neither holds dark, bass-led music (reel 2 below); HoliznaCC0 adds CC0 hip-hop beats. A CC BY track is for a post whose caption has room for the credit and never for a store preview. TikTok's and Meta's libraries are for a platform's own version of a film.

## 3. Music shortlist for the Black stage films (measured 2026-11-21)

Eight tracks picked by measured structure, none by ear: each has a quiet build of four bars or more and a lift of 8 to
20 dB that a six-beat film of 15 to 20 s can land its payoff on. Found by scoring the published waveform of 449 Mixkit
tracks for a sharp rise after a build, then running `scripts/beats.ts` on the best 30, on Unminus's 51 tracks and on 10
of Scott Buckley's. "Lift" is the RMS level of the two units after the lift against the two before it; a unit is the
film beat in seconds. K-weighted (as a phone speaker hears it) the lift in "Thunder" is 8 dB, not 19: the rest is bass.

| # | Track | Library | File | BPM | Film beat | Lift at | Lift | Bass share of the section |
|---|---|---|---|---|---|---|---|---|
| 1 | Thunder, Arulo | Mixkit 318 | https://assets.mixkit.co/music/318/318.mp3 | 95 | 2.53 s (one bar) | 20.19 s | 19 dB | -1.2 dB |
| 2 | Waveform, Kit Wheston | Unminus | https://feeds.soundcloud.com/stream/1038044245-unminus-waveform.mp3 | 80 (listed 160) | 3.00 s | 23.89 s | 19 dB | -3.4 dB |
| 3 | Other World, Lily J | Mixkit 723 | https://assets.mixkit.co/music/723/723.mp3 | 140 | 2.57 s | 9.21 s | 20 dB | -1.4 dB |
| 4 | Atoms in Peace, Alejandro Magaña | Mixkit 107 | https://assets.mixkit.co/music/107/107.mp3 | 96 | 2.50 s | 28.54 s | 12 dB | -3.5 dB |
| 5 | Kickin' Heart, Mauro Urbina | Mixkit 771 | https://assets.mixkit.co/music/771/771.mp3 | 109 | 3.31 s | 17.81 s | 11 dB | -3.1 dB |
| 6 | Silent Descent, Eugenio Mininni | Mixkit 614 | https://assets.mixkit.co/music/614/614.mp3 | 140 | 2.57 s | 69.66 s | 8 dB | -27.6 dB (no bass) |
| 7 | 5 Stages of You, Kit Wheston | Unminus | https://feeds.soundcloud.com/stream/1145820199-unminus-5-stages-of-you-free-lo-fi-music.mp3 | 80 | 3.00 s | 24.04 s | 16 dB, after a bar of near silence | -3.9 dB |
| 8 | Born of the Sky, Scott Buckley | CC BY 4.0, credit required | https://www.scottbuckley.com.au/library/wp-content/uploads/2025/08/BornOfTheSky.mp3 | 120 | 3.01 s | 32.51 s | 10 dB, a swell | -1.9 dB |

The reel, the excerpts, the measurements and the tools are in the Undirect repo, `docs/research/pro-film-refs/music/`.
Track 1 is the placeholder under the first film until the owner picks by ear.

**The owner's ear on reel 1 (2026-11-22):** 1 and 2 "maybe least bad", 7 kept for another film, the other five rejected.
What 1 and 2 share and the rejected lack is the floor for anything offered next: a slow pulse (62 to 100 BPM felt), a
build at least 11 dB under the track for four film beats, a lift of 14 dB or more that holds, and bass in the lifted
section (the band under 90 Hz within 6 dB of the whole). Bright, bass-less or flat tracks fail by ear even when they lift.

### Reel 2 (tracks 9 to 16, measured 2026-11-22)

Screened against that floor with `music/tools/measure2.py`. "Phone" is the lift with everything under 150 Hz removed.

| # | Track | Library | File | BPM felt | Lift at | Lift | Phone | Bass share |
|---|---|---|---|---|---|---|---|---|
| 9 | Torey, Arulo | Mixkit 304 | https://assets.mixkit.co/music/304/304.mp3 | 56 | 34.37 s | 20.7 dB | 10.7 | -0.5 dB |
| 10 | Headlight Vision, Arulo | Mixkit 297 | https://assets.mixkit.co/music/297/297.mp3 | 75 | 11.15 s | 19.8 dB | 12.5 | -1.2 dB |
| 11 | 21, Arulo | Mixkit 445 | https://assets.mixkit.co/music/445/445.mp3 | 67.6 | 14.25 s | 18.2 dB | 10.2 | -1.3 dB |
| 12 | Lil Pump Type, Arulo | Mixkit 410 | https://assets.mixkit.co/music/410/410.mp3 | 62.5 | 15.40 s | 24.5 dB | 14.4 | -0.7 dB |
| 13 | Chill Trap, Arulo | Mixkit 256 | https://assets.mixkit.co/music/256/256.mp3 | 67.5 | 14.26 s | 22.6 dB | 11.3 | -0.4 dB |
| 14 | Wolf, HoliznaCC0 | FMA, CC0 1.0 | https://freemusicarchive.org/music/holiznacc0/after-dark/wolf-1/ | 74.6 | 12.03 s | 17.8 dB | 9.1 | -1.0 dB |
| 15 | Bowers & Wilkins, JNGS | Unminus | https://feeds.soundcloud.com/stream/499010700-unminus-bowers-wilkins.mp3 | 69.7 | 5.96 s | 19.5 dB | 5.2 | -0.1 dB |
| 16 | Electro Dreams, Arulo | Mixkit 190 | https://assets.mixkit.co/music/190/190.mp3 | 120.7 | 15.96 s | 18.2 dB | 13.7 | -3.5 dB |

How wide the search went: every Mixkit waveform (1,341 ids answer at `assets.mixkit.co/music/<id>/<id>-waveform.json`),
58 measured in full, 28 pass, 21 of the 23 named ones by Arulo; all 51 Unminus tracks, 3 pass; OpenTracks, 374 listed
under its dark, cool, serious, cinema and hip-hop tags, the 45 most downloaded measured from their previews, none passes;
魔王魂's categories (8-bit, fantasy, acoustic, piano, rock) were not measured; HoliznaCC0, 65 tracks from eleven beat
albums, 4 pass. Mixkit answers HTTP 429 after about 200 listing pages in a few minutes: space them a second apart.
Five passing Mixkit files (1355, 279, 377, 1297, 203) appear among none of the 910 titles on the listing pages read,
and only 2 of the 194 ids above 1200 that answer on the server are listed at all: a file that answers without being
listed may not be on offer, so none of the five is on the reel (1355 has the largest lift measured: 27 dB, 20 on a
phone, 100 BPM). Offer a Mixkit track only when a listing page shows it.

## 4. Sound effects


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

## 5. Recommendation

- **Music**: from the shortlist in section 3, chosen by the owner's ear from the reel; the film's cuts are then laid on
  that track's downbeats so its lift lands on the payoff.
- **SFX**: soft UI tap: *Select click*; transitions: *Fast whoosh transition* / *Fast swipe zoom*; pop: *Bubble pop up
  alert notification*; pre-logo riser: *Tech choir cinematic riser*; final hit: *Movie impact intro presentation*.
- **Master** to -14 LUFS, true peak at most -1 dBTP, and measure the delivered file with `ebur128`. A film that is a
  quiet build and one lift is brought up with one gain and a limiter: `loudnorm`'s dynamic mode would level the build
  up to the lift.
