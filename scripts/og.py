"""Generate the Open Graph cards (1200x630) that show up in link previews.

Run after changing the headline, a case study title, or a headline number:
    pip install pillow
    python scripts/og.py

Fonts are downloaded once from github.com/google/fonts into .cache/fonts/.
The numbers below are copied from src/data/claims.ts. Keep them in sync.
"""

from __future__ import annotations

import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "og"
CACHE = ROOT / ".cache" / "fonts"
FONTS = {
    "sans": ("SchibstedGrotesk[wght].ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/schibstedgrotesk/SchibstedGrotesk%5Bwght%5D.ttf"),
    "serif": ("Literata[opsz,wght].ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/literata/Literata%5Bopsz%2Cwght%5D.ttf"),
}
PAPER, INK, MUTED, MARK, RULE = (246, 243, 235), (31, 30, 28), (107, 101, 92), (212, 113, 78), (221, 214, 200)
W, H, M = 1200, 630, 76

NAME = "Avnish Singh"
HEADLINE = "I build benchmarks and deterministic checks that catch silent failures in AI systems."
SUBLINE = "Final-year CS student, Babu Banarasi Das University. Graduating May 2027."

CASES = {
    "omitbench": ("OmitBench", "A benchmark for silent omissions in coding-agent patches.", "−0.202", "MCC against a mid-tier LLM judge, and I kept it as the headline"),
    "integrity-analyzer": ("Implementation Integrity Analyzer", "Static analysis for safety checks that AI-generated code defines but never runs.", "0.389", "MCC on 15 scenarios, where a name search catches nothing"),
    "cancer-fusion": ("Cancer Fusion AI", "A skin lesion classifier that combines dermoscopy images with patient metadata.", "0.712", "macro-F1 on 1,543 held-out test images"),
}


def font(kind: str, size: int, weight: int) -> ImageFont.FreeTypeFont:
    name, url = FONTS[kind]
    path = CACHE / name
    if not path.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        urllib.request.urlretrieve(url, path)
    f = ImageFont.truetype(str(path), size)
    values = []
    for axis in f.get_variation_axes():
        label = axis["name"].decode() if isinstance(axis["name"], bytes) else str(axis["name"])
        if "eight" in label:
            values.append(weight)
        elif "ptical" in label:
            values.append(max(axis["minimum"], min(axis["maximum"], size * 0.75)))
        else:
            values.append(axis["default"])
    f.set_variation_by_axes(values)
    return f


def wrap(draw: ImageDraw.ImageDraw, text: str, f: ImageFont.FreeTypeFont, width: int) -> list[str]:
    lines, current = [], ""
    for word in text.split():
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=f) <= width:
            current = trial
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def mark(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    """The favicon glyph: three lines of text, the last one highlighted."""
    draw.rounded_rectangle((x, y, x + 34, y + 34), radius=8, fill=INK)
    draw.rounded_rectangle((x + 8, y + 9, x + 22, y + 13), radius=1, fill=PAPER)
    draw.rounded_rectangle((x + 8, y + 16, x + 27, y + 20), radius=1, fill=(160, 152, 140))
    draw.rounded_rectangle((x + 8, y + 23, x + 19, y + 27), radius=1, fill=MARK)


def base() -> tuple[Image.Image, ImageDraw.ImageDraw]:
    img = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(img)
    mark(draw, M, M - 6)
    draw.text((M + 50, M + 22), NAME, font=font("sans", 32, 640), fill=INK, anchor="ls")
    return img, draw


def default_card() -> None:
    img, draw = base()
    photo = Image.open(ROOT / "src" / "assets" / "avnish.jpg").convert("RGB")
    size = 208
    photo = ImageOps.fit(photo, (size, size))
    rounded = Image.new("L", (size, size), 0)
    ImageDraw.Draw(rounded).rounded_rectangle((0, 0, size, size), radius=12, fill=255)
    img.paste(photo, (W - M - size, M - 6), rounded)

    head = font("sans", 60, 660)
    y = 212
    for line in wrap(draw, HEADLINE, head, W - 2 * M - size - 40):
        draw.text((M, y), line, font=head, fill=INK, anchor="ls")
        y += 70
    draw.line((M, H - 118, W - M, H - 118), fill=RULE, width=2)
    draw.text((M, H - 70), SUBLINE, font=font("serif", 30, 400), fill=MUTED, anchor="ls")
    img.save(OUT / "default.png", optimize=True)


def case_card(slug: str, title: str, dek: str, number: str, rest: str) -> None:
    img, draw = base()
    title_font = font("sans", 76 if len(title) < 20 else 62, 660)
    y = 236
    for line in wrap(draw, title, title_font, W - 2 * M):
        draw.text((M, y), line, font=title_font, fill=INK, anchor="ls")
        y += 78
    serif = font("serif", 32, 400)
    y += 6
    for line in wrap(draw, dek, serif, W - 2 * M):
        draw.text((M, y), line, font=serif, fill=MUTED, anchor="ls")
        y += 46

    stat_y = H - 78
    num_font = font("sans", 44, 650)
    rest_font = font("sans", 30, 450)
    width = draw.textlength(number, font=num_font)
    draw.rectangle((M - 2, stat_y + 4, M + width + 2, stat_y + 12), fill=MARK)
    draw.text((M, stat_y), number, font=num_font, fill=INK, anchor="ls")
    for i, line in enumerate(wrap(draw, rest, rest_font, W - 2 * M - int(width) - 20)[:1]):
        draw.text((M + width + 16, stat_y), line, font=rest_font, fill=MUTED, anchor="ls")
    img.save(OUT / f"{slug}.png", optimize=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    default_card()
    for slug, args in CASES.items():
        case_card(slug, *args)
    print("wrote", sorted(p.name for p in OUT.glob("*.png")))
