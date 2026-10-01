"""Build the résumé PDF from resume/resume.html with headless Chromium.

    pip install playwright pypdf && python -m playwright install chromium
    python scripts/resume.py                      # writes public/resume.pdf, no phone number
    RESUME_PHONE="+91-..." python scripts/resume.py out.pdf   # private copy with the phone number

Needs the Carlito font installed (fonts-crosextra-carlito on Debian/Ubuntu); it is metric-compatible
with Calibri. The phone number is never committed: the public copy on the site leaves it out.
"""

import os
import sys
import tempfile
from pathlib import Path

from playwright.sync_api import sync_playwright
from pypdf import PdfReader, PdfWriter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "resume" / "resume.html"


def build(out: Path, phone: str | None) -> int:
    html = SRC.read_text()
    html = html.replace("<!--PHONE-->", f'<span class="sep">|</span>{phone}' if phone else "")
    with tempfile.TemporaryDirectory() as tmp, sync_playwright() as p:
        page_html = Path(tmp) / "resume.html"
        raw = Path(tmp) / "raw.pdf"
        page_html.write_text(html)
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto(page_html.as_uri())
        page.pdf(path=str(raw), format="Letter", print_background=True, prefer_css_page_size=True, tagged=True)
        browser.close()
        reader = PdfReader(str(raw))
        writer = PdfWriter(clone_from=reader)
        writer.add_metadata({
            "/Title": "Avnish Singh - Resume",
            "/Author": "Avnish Singh",
            "/Subject": "AI/ML engineer: LLM evaluation, benchmarks, medical image classification",
            "/Keywords": "AI/ML, LLM evaluation, benchmarks, PyTorch, computer vision, Python, FastAPI",
        })
        with open(out, "wb") as f:
            writer.write(f)
        return len(reader.pages)


if __name__ == "__main__":
    phone = os.environ.get("RESUME_PHONE")
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "public" / "resume.pdf"
    if phone and out.resolve().is_relative_to((ROOT / "public").resolve()):
        sys.exit("refusing to put the phone number into public/")
    pages = build(out, phone)
    print(f"wrote {out} ({pages} page{'s' if pages != 1 else ''})")
    if pages != 1:
        sys.exit("the résumé must fit on one page")
