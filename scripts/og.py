#!/usr/bin/env python3
"""
Builds public/og-image.jpg — the social-share (Open Graph) card.

Source is the client-approved court banner (banner/horizontal-2-court.png,
1920×1080). It is centre-cropped to the OG 1.91:1 ratio, resized to 1200×630
and saved as a progressive JPEG tuned to stay UNDER 300 KB — WhatsApp only
renders the large full-width preview when the image is < ~300 KB; above that
it falls back to a tiny cropped thumbnail (or nothing at all).

    python3 scripts/og.py            # or: npm run og

After deploying, force WhatsApp/Facebook to drop their cached preview:
https://developers.facebook.com/tools/debug/  →  paste site URL  →  "Scrape Again".
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "banner" / "horizontal-2-court.png"
OUT = ROOT / "public" / "og-image.jpg"
W, H = 1200, 630
MAX_BYTES = 280 * 1024  # safety margin under WhatsApp's ~300 KB ceiling

img = Image.open(SRC).convert("RGB")
sw, sh = img.size
target = W / H
if sw / sh > target:  # source wider → trim sides
    nw = round(sh * target)
    box = ((sw - nw) // 2, 0, (sw - nw) // 2 + nw, sh)
else:                  # source taller → trim top/bottom
    nh = round(sw / target)
    box = (0, (sh - nh) // 2, sw, (sh - nh) // 2 + nh)
card = img.crop(box).resize((W, H), Image.LANCZOS)

for q in range(90, 50, -2):
    card.save(OUT, "JPEG", quality=q, optimize=True, progressive=True, subsampling=1)
    size = OUT.stat().st_size
    if size <= MAX_BYTES:
        break

print(f"{OUT.relative_to(ROOT)}  {W}×{H}  q={q}  {size/1024:.0f} KB")
