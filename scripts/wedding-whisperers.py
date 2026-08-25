"""Bake the Wedding Whisperers sponsor logo: the lettering FILLED with red
silk-satin (the brand's own artwork has white letters on satin; the client
asked for the satin inside the letters instead, on transparent). The letter
shapes come from wedding-whisperers-mark.png (cut out of the client's JPG).
Run: python3 scripts/wedding-whisperers.py"""
from PIL import Image, ImageFilter
import numpy as np

W = 1000  # medallion is <=256 CSS px, lettering ~78% of it: 1000px covers 4x DPR
rng = np.random.default_rng(11)

mark = Image.open("src/assets/partners/wedding-whisperers-mark.png").convert("RGBA").getchannel("A")
H = int(mark.height * W / mark.width)
alpha = mark.resize((W, H), Image.LANCZOS)

def layer(gw, gh, angle, amp):
    """One band of folds: float noise on a stretched grid, rotated, cropped."""
    big = int(max(W, H) * 1.7)
    g = rng.standard_normal((gh, gw)).astype(np.float32)
    im = Image.fromarray(g, "F").resize((big, big), Image.BICUBIC).rotate(angle, resample=Image.BICUBIC)
    ox, oy = (big - W) // 2, (big - H) // 2
    return np.asarray(im.crop((ox, oy, ox + W, oy + H))).astype(float) * amp * 0.5

# folds are finer than on the full tile so they read inside letter strokes
h = layer(4, 14, 28, 1.0) + layer(7, 26, 20, 0.55) + layer(12, 44, 34, 0.22)
dy, dx = np.gradient(h)
k = 150.0
n = np.dstack((-dx * k, -dy * k, np.ones_like(h)))
n /= np.linalg.norm(n, axis=2, keepdims=True)
L = np.array([-0.45, -0.55, 0.70]); L /= np.linalg.norm(L)
V = np.array([0, 0, 1.0]); Hv = (L + V) / np.linalg.norm(L + V)
diff = np.clip(n @ L, 0, 1)
ndh = np.clip(n @ Hv, 0, 1)
spec, sheen = ndh ** 26, ndh ** 5
base = np.array([70, 0, 10]); lit = np.array([182, 16, 32]); hi = np.array([255, 165, 170])
col = base + (lit - base) * (0.3 + 0.7 * diff)[..., None]
col = col + (hi - col) * (0.18 * sheen + 0.6 * spec)[..., None]
col = col + rng.standard_normal(col.shape) * 1.0
rgb = np.clip(col, 0, 255).astype(np.uint8)

out = np.dstack((rgb, np.asarray(alpha)))
img = Image.fromarray(out, "RGBA")
path = "src/assets/partners/wedding-whisperers.webp"
img.save(path, "WEBP", quality=88, method=6)
print("wrote", path, img.size)
