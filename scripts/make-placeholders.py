#!/usr/bin/env python3
"""
Generates the placeholder photography for the Pickle & Pilates invitation.

Every image is an abstract, soft-focus composition in the brand's pastel
register (ivory / blush / sage / sky / matcha / mango) with light grain —
neutral enough to sit under every theme's overlay and filter, and clearly a
stand-in to be replaced with real event photography.

Usage:
    python3 scripts/make-placeholders.py            # writes src/assets/invitation + public/og-image.png

Replace any output file with a real photo of the SAME NAME (any size — the
layouts crop with object-fit) and the site picks it up via src/data/assets.ts.
"""
from __future__ import annotations

import math
import os
import random
from dataclasses import dataclass, field

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "assets", "invitation")
PUBLIC = os.path.join(ROOT, "public")
os.makedirs(OUT, exist_ok=True)

# ---------------------------------------------------------------- palette
P = {
    "ivory": (247, 242, 236),
    "cream": (252, 248, 240),
    "blush": (238, 213, 205),
    "rose": (222, 182, 172),
    "clay": (196, 142, 128),
    "sage": (196, 208, 186),
    "sage_deep": (150, 170, 140),
    "mist": (222, 233, 236),
    "sky": (190, 214, 232),
    "matcha": (168, 194, 128),
    "matcha_deep": (118, 148, 92),
    "peach": (255, 226, 200),
    "mango": (245, 200, 120),
    "sand": (232, 220, 200),
    "stone": (200, 190, 178),
    "charcoal": (60, 52, 48),
}


def lerp(a, b, t):
    return tuple(int(round(a[i] + (b[i] - a[i]) * t)) for i in range(3))


def gradient(w, h, stops, angle_deg=90):
    """Multi-stop linear gradient. angle 90 = top→bottom, 0 = left→right."""
    ang = math.radians(angle_deg)
    dx, dy = math.cos(ang), math.sin(ang)
    xs = np.linspace(0, 1, w)[None, :]
    ys = np.linspace(0, 1, h)[:, None]
    t = (xs * dx + ys * dy)
    t = (t - t.min()) / (t.max() - t.min() + 1e-9)
    img = np.zeros((h, w, 3), dtype=np.float32)
    positions = [s[0] for s in stops]
    colors = np.array([s[1] for s in stops], dtype=np.float32)
    for c in range(3):
        img[..., c] = np.interp(t, positions, colors[:, c])
    return Image.fromarray(img.astype(np.uint8), "RGB")


def soft_shape(base: Image.Image, kind, box, color, alpha=0.5, blur=60, angle=0):
    """Blurred translucent shape (circle / ellipse / rounded rect / capsule)."""
    w, h = base.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    a = int(255 * alpha)
    fill = (*color, a)
    if kind == "circle" or kind == "ellipse":
        d.ellipse(box, fill=fill)
    elif kind == "rrect":
        x0, y0, x1, y1 = box
        r = min(x1 - x0, y1 - y0) * 0.22
        d.rounded_rectangle(box, radius=r, fill=fill)
    elif kind == "capsule":
        x0, y0, x1, y1 = box
        r = min(x1 - x0, y1 - y0) / 2
        d.rounded_rectangle(box, radius=r, fill=fill)
    if angle:
        layer = layer.rotate(angle, resample=Image.BICUBIC, center=((box[0] + box[2]) / 2, (box[1] + box[3]) / 2))
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)


def thin_line(base, p0, p1, color, width=2, alpha=0.5, blur=1.5):
    w, h = base.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.line([p0, p1], fill=(*color, int(255 * alpha)), width=width)
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)


def pickleball(base, cx, cy, r, color, hole_color, alpha=0.9, blur=6):
    """Soft-focus wiffle ball: disc + ring of holes."""
    w, h = base.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(*color, int(255 * alpha)))
    hr = r * 0.11
    pts = [(0, 0)]
    for k in range(6):
        a = math.radians(k * 60 + 15)
        pts.append((math.cos(a) * r * 0.55, math.sin(a) * r * 0.55))
    for k in range(9):
        a = math.radians(k * 40)
        pts.append((math.cos(a) * r * 0.86, math.sin(a) * r * 0.86))
    for (px, py) in pts:
        d.ellipse((cx + px - hr, cy + py - hr, cx + px + hr, cy + py + hr), fill=(*hole_color, int(255 * alpha * 0.55)))
    # highlight
    d.ellipse((cx - r * 0.55, cy - r * 0.62, cx - r * 0.05, cy - r * 0.15), fill=(255, 255, 255, int(255 * 0.28)))
    if blur:
        layer = layer.filter(ImageFilter.GaussianBlur(blur))
    base.alpha_composite(layer)


def grain(base: Image.Image, amount=8.0, seed=1):
    rng = np.random.default_rng(seed)
    arr = np.asarray(base.convert("RGB")).astype(np.float32)
    noise = rng.normal(0, amount, arr.shape[:2])[..., None]
    arr = np.clip(arr + noise, 0, 255).astype(np.uint8)
    return Image.fromarray(arr, "RGB")


def vignette(base: Image.Image, strength=0.18):
    w, h = base.size
    xs = np.linspace(-1, 1, w)[None, :]
    ys = np.linspace(-1, 1, h)[:, None]
    d = np.sqrt((xs * 0.9) ** 2 + (ys * 0.9) ** 2)
    m = np.clip(1 - strength * np.clip(d - 0.55, 0, None) * 1.6, 0, 1)
    arr = np.asarray(base.convert("RGB")).astype(np.float32) * m[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")


def finish(img: Image.Image, path: str, seed: int, grain_amt=7.0, vig=0.16, quality=82):
    img = img.convert("RGB")
    img = vignette(img, vig)
    img = grain(img, grain_amt, seed)
    img.save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    print("wrote", os.path.relpath(path, ROOT), img.size)


@dataclass
class Scene:
    name: str
    size: tuple
    stops: list
    angle: float = 90
    shapes: list = field(default_factory=list)
    lines: list = field(default_factory=list)
    balls: list = field(default_factory=list)
    seed: int = 1


def render(scene: Scene, out_dir=OUT, ext="jpg"):
    w, h = scene.size
    base = gradient(w, h, scene.stops, scene.angle).convert("RGBA")
    for s in scene.shapes:
        soft_shape(base, *s)
    for l in scene.lines:
        thin_line(base, *l)
    for b in scene.balls:
        pickleball(base, *b)
    finish(base, os.path.join(out_dir, f"{scene.name}.{ext}"), scene.seed)


def R(w, h, x, y, rw, rh):
    """Box from fractional center + fractional size."""
    return (x * w - rw * w / 2, y * h - rh * h / 2, x * w + rw * w / 2, y * h + rh * h / 2)


scenes = []

# ---- hero portrait: warm ivory → blush, sun-disc, court lines
w, h = 1200, 1600
scenes.append(Scene(
    "hero-portrait", (w, h),
    [(0, P["cream"]), (0.55, P["ivory"]), (1, P["blush"])], 100,
    shapes=[
        ("circle", R(w, h, 0.68, 0.28, 0.62, 0.46), P["peach"], 0.55, 90),
        ("circle", R(w, h, 0.2, 0.86, 0.5, 0.36), P["sage"], 0.35, 110),
        ("capsule", R(w, h, 0.5, 0.62, 0.9, 0.06), P["rose"], 0.22, 40, -8),
    ],
    lines=[((0, h * 0.72), (w, h * 0.66), P["clay"], 3, 0.35), ((0, h * 0.8), (w, h * 0.74), P["clay"], 2, 0.22)],
    balls=[(w * 0.34, h * 0.42, 150, P["cream"], P["clay"], 0.92, 5)],
    seed=11,
))

# ---- hero landscape: sage → mist, horizon, two spheres
w, h = 1920, 1200
scenes.append(Scene(
    "hero-landscape", (w, h),
    [(0, P["mist"]), (0.5, P["ivory"]), (1, P["sage"])], 80,
    shapes=[
        ("circle", R(w, h, 0.78, 0.36, 0.34, 0.54), P["sky"], 0.5, 90),
        ("circle", R(w, h, 0.18, 0.72, 0.28, 0.44), P["matcha"], 0.35, 100),
        ("rrect", R(w, h, 0.5, 0.86, 1.1, 0.16), P["sage_deep"], 0.28, 60, -3),
    ],
    lines=[((0, h * 0.62), (w, h * 0.6), P["sage_deep"], 3, 0.35)],
    balls=[(w * 0.62, h * 0.58, 120, P["cream"], P["sage_deep"], 0.9, 4)],
    seed=12,
))

# ---- gallery 01: blush portrait, mat roll
w, h = 1200, 1500
scenes.append(Scene(
    "gallery-01", (w, h),
    [(0, P["blush"]), (0.6, P["ivory"]), (1, P["rose"])], 110,
    shapes=[
        ("capsule", R(w, h, 0.5, 0.58, 0.72, 0.18), P["clay"], 0.42, 30, 12),
        ("circle", R(w, h, 0.8, 0.2, 0.5, 0.4), P["peach"], 0.45, 100),
    ],
    lines=[((w * 0.1, h * 0.86), (w * 0.9, h * 0.86), P["clay"], 2, 0.25)],
    seed=21,
))

# ---- gallery 02: court from above — sage with lines
w, h = 1600, 1100
scenes.append(Scene(
    "gallery-02", (w, h),
    [(0, P["sage"]), (1, P["matcha"])], 60,
    shapes=[("circle", R(w, h, 0.25, 0.3, 0.4, 0.6), P["cream"], 0.35, 110)],
    lines=[
        ((w * 0.12, h * 0.15), (w * 0.12, h * 0.85), P["cream"], 6, 0.75),
        ((w * 0.12, h * 0.5), (w * 0.88, h * 0.5), P["cream"], 6, 0.75),
        ((w * 0.5, h * 0.15), (w * 0.5, h * 0.85), P["cream"], 6, 0.75),
        ((w * 0.88, h * 0.15), (w * 0.88, h * 0.85), P["cream"], 6, 0.75),
        ((w * 0.12, h * 0.15), (w * 0.88, h * 0.15), P["cream"], 6, 0.75),
        ((w * 0.12, h * 0.85), (w * 0.88, h * 0.85), P["cream"], 6, 0.75),
    ],
    balls=[(w * 0.68, h * 0.34, 70, P["mango"], P["matcha_deep"], 0.95, 2)],
    seed=22,
))

# ---- gallery 03: matcha cup from above (square)
w, h = 1200, 1200
scenes.append(Scene(
    "gallery-03", (w, h),
    [(0, P["cream"]), (1, P["sand"])], 45,
    shapes=[
        ("circle", R(w, h, 0.5, 0.5, 0.62, 0.62), P["ivory"], 0.9, 4),
        ("circle", R(w, h, 0.5, 0.5, 0.5, 0.5), P["matcha_deep"], 0.85, 3),
        ("circle", R(w, h, 0.42, 0.42, 0.14, 0.14), P["matcha"], 0.5, 18),
        ("circle", R(w, h, 0.5, 0.5, 1.2, 0.35), P["charcoal"], 0.08, 90),
    ],
    seed=23,
))

# ---- gallery 04: sky portrait, capsule (reformer)
w, h = 1200, 1500
scenes.append(Scene(
    "gallery-04", (w, h),
    [(0, P["sky"]), (0.5, P["mist"]), (1, P["ivory"])], 95,
    shapes=[
        ("rrect", R(w, h, 0.5, 0.7, 0.86, 0.22), P["stone"], 0.4, 40, -6),
        ("circle", R(w, h, 0.22, 0.24, 0.5, 0.4), P["cream"], 0.5, 90),
    ],
    lines=[((0, h * 0.5), (w, h * 0.46), P["sage_deep"], 2, 0.25)],
    seed=24,
))

# ---- gallery 05: ivory landscape, paddle silhouette
w, h = 1600, 1000
scenes.append(Scene(
    "gallery-05", (w, h),
    [(0, P["ivory"]), (1, P["sand"])], 120,
    shapes=[
        ("rrect", R(w, h, 0.62, 0.5, 0.26, 0.6), P["clay"], 0.55, 14, -18),
        ("capsule", R(w, h, 0.62, 0.9, 0.06, 0.3), P["charcoal"], 0.35, 10, -18),
        ("circle", R(w, h, 0.2, 0.3, 0.5, 0.7), P["blush"], 0.5, 110),
    ],
    balls=[(w * 0.34, h * 0.64, 90, P["cream"], P["clay"], 0.95, 3)],
    seed=25,
))

# ---- gallery 06: rose portrait, ring
w, h = 1200, 1500
scenes.append(Scene(
    "gallery-06", (w, h),
    [(0, P["rose"]), (0.55, P["blush"]), (1, P["peach"])], 70,
    shapes=[
        ("circle", R(w, h, 0.5, 0.42, 0.7, 0.56), P["cream"], 0.55, 8),
        ("circle", R(w, h, 0.5, 0.42, 0.56, 0.45), P["blush"], 0.9, 8),
        ("circle", R(w, h, 0.5, 0.42, 0.42, 0.34), P["cream"], 0.7, 8),
    ],
    lines=[((w * 0.15, h * 0.85), (w * 0.85, h * 0.85), P["clay"], 2, 0.3)],
    seed=26,
))

# ---- gallery 07: green court lines landscape (dynamic)
w, h = 1600, 1100
scenes.append(Scene(
    "gallery-07", (w, h),
    [(0, P["matcha_deep"]), (0.5, P["sage_deep"]), (1, P["sage"])], 30,
    shapes=[("circle", R(w, h, 0.8, 0.8, 0.5, 0.7), P["mango"], 0.28, 120)],
    lines=[
        ((0, h * 0.7), (w, h * 0.3), P["cream"], 8, 0.7),
        ((0, h * 0.95), (w, h * 0.55), P["cream"], 4, 0.45),
        ((0, h * 0.45), (w * 0.6, 0), P["cream"], 4, 0.45),
    ],
    balls=[(w * 0.3, h * 0.55, 110, P["cream"], P["matcha_deep"], 0.95, 2)],
    seed=27,
))

# ---- gallery 08: mango / peach square, sunrise
w, h = 1200, 1200
scenes.append(Scene(
    "gallery-08", (w, h),
    [(0, P["peach"]), (0.6, P["mango"]), (1, P["clay"])], 90,
    shapes=[
        ("circle", R(w, h, 0.5, 0.36, 0.5, 0.5), P["cream"], 0.75, 30),
        ("rrect", R(w, h, 0.5, 0.86, 1.2, 0.3), P["charcoal"], 0.35, 40),
    ],
    lines=[((0, h * 0.72), (w, h * 0.72), P["cream"], 3, 0.4)],
    seed=28,
))

# ---- venue: lawn horizon (club grounds)
w, h = 1800, 1100
scenes.append(Scene(
    "venue", (w, h),
    [(0, P["sky"]), (0.45, P["mist"]), (0.5, P["sage_deep"]), (1, P["matcha_deep"])], 90,
    shapes=[
        ("circle", R(w, h, 0.72, 0.28, 0.16, 0.26), P["cream"], 0.8, 30),
        ("rrect", R(w, h, 0.5, 0.49, 0.6, 0.1), P["stone"], 0.55, 8),
        ("rrect", R(w, h, 0.5, 0.44, 0.34, 0.06), P["ivory"], 0.6, 6),
        ("capsule", R(w, h, 0.5, 0.75, 1.3, 0.05), P["cream"], 0.35, 20),
    ],
    lines=[((0, h * 0.5), (w, h * 0.5), P["cream"], 3, 0.5)],
    seed=31,
))

# ---- story 01 portrait: paddles crossed (abstract), blush/sage
w, h = 1200, 1500
scenes.append(Scene(
    "story-01", (w, h),
    [(0, P["ivory"]), (1, P["sage"])], 100,
    shapes=[
        ("rrect", R(w, h, 0.42, 0.46, 0.34, 0.42), P["clay"], 0.55, 16, 22),
        ("rrect", R(w, h, 0.58, 0.46, 0.34, 0.42), P["sage_deep"], 0.55, 16, -22),
        ("circle", R(w, h, 0.5, 0.86, 0.9, 0.3), P["blush"], 0.4, 100),
    ],
    balls=[(w * 0.5, h * 0.3, 90, P["cream"], P["charcoal"], 0.95, 3)],
    seed=41,
))

# ---- story 02 landscape: mats in a row
w, h = 1400, 1000
scenes.append(Scene(
    "story-02", (w, h),
    [(0, P["mist"]), (1, P["ivory"])], 60,
    shapes=[
        ("rrect", R(w, h, 0.25, 0.62, 0.22, 0.6), P["rose"], 0.6, 10, 8),
        ("rrect", R(w, h, 0.5, 0.62, 0.22, 0.6), P["sage_deep"], 0.55, 10, 8),
        ("rrect", R(w, h, 0.75, 0.62, 0.22, 0.6), P["mango"], 0.55, 10, 8),
        ("circle", R(w, h, 0.85, 0.15, 0.4, 0.5), P["cream"], 0.5, 90),
    ],
    seed=42,
))

for sc in scenes:
    render(sc)


# ---- OG image (public/og-image.png) — text set in the system serif
def og_image():
    w, h = 1200, 630
    base = gradient(w, h, [(0, P["cream"]), (0.6, P["ivory"]), (1, P["blush"])], 100).convert("RGBA")
    soft_shape(base, "circle", R(w, h, 0.84, 0.3, 0.5, 0.9), P["peach"], 0.55, 90)
    soft_shape(base, "circle", R(w, h, 0.1, 0.9, 0.5, 0.9), P["sage"], 0.4, 100)
    pickleball(base, w * 0.84, h * 0.5, 120, P["cream"], P["clay"], 0.92, 3)
    d = ImageDraw.Draw(base)
    try:
        f_big = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoSerifDisplay-Regular.ttf", 108)
        f_it = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoSerifDisplay-Italic.ttf", 108)
        f_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)
    except OSError:
        f_big = f_it = f_small = ImageFont.load_default()
    ink = (43, 37, 33, 255)
    d.text((80, 130), "YOU'RE INVITED", font=f_small, fill=(182, 120, 108, 255), spacing=4)
    d.text((80, 190), "Pickle", font=f_big, fill=ink)
    d.text((80 + d.textlength("Pickle ", font=f_big), 190), "&", font=f_it, fill=(182, 120, 108, 255))
    d.text((80, 310), "Pilates", font=f_big, fill=ink)
    d.text((80, 470), "A WELLNESS EXPERIENCE  ·  FOREST HILLS COUNTRY CLUB, SALEM", font=f_small, fill=(109, 99, 91, 255))
    img = grain(base.convert("RGB"), 4, 99)
    img.save(os.path.join(PUBLIC, "og-image.png"), "PNG", optimize=True)
    print("wrote public/og-image.png")


def favicon():
    """P&P monogram favicon: blush disc with a wiffle-ball hole ring."""
    s = 256
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse((8, 8, s - 8, s - 8), fill=(182, 120, 108, 255))
    d.ellipse((s * 0.5 - 62, s * 0.5 - 62, s * 0.5 + 62, s * 0.5 + 62), fill=(247, 242, 236, 255))
    for k in range(6):
        a = math.radians(k * 60)
        cx, cy = s * 0.5 + math.cos(a) * 36, s * 0.5 + math.sin(a) * 36
        d.ellipse((cx - 8, cy - 8, cx + 8, cy + 8), fill=(182, 120, 108, 255))
    d.ellipse((s * 0.5 - 8, s * 0.5 - 8, s * 0.5 + 8, s * 0.5 + 8), fill=(182, 120, 108, 255))
    img.save(os.path.join(PUBLIC, "favicon.png"), "PNG", optimize=True)
    print("wrote public/favicon.png")


og_image()
favicon()
