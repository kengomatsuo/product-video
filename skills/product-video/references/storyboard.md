# Plan, propose, wireframe

The storyboard and then the wireframe go to the user as pictures and a clip as soon as
they exist, and the build carries on; the work stops only for a pick that is the user's
alone, such as music by ear. A change is cheapest here: a line in a table, a box moved in
a still.

## Plan the storyboard

Each scene is a moment in the product's story, with its own device line-up, and each table row says why every
device moves (it shows a screen, takes a tap, or carries the cut). Do not copy a reference's choreography onto devices
with no reason to move, and do not repeat the same three devices in every scene.

Start from the study notes, not from the scaffold's placeholder beats. Write
`storyboard.md` in the film's folder:

1. **Brief**, one paragraph: the product, who watches, where it runs, length, the one
   thing the viewer should remember, and the approved facts with their sources.
2. **The directions**, as many as the designer has, a sentence each, saying what it takes
   from a reference (by file) and what is its own. Pick one and name its signature move.
3. **The music**: the user's pick from the sample reel, its BPM and the drop
   (`beats.ts`). The film is laid out in its bars.
4. **The beat table**, one row per beat:

| # | Bars (s) | On screen | Motion | Caption (words) | Sound | Reference |
|---|---|---|---|---|---|---|
| 1 | 1-2 (0-3.9) | keyboard list, tap the app | phone rises from below, settles right | Stop retyping your address (4) | pad in, tap | `launch-videos/things-02.jpg` |

   Each caption is timed against `research/timing.md`: words arrive at speaking pace and
   the line holds at least as long as it takes to read twice. Each beat names the take it
   needs recorded, so capture has a shot list.

## Propose it

Send the user the brief, the directions with a reference frame for each that takes from
one, the chosen direction, and the beat table. Publish it as a page when the host has
artifacts or docs, otherwise as a file with SendUserFile. Apply every change the user
sends to the table.

## Wireframe

Put the table into `src/storyboard.json` with every shot's `src` set to
`"wire:<what the shot shows>"`: the template draws a labelled, hatched box in its place,
at the real size, device and position. Set `music` to the chosen track. Then:

```bash
bun tools/stills.ts                 # one still per beat, settled and mid-beat
bun tools/render.ts --draft         # the animatic: real timing, captions and music
```

Send the stills as one contact sheet and the animatic at phone size. The user judges
pacing, reading time and composition here, with no recording yet.

## Then build

Record the shot list (`references/capture.md`), replace each `wire:` with its take, and
build the scenes in the order of the table. Stills after every scene; a draft after
every three.
