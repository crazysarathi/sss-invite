"""Bake the hosts' crest in the site's own colours — the client asked for
the same logo on the "Logo launch" card but WITHOUT its actual brand
colours (2026-08-25). The crest SVG wraps a raster, so this remaps hues on
that raster: the paddle/lettering blues become the palette's wisteria
lavender (#75689f, hue ≈254°) at the same lightness, and the chartreuse trim
becomes the palette's ball-lime accent (#c3d64b, hue ≈67°). Whites, greys and
alpha are left alone. Output: src/assets/logos/sss-crest-wisteria.webp.
Run: python3 scripts/crest-wisteria.py"""
import base64
import colorsys
import io
import re

from PIL import Image

SRC = "src/assets/logos/sss-crest.svg"
OUT = "src/assets/logos/sss-crest-wisteria.webp"
LAVENDER_H = 254 / 360
LIME_H = 67 / 360

svg = open(SRC, encoding="utf-8").read()
data = re.search(r'href="data:image/png;base64,([^"]+)"', svg).group(1)
im = Image.open(io.BytesIO(base64.b64decode(data))).convert("RGBA")
# Work at 2× so the tinted edges stay crisp on retina cards.
im = im.resize((im.width * 2, im.height * 2), Image.LANCZOS)
px = im.load()
for y in range(im.height):
    for x in range(im.width):
        r, g, b, a = px[x, y]
        if a == 0:
            continue
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
        if s < 0.12:
            continue  # white ball, grey shading — keep
        deg = h * 360
        if 170 <= deg <= 260:  # the crest's blues
            nh, ns = LAVENDER_H, min(0.55, s * 0.5)
        elif 45 <= deg <= 120:  # the chartreuse trim / mountain light
            nh, ns = LIME_H, min(1.0, s * 0.9)
        else:
            continue
        nr, ng, nb = colorsys.hsv_to_rgb(nh, ns, v)
        px[x, y] = (round(nr * 255), round(ng * 255), round(nb * 255), a)
im.save(OUT, "WEBP", quality=92, method=6)
print("wrote", OUT, im.size)
