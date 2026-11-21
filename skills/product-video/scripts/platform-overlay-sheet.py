# A whole vertical film under each platform's player: every frame at 4 a second with that platform's unsafe zones, its
# top and bottom shadow gradients and a stand-in for its buttons and caption composited on top, tiled into one sheet per
# platform. A word or a pressed control that sits in a tinted, shaded or covered band on any tile fails the film.
#
#   uv run --with pillow python -I platform-overlay-sheet.py <film.mp4> <out-prefix> [--fps 4] [--only tiktok,reels]
#   -> <out-prefix>-tiktok.jpg, -reels.jpg, -shorts.jpg, -stories.jpg, and <out-prefix>-overlay-<platform>.png
#
# Where each zone comes from (1080 x 1920):
#   tiktok   TikTok's own In-Feed template, references/overlays/tiktok-in-feed-template.png (720 x 1280 labels x 1.5):
#            top 240, bottom from 1260, 120 each side, and the button column x 780+ below y 840
#   shorts   Google's vertical overlay, references/overlays/youtube-shorts-overlay.png: clear x 48-887, y 288-1247
#   reels    Meta publishes no pixel numbers; the house box is used (top 288, bottom from 1248, left 120, right 888,
#            button column x 781+ below y 840), which is the strictest of the other two
#   stories  top 270 (progress bars and the account row), bottom from 1536 (the reply bar), 64 each side
# The gradients and the buttons are drawn here, not captured from the apps: each gradient is full strength at the frame
# edge and reaches zero exactly at the zone's inner edge, so a thing that clears the gradient clears the real one.
import subprocess, sys, tempfile, glob, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
ZONES = {
    'tiktok': dict(top=240, bottom=1260, left=120, right=960, rail=(780, 840)),
    'reels': dict(top=288, bottom=1248, left=120, right=888, rail=(781, 840)),
    'shorts': dict(top=288, bottom=1248, left=48, right=888, rail=None),
    'stories': dict(top=270, bottom=1536, left=64, right=1016, rail=None),
}
TINT = {'tiktok': (0, 190, 255), 'reels': (255, 60, 150), 'shorts': (255, 40, 40), 'stories': (255, 170, 0)}


def font(size, bold=False):
    for p in ('/System/Library/Fonts/Helvetica.ttc', '/System/Library/Fonts/SFNS.ttf'):
        try:
            return ImageFont.truetype(p, size, index=1 if bold and p.endswith('.ttc') else 0)
        except Exception:
            pass
    return ImageFont.load_default()


def overlay(name):
    z = ZONES[name]
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    px = im.load()
    # the player's shadows: black, strongest at the frame edge, gone at the zone's inner edge
    for y in range(z['top']):
        a = int(150 * (1 - y / z['top']) ** 1.2)
        for x in range(W):
            px[x, y] = (0, 0, 0, a)
    for y in range(z['bottom'], H):
        a = int(205 * min(1, (y - z['bottom']) / 260) ** 0.9)
        for x in range(W):
            px[x, y] = (0, 0, 0, a)
    d = ImageDraw.Draw(im, 'RGBA')
    tint = TINT[name]
    # every unsafe zone, tinted so a covered band is seen at a glance
    unsafe = [(0, 0, W, z['top']), (0, z['bottom'], W, H), (0, 0, z['left'], H), (z['right'], 0, W, H)]
    if z['rail']:
        unsafe.append((z['rail'][0], z['rail'][1], W, H))
    tinted = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    td = ImageDraw.Draw(tinted)
    for r in unsafe:
        td.rectangle(r, fill=(*tint, 46))
    im = Image.alpha_composite(im, tinted)
    d = ImageDraw.Draw(im, 'RGBA')
    white, soft = (255, 255, 255, 235), (255, 255, 255, 150)
    if name == 'tiktok':
        d.text((330, 118), 'Following', font=font(40), fill=soft)
        d.text((560, 118), 'For You', font=font(40, True), fill=white)
        d.ellipse((980, 112, 1030, 162), outline=white, width=5)
        for i, y in enumerate((980, 1130, 1280, 1430, 1580)):
            d.ellipse((930, y, 1040, y + 110), fill=(255, 255, 255, 225) if i else (200, 200, 200, 255))
        d.text((40, 1500), '@monholtco', font=font(44, True), fill=white)
        d.text((40, 1566), 'The caption of the post runs here over two', font=font(38), fill=white)
        d.text((40, 1616), 'lines, with its hashtags  ... more', font=font(38), fill=white)
        d.text((40, 1684), 'original sound - monholtco', font=font(34), fill=soft)
        d.rectangle((0, 1780, W, H), fill=(0, 0, 0, 255))
        for i in range(5):
            d.ellipse((80 + i * 216, 1820, 136 + i * 216, 1876), fill=(255, 255, 255, 220))
    elif name == 'reels':
        d.text((48, 120), 'Reels', font=font(56, True), fill=white)
        d.ellipse((980, 118, 1036, 174), outline=white, width=5)
        for y in (1020, 1170, 1320, 1470, 1620):
            d.ellipse((950, y, 1040, y + 90), fill=(255, 255, 255, 225))
        d.ellipse((40, 1500, 110, 1570), fill=(210, 210, 210, 255))
        d.text((128, 1512), 'monholtco', font=font(42, True), fill=white)
        d.rounded_rectangle((370, 1506, 520, 1566), 14, outline=white, width=3)
        d.text((40, 1596), 'The caption of the reel runs here  ... more', font=font(38), fill=white)
        d.text((40, 1660), 'Original audio', font=font(34), fill=soft)
        d.rectangle((0, 1770, W, H), fill=(0, 0, 0, 255))
        for i in range(5):
            d.ellipse((80 + i * 216, 1815, 136 + i * 216, 1871), fill=(255, 255, 255, 220))
    elif name == 'shorts':
        d.text((48, 120), 'Shorts', font=font(52, True), fill=white)
        d.ellipse((900, 118, 956, 174), outline=white, width=5)
        d.ellipse((990, 118, 1046, 174), outline=white, width=5)
        for y in (900, 1060, 1220, 1380, 1540):
            d.ellipse((940, y, 1040, y + 100), fill=(255, 255, 255, 225))
        d.ellipse((40, 1540, 104, 1604), fill=(210, 210, 210, 255))
        d.text((122, 1548), '@monholtco', font=font(40, True), fill=white)
        d.rounded_rectangle((400, 1540, 600, 1604), 32, fill=(255, 255, 255, 240))
        d.text((40, 1632), 'The title of the Short runs here #shorts', font=font(40), fill=white)
        d.rectangle((0, 1770, W, H), fill=(15, 15, 15, 255))
        for i in range(5):
            d.ellipse((80 + i * 216, 1815, 136 + i * 216, 1871), fill=(255, 255, 255, 220))
    else:  # stories
        for i in range(3):
            d.rounded_rectangle((24 + i * 348, 40, 24 + i * 348 + 336, 48), 4, fill=(255, 255, 255, 230 if i == 0 else 110))
        d.ellipse((32, 84, 112, 164), fill=(210, 210, 210, 255))
        d.text((132, 102), 'monholtco', font=font(40, True), fill=white)
        d.text((360, 104), '2h', font=font(38), fill=soft)
        d.text((990, 96), 'x', font=font(52), fill=white)
        d.rounded_rectangle((40, 1740, 860, 1850), 55, outline=white, width=4)
        d.text((84, 1772), 'Send message', font=font(40), fill=white)
        d.ellipse((900, 1750, 990, 1840), outline=white, width=5)
    # the box everything that must be read sits in
    box = [(z['left'], z['top']), (z['right'], z['top'])]
    if z['rail']:
        box += [(z['right'], z['rail'][1]), (z['rail'][0], z['rail'][1]), (z['rail'][0], z['bottom'])]
    else:
        box += [(z['right'], z['bottom'])]
    box += [(z['left'], z['bottom']), (z['left'], z['top'])]
    d.line(box, fill=(*tint, 255), width=5)
    return im


def main():
    a = sys.argv[1:]
    film, prefix = a[0], a[1]
    fps = float(a[a.index('--fps') + 1]) if '--fps' in a else 4
    names = a[a.index('--only') + 1].split(',') if '--only' in a else list(ZONES)
    tmp = tempfile.mkdtemp()
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', film, '-vf', f'fps={fps},scale={W}:{H}', f'{tmp}/%04d.png'], check=True)
    frames = sorted(glob.glob(f'{tmp}/*.png'))
    cols = 11
    tw, th = 270, 480
    for n in names:
        ov = overlay(n)
        ov.save(f'{prefix}-overlay-{n}.png')
        rows = -(-len(frames) // cols)
        sheet = Image.new('RGB', (cols * (tw + 6) - 6, rows * (th + 6) - 6), (36, 36, 36))
        for i, fr in enumerate(frames):
            im = Image.alpha_composite(Image.open(fr).convert('RGBA'), ov).convert('RGB').resize((tw, th), Image.LANCZOS)
            ImageDraw.Draw(im).text((8, 6), f'{i / fps:.2f}s', font=font(20, True), fill=(255, 255, 0))
            sheet.paste(im, ((i % cols) * (tw + 6), (i // cols) * (th + 6)))
        sheet.save(f'{prefix}-{n}.jpg', quality=88)
        print(f'{prefix}-{n}.jpg', len(frames), 'frames')
    for fr in frames:
        os.remove(fr)
    os.rmdir(tmp)


main()
