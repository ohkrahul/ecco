"""Extract the deck images the microsite uses and save them as WebP.
Usage: python scripts/extract-deck.py "<deck.pptx>" public/img
"""
import sys, zipfile, io, os
from PIL import Image

MAP = {  # deck media name -> site asset name
    "image12.png": "kv-long-way-up", "image13.png": "kv-magic",
    "image14.png": "kv-weekend", "image15.png": "kv-ridiculously-good",
    "image26.jpg": "ooh-travelator", "image27.jpg": "ooh-escalator",
    "image28.jpg": "ooh-bench-airport", "image29.jpg": "ooh-bench-shoe",
    "image30.jpg": "ooh-bench-shoe-airport",
    "image18.jpg": "format-sticker", "image19.jpg": "format-untold",
    "image20.jpg": "format-podcast",
    "image17.jpg": "kv-unseen-hours",
    "image2.jpg": "brand-ad-gps", "image3.jpg": "brand-ad-no-run", "image4.jpg": "brand-ad-trends",
    "image5.jpg": "brand-walk-your-walk", "image11.jpg": "audience", "image16.png": "kv-grid",
    "image22.jpg": "practice-zones-ref",
    "image6.jpg": "cat-6", "image7.jpg": "cat-7", "image8.jpg": "cat-8", "image9.jpg": "cat-9", "image10.jpg": "cat-10",
}

def main(pptx, out):
    os.makedirs(out, exist_ok=True)
    with zipfile.ZipFile(pptx) as z:
        for src, name in MAP.items():
            im = Image.open(io.BytesIO(z.read("ppt/media/" + src))).convert("RGB")
            im.thumbnail((2400, 2400))
            im.save(os.path.join(out, name + ".webp"), "WEBP", quality=82, method=6)
            print(name, im.size)

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
