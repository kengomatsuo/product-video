# Plan, propose, wireframe

Nothing is built until the owner has approved the storyboard and then the wireframe. A
change is cheapest here: a line in a table, a box moved in a still.

## Plan the storyboard

Start from the study notes, not from the scaffold's placeholder beats. Write
`storyboard.md` in the film's folder:

1. **Brief**, one paragraph: the product, who watches, where it runs, length, the one
   thing the viewer should remember, and the approved facts with their sources.
2. **Three directions**, a sentence each, every one naming the references it takes from
   by file. Pick one and name its signature move.
3. **The music**: the owner's pick from the sample reel, its BPM and the drop
   (`beats.ts`). The film is laid out in its bars.
4. **The beat table**, one row per beat:

| # | Bars (s) | On screen | Motion | Caption (words) | Sound | Reference |
|---|---|---|---|---|---|---|
| 1 | 1-2 (0-3.9) | keyboard list, tap Cutling | phone rises from below, settles right | Stop retyping your address (4) | pad in, tap | `launch-videos/things-02.jpg` |

   Each caption is timed against `research/timing.md`: words arrive at speaking pace and
   the line holds at least as long as it takes to read twice. Each beat names the take it
   needs recorded, so capture has a shot list.

## Propose it

Send the owner the brief, the three directions with one reference frame each, the chosen
direction, and the beat table. Publish it as a page when the host has artifacts or docs,
otherwise as a file with SendUserFile. Wait for approval; apply every change to the table
before going on.

## Wireframe

Put the approved table into `src/storyboard.json` with every shot's `src` set to
`"wire:<what the shot shows>"`: the template draws a labelled, hatched box in its place,
at the real size, device and position. Set `music` to the chosen track. Then:

```bash
bun tools/stills.ts                 # one still per beat, settled and mid-beat
bun tools/render.ts --draft         # the animatic: real timing, captions and music
```

Send the stills as one contact sheet and the animatic at phone size. The owner judges
pacing, reading time and composition here, with no recording yet. Wait for approval.

## Then build

Record the shot list (`references/capture.md`), replace each `wire:` with its take, and
build the scenes in the order of the table. Stills after every scene; a draft after
every three.
