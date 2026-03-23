"""
Production-grade text cleaning for RAG ingestion.

Pipeline applied by clean_text():
  1. Unicode NFC normalisation
  2. Ligature / smart-quote expansion
  3. HTML/XML tag removal
  4. CRLF → LF, form-feed collapse
  5. Control character removal (preserves \t and \n)
  6. Horizontal whitespace collapse
  7. Blank-line collapse (max 2 consecutive)
  8. Per-line leading/trailing space trim
  9. Final strip + minimum length guard

clean_pages() additionally:
  - Applies clean_text() to each page
  - Removes structurally-repeated boilerplate (headers/footers that appear
    on 50 %+ of pages — a common PDF extraction artefact)
  - Drops pages that remain below MIN_PAGE_CHARS after cleaning
"""

from __future__ import annotations

import re
import unicodedata
from collections import Counter
from html.parser import HTMLParser

# Pages shorter than this after cleaning are treated as noise (cover pages,
# blank pages, watermark-only pages, etc.)
MIN_PAGE_CHARS = 20

# Lines that appear on at least this fraction of pages are treated as
# boilerplate (running headers / footers) and stripped.
BOILERPLATE_THRESHOLD = 0.5

# ── Unicode ligature / typographic character map ─────────────────────────────
_LIGATURE_MAP: dict[str, str] = {
    "\ufb00": "ff",
    "\ufb01": "fi",
    "\ufb02": "fl",
    "\ufb03": "ffi",
    "\ufb04": "ffl",
    "\ufb05": "st",
    "\ufb06": "st",
    # Smart / curly quotes → straight
    "\u2018": "'",
    "\u2019": "'",
    "\u201a": "'",
    "\u201b": "'",
    "\u201c": '"',
    "\u201d": '"',
    "\u201e": '"',
    "\u201f": '"',
    # Dashes → hyphen-minus
    "\u2013": "-",
    "\u2014": "-",
    "\u2015": "-",
    # Ellipsis → three dots
    "\u2026": "...",
    # Non-breaking / zero-width spaces
    "\u00a0": " ",
    "\u200b": "",
    "\u200c": "",
    "\u200d": "",
    "\ufeff": "",  # BOM
}
_LIGATURE_RE = re.compile("[" + re.escape("".join(_LIGATURE_MAP)) + "]")


class _HTMLStripper(HTMLParser):
    """Minimal, allocation-efficient HTML tag stripper."""

    def __init__(self) -> None:
        super().__init__()
        self._parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self._parts.append(data)

    def get_text(self) -> str:
        return " ".join(self._parts)


def _strip_html(text: str) -> str:
    if "<" not in text:
        return text
    stripper = _HTMLStripper()
    stripper.feed(text)
    return stripper.get_text()


def clean_text(text: str) -> str:
    """Return a cleaned version of *text*, ready for chunking."""
    # 1. Unicode NFC normalisation (compose canonical equivalents)
    text = unicodedata.normalize("NFC", text)

    # 2. Expand ligatures and normalise typographic characters
    text = _LIGATURE_RE.sub(lambda m: _LIGATURE_MAP[m.group()], text)

    # 3. Strip HTML/XML tags (no-op if no angle brackets present)
    text = _strip_html(text)

    # 4. Normalise line endings; collapse form-feed to newline
    text = text.replace("\r\n", "\n").replace("\r", "\n").replace("\f", "\n")

    # 5. Remove control characters (keep \t and \n)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)

    # 6. Collapse horizontal whitespace (spaces and tabs) to a single space
    text = re.sub(r"[ \t]+", " ", text)

    # 7. Collapse 3+ consecutive blank lines to 2
    text = re.sub(r"\n{3,}", "\n\n", text)

    # 8. Strip leading/trailing space on every line
    text = "\n".join(line.strip() for line in text.splitlines())

    # 9. Final strip
    return text.strip()


def _detect_boilerplate(pages: list[tuple[str, int]]) -> frozenset[str]:
    """
    Return lines that appear on ≥ BOILERPLATE_THRESHOLD of pages.
    These are likely running headers, footers, or page-number lines.
    Only considers lines of ≤ 120 characters to avoid false positives on
    repeated legitimate paragraph text.
    """
    if len(pages) < 3:
        # Not enough pages to reliably detect boilerplate
        return frozenset()

    line_counts: Counter[str] = Counter()
    for text, _ in pages:
        seen = {line.strip() for line in text.splitlines() if 0 < len(line.strip()) <= 120}
        line_counts.update(seen)

    threshold = max(2, int(len(pages) * BOILERPLATE_THRESHOLD))
    return frozenset(line for line, count in line_counts.items() if count >= threshold)


def _remove_boilerplate(text: str, boilerplate: frozenset[str]) -> str:
    if not boilerplate:
        return text
    lines = [line for line in text.splitlines() if line.strip() not in boilerplate]
    return "\n".join(lines)


def clean_pages(pages: list[tuple[str, int]]) -> list[tuple[str, int]]:
    """
    Clean and filter a list of (page_text, page_number) tuples.

    Steps:
    1. Apply clean_text() to each page.
    2. Detect and strip cross-page boilerplate (headers/footers).
    3. Drop pages whose cleaned text is empty or below MIN_PAGE_CHARS.
    """
    # First pass: clean each page
    cleaned: list[tuple[str, int]] = [
        (clean_text(text), page_num) for text, page_num in pages
    ]

    # Second pass: remove boilerplate identified across all pages
    boilerplate = _detect_boilerplate(cleaned)
    result: list[tuple[str, int]] = []
    for text, page_num in cleaned:
        text = _remove_boilerplate(text, boilerplate).strip()
        if len(text) >= MIN_PAGE_CHARS:
            result.append((text, page_num))

    return result
