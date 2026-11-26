# Explainers and hybrid films

Use this for any film that shows how something works, and for a store preview that lays animation over real recordings. Pixel sizes assume a 1080-tall frame. The numbers are starting values from one approved film: measure them again on the new film.

## Turn each idea into an object

- Give each shot one idea, shown as one physical thing a viewer with no technical knowledge reads with the sound off: an invisible overlay is a pane of glass, a link that changes is a flipping address tag, a hidden tab is a card sliding behind the device, a redirect is a page shoved out of the screen.
- Cut anything only an engineer reads: code, property values, wireframes, rulers, long addresses. Labels are the objects themselves.
- Cut a second idea from a shot, however good it is. A device line-up, a knot on a back arrow and a timeline scrubber each cost the viewer the first idea.
- Show the answer in the framing of the trick it beats. A rescue is the theft's own move run backwards at the same speed.

## A film made wholly as motion graphics

- Build the product from the brand's own objects: the shapes in its icon, its colours, the thing it makes or fills in. An app screen drawn in code on a plain ground reads as a cropped recording, however carefully it is drawn.
- Take each shape from the brand's files (the icon's layer SVGs, its Icon Composer package), and take each colour from a rendered frame of the finished icon, since a wide-gamut source file read raw gives a duller colour than the one viewers see.
- The film ends with those objects landing in the icon's exact arrangement, each layer at its own angle and place, and the finished icon fades in over them with no dip. An outline that closes into the icon uses the icon's own alpha as its mask: a rounded rectangle is not the icon's curve, and the difference shows.
- Whatever is not the product is drawn as itself, as close to the real thing as it can be measured: a chat is the platform's bubbles, with the other person's message first; a system keyboard is the system's keys and makes the system's own sounds (iOS keeps them in the simulator runtime's `System/Library/Audio/UISounds`). The product's shapes are kept for the product, so the viewer sees the moment it arrives.
- One camera and no cut: every change of scene is the same objects moving, turning over or being flown to.
- An object that has been used keeps the mark of its use. A stack of sent replies still shows each reply, because blank copies read as decoration.
- Each language is its own film: its lines written in that language, its names, its date and number forms, its keyboard (kana keys and the conversion to kanji for Japanese). The words live in one file per film, keyed by language, and the layout is measured from the words, never from the English widths.
- Two cuts that differ only from some frame on (an end card with one more line) are rendered once to that frame and joined before the encode, so the shared part is the same frames in both.

## Build the feeling

- The film makes the viewer want something before it shows the product giving it; the approved film did this by taking the thing away on a press and returning it in the opening framing.
- Put the music's lift, the spoken word and the press on the same frame.
- Reserve one colour for the product and for a trick being caught. Anything hostile is loud and uses other colours.
- Invented content must look alive. A video said to be playing has parallax, drifting things, a running time code and a moving progress bar.

## Join animation to the real recording

- The recording is the ground, and every overlay is placed in the recording's own pixel coordinates inside the same transform, so it rides every camera move.
- Cut the take into layers: page area, app chrome on top, and whatever is revealed underneath. An animated object goes between them, and the page can be thrown away while the toolbar stays put.
- Measure each control's position in take pixels. The fingertip, ring, pane and tag start from that point.
- Keep what the product does real: its control, its response, its popup and menu come from the take at recorded speed. Animate only what no camera can film, such as an invisible layer or a value changing mid-press.
- A real take sits in the film's world with the same light, camera and motion as the drawn shots, because a rectangle dropped into the frame reads as pasted.
- Trim a take to the action: cut still stretches, jump within it at a press, and stop on a held frame just before anything ugly loads. Hide each held frame under motion.
- Each press lands in steps: fingertip arrives, press, the device dips on that frame, release, then the reaction. On a Mac, record without the cursor and draw a smooth pointer that glides between the logged clicks.
- Use a magnifier showing the recording's own pixels for a small control, growing from the control's place on the held frame.
- Start the voice before the press, so the spoken "press" and the on-screen press happen together.
- Under a store preview's overlays, every shot still shows the platform's own recording.

## Keep it clean

- Move at most three things in a shot, and count the camera as one.
- Open each beat on its action within 0.3 s, and leave 0.4 s of stillness before its cut, unless a move carries across the cut on purpose.
- Keep captions at 72 px or more and any other word at 48 px or more at its delivered size in that shot.
- Nothing in the background competes with the subject for the eye.
- Every element enters by moving in and leaves by moving out. Navigation moves two pages edge to edge as one strip, so the screen is never empty.
- Hinge a tilting page on an edge, so no part passes through the glass or the screen. Give every layer one render order in one table.
- When a move does not fit its beat, cut an element. A move squeezed to fit looks sped up.
- Reserve bands for captions and subtitles, frame close-ups to keep page text out of them, and lay a dark band over any bright page beneath them.
- Give a portrait cut its own camera table, pulled back until each subject fits the width. Its world is centred a little above the middle of the frame and fills the width; what ran across the wide frame is laid out again for the tall one (three rows of a marquee become five), and words that sat in a corner move to the centre line. It is composed to look right as a plain video with no buttons over it first, and only then checked under each platform's overlay (`formats.md`).
