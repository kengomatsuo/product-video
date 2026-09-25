# Blender/C4D Product-Animation Camera Move Timing

URLs:
- https://artisticrender.com/how-to-animate-the-camera-in-blender/
- https://blenderartists.org/t/controlling-ease-on-a-camera-path-animation/547674

Fetched: 2026-09-24 (WebSearch across Blender tutorial/community sources)

## Notes

- Blender's default keyframe interpolation for camera moves is **Bezier**, which automatically eases out of and into every keyframe — a deliberately "soft" default that most product-camera tutorials keep rather than override, because a linear camera move reads as robotic/CG-obvious in a product shot.
- Community add-ons built specifically for product/marketing camera work (e.g. "Quick Shot") organize a camera move as **duration in frames + an explicit interpolation choice (linear vs. ease-in/out)** per shot — i.e. practitioners think in discrete named shots with their own duration, not one continuous camera path, mirroring how promo editors think in per-scene durations.
- No single canonical "a push-in should take N seconds" number was found from a primary Apple or Blender source in this pass — this is treated as the weakest-sourced item in this collection; the spec table below picks a duration by triangulating against the App Store preview pacing (5–10 s per feature) and general UI "large movement = long duration" scaling rule from Material/Carbon/Fluent, not from a camera-specific citation.

## Quote (under 15 words)

"ease out and ease in when getting closer to a keyframe" (Blender default behavior)
