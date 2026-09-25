# GitHub prior-art — promo video / device-preview references

Source: GitHub, fetched 2026-09-24 with `gh`, media downloaded via `curl`, frames extracted with `ffmpeg`. All repos verified with `gh api repos/<o>/<r>`.

## Media table

| # | Repo (stars, license) | Media URL | File | What to take |
|---|---|---|---|---|
| 1 | kacperkapusciak/goldie (2172★, MIT) | github.com/user-attachments/assets/d6171a90… | goldie-01..04-studio-*.jpg | Studio UI: template picker (editorial/panorama), font panel, export panel — a full agent-facing screenshot/preview tool |
| 2 | kacperkapusciak/goldie | assets/17-pro-blue.png, 17-pro-orange.png | goldie-05/06-device-bezel-*.png | Bundled iPhone 17 Pro bezel art (transparent screen cutout) |
| 3 | kacperkapusciak/goldie | assets/pixel-10-pro.webp | goldie-07-device-bezel-pixel.jpg | Bundled Pixel 10 Pro bezel (Android emulator skin) |
| 4 | software-mansion/argent (2885★, Apache-2.0) | assets/showcase.gif | argent-01-showcase-source.gif, 02/03-frames | Full showcase reel of the toolkit driving simulators |
| 5 | software-mansion/argent | user-attachments/…6cec01d5… | argent-04-readme-flow-device.png | README hero: terminal + live iPhone 17 Pro frame side by side, on a skyline background |
| 6 | software-mansion/argent | docs/static/video/flow.mp4 | argent-05/06-flow-*.jpg | Agent replaying a recorded flow against a live device frame (exact "coding agent + phone" composition the owner wants) |
| 7 | software-mansion/argent | docs/static/video/interact.mp4 | argent-07/08-interact-*.jpg | Tap/gesture interaction on device |
| 8 | software-mansion/argent | docs/static/video/lens.mp4 | argent-09/10-lens-*.jpg | Element inspector overlay on live device |
| 9 | software-mansion/argent | docs/static/video/ios-android-web.mp4 | argent-11/12-multi-platform*.jpg | Same flow across iOS/Android/web frames in a row |
| 10 | software-mansion/argent | docs/static/video/shake.mp4, tv.mp4 | argent-13/14-*.jpg | Shake gesture; Apple TV device frame |
| 11 | MrKai77/Loop (11663★, GPL-3.0) | assets/graphics/loop_demo.gif, Radial Menu.mp4, Preview.mp4, Keyboard Shortcuts.mp4 | loop-01..08-*.jpg | Radial menu overlay animation, window-snap preview overlay, keyboard-shortcut HUD — all recorded live on a real desktop wallpaper, not a mockup |
| 12 | jordanbaird/Ice (29697★, GPL-3.0) | github.com/user-attachments/assets/4423085c…, f1429589…, 095442ba…, 8c22c185… | ice-01..04-*.png | Menu-bar-hiding app: banner, menu bar icon strip, layout editor, appearance editor — clean flat screenshots, no device frame needed for a menu bar utility |
| 13 | exelban/stats (42077★, MIT) | cdn.mac-stats.com/assets/images/menus.png, popups.png | stats-01/02-*.png | Menu bar strip + popped-out detail panels, direct macOS chrome capture |
| 14 | rxhanson/Rectangle (29972★, custom/no explicit SPDX) | github.com/user-attachments/assets/e8d88e5f… | rectangle-01-readme.png | Window-snap README hero image |
| 15 | lwouis/alt-tab-macos (16320★, GPL-3.0) | docs/readme/screenshot-source.webp | alt-tab-01-screenshot-source.jpg | Raw screenshot source asset the README composites from |
| 16 | haidrrrry/claude-remotion-skill (187★, MIT) | demo.gif, examples/videos/focus-cat-promo.mp4 | haidrrrry-01..05-*.gif/jpg | Claude Code skill for Remotion motion graphics; demo reel + a finished example render |
| 17 | AKCodez/promo-video-skill (54★, license: none/unspecified) | — | (not downloaded — no README media, unclear license; text-only skill) | Text-only skill spec, checked but skipped for media/code |
| 18 | aariz51/promo-video-skill (1★, MIT) | skills/promo-video/template/public/app-screens/*.png | aariz51-01..04-app-screen-*.png | Placeholder app screenshots the template composites into device frames and orbit scenes |
| 19 | soloandco/web-demo-video (0★, MIT) | docs/media/motion.gif, walkthrough.gif | soloandco-01..05-*.gif/jpg | Two-mode output: "motion graphics" reel vs. plain screen "walkthrough" capture |
| 21 | CodeEditApp/CodeEdit (23040★, MIT) | user-images…194004176…, CodeEdit/assets/806104/a9379df0… | codeedit-01/02-*.png | Editor screenshot banners, flat no-device-frame style |
| 22 | aptabase/aptabase (1821★, AGPL-3.0) | aptabase.com/og.png | aptabase-01-og-card.png | OG/social card layout reference |
| 23 | hoppscotch/hoppscotch (80492★, MIT) | packages/hoppscotch-common/public/images/banner-{dark,light}.png | hoppscotch-01/02-banner-*.png | Light/dark banner pair pattern for README hero |
| 24 | calcom/cal.com (48633★, MIT) | user-images…210054112… | calcom-01-banner.png | Dashboard screenshot banner, wide aspect |
| 25 | makeplane/plane (59812★, AGPL-3.0) | media.docs.plane.so/GitHub-readme/github-{top,work-items,cycles,views,analytics}.webp | plane-01..05-*.jpg | Five-panel feature showcase set, consistent framing/crop across screens |
| 26 | dubinc/dub (24809★, license: none/unspecified) | user-attachments/…42cf0705… | dub-01-readme-banner.png | Product screenshot banner |
| 27 | twentyhq/twenty (57396★, license: none/unspecified) | packages/twenty-website/public/images/readme/github-cover-light.webp, v2-build-apps-light.webp, v2-crm-tools-light.webp | twenty-01..03-*.jpg | Light/dark cover pair + feature panel screenshots |
| 28 | remotion-dev/remotion (60208★, license: none/unspecified — commercial for teams) | packages/docs/static/img/showcase.png | remotion-01-showcase-og.png | Official showcase OG card |
| 29 | marcusstenbeck/remotion-template-audiogram (via remotion-dev/template-audiogram README) | Promo.png | remotion-02-audiogram-template-promo.png | Template promo card style |

Total images delivered: **72** (target was 60+).

## Tooling worth reusing

**kacperkapusciak/goldie** (MIT) — closest thing to a finished "our skill but better" reference:
- `src/frame.ts` / `src/device.ts`: precisely measured bezel geometry (screen cutout x/y/w/h/corner-radius) for real device art (iPhone 17 Pro, Pixel 10 Pro emulator skin), plus screen-content clipping to the physical corner radius. Our Remotion skill has no equivalent — it would otherwise place raw screen captures inside a frame without correcting for the cutout's own radius vs. the phone's outer radius.
- `src/render.ts`: the actual compositor that stitches simulator/emulator captures into templated screenshot sets (`editorial`, `showcase`, `magazine`, `storyboard`, `dynamic`, plus atomic layouts like `duo`, `panorama`, `tilt`).
- It drives a real iOS simulator / Android emulator via **argent** (flow replay) rather than working from static screenshots, then verifies the export against each store's own upload rules (`goldie doctor` / `all`). Our skill has no store-rule verification step and no automated flow-replay capture — screenshots have to be supplied, not captured live.

**software-mansion/argent** (Apache-2.0) — an agentic simulator/emulator driver (record a flow once, replay it against a live device to (re)capture it), with a device-provider abstraction (`packages/device-providers`) that generalizes physical + virtual iOS/Android/web/tvOS targets. This is the missing "go get a fresh, real screen recording" half of a promo pipeline; our skill assumes footage already exists.

**aariz51/promo-video-skill** (MIT) — the closest sibling skill to what the owner is building: reverse-engineers a *reference* promo video's timing/motion language and rebuilds it around the user's product. Its `PhoneFrame.tsx` + `S6_DeviceOrbit.tsx` show a full 3D-ish orbiting device-ring scene (six real app screens circling a headline, camera push-in via `pushIn()`, spring text entrance) — a camera-move pattern our skill's scene library likely lacks.

**haidrrrry/claude-remotion-skill** (MIT) — general Remotion motion-graphics skill (captions, sound design, B-roll) with a small reusable animation-primitives file (`Motion.tsx`: `Entrance` spring fade+rise+scale, `WordReveal` word-by-word text reveal) — simple, copy-pasteable transition primitives.

**soloandco/web-demo-video** (MIT) — two distinct output modes worth stealing conceptually: a "motion graphics" promo reel *and* a plain literal screen "walkthrough" capture from the same source app, selected per use case, with QA/brand-guard scripts (`scripts/brand-guard.mjs`) checking the render against brand rules before shipping.

## Licence note on `code/`

Copied verbatim, with a header comment citing the exact commit-SHA permalink, only from repos confirmed MIT or Apache-2.0 by their own `LICENSE` file (goldie's GitHub license field showed `NOASSERTION` but its `LICENSE` file is plain MIT — verified directly, not from the API's classifier):

- `code/goldie-frame.ts`, `code/goldie-device.ts`, `code/goldie-render.ts` (MIT)
- `code/aariz51-PhoneFrame.tsx`, `code/aariz51-S6_DeviceOrbit.tsx` (MIT)
- `code/haidrrrry-Motion.tsx` (MIT)


## Visual patterns observed (8 bullets)

1. **Live device frame beside a live agent terminal** on one canvas, not a screenshot glued to a mockup — argent's README hero (`argent-04-readme-flow-device.png`) and flow/interact/lens frames (`argent-05..10`) put a real running phone next to the CLI driving it, on a soft gradient/skyline backdrop.
2. **Bezel art needs its own measured screen-cutout geometry**, not just "put content in a rectangle" — goldie's `FRAME`/`ANDROID_FRAME` constants (`code/goldie-frame.ts`) carry x/y/width/height/screenRadius per device, because the cutout's corner radius differs from the phone's outer corner radius.
3. **Template families, not one hardcoded layout** — goldie's `editorial`, `showcase`, `magazine`, `storyboard`, `dynamic` templates (visible in `goldie-01/03-studio-*.jpg`) are each a named sequence of atomic layouts (`hero`, `duo`, `tilt`, `panorama`, `minimal`), so a promo tool should expose a layout vocabulary, not one fixed grid.
4. **Camera orbit around real screens, not static tiles** — aariz51's `S6_DeviceOrbit.tsx` rotates six real app screenshots on an elliptical ring with an easing push-in, driven purely by `frame * constant` for rotation and `interpolate`/spring for scale — cheap to build, reads as expensive motion.
5. **Radial/contextual overlay UI recorded on a real desktop**, wallpaper and all, sells better than an isolated component render — Loop's `loop-03/04-radial-menu-*.jpg` and `loop-05/06-snap-preview-*.jpg` show the actual macOS desktop behind the overlay, which is exactly the "real screen recording" approach the owner's skill targets.
6. **Multi-platform-in-a-row composition** — argent's `argent-11/12-multi-platform*.jpg` lines up iOS/Android/web frames of the same flow side by side to sell cross-platform reach in a single frame, useful if any of Cutling/Undirect/solute ever needs a multi-surface shot.
7. **Consistent crop/aspect across a feature set** sells a "system," not a grab-bag — Plane's five-panel set (`plane-01..05`) and Twenty's dark/light cover pairs (`twenty-01..03`, `hoppscotch-01/02`) all keep identical framing and only swap content, which reads as more deliberate than one-off screenshots.
8. **Simple spring-based entrance + word-reveal beats a lone fade** — haidrrrry's `Motion.tsx` (`code/haidrrrry-Motion.tsx`) explicitly comments "never a lone fade": it pairs opacity with a translateY rise and a scale-up via one `spring()` call, which is a one-line upgrade over a plain `opacity` interpolate.
