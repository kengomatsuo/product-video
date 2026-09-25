# Microsoft Fluent 2 / Windows Apps — Motion, Timing and Easing

URL: https://fluent2.microsoft.design/motion
Windows implementation: https://learn.microsoft.com/en-us/windows/apps/design/motion/timing-and-easing

Fetched: 2026-09-24 (WebFetch on fluent2.microsoft.design returned only qualitative text; numeric values below are from Microsoft Learn's Windows motion docs, cross-checked via search)

## Notes

- Named duration constants used across Windows/WinUI controls: `ControlFasterAnimationDuration` = **83 ms**, `ControlFastAnimationDuration` = **167 ms**, `ControlNormalAnimationDuration` = **250 ms**.
- Explicit scaling rule (matches Material/Carbon): **larger elements get more time** than smaller ones, and **more important elements get more emphasis** — bigger, slower, more deliberate motion — than incidental ones.
- Fluent 2's own conceptual copy (non-numeric): duration and easing exist so "people have enough time to notice the motion and interpret what it communicates" — i.e., duration is set by comprehension, not decoration.

## Quote (under 15 words)

"Make it feel natural and quick by considering the size... and distance"
