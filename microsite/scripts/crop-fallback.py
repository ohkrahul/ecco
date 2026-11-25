"""Crop a transparent render to its content and save as WebP.
Usage: python scripts/crop-fallback.py shots/shoe-render.png public/img/shoe-fallback.webp
"""
import sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
box = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
pad = 24
box = (max(0, box[0] - pad), max(0, box[1] - pad), min(im.width, box[2] + pad), min(im.height, box[3] + pad))
im.crop(box).save(out, "WEBP", quality=88, method=6)
print(out, im.crop(box).size)
