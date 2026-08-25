"""Knock the white box out of the sponsor logos that arrived as JPEGs on a
white ground (the client asked for every white-backed logo to sit straight
on the medallion's paper instead). The white is removed by flood-filling in
from the picture's edges — NOT by keying every white pixel — so white that
belongs to the artwork (the lettering inside Farm Harvest's badge, the
"IA MOTOR" dealer text, Narasu's lady) survives. The fill tolerates JPEG
noise and the faint grey gradient on the IA Motor scan, and the cut edge is
softened by a pixel so lettering keeps its anti-aliasing. Output: a lossy
WebP with alpha next to the source. The client's source JPEGs were removed
from the folder once baked (the hosts wanted only the used images kept) —
to re-run, restore them from git history (they were tracked up to the
2026-08-25 v2 commit) or drop the originals back in.
Run: python3 scripts/partners-knockout.py"""
from collections import deque

import numpy as np
from PIL import Image, ImageFilter

SRC = "src/assets/partners"
# (file, how far from pure white still counts as background, 0-255)
LOGOS = [
    ("farm-harvest.jpg", 28),
    ("ia-motors.jpg", 40),      # scanned: the "white" drifts to ~rgb(240)
    ("megawin.jpeg", 28),       # a white strip above the brand's yellow box
    ("narasus-coffee.jpg", 28),
    ("sks-hospital.jpeg", 28),
    ("tailored-luxury.jpeg", 28),
    ("venus-estates.jpg", 28),
]


def knockout(name: str, tol: int) -> None:
    im = Image.open(f"{SRC}/{name}").convert("RGB")
    a = np.asarray(im).astype(np.int16)
    h, w, _ = a.shape
    # "near white": every channel within tol of 255 AND low saturation, so a
    # pale brand colour (Venus's peach gradient) never counts as background
    dist = 255 - a.min(axis=2)
    sat = a.max(axis=2) - a.min(axis=2)
    bg_ok = (dist <= tol) & (sat <= tol // 2)

    # flood from every edge pixel — 4-connected — through near-white only
    seen = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if bg_ok[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if bg_ok[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and bg_ok[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))

    # alpha: background 0, artwork 255, then a 1px feather so the
    # anti-aliased fringe fades instead of cutting hard
    alpha = np.where(seen, 0, 255).astype(np.uint8)
    alpha_im = Image.fromarray(alpha, "L").filter(ImageFilter.GaussianBlur(0.8))
    alpha = np.asarray(alpha_im)
    # un-tint the fringe: pixels that were half-white now carry that white in
    # their colour; push the colour towards the nearest solid artwork colour
    # is overkill — instead just keep colour and let alpha do the fading.

    rgba = np.dstack((a.astype(np.uint8), alpha))
    out = Image.fromarray(rgba, "RGBA")
    # crop the now-empty margin so the logo fills its medallion slot evenly
    bbox = out.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    if bbox:
        pad = 6
        out = out.crop((max(0, bbox[0] - pad), max(0, bbox[1] - pad),
                        min(w, bbox[2] + pad), min(h, bbox[3] + pad)))
    stem = name.rsplit(".", 1)[0]
    path = f"{SRC}/{stem}.webp"
    out.save(path, "WEBP", quality=90, method=6)
    print("wrote", path, out.size, f"{100 * seen.mean():.1f}% removed")


for name, tol in LOGOS:
    knockout(name, tol)
