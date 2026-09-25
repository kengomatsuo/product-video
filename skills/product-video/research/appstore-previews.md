# App Store preview video / screenshot reference — notes

Source: official App Store product pages on apps.apple.com (US storefront), fetched
2026-09-24. Video frames pulled with ffmpeg directly from the page's embedded HLS
(`.m3u8`, hosted on apptrailers.itunes.apple.com) preview-video stream. Screenshot
"posters" pulled from the page's embedded `mzstatic.com` marketing-screenshot assets.
No page required a browser session — a plain `curl -L` on the app's
`https://apps.apple.com/us/app/id<NNNNNNN>` URL returned the full HTML with all
media URLs inline, so no gated/geo-blocked source was hit.

Apps that do **not** currently ship an App Store preview video (checked, none found in
page HTML): Paste, Bear, Flighty, 1Blocker, Noir, AdGuard, Shopify POS, Loyverse POS,
1Password. For these, only screenshot posters are included below.

## Table

| # | App | Source URL (page + media) | File | What to take |
|---|-----|---------------------------|------|--------------|
| 1 | Things 3 | page: apps.apple.com/us/app/id904244226 · media: apptrailers.itunes.apple.com/.../P1200278782_default.m3u8 | things3-01-mac-device-frame.jpg | Mac window on a solid blue background, no device bezel — just the app window floating with a soft drop shadow. |
| 2 | Things 3 | same as above | things3-02-checklist-detail.jpg | Mid-scroll on a real checklist ("Vacation in Rome") with one row mid-hover-highlight, showing live cursor interaction rather than a static screenshot. |
| 3 | Things 3 | same as above | things3-03-add-task-modal.jpg | A quick-entry modal sheet sliding up over the dimmed list, showing the add-task micro-interaction. |
| 4 | Fantastical | page: apps.apple.com/us/app/id718043190 · media: apptrailers.itunes.apple.com/.../P385416843_default.m3u8 | fantastical-01-caption-natural-language.jpg | Full-bleed caption card, "Natural language" set in heavy bold sans over flat grey, cursor blinking in an empty text field below it — caption-first, UI second. |
| 5 | Fantastical | same as above | fantastical-02-event-creation-ui.jpg | Real iOS event-creation sheet, natural-language text ("Lunch wi...") mid-type above a live day-grid preview that updates as you type. |
| 6 | Fantastical | same as above | fantastical-03-task-edit-sidebar.jpg | Split-pane iPad task editor, list on the left (partly obscured/cropped by the frame edge) and detail form on the right — shows off multi-column layout. |
| 7 | Fantastical | same as above | fantastical-04-weather-widget-ui.jpg | Full weather forecast screen with hourly line chart — a feature screen unrelated to calendaring, used to show app breadth. |
| 8 | Fantastical | same as above | fantastical-05-floating-widgets-collage.jpg | End-of-video hero collage: multiple calendar cards, a lock-screen widget, and a floating dot-matrix calendar tile scattered at angles over a pastel gradient — this is the "everything at once" summary shot. |
| 9 | Structured | page: apps.apple.com/us/app/id1499198946 · media: apptrailers.itunes.apple.com/.../P634415449_default.m3u8 | structured-01-logo-loop-title.jpg | Opening title card: a looping checkmark-circle logo animation, mid-frame, on flat off-white — pure brand mark, no UI. |
| 10 | Structured | same as above | structured-02-caption-onboarding-card.jpg | Small rounded illustration card (eye icon) with caption "Planning a world travel adventure" underneath — a template/example card, not real UI. |
| 11 | Structured | same as above | structured-03-vertical-timeline-icons.jpg | Vertical timeline of the day with colored pill icons (alarm clock, yoga pose, bike) and strikethrough on completed items — the core "structured day" visual metaphor. |
| 12 | Structured | same as above | structured-04-nested-checklist-outline.jpg | Full nested outline / checklist screen for a travel-planning project, colored progress dots per section — shows information density at rest. |
| 13 | Structured | same as above | structured-05-caption-how-long-picker.jpg | Caption card "How long?" over a horizontal duration slider (1/15/30/45m) — a decision-point UI moment paired with a plain-language question. |
| 14 | Square Point of Sale | page: apps.apple.com/us/app/id335393788 · media: apptrailers.itunes.apple.com/.../P1479082702_default.m3u8 | square-01-device-tilt-terrazzo.jpg | Phone lying at a 3/4 angle on a blue-speckled terrazzo countertop, app screen visible; right two-thirds of frame is solid black with a stacked feature caption list ("Manage shop operations / Inventory and orders / ..."). |
| 15 | Square Point of Sale | same as above | square-02-device-tilt-caption-list.jpg | Same shot a couple of seconds later — device and captions barely move; the whole preview is essentially one static tabletop composition, not a UI walkthrough. |
| 16 | Due | page: apps.apple.com/us/app/id390017969 · media: apptrailers.itunes.apple.com/.../P63825708_default.m3u8 (+ a second variant P202077526) | due-01-overdue-list-dark-ui.jpg | Real dark-mode reminder list, red/orange/blue color-coded left-edge bars per section (Overdue/Today/Tomorrow), plain iOS status bar visible at top — no device frame, just the app canvas. |
| 17 | Due | same as above | due-02-snooze-popup-dark.jpg | Full-screen dark "snooze" action sheet with icon row (dismiss/snooze/repeat/alert/OK) and quick +10min/+1hr/+3hr/+1day grid — a persistent-notification interaction, Due's signature feature. |
| 18 | Due | same as above | due-03-caption-black-bg.jpg | Plain caption card, "Manage reminders from notifications" centered in light sans on pure black — no UI, just the value statement. |
| 19 | Due | same as above | due-04-lockscreen-notification-color.jpg | iOS lock screen with a bold pink/purple gradient wallpaper and one Due notification banner ("Print itinerary ✈️") — shows the reminder in its real-world notification context, not inside the app. |
| 20 | MindNode | page: apps.apple.com/us/app/id6446116532 · media: apptrailers.itunes.apple.com/.../P933975716_default.m3u8 | mindnode-01-travel-template-card.jpg | Small rounded template card (eye icon, purple/orange) captioned "Planning a world travel adventure" — near-identical template style to Structured's card (#10), suggesting both used the same preview-video production template. |
| 21 | MindNode | same as above | mindnode-02-caption-collaborate-teal.jpg | Full-bleed caption "Collaborate with anyone." in bold white on solid teal — flat color caption card, no UI. |
| 22 | MindNode | same as above | mindnode-03-mindmap-branches-detail.jpg | Close crop on real mind-map branch lines (orange "Electronic devices" branch, green "Day-by-day breakdown" branch) — shows the node/line drawing style at detail level, not the whole map. |
| 23 | MindNode | same as above | mindnode-04-caption-organize-purple.jpg | Caption "Organize your ideas." on a blue-to-purple gradient — same caption-card pacing as #21, different color per section. |
| 24 | MindNode | same as above | mindnode-05-text-transition-blur.jpg | Mid-transition frame: the word "Integrate" plus ghosted lower lines ("reminders", "calendars", "todos") mid-crossfade/motion-blur — caught between two caption cards, useful reference for how a text transition actually renders mid-blend. |
| 25 | Todoist | page: apps.apple.com/us/app/id572688855 · media: apptrailers.itunes.apple.com/.../P1246579983_default.m3u8 | todoist-01-logo-intro-caption.jpg | Opening logo mark plus caption "Simple enough" in bold dark type over a soft peach gradient background with a diagonal wave shape. |
| 26 | Todoist | same as above | todoist-02-task-creation-sheet.jpg | Real bottom-sheet task composer (Task name / Description / Today / Deadline / P2 flag) with the iOS keyboard and predictive-text bar visible — captured mid-keyboard-animation. |
| 27 | Todoist | same as above | todoist-03-sticky-notes-collage.jpg | Upcoming/calendar view partly obscured by three overlapping colored "sticky note" task cards (pink/blue/yellow) fanned out at angles over it — a collage-style hero composition, not a clean screenshot. |
| 28 | Todoist | same as above | todoist-04-caption-scale-team-mint.jpg | Caption "Powerful enough to scale to your team" over a mint-green gradient, with a small greyed-out notification banner sitting above the text ("Denise assigned you: Send report") — caption plus a supporting notification prop. |
| 29 | Paste | page: apps.apple.com/us/app/id967805235 | paste-01-poster-sub-devices.png | Marketing poster: subscription/pro-features screen, likely a "Paste for Teams" or plan-comparison panel. |
| 30 | Paste | same as above | paste-02-poster-mac-screen.png | Mac screenshot: the multi-column clipboard-history board (Paste's core UI), pinned items down the left. |
| 31 | Paste | same as above | paste-03-poster-iphone-screen.png | iPhone screenshot of the clipboard grid on mobile. |
| 32 | Paste | same as above | paste-04-poster-ipad-screen.png | iPad screenshot, wider grid layout with sidebar. |
| 33 | Paste | same as above | paste-05-poster-mac-screen2.png | A second Mac screenshot, different board/filter state. |
| 34 | Bear | page: apps.apple.com/us/app/id1016366447 | bear-01-poster-search-feature.png | iPhone screenshot demonstrating in-note search with highlighted matches. |
| 35 | Bear | same as above | bear-02-poster-tags-feature.png | iPhone screenshot of the nested-tag sidebar/organization system. |
| 36 | Bear | same as above | bear-03-poster-sketch-ipad.png | iPad screenshot showing Apple Pencil sketch/drawing inside a note. |
| 37 | Bear | same as above | bear-04-poster-markdown-feature.png | iPhone screenshot of live Markdown rendering while typing. |
| 38 | Bear | same as above | bear-05-poster-encryption-ipad.png | iPad screenshot of the note-lock/encryption prompt. |
| 39 | Flighty | page: apps.apple.com/us/app/id1358823008 | flighty-01-poster-ipad-detail.png | iPad screenshot, flight-detail view with map. |
| 40 | Flighty | same as above | flighty-02-poster-title-card.png | Marketing title-card poster (large logo/hero panel), used as a store-listing intro image rather than a UI shot. |
| 41 | Flighty | same as above | flighty-03-poster-wheres-my-plane.png | Poster panel captioned "Where's My Plane" — a named-feature marketing panel over a live-tracking map screenshot. |
| 42 | Flighty | same as above | flighty-04-poster-ipad-detail2.png | Second iPad detail screenshot, different flight state. |
| 43 | Flighty | same as above | flighty-05-poster-ipad-detail3.png | Third iPad detail screenshot. |
| 44 | 1Blocker | page: apps.apple.com/us/app/id1365531024 | oneblocker-01-poster-badges.png | Poster panel with review-badge / award callouts overlaid on the app icon. |
| 45 | 1Blocker | same as above | oneblocker-02-poster-feature.png | Feature poster panel, second badge/testimonial-style layout. |
| 46 | 1Blocker | same as above | oneblocker-03-poster-iphone.png | Plain iPhone screenshot of the blocking-rules list. |
| 47 | 1Blocker | same as above | oneblocker-04-poster-macbook-simple-advanced.png | MacBook mockup poster captioned "Simple & Advanced" — laptop shown at an angle with the settings UI on-screen. |
| 48 | 1Blocker | same as above | oneblocker-05-poster-ipad.png | iPad mockup poster, numbered panel in the listing sequence. |
| 49 | Noir | page: apps.apple.com/us/app/id1592917505 | noir-01-poster-create-themes-mac.png | Mac screenshot poster, caption "Create your own themes" in bold purple above a MacBook-framed theme-editor window (traffic-light buttons, sidebar, live preview card). |
| 50 | Noir | same as above | noir-02-poster-mac-detail.png | Second Mac detail screenshot in the same numbered set. |
| 51 | Noir | same as above | noir-03-poster-mac-detail2.png | Third Mac detail screenshot. |
| 52 | AdGuard | page: apps.apple.com/us/app/id1047223162 | adguard-01-poster-screen1.png | Numbered poster panel 1 of the set (ad-blocking stats/dashboard style). |
| 53 | AdGuard | same as above | adguard-02-poster-screen5.png | Numbered poster panel 5. |
| 54 | AdGuard | same as above | adguard-03-poster-screen3.png | Numbered poster panel 3. |
| 55 | AdGuard | same as above | adguard-04-poster-screen2.png | Numbered poster panel 2. |
| 56 | AdGuard | same as above | adguard-05-poster-screen4.png | Numbered poster panel 4. |
| 57 | Shopify POS | page: apps.apple.com/us/app/id686830644 | shopifypos-01-poster-bopis-iphone.png | iPhone poster panel, "buy online pick up in store" (BOPIS) flow. |
| 58 | Shopify POS | same as above | shopifypos-02-poster-ipad-intro.png | iPad intro/overview poster panel. |
| 59 | Shopify POS | same as above | shopifypos-03-poster-ipad-bopis.png | iPad BOPIS poster panel, larger-format version of #57. |
| 60 | Shopify POS | same as above | shopifypos-04-poster-ipad-apps.png | iPad poster panel showing the app/extension marketplace. |
| 61 | Shopify POS | same as above | shopifypos-05-poster-iphone-apps.png | iPhone poster panel, same app-marketplace feature. |
| 62 | Shopify POS | same as above | shopifypos-06-poster-iphone-customize.png | iPhone poster panel, checkout-customization screen. |
| 63 | Loyverse POS | page: apps.apple.com/us/app/id1070865387 | loyverse-01-poster-image4.png | Numbered poster image 4 of the set (register/checkout screen). |
| 64 | Loyverse POS | same as above | loyverse-02-poster-image5.png | Numbered poster image 5. |
| 65 | Loyverse POS | same as above | loyverse-03-poster-image7.png | Numbered poster image 7. |
| 66 | Loyverse POS | same as above | loyverse-04-poster-image4b.png | A second "image4"-named asset (different platform/localized variant of #63). |
| 67 | Loyverse POS | same as above | loyverse-05-poster-image2.png | Numbered poster image 2. |
| 68 | 1Password | page: apps.apple.com/us/app/id1511601750 | onepassword-01-poster-iphone-15-08.png | iPhone poster panel (en-app-store-screenshots series, panel 08). |
| 69 | 1Password | same as above | onepassword-02-poster-ipad-06.png | iPad poster panel, panel 06 of the same series. |
| 70 | 1Password | same as above | onepassword-03-poster-frame4-watch.png | Apple Watch screenshot: Face ID/passcode-unlock complication mid-entry. |
| 71 | 1Password | same as above | onepassword-04-poster-frame5.png | A second small "Frame" asset, watch or widget size. |
| 72 | 1Password | same as above | onepassword-05-poster-iphone-15-05.png | iPhone poster panel 05 of the main series. |

## Patterns observed across apps

- **Caption cards run 2–3 seconds and never share the frame with real UI.** Things 3, Fantastical, Structured, Due, MindNode and Todoist all cut to a full-bleed flat-color or gradient card with one short sentence in bold sans (see fantastical-01, structured-02/05, due-03, mindnode-02/04, todoist-01/04) before or after showing the actual product — text and product footage are never composited together, they alternate.
- **Two completely different apps (Structured, MindNode) used the same caption-card template**, down to the rounded-corner icon-tile-plus-one-line-caption layout and even one identical caption text, "Planning a world travel adventure" (structured-02, mindnode-01). Likely both commissioned from the same preview-video vendor/template — a formula worth knowing rather than copying outright.
- **Real UI is shown mid-interaction, not as a static screenshot.** Fantastical's event sheet is caught mid-keystroke ("Lunch wi..."), Todoist's composer shows the predictive-text keyboard bar up, and Due's snooze sheet is a full interactive action panel — see fantastical-02, todoist-02, due-02.
- **Only one of the seven video apps uses a physical device mockup on a surface; the rest float the app chrome-less on a flat/gradient background.** Square Point of Sale is the outlier: phone tilted on a terrazzo countertop, motion nearly imperceptible for the full clip (square-01/02). Things 3 and Fantastical instead float a bezel-less Mac/iPad window directly on a solid color.
- **Hero "everything at once" collage shots appear near the middle or end, not necessarily last.** Fantastical scatters several calendar cards and a widget at angles over a pastel gradient (fantastical-05); Todoist fans three colored task cards over the calendar view (todoist-03) — both use overlapping, slightly rotated cards rather than a grid.
- **Notification banners and lock-screen context are used as proof, not just app screenshots.** Due shows its reminder as an actual iOS lock-screen banner on a bold gradient wallpaper (due-04); Todoist shows a greyed notification sitting above its caption card (todoist-04) — the message is "this shows up in your real notification stream," illustrated literally.
- **Dark-mode apps commit to it across every frame, not just a toggle demo.** Due's list, snooze sheet and caption card are all pure black/near-black with a single accent color per state (red for overdue, pink/purple gradients for lock-screen); no frame reverts to light.
- **Marketing screenshot posters (the static panel set) consistently pair one bold caption line with one cropped or angled device mockup**, e.g. Noir's "Create your own themes" over a MacBook window (noir-01), 1Blocker's "Simple & Advanced" over an angled MacBook (oneblocker-04) — the same caption-over-device-mockup grammar as the videos, just as a single static panel instead of a sequence.
- **Several apps (Paste, Flighty, AdGuard, Loyverse, Shopify POS) currently ship no App Store preview video at all**, relying only on the screenshot panel set — worth noting since it means even well-designed, established apps sometimes skip video investment entirely; it is not a signal of lower production quality.
