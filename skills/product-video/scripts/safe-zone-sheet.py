# Contact sheet of 1080x1920 frames with every platform's overlay drawn on, to check a vertical film before upload.
#   ffmpeg -i film.mp4 -vf fps=1/4 frames/%02d.png
#   uv run --with pillow python -I safe-zone-sheet.py sheet.png frames/*.png
# Red: YouTube Shorts unsafe (Google's vertical overlay). Blue: TikTok In-Feed unsafe (TikTok's template). Green line: the box all
# three platforms leave clear (references/formats.md, "Vertical safe zone"). Captions, buttons and the key action stay inside it.
import sys
from PIL import Image, ImageDraw
out, frames = sys.argv[1], sys.argv[2:]
W, H = 1080, 1920
YT = [(0, 0, W, 288), (0, 1248, W, H), (0, 0, 48, H), (888, 0, W, H)]
TT = [(0, 0, W, 240), (0, 1260, W, H), (0, 0, 120, H), (960, 0, W, H), (780, 840, W, H)]
BOX = [(120, 288), (887, 288), (887, 840), (780, 840), (780, 1247), (120, 1247), (120, 288)]
tiles = []
for f in frames:
    im = Image.open(f).convert("RGBA").resize((W, H))
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    for r in YT: d.rectangle(r, fill=(255, 0, 0, 70))
    for r in TT: d.rectangle(r, fill=(0, 120, 255, 70))
    d.line(BOX, fill=(0, 255, 0, 255), width=6)
    im = Image.alpha_composite(im, ov).convert("RGB")
    ImageDraw.Draw(im).text((20, 20), f.split('/')[-1], fill=(255, 255, 0))
    tiles.append(im.resize((270, 480)))
cols = min(8, len(tiles)); rows = (len(tiles) + cols - 1) // cols
sheet = Image.new("RGB", (cols * 276 - 6, rows * 486 - 6), (40, 40, 40))
for i, t in enumerate(tiles): sheet.paste(t, ((i % cols) * 276, (i // cols) * 486))
sheet.save(out)
