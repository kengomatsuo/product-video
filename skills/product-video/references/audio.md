# Sound and cutting to music

When a film is cut to music, pick the track before the storyboard and build the timeline
on its bars, because a storyboard cut against a track chosen later never lands; a film led
by voice or silence sets its own grid.

## 1. Pick and measure the track

The reel offers tracks that suit this film's mood, each with its measured bass share (the
band below 90 Hz against its full-band level), since a heavy kick and bass can clank on a
phone speaker. The user listens on a phone and picks by ear, so always send a sample reel
with a spoken number before each track, and never pick the music alone.

No lyric is written for a product. Of fifteen Apple and Samsung product and system films heard in 2026-11, seven
are a narrator over a released song or a bed, five have no words, and the three whose sung words carry the film use
a released artist's song about something else (learning jazz in Apple's AirPods film) or a hook of a few words
(17 words, 8 different, in Samsung's One UI 5 film). So a film that wants a voice licenses a real song whose mood
and one phrase fit, or runs a beat with a few shouted syllables; words written to the brief are a jingle, and the
owner hears it at once. Read the references' words before proposing any, and show the owner the words before a take
is made.

Music comes from Mixkit, whose licence forbids registering its tracks with Content ID or any rights-management service; Pixabay tracks can be registered by their distributors and get claimed (research/audio-library.md).

With the optional `<library>` (see SKILL.md), `<library>/music-for-promos/README.md` lists
what Apple, Samsung and app launch films use, and `<library>/audio/LIBRARY.md` lists
tracks and effects with their licence and the exact attribution line when one is required.
Without it, use `research/music-for-promos.md` and `research/audio-library.md`.

```bash
bun <skill>/scripts/beats.ts <track.mp3> > beats.json          # bpm, beats, downbeats, bars, sections, drops
bun <skill>/scripts/beats.ts <track.mp3> --snap 9.9            # nearest beat / downbeat
bun <skill>/scripts/beats.ts <track.mp3> --plan 6 --near 10    # 6 cuts on downbeats, biggest drop near 10 s
```

`beats.ts` decodes with ffmpeg, builds a mel onset envelope, estimates tempo by
autocorrelation with sub-lag precision, tracks beats by dynamic programming (Ellis 2007),
picks downbeats by bass energy, and finds sections and drops with a checkerboard
novelty kernel (Foote 2000). Its tempo matched an independent librosa
run within 1.5 BPM on the tracks tested.

Choose a start point on a downbeat so the track's drop lands on the film's payoff, and
its next section change on the end-card line.

## 2. Build the timeline on bars

When a film is cut to music, picture events land on its bars as below.

```ts
const BAR = 60 / bpm * 4 * FPS;         // frames per bar
const B = (n: number) => Math.round(n * BAR);
```

| Event | Where | Lead |
|---|---|---|
| Scene cut | a downbeat | the outgoing move peaks on it |
| Payoff (the thing the video is for) | the drop | 0 |
| A word of a headline | a beat, one word per beat (half-beat for long lines) | 2 frames early, so the eye meets it on the beat |
| Build-up card | the bars before the drop, with a riser ending on the drop | 0 |
| Logo | a downbeat near the end, with an impact | impact peak on the frame |
| Call to action | the next downbeat after a held beat of stillness | 0 |

The reasoning for the leads is in `research/music-sync.md`.

## 3. Effects

An effect is the recorded sound of the thing on screen (a card dealt for a page flying out,
ice cracking for glass under a finger, a spacebar for a key landing), found and judged by
description, because a stock whoosh, pop or impact reads as stock and you cannot hear either.
`scripts/sfx/` does the listening (`zsh scripts/sfx/setup.sh` once; method and tests in
`undirect/docs/research/sfx-for-claude.md`):

```bash
PY=~/.cache/audio-tools/venv/bin/python; K=<skill>/scripts/sfx
$PY -I $K/mix.py bands <track> <start> <length>      # where the track is thin
$PY -I $K/sfx.py batch moments.json --out picks      # or: sfx.py find "<description>" --query "<search words>" --out picks/<name>
$PY -I $K/mix.py cues.json                           # lays the picks under the track, prints how each sits
```

1. List the moments from the storyboard and write each as the physical sound: what makes it,
   the material, "close, dry", one hit or several, how long (`--dur`). `moments.json` holds one
   entry per moment with its search words.
2. Read `picks/<name>/ranked.md`. Keep a take only when the fit is clear (0.45 up, z over 3),
   the second model's labels or the listeners' sentences name the same thing, and the measured
   decay is as dry as asked. Among those, take the one whose energy sits where the track is
   thin: it is heard at a level far under the music, while a take in a band the track fills
   has to be loud to be heard at all.
3. Freeze the kept files in the project with each source page and licence (the tool fetches
   only CC0, public-domain and Mixkit sounds, which a commercial film may use with no credit).
4. Place each on the frame of its event (a tap on the touch, a landing on its peak) with
   `over`: 3 just heard, 6 plain, 9 an accent. `mix.py` keeps every cue under the music as a
   whole and flags the ones it finds BURIED: change the take, not the level. The models
   describe and measure but do not judge taste, so the owner hears the film before it ships.

## 4. Master

`bash tools/master.sh <Comp> <version>` renders ProRes, measures loudness, and encodes
with two-pass `loudnorm` to -14 LUFS, true peak -1.5 dBTP, then prints the loudness of
the delivered file. You cannot hear it: report those numbers.

## Voiceover from a text-to-speech product

Before choosing, open the product's model picker and its voice suggestions for the actual script, and list every model and suggested voice it offers for each language. Generate the whole script in one request and cut it at the line boundaries (character timestamps where the API gives them); a line-by-line read loses its intonation between lines. Compare at least the top two models and two suggested voices per language, side by side, before picking.

Every voice read goes through ElevenLabs' voice isolator (`POST /v1/audio-isolation`, multipart field `audio`, returns MP3, one request at a time on Starter, refuses audio under 4.6 s), generated speech included. Isolate the whole read once and find its shift against the original by cross-correlation. Cut each line inside the silence measured in the audio nearest its boundary, because character timestamps overlap neighbouring lines by up to 80 ms and leave the next word's start in this line's file or clip this line's last sound. A pause added inside a line also goes only inside a measured silence of 120 ms or more, or before the line's first word, and an audio piece trims on exact frames with no extra frame. Then read each file back on its own with speech-to-text and require its first and last words to match the script. Lower every pause of 100 ms or more lying 35 dB under the line's loud frames by 40 dB, then bring every line to one integrated loudness with transients limited under -1 dBFS.

Audio sent to the user for listening is MP3: an `.m4a` does not play in the remote app.
