# On-screen copy from the references (OCR, 2026-09-24)

Text read from every reference image with macOS Vision (`<skill>/scripts/refs-ocr.swift`). Tiers say how far a line can be trusted as HUMAN copy:

| Tier | Sources | Trust |
|---|---|---|
| A | Linear, Framer, Notion, Things, Screen Studio launch videos | in-house writers; most text here is product UI, not headlines |
| B | App Store previews and store panels of established apps | mostly human, older copy safest |
| C | Product Hunt galleries, competitor POS sites, GitHub READMEs | mixed; much 2025-26 launch copy is AI-assisted |
| D | Dribbble/Behance, YouTube tutorial demos | placeholder or AI filler; never a copy example |

A line is "flagged" when it matches an AI tell: not just X but Y; seamless, effortless, unlock, elevate, supercharge, reimagine, revolutionize, empower, streamline, all-in-one, at your fingertips; "No X. No Y."; a three-item list.

## What the trusted copy does

- Headline length (large type, tiers A+B): median 3, p25 2, p75 5, n=319.
- Verb + concrete object: "Accept any payment type", "Sync clipboard history", "Analyse sales trend", "Sell in-store and online".
- Lists are literal and specific, not triads: Wipr's panel lists fifteen blocked things one per line ("× cookie warnings", "× anti-blocker nags").
- The product UI carries most of the words; Linear, Notion and Things show real task text and chats, with almost no overlaid headline.
- Tier D copy is where the tells live (7 of 17 flagged lines), e.g. "designed to revolutionize the way", "streamline your operations and empower you".

## Trusted headlines (tiers A and B, large type, no tells)

| tier | source | brand | words | text |
|---|---|---|---|---|
| B | posters | appstore-loyverse-dashboard | 3 | Analyse sales trend |
| B | posters | appstore-square-pos | 3 | Access funds instantly. |
| B | posters | appstore-square-retail | 4 | Accept any payment type |
| B | posters | appstore-wipr2 | 3 | × non-english ads |
| B | posters | appstore-altos-pos | 3 | For food and |
| B | posters | appstore-pastepal | 2 | Universal access |
| B | posters | appstore-loyverse-dashboard | 2 | stock level |
| B | posters | appstore-square-retail | 2 | and online |
| B | posters | appstore-square-retail | 2 | Reader Ready |
| B | posters | appstore-square-retail | 2 | Q Search |
| B | posters | appstore-square-retail | 2 | Saved Carts |
| B | posters | appstore-loyverse-pos | 2 | Accept multiple |
| B | posters | appstore-loyverse-pos | 2 | payment types |
| B | posters | appstore | 2 | on sites |
| B | posters | appstore-clover-go | 3 | manage your business |
| B | posters | appstore-clover-go | 2 | anytime, anywhere |
| B | posters | appstore-eatos | 2 | LOG IN |
| B | posters | appstore-paste | 3 | A Better Way |
| B | posters | appstore-paste | 3 | to Copy and |
| B | posters | appstore-toast-now | 4 | Set up & launch |
| B | posters | appstore-toast-now | 2 | your business |
| B | posters | appstore-wipr2 | 5 | Block all the bad things |
| B | posters | appstore-clipboardpp | 4 | hold tap to open |
| B | posters | appstore-clover-go | 5 | Track payments and manage your |
| B | posters | appstore-clover-go | 3 | business anytime, anywhere |
| B | posters | appstore-adblockpro | 3 | lOfps ULTRA HD] |
| B | posters | appstore-adblockpro | 4 | Watermelon: Fruit or Vegetable? |
| B | posters | appstore-adblockpro | 4 | Apples vs Oranges (comparison) |
| B | posters | appstore-adblockpro | 7 | How to tie balloon (in 70 steps) |
| B | posters | appstore-altos-pos | 5 | For food and retail businesses |
| B | posters | appstore-adguard | 3 | Take back your |
| B | posters | appstore-adguard | 2 | privacy and |
| B | posters | appstore-adguard | 3 | • Ab Times |
| B | posters | appstore-adguard | 2 | is enabled |
| B | posters | appstore-adguard | 2 | NS protection |
| B | posters | appstore-loyverse-dashboard | 2 | Analyse sales |
| B | posters | appstore-loyverse-dashboard | 4 | Real-time insights at your |
| B | posters | appstore-altos-pos | 2 | Back Office |
| B | posters | appstore-altos-pos | 2 | ~ Reports |
| B | posters | appstore-altos-pos | 2 | GORY + |
| B | posters | appstore-altos-pos | 2 | Pizza (10) |
| B | posters | appstore-adguard | 3 | The World's Most |
| B | posters | appstore-adguard | 3 | Advanced Ad Blocker |
| B | posters | appstore-adguard | 3 | The Ad Times |
| B | posters | appstore-adguard | 5 | Legacy Safari Extensions are no |
| B | posters | appstore-adguard | 6 | longer supported: is it the end |
| B | posters | appstore-adguard | 4 | of powerful ad blockers? |
| B | posters | appstore-adguard | 8 | started the process of deprecating the traditional extensions, |
| B | posters | appstore-adguard | 9 | install the old style extensions and enable them manually. |
| B | posters | appstore-adguard | 8 | Safari started the process of deprecating the traditional |
| B | posters | appstore-adguard | 9 | could install the old style extensions and enable them |
| B | posters | appstore-adguard | 9 | install the old style extensions and enable them manuall |
| B | posters | appstore-adguard | 8 | Safari started the process of deprecating the traditi |
| B | posters | appstore-adguard | 9 | extensions, and we covered it in our Blog article |
| B | posters | appstore-adguard | 8 | could install the old style extensions and enab |
| B | posters | appstore-eatos | 2 | ALL DAY. |
| B | posters | appstore-paste | 2 | A Better |
| B | posters | appstore-paste | 3 | Way to Copy |
| B | posters | appstore-paste | 2 | and Paste |
| B | posters | appstore-toast-now | 2 | Manage your |
| B | posters | appstore-toast-now | 3 | on the go |
| B | posters | appstore | 2 | Ad Blocker |
| B | posters | appstore | 2 | for Safari |
| B | posters | appstore-paste | 3 | clipboard for your |
| B | posters | appstore-paste | 3 | The limitless clipboard |
| B | posters | appstore-paste | 3 | for your essentials |
| B | posters | appstore-square-pos | 2 | Get started |
| B | posters | appstore-square-pos | 2 | any payment. |
| B | posters | appstore-pastepal | 2 | Your Content, |
| B | posters | appstore-pastepal | 2 | Ready Anytime |
| B | posters | appstore-pastepal | 5 | autiful Free Images & Pictures |
| B | posters | appstore-toast-now | 2 | Live reporting |
| B | posters | appstore-toast-now | 2 | & analytics |
| B | posters | appstore-pastepal | 3 | Organized into collections |
| B | posters | appstore-adguard | 2 | The World's |
| B | posters | appstore-adguard | 3 | Legacy Safari Extensions |
| B | posters | appstore-adguard | 4 | are no longer supported: |
| B | posters | appstore-adguard | 7 | is it the end of powerful ad |
| B | posters | appstore-adguard | 8 | We can't say we weren't expecting that. Last |
| B | posters | appstore-adguard | 7 | year Safari started the process of deprecating |
| B | posters | appstore-adguard | 8 | the traditional extensions, and we covered it in |
| B | posters | appstore-adguard | 9 | our Blog article. But you still could install the |
| B | posters | appstore-adguard | 6 | old style extensions and enable them |
| B | posters | appstore-adguard | 7 | Safari started the process of deprecating the |
| B | posters | appstore-adguard | 8 | traditional extensions, and we covered it in our |
| B | posters | appstore-adguard | 9 | Blog article. But you still could install the old |
| B | posters | appstore-clipboardpp | 3 | clean & simple |
| B | posters | appstore-square-pos | 3 | Get started quickly. |
| B | posters | appstore-square-pos | 3 | Take any payment. |
| B | posters | appstore-square-pos | 2 | French fries |
| B | posters | appstore-square-pos | 3 | Soda × 2 |
| B | posters | appstore-square-pos | 2 | Mushroom burger |
| B | posters | appstore-square-retail | 3 | payments with just |
| B | posters | appstore-square-retail | 2 | your iPhone |
| B | posters | appstore-loyverse-pos | 2 | Track inventory |
| B | posters | appstore | 2 | Watch videos |
| B | posters | appstore | 2 | without ads |
| B | posters | appstore-square-retail | 4 | Sell in-store and online |
| B | posters | appstore-loyverse-dashboard | 2 | Revenue and |
| B | posters | appstore-eatos | 3 | ACCOUNT WITH EASE |
| B | posters | appstore | 5 | Hamster Opens Tiny Café in |
| B | posters | appstore-loyverse-pos | 3 | Easy to sell |
| B | posters | appstore-pastepal | 3 | Add And Organize |
| B | posters | appstore-clipboardpp | 4 | open app to save |
| B | posters | appstore-clipboardpp | 2 | copied text |
| B | posters | appstore-adguard | 4 | Take back your privacy |
| B | posters | appstore-adguard | 2 | and security |
| B | posters | appstore-adguard | 3 | Protection is enabled |
| B | posters | appstore-adguard | 2 | DNS protection |
| B | posters | appstore-adguard | 3 | at you still |
| B | posters | appstore-adguard | 3 | This week stat |
| B | posters | appstore-adguard | 2 | Missed ad? |
| B | posters | appstore-adguard | 3 | Block it manually |
| B | posters | appstore-square-retail | 2 | • Square |
| B | posters | appstore-square-retail | 3 | with quick setup, |
| B | posters | appstore-square-retail | 2 | easy inventory |
| B | posters | appstore-adblockpro | 3 | ! Better Browsing |
| B | posters | appstore-clover-go | 4 | Get a snapshot of |
| B | posters | appstore-clover-go | 6 | Get a snapshot of your sales |
| B | posters | appstore-adblockpro | 2 | BLOCK ADS |
| B | posters | appstore-adblockpro | 2 | AdBlock Pro |
| B | posters | appstore-adblockpro | 2 | in Safari |
| B | posters | appstore-adblockpro | 5 | how to fix common issues |
| B | posters | appstore-adblockpro | 2 | RECOMMENDED SETTINGS |
| B | posters | appstore-adblockpro | 6 | 4x faster loading, 50% less data |
| B | posters | appstore-adblockpro | 3 | Stop Tracking Scripts |
| B | posters | appstore-adblockpro | 3 | Block Social Buttons |
| B | posters | appstore-adblockpro | 4 | block social media tracking |
| B | posters | appstore-adblockpro | 4 | block known malware pages |
| B | posters | appstore-adblockpro | 2 | Background Updates |
| B | posters | appstore-adblockpro | 3 | Update Filters Automatically |
| B | posters | appstore-adblockpro | 2 | Bypass Anti-Adblock |
| B | posters | appstore-adblockpro | 4 | circumvent adblock detectors (expe |
| B | posters | appstore-adblockpro | 3 | Hide Cookie Prompts |
| B | posters | appstore-adblockpro | 8 | ¡Cat X Pro Mini - 100 HOURS [8K |
| B | posters | appstore-adblockpro | 7 | consumer's mood when they see your ad. |
| B | appstore-previews | loyverse | 2 | Build your |
| B | appstore-previews | loyverse | 2 | customer base |
| B | appstore-previews | shopifypos | 2 | smart grid |
| B | appstore-previews | square | 2 | Retail mode |
| B | appstore-previews | square | 3 | Manage shop operations |
| B | appstore-previews | square | 3 | Inventory and orders |
| B | appstore-previews | square | 2 | Customer profiles |
| B | appstore-previews | square | 2 | Integrated payments |
| B | appstore-previews | adguard | 4 | See who is trying |
| B | appstore-previews | adguard | 3 | to track you |
| B | appstore-previews | noir | 6 | Easy to configure to your liking |
| B | appstore-previews | shopifypos | 4 | Design your perfect POS |
| B | appstore-previews | flighty | 2 | Flighty Friends |
| B | appstore-previews | loyverse | 2 | sales history |
| B | appstore-previews | shopifypos | 2 | Design your |
| B | appstore-previews | shopifypos | 2 | perfect POS |
| B | appstore-previews | onepassword | 3 | Securely share anything |
| B | appstore-previews | noir | 4 | Fully customizable per website |
| B | appstore-previews | paste | 5 | Share pinboards and work together |
| B | appstore-previews | loyverse | 3 | Build your customer |
| B | appstore-previews | oneblocker | 2 | • Safari |
| B | appstore-previews | structured | 2 | How long? |
| B | appstore-previews | todoist | 2 | Simple enough |
| B | appstore-previews | fantastical | 3 | 900A# PM 10/2122 |
| B | appstore-previews | oneblocker | 4 | Ad Blocker for Safari |
| B | appstore-previews | oneblocker | 6 | The New Yorkcimes THEVERGE TE TechCrunch |
| B | appstore-previews | onepassword | 2 | Personal Identity |
| B | appstore-previews | shopifypos | 7 | The point of sale for every sale |
| B | appstore-previews | oneblocker | 2 | Hide other |
| B | appstore-previews | oneblocker | 2 | Pop-ups, widgets. |
| B | appstore-previews | paste | 3 | 3 minutes ag |
| B | appstore-previews | paste | 3 | 2 hours a |
| B | appstore-previews | paste | 2 | 4 hours |
| B | appstore-previews | paste | 2 | 7 minutes |
| B | appstore-previews | paste | 2 | Your Y |
| B | appstore-previews | flighty | 5 | All Airlines and Airports Worldwide |
| B | appstore-previews | bear | 2 | Private nôtes |
| B | appstore-previews | adguard | 4 | Add your own filters |
| B | appstore-previews | oneblocker | 2 | Curated Filters |
| B | appstore-previews | shopifypos | 5 | Buy online, pickup in store |
| B | appstore-previews | bear | 3 | Sketch anywhere ! |
| B | appstore-previews | bear | 2 | baking + |
| B | appstore-previews | bear | 2 | vinegar mix |
| B | appstore-previews | todoist | 2 | Powerful enough |
| B | appstore-previews | noir | 4 | Create your own themes |
| B | appstore-previews | flighty | 2 | My Flights |
| B | appstore-previews | flighty | 5 | New York to Los Angeles |
| B | appstore-previews | due | 2 | Manage reminders |
| B | appstore-previews | due | 2 | from notifications |
| B | appstore-previews | mindnode | 3 | for each day |
| B | appstore-previews | shopifypos | 2 | Buy online, |
| A | launch-videos | linear | 4 | Worked for 6min - |
| A | launch-videos | linear | 3 | • Jasdev Singh |
| A | launch-videos | linear | 9 | add a preview so I can verify this change. |
| A | launch-videos | linear | 2 | Getting ready... |
| A | launch-videos | things | 4 | • Research metro passes |
| A | launch-videos | things | 3 | O New To-Do |
| A | launch-videos | things | 3 | all-new O power |
| A | launch-videos | notion | 4 | User feedback call @Today |
| A | launch-videos | framer | 2 | New Chat |
| A | launch-videos | framer | 7 | Create a sleek black homepage for an |
| A | launch-videos | framer | 3 | Al well-being re/ |
| A | launch-videos | framer | 3 | Opus 4.8 v |
| A | launch-videos | framer | 3 | • + T |
| A | launch-videos | things | 3 | and much more |
| A | launch-videos | linear | 3 | DY FOR REVIEW |
| A | launch-videos | linear | 3 | The right environment |
| A | launch-videos | linear | 3 | for every session. |
| A | launch-videos | linear | 2 | Opus 5 |
| A | launch-videos | linear | 3 | Changes - 4 |
| A | launch-videos | things | 4 | Vacation in Rome ••• |
| A | launch-videos | things | 8 | We'll go from June 14-22 and stop through |
| A | launch-videos | things | 9 | London on the way back to visit Dave & |
| A | launch-videos | linear | 7 | That old wrapper carried the row-lever un |
| A | launch-videos | linear | 2 | • subLabelSlot |
| A | launch-videos | linear | 3 | • outer textWrapper |
| A | launch-videos | linear | 5 | ithout truncate or nowrap, so |
| A | launch-videos | linear | 5 | line under the row content. |
| A | launch-videos | screenstudio | 3 | show US dollars. |
| A | launch-videos | notion | 2 | Acme Inc. |
| A | launch-videos | notion | 8 | • Timeline v Priority • By team + |
| A | launch-videos | linear | 3 | * Claude Code |
| A | launch-videos | linear | 2 | Runtime version |
| A | launch-videos | linear | 2 | Sonnet 5 |
| A | launch-videos | notion | 4 | Weekly team status @Today |
| A | launch-videos | notion | 4 | This week's completed tasks: |
| A | launch-videos | notion | 2 | Today's priorities |
| A | launch-videos | framer | 2 | Hello, Neo |
| A | launch-videos | notion | 3 | Bug Tracking Dashboard |
| A | launch-videos | things | 2 | • Things |
| A | launch-videos | linear | 3 | PROJECT STATUS CHANGES |
| A | launch-videos | linear | 2 | verPeek.tsx client/src/compon.... |
| A | launch-videos | linear | 2 | 6} noMinW |
| A | launch-videos | things | 6 | • Buy a whiteboard and accessories |
| A | launch-videos | things | 7 | Something around 4' × 3' that's free- |
| A | launch-videos | things | 4 | standing, two-sided, and magnetic. |
| A | launch-videos | things | 3 | v Cleaning spray |
| A | launch-videos | things | 3 | O Magnetic eraser |
| A | launch-videos | things | 3 | • Round magnets |
| A | launch-videos | linear | 4 | Write a project update... |
| A | launch-videos | linear | 2 | Target date |
| A | launch-videos | linear | 4 | Progress since May 1 |
| A | launch-videos | linear | 5 | • GA 3% → 33% |
| A | launch-videos | linear | 3 | In Progress → |
| A | launch-videos | linear | 5 | Apr 2026 → May 2026 |
| A | launch-videos | linear | 4 | * Write with Agent |
| A | launch-videos | linear | 7 | Design has been reviewed and accepted, ready |
| A | launch-videos | linear | 6 | 9 Design • Completed 9 Blasues |
| A | launch-videos | linear | 2 | • Todo |
| A | launch-videos | linear | 2 | In Progross |
| A | launch-videos | linear | 2 | Review requested |
| A | launch-videos | linear | 2 | In Review |
| A | launch-videos | linear | 2 | Revisions requested |
| A | launch-videos | linear | 2 | Won't Do |
| A | launch-videos | linear | 2 | REVIEW ISSUES |
| A | launch-videos | linear | 3 | UPDATE PRD DOCUMENT |
| A | launch-videos | things | 2 | New Proj |
| A | launch-videos | framer | 3 | Al research for |
| A | launch-videos | framer | 2 | human well-being |
| A | launch-videos | linear | 4 | Worked for 6min = |
| A | launch-videos | notion | 6 | How can I help you today? |
| A | launch-videos | notion | 3 | Write meeting agenda |
| A | launch-videos | linear | 4 | a preview so i |
| A | launch-videos | linear | 2 | Draft update |
| A | launch-videos | linear | 2 | Something else... |
| A | launch-videos | linear | 5 | Write Onboarding 2026 project update |
| A | launch-videos | linear | 9 | Linear moved from Todo to Started • 1d ago |
| A | launch-videos | linear | 7 | Customer follow-up is running... • just now |
| A | launch-videos | notion | 3 | Launch status updates |
| A | launch-videos | notion | 6 | Weekly team status @Aug 10, 2026 |
| A | launch-videos | notion | 6 | Weekly team status @Jul 20, 2026 |
| A | launch-videos | notion | 6 | Weekly team status @Jul 13, 2026 |
| A | launch-videos | linear | 3 | • BUG LABELS |
| A | launch-videos | framer | 4 | We build the tools |
| A | launch-videos | framer | 3 | that make intelligence |
| A | launch-videos | framer | 2 | feel creative. |
| A | launch-videos | notion | 6 | pages, our roadmap, and company priorities |
| A | launch-videos | notion | 5 | Q 96 search results • |
| A | launch-videos | notion | 6 | Acme Inc., Summary of company priorities |
| A | launch-videos | notion | 6 | Acme Inc. is focused on profitable, |
| A | launch-videos | notion | 4 | markets, and deepening enterprise |
| A | launch-videos | screenstudio | 2 | - L |
| A | launch-videos | screenstudio | 3 | Monthlv strategy sync |
| A | launch-videos | screenstudio | 7 | you press command and just drag it |
| A | launch-videos | framer | 7 | formed in 1993 by Thomas Bangalter and |
| A | launch-videos | linear | 2 | & Loops |
| A | launch-videos | framer | 3 | component that displays |
| A | launch-videos | framer | 4 | uploaded images in a |
| A | launch-videos | framer | 3 | draggable rotating ring |
| A | launch-videos | framer | 5 | that speeds up on scroll |
| A | launch-videos | linear | 6 | When an issue is marked done |
| A | launch-videos | notion | 2 | Ramp HQ |
| A | launch-videos | notion | 3 | New features documentation |
| A | launch-videos | linear | 2 | localhost: 6379 |
| A | launch-videos | linear | 2 | • Position/order |
| A | launch-videos | linear | 4 | • Triage-rule usage count |
| A | launch-videos | linear | 4 | • Anything overly settings-specific |
| A | launch-videos | linear | 6 | Create an issue for this andi |
| A | launch-videos | linear | 2 | / agr |
| A | launch-videos | linear | 5 | * Claude Code Opus 5 |
| A | launch-videos | linear | 2 | Node.js 22 |
| A | launch-videos | framer | 5 | Introducing MacBook Neo, an amazing |
| A | launch-videos | framer | 5 | Mac at a surprising pre |
| A | launch-videos | framer | 4 | ore. With a durable |
| A | launch-videos | framer | 5 | design, beautiful coors, and powerful |
| A | launch-videos | framer | 7 | features, it's magical nw way to fall |
| A | launch-videos | framer | 7 | head over heels with Nac, every day. |
| A | launch-videos | framer | 3 | Welme to thefamily. |
| A | launch-videos | framer | 4 | Love at first Mac. |
| A | launch-videos | framer | 5 | Introducing Macbook Iveo, an amazing |
| A | launch-videos | framer | 8 | Mac at a surprising price. With a durable |
| A | launch-videos | framer | 5 | design, beautiful colors, and powerful |
| A | launch-videos | framer | 8 | features, it's a magical new way to fall |
| A | launch-videos | framer | 7 | head over heels with Mac, every day. |
| A | launch-videos | framer | 4 | Welcome to the family. |
| A | launch-videos | linear | 4 | Lily 32 minutes ago |
| A | launch-videos | linear | 3 | READ SLACK CHANNEL |
| A | launch-videos | notion | 3 | @ Add context |
| A | launch-videos | notion | 9 | Create a bug tracker with the latest customer feedback |
| A | launch-videos | linear | 8 | Help me write an update for this project |
| A | launch-videos | linear | 8 | completed issues, project activity, and the connected Slack |
| A | launch-videos | screenstudio | 8 | down here and now we format it to |
| A | launch-videos | notion | 3 | 1 Ramp HQ |

## Tier C headlines (no tells, verify before copying the style)

| tier | source | brand | words | text |
|---|---|---|---|---|
| C | posters | square-square | 3 | Thank you for |
| C | posters | square-square | 2 | visiting us! |
| C | posters | producthunt-popclip | 4 | 3. git concepts chapt |
| C | posters | producthunt-raycast | 2 | Cloud Sync |
| C | posters | producthunt-raycast | 5 | Keep everything safe and updated |
| C | posters | producthunt-raycast | 6 | across your Macs. Perfect to switch |
| C | posters | producthunt-raycast | 5 | between personal and work setup. |
| C | posters | producthunt-raycast | 4 | Search for apps and |
| C | posters | producthunt-yoink | 5 | How I use my iPad |
| C | posters | square-square | 2 | Pay $59.13 |
| C | posters | producthunt-superhuman | 3 | Respond faster to |
| C | posters | producthunt-superhuman | 3 | what matters most |
| C | posters | producthunt-superhuman | 5 | Document shared with you: "Ac |
| C | posters | square-square | 4 | Tap, Insert, or Swipe |
| C | posters | producthunt-upserve | 2 | by Lightspeed |
| C | posters | producthunt-upserve | 4 | boost your restaurant profits |
| C | posters | producthunt-upserve | 9 | Point-of-Sale Payments Insights Workforce Inventory Loyalty Online Ordering Marketing |
| C | posters | producthunt-fantastical | 2 | * Claude |
| C | posters | producthunt-fantastical | 2 | Blog Post |
| C | posters | producthunt-fantastical | 2 | Office Hours |
| C | posters | producthunt-fantastical | 2 | Al Jamming |
| C | posters | producthunt-fantastical | 2 | Vision Room |
| C | posters | producthunt-fantastical | 2 | Flexibits Team |
| C | posters | producthunt-fantastical | 4 | At the pool I |
| C | posters | producthunt-typora | 2 | Unordered List |
| C | posters | producthunt-shottr | 4 | between any two raster |
| C | posters | producthunt-shottr | 4 | objects on your screen |
| C | posters | producthunt-shottr | 3 | You can use |
| C | posters | producthunt-superhuman | 2 | Follow up |
| C | posters | producthunt-superhuman | 4 | on time, every time |
| C | posters | producthunt-superhuman | 8 | Absolutely! Can you please set up a meetir |
| C | posters | producthunt-superhuman | 2 | open questions. |
| C | posters | producthunt-superhuman | 9 | Reminder set: Monday July 10th if no reply UN |
| C | posters | producthunt-raycast | 2 | Raycast Al |
| C | posters | producthunt-raycast | 5 | Write smarter, code faster and |
| C | posters | producthunt-raycast | 4 | answer questions quicker with |
| C | posters | producthunt-raycast | 3 | ChatGPT in Raycast. |
| C | posters | producthunt-raycast | 5 | Deeply integrated into macOS and |
| C | posters | producthunt-raycast | 4 | just one keystroke away. |
| C | posters | producthunt-raycast | 3 | could you assist |
| C | posters | producthunt-raycast | 3 | Ask Al an |
| C | posters | producthunt-raycast | 3 | Oh, good que: |
| C | posters | producthunt-raycast | 3 | any added cre |
| C | posters | producthunt-raycast | 2 | Ingredients fo |
| C | posters | producthunt-lightspeed-restaurant | 2 | & Payments. |
| C | posters | producthunt-fantastical | 2 | Install the |
| C | posters | producthunt-fantastical | 2 | connector (MCP) |
| C | posters | producthunt-fantastical | 3 | in the Claude |
| C | posters | producthunt-fantastical | 2 | desktop app |
| C | posters | producthunt-fantastical | 6 | to add scheduling right into your |
| C | posters | producthunt-shottr | 4 | Take a screenshot of |
| C | posters | producthunt-shottr | 4 | a long web page |
| C | posters | producthunt-shottr | 4 | or capture a chat |
| C | posters | producthunt-shottr | 4 | Annotations are easy to |
| C | posters | producthunt-shottr | 5 | add and edit, and they |
| C | posters | producthunt-shottr | 3 | always look good |
| C | posters | producthunt-shottr | 7 | ou can use letters, numbers & periods |
| C | posters | producthunt-obsidian | 3 | Writing is telepathy |
| C | posters | producthunt-superhuman | 3 | The Fastest Email |
| C | posters | producthunt-superhuman | 3 | Experience Ever Made |
| C | posters | producthunt-notion | 8 | Reading will make you freei - Paul Rand |
| C | posters | producthunt-bartender | 2 | Q dr |
| C | posters | producthunt-bartender | 2 | Bartender 4 |
| C | posters | producthunt-bartender | 2 | Keyboard Brightness |
| C | posters | producthunt-bartender | 3 | Do Not Disturb |
| C | posters | producthunt-shottr | 2 | Text Recognition |
| C | posters | producthunt-shottr | 5 | Text copied to the clipboard |
| C | posters | producthunt-popclip | 2 | sterne promontory, |
| C | posters | producthunt-popclip | 6 | e air, look you, this b |
| C | posters | producthunt-popclip | 4 | ent, this majestical ro |
| C | posters | producthunt-popclip | 5 | ¿ it appears no other |
| C | posters | producthunt-popclip | 2 | Q Cut |
| C | posters | producthunt-popclip | 6 | ‹ is a man! how noble |
| C | posters | producthunt-popclip | 5 | y! in form and movi |
| C | posters | producthunt-popclip | 5 | le! in action how lik |
| C | posters | producthunt-popclip | 5 | like a rod! the hea |
| C | posters | producthunt-maccy | 4 | Start typing to search |
| C | posters | producthunt-maccy | 5 | Use shortcuts to select faster |
| C | posters | producthunt-maccy | 3 | No fluff! @ |
| C | posters | producthunt-maccy | 4 | Clear the copy history |
| C | posters | producthunt-maccy | 5 | Select with pressed to paste |
| C | posters | producthunt-yoink | 3 | Yoink for iPad |
| C | posters | producthunt-yoink | 6 | Simplify and Improve Drag and Drop |
| C | posters | producthunt-yoink | 6 | on your iPad on iOS 11 |
| C | posters | producthunt-things | 4 | headings. Insert new to-dos |
| C | posters | producthunt-things | 4 | with drag and drop. |
| C | posters | producthunt-obsidian | 3 | Sharpen your thinking. |
| C | posters | producthunt-fantastical | 2 | Make your |
| C | github | twenty | 6 | Create your apps with ‹› * |
| C | github | twenty | 9 | Create a front-end component to display my close rate |
| C | github | codeedit | 2 | QK main |
| C | github | codeedit | 6 | { useState, useCallback } from "react"; |
| C | github | soloandco | 3 | Send invoice reminders |
| C | github | soloandco | 6 | days. Use the standard reminder template. |
| C | github | soloandco | 6 | Everything about it in one panel |
| C | github | plane | 2 | No.of projects |
| C | github | argent | 7 | Hi Argent, we've introduced a functionality, where |
| C | github | argent | 4 | → Add a follow-up |
| C | github | argent | 3 | Sonnet 4.6 1M |
| C | github | argent | 3 | ~/Desktop/event-gallery-demo • main |
| C | github | aptabase | 3 | Analytics for Apps. |
| C | github | aptabase | 2 | Privacy-First. Simple. |
| C | github | soloandco | 2 | Search tasks |
| C | github | soloandco | 6 | This week 7 of 12 done |
| C | github | soloandco | 3 | Update onboarding checklist |
| C | github | argent | 3 | Generating 11 tokens |
| C | github | argent | 3 | Add a follow-up |
| C | github | argent | 2 | ~/Desktop/event-gallery-demo main |
| C | github | ice | 2 | 79% *D |
| C | github | ice | 3 | Fri Jul 26 |
| C | github | argent | 2 | mansion M |
| C | github | goldie | 6 | The native IOS & Android clie |
| C | github | haidrrrry | 2 | Claude Design |
| C | github | twenty | 8 | Plus all the tools of a good CRM |
| C | github | argent | 4 | • Referral program experiment |
| C | github | stats | 3 | 1 377 KB/8 |
| C | github | stats | 2 | 9.18 GB |
| C | github | stats | 2 | 22.82 GB |
| C | github | stats | 2 | 295.9 GB |
| C | github | stats | 2 | 698.8 GB |

## Flagged lines (do not imitate)

| tier | source | brand | words | text |
|---|---|---|---|---|
| B | posters | appstore-loyverse-dashboard | 5 | Real-time insights at your fingertips |
| B | posters | appstore-pastepal | 5 | access Mac, iPhone and iPad |
| C | posters | producthunt-upserve | 4 | All-in-one system designed to |
| B | posters | appstore-altos-pos | 2 | All-in-one solution |
| C | posters | producthunt-lightspeed-restaurant | 3 | Hospo's all-in-one POS |
| B | posters | appstore-adblockpro | 14 | copy is difficult, as it must appeal to, entice, and convince consumers to take |
| B | appstore-previews | paste | 5 | Weight, size, and color to |
| C | github | aptabase | 7 | Built for Deskop, Mobile and Web Apps. |
| D | youtube | vye0_xIG5HY | 6 | clarity, consistency, and overall user experience. |
| A | launch-videos | framer | 9 | ess is close, considered, and unflinchingly attentive to detail. |
| A | launch-videos | notion | 7 | from Slack, Notion, and email; duplicates are |
| D | dribbble-behance | dribbble-dhira | 10 | Our POS mobile app is designed to revolutionize the way |
| D | dribbble-behance | dribbble-dhira | 7 | comprehensive suite of features that streamline your |
| D | dribbble-behance | dribbble-dhira | 7 | operations and empower you to take control. |
| D | dribbble-behance | dribbble-whatastory | 3 | All in One |
| D | dribbble-behance | dribbble-whatastory | 4 | All in One Place |
| D | dribbble-behance | dribbble-rixlab | 8 | these four steps to unlock the full power. |
