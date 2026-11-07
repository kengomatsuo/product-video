<!-- remotion-dev/skills@a2824c67f8b4585c294a8101db9f9f0ad3c643f8 remotion-license; Remotion docs /docs/license, /docs/license/faq, /docs/terms, read 2026-11-07 -> product-video references/remotion/license.md -->
# Remotion licence

Remotion is source-available with its own licence, not an open-source one. This summary was
read from `https://www.remotion.dev/docs/license/faq.md` and `https://www.remotion.dev/docs/terms.md`
on 2026-11-07. Terms and prices change; read the live pages before a decision, and treat this
file as a pointer, not legal advice. Buying is at `https://www.remotion.pro/license`.

## Who pays

- **Free licence**: an individual (personal or commercial use), a team or company with up to
  3 people in total headcount, a non-profit, or someone evaluating. No sign-up, no
  difference in features, commercial use allowed.
- **Company licence**: required once the combined headcount of everyone who works on the
  Remotion project is 4 or more. Headcount counts all personnel, whether or not they use
  Remotion. A company with 20 staff and one Remotion user still needs it.
- **Enterprise licence**: a Company licence with a $500 monthly minimum, signed agreements,
  vendor paperwork and a support channel.

## Company licence kinds (prices as read on the date above)

- **Creators**: $25 per month per person who writes Remotion code, by hand or with a coding
  agent.
- **Automators**: $0.01 per render, $100 per month minimum, for organisations that run an
  automation. Both kinds can be held; a combined $100 minimum applies.
- An automation is code you own that calls a render API or command: `renderMedia()`,
  `renderStill()`, `renderFrames()`, the Lambda, Cloud Run, Vercel and web-renderer
  variants, `npx remotion render`, `npx remotion still`, or the `<Player>`. A render is one
  successful video, audio, GIF, still or image sequence. Studio and Player previews do not
  count.

## What it means for this skill

- Films here render with `bunx remotion render` and `still` (via `tools/render.ts`,
  `tools/stills.ts`). The FAQ's literal list of automation commands includes those two, while
  its Creators description is "produce videos without setting up an automation". Which one
  fits a company that renders its own films by hand is not settled by the pages read; ask
  Remotion (hi@remotion.dev) before the first commercial release when the company has 4 or
  more people.
- A film delivered as a video file to a client does not count the client's headcount. Handing
  over the project code does, and then both headcounts add up.
- Not allowed under any licence: selling Remotion itself, or letting users upload their own
  Remotion projects for rendering.
- Server-side renders send no telemetry today. The FAQ announces mandatory telemetry for the
  Automators plan from Remotion 5.0; client-side rendering has telemetry on by default.
