# Before and after of one vertical frame, the area YouTube Shorts, TikTok and Reels cover tinted red and their common clear box
# outlined (references/formats.md, "Vertical safe zone"), for showing a layout change to a person.
#   uv run --with pillow python -I safe-zone-pair.py out.jpg before.png after.png "title"
import sys
from PIL import Image, ImageDraw, ImageFont
out, a, b, title = sys.argv[1:5]
W, H = 1080, 1920
BOX = [(120, 288), (887, 288), (887, 840), (780, 840), (780, 1247), (120, 1247)]
F = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
def shade(p, label):
    im = Image.open(p).convert("RGBA").resize((W, H))
    mask = Image.new("L", (W, H), 255); ImageDraw.Draw(mask).polygon(BOX, fill=0)
    red = Image.new("RGBA", (W, H), (230, 30, 30, 120)); im.paste(red, (0, 0), Image.composite(Image.new("L", (W, H), 120), Image.new("L", (W, H), 0), mask))
    d = ImageDraw.Draw(im); d.line(BOX + [BOX[0]], fill=(60, 255, 90), width=7)
    d.text((W // 2, 120), label, font=ImageFont.truetype(F, 84), fill="white", anchor="mm", stroke_width=6, stroke_fill="black")
    return im.convert("RGB")
pa, pb = shade(a, "Before"), shade(b, "After")
o = Image.new("RGB", (W * 2 + 40, H + 150), (20, 20, 20))
o.paste(pa, (0, 150)); o.paste(pb, (W + 40, 150))
ImageDraw.Draw(o).text((o.width // 2, 75), title, font=ImageFont.truetype(F, 60), fill="white", anchor="mm")
o.resize((o.width // 2, o.height // 2)).save(out, quality=88)
