"""Bake the official paddle (Yaba Pro+ Gen4) in the site's own colours — the
client asked for the paddle on the "Official paddle launch" card in the
WEBSITE's palette, not its own (2026-08-26). Unlike the crest, the render is
mostly black, so a hue remap wouldn't bite: instead the dark carbon face and
grip are tinted by luminance — black becomes the palette's wisteria lavender
(#75689f), lighter greys fade toward white — while the red edge guard, the
"PRO+" mark and the butt cap become the ball-lime accent (#c3d64b). Whites
(the face lines, the YABA logo) and alpha are left alone.

Source: the product render from Yaba's own store CDN (fetched on first run
into node_modules/.cache). Output: src/assets/partners/yaba-pro-paddle.webp.
Run: python3 scripts/paddle-wisteria.py"""
import colorsys
import os
import urllib.request

import numpy as np
from PIL import Image, ImageFilter

SRC_URL = "https://cdn.shopify.com/s/files/1/0660/0412/3708/files/YabaPro_RedResize2.png?v=1783080011"
SRC = "node_modules/.cache/yaba-pro-paddle-src.png"
OUT = "src/assets/partners/yaba-pro-paddle.webp"
LAVENDER = (0x75, 0x68, 0x9F)
LIME_H, LIME_S = 67 / 360, 0.66
HEIGHT = 720

if not os.path.exists(SRC):
    os.makedirs(os.path.dirname(SRC), exist_ok=True)
    req = urllib.request.Request(SRC_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req) as r, open(SRC, "wb") as f:
        f.write(r.read())

im = Image.open(SRC).convert("RGBA")
im = im.crop(im.getbbox())
im = im.resize((round(im.width * HEIGHT / im.height), HEIGHT), Image.LANCZOS)

rgb = np.asarray(im.convert("RGB"), dtype=np.float32) / 255.0
alpha = np.asarray(im.getchannel("A"))
hsv = np.asarray(im.convert("RGB").convert("HSV"), dtype=np.float32) / 255.0
hue_deg, sat, val = hsv[..., 0] * 360.0, hsv[..., 1], hsv[..., 2]

# "Redness" as a SOFT weight rather than a hard cut — the render is noisy
# where the red trim and the brushed "PRO+" fade into the carbon, and a
# per-pixel threshold there speckles. Blur the mask a touch as well.
hue_dist = np.minimum(hue_deg, 360.0 - hue_deg)  # distance from pure red
w_hue = np.clip(1.0 - (hue_dist - 12.0) / 18.0, 0.0, 1.0)  # 1 within 12°, 0 past 30°
w_sat = np.clip((sat - 0.2) / 0.25, 0.0, 1.0)  # 0 at s≤.2, 1 at s≥.45
mask = Image.fromarray((w_hue * w_sat * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
w = (np.asarray(mask, dtype=np.float32) / 255.0)[..., None]

# red trim → lime, kept bright so the edge guard still reads
lime_v = np.maximum(val, 0.72)
lime = np.stack([np.vectorize(lambda v: colorsys.hsv_to_rgb(LIME_H, LIME_S, v)[i])(lime_v) for i in range(3)], axis=-1)

# greys/blacks → tint by luminance: black → lavender, white → white; the
# curve keeps the carbon face solidly lavender and lifts only real highlights
t = np.clip((val - 0.08) / 0.92, 0.0, 1.0) ** 1.6
lav = np.asarray(LAVENDER, dtype=np.float32) / 255.0
tint = lav + (1.0 - lav) * t[..., None]

out = w * lime + (1.0 - w) * tint
out8 = np.dstack([(np.clip(out, 0, 1) * 255).round().astype(np.uint8), alpha])
Image.fromarray(out8, "RGBA").save(OUT, "WEBP", quality=88, method=6)
print("wrote", OUT, im.size)
