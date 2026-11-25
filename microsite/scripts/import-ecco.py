"""Convert images saved from au.ecco.com into site assets.
Usage: python scripts/import-ecco.py D:/ecco/ecco-site-assets/raw public/img
Lifestyle JPGs -> ecco-life-*.webp; transparent product PNGs -> cropped ecco-product-*.webp.
"""
import sys, os
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
life = {"feature-1": "ecco-life-1", "feature-2": "ecco-life-2", "feature-3": "ecco-life-3",
        "feature-4": "ecco-life-4", "feature-5": "ecco-life-5", "feature-sneakers": "ecco-life-sneakers"}
for k, v in life.items():
    im = Image.open(os.path.join(src, k + ".jpg")).convert("RGB"); im.thumbnail((1600, 1600))
    im.save(os.path.join(out, v + ".webp"), "WEBP", quality=82, method=6); print(v, im.size)
for f in sorted(os.listdir(src)):
    if f.startswith("product-") and f.endswith(".png"):
        im = Image.open(os.path.join(src, f)).convert("RGBA")
        box = im.getchannel("A").point(lambda a: 255 if a > 10 else 0).getbbox()
        if box:  # pad and crop to the shoe
            pad = 30; box = (max(0, box[0]-pad), max(0, box[1]-pad), min(im.width, box[2]+pad), min(im.height, box[3]+pad)); im = im.crop(box)
        im.thumbnail((1400, 1400)); name = "ecco-" + f[:-4]
        im.save(os.path.join(out, name + ".webp"), "WEBP", quality=88, method=6); print(name, im.size)
