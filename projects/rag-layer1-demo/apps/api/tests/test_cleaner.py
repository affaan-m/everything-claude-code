"""
Tests for the production-grade text cleaner.
Each test targets a specific cleaning behaviour so failures are easy to diagnose.
"""

import pytest

from app.worker.pipeline.cleaner import (
    MIN_PAGE_CHARS,
    clean_pages,
    clean_text,
)


# ── clean_text ────────────────────────────────────────────────────────────────

class TestCleanText:
    def test_crlf_normalised(self):
        assert clean_text("line1\r\nline2") == "line1\nline2"

    def test_cr_only_normalised(self):
        assert clean_text("line1\rline2") == "line1\nline2"

    def test_form_feed_normalised(self):
        assert clean_text("page1\fpage2") == "page1\npage2"

    def test_control_characters_removed(self):
        # Null byte and other C0 controls (except \t \n) must be stripped
        assert "\x00" not in clean_text("hello\x00world")
        assert "\x08" not in clean_text("back\x08space")
        assert "\x1f" not in clean_text("unit\x1fsep")

    def test_tabs_preserved_as_space(self):
        # Horizontal whitespace is collapsed, so a tab becomes a space
        result = clean_text("col1\tcol2")
        assert "\t" not in result
        assert "col1 col2" == result

    def test_multiple_spaces_collapsed(self):
        assert clean_text("too   many   spaces") == "too many spaces"

    def test_excessive_blank_lines_collapsed(self):
        text = "para1\n\n\n\n\npara2"
        result = clean_text(text)
        assert "\n\n\n" not in result
        assert "para1" in result
        assert "para2" in result

    def test_leading_trailing_whitespace_stripped(self):
        assert clean_text("  hello world  ") == "hello world"

    def test_per_line_leading_trailing_space_stripped(self):
        text = "  first line  \n  second line  "
        lines = clean_text(text).splitlines()
        assert lines[0] == "first line"
        assert lines[1] == "second line"

    def test_unicode_nfc_normalisation(self):
        # NFD: 'e' + combining acute accent vs NFC: é
        nfd = "e\u0301"  # two code points
        nfc = "\u00e9"   # single code point
        assert clean_text(nfd) == nfc

    def test_ligatures_expanded(self):
        assert clean_text("\ufb01nancial") == "financial"  # ﬁ → fi
        assert clean_text("\ufb00ort") == "ffort"          # ﬀ → ff
        assert clean_text("\ufb02ight") == "flight"        # ﬂ → fl

    def test_smart_quotes_normalised(self):
        assert clean_text("\u201chello\u201d") == '"hello"'
        assert clean_text("\u2018it\u2019s\u201d") == "'it's\""

    def test_em_dash_normalised(self):
        assert clean_text("one\u2014two") == "one-two"

    def test_ellipsis_normalised(self):
        assert clean_text("wait\u2026") == "wait..."

    def test_non_breaking_space_normalised(self):
        assert clean_text("one\u00a0two") == "one two"

    def test_zero_width_chars_removed(self):
        result = clean_text("zero\u200bwidth\u200csep\u200darator")
        assert "\u200b" not in result
        assert "\u200c" not in result
        assert "\u200d" not in result
        assert "zerowidthseparator" == result

    def test_bom_removed(self):
        assert clean_text("\ufeffhello") == "hello"

    def test_html_tags_stripped(self):
        assert clean_text("<p>Hello <b>world</b></p>") == "Hello world"

    def test_html_tags_with_attributes_stripped(self):
        result = clean_text('<a href="http://example.com">click</a>')
        assert "<" not in result
        assert "click" in result

    def test_no_html_unchanged(self):
        plain = "Just plain text with no angle brackets."
        assert clean_text(plain) == plain

    def test_below_min_length_not_filtered_by_clean_text(self):
        # clean_text is a pure transformation; length filtering is clean_pages' job
        short = "x" * (MIN_PAGE_CHARS - 1)
        assert clean_text(short) == short

    def test_at_min_length_passes(self):
        text = "a" * MIN_PAGE_CHARS
        assert clean_text(text) == text

    def test_preserves_meaningful_newlines(self):
        text = "paragraph one.\n\nparagraph two."
        result = clean_text(text)
        assert "paragraph one." in result
        assert "paragraph two." in result
        assert "\n\n" in result


# ── clean_pages ───────────────────────────────────────────────────────────────

class TestCleanPages:
    def _make_pages(self, texts: list[str]) -> list[tuple[str, int]]:
        return [(t, i + 1) for i, t in enumerate(texts)]

    def test_basic_cleaning_applied(self):
        # Text must exceed MIN_PAGE_CHARS after cleaning for clean_pages to keep it
        pages = self._make_pages(["  hello   world   and   some   extra   padding  "])
        result = clean_pages(pages)
        assert result[0][0] == "hello world and some extra padding"

    def test_empty_pages_dropped(self):
        pages = self._make_pages(["good content here with enough text", "   ", "\x00\x01"])
        result = clean_pages(pages)
        assert len(result) == 1
        assert result[0][0] == "good content here with enough text"

    def test_page_numbers_preserved(self):
        pages = [("enough text to pass the minimum length filter", 5)]
        result = clean_pages(pages)
        assert result[0][1] == 5

    def test_boilerplate_removed(self):
        # Simulate a 6-page PDF where every page has the same footer
        footer = "Confidential — Acme Corp — Page"
        good_text = "This is the real content of the page and it is long enough."
        pages = self._make_pages([f"{good_text}\n{footer}"] * 6)
        result = clean_pages(pages)
        for text, _ in result:
            assert footer not in text
            assert good_text in text

    def test_boilerplate_not_removed_for_few_pages(self):
        # With < 3 pages, boilerplate detection is skipped entirely
        footer = "Repeated Footer"
        good_text = "This is real content and it is long enough to pass the filter."
        pages = self._make_pages([f"{good_text}\n{footer}"] * 2)
        result = clean_pages(pages)
        # Footer should still be present since detection was skipped
        for text, _ in result:
            assert footer in text

    def test_non_repeated_lines_kept(self):
        # A line that only appears once should NOT be removed as boilerplate
        pages = self._make_pages(
            [f"unique content on page {i} which is long enough" for i in range(6)]
        )
        result = clean_pages(pages)
        assert len(result) == 6

    def test_empty_input_returns_empty(self):
        assert clean_pages([]) == []

    def test_all_pages_below_min_dropped(self):
        pages = self._make_pages(["x", "y", "z"])
        assert clean_pages(pages) == []
