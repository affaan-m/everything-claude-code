import re


def clean_text(text: str) -> str:
    """Normalize whitespace and remove common noise."""
    # Collapse runs of whitespace/newlines
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Remove null bytes and control characters (except newlines/tabs)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return text.strip()


def clean_pages(pages: list[tuple[str, int]]) -> list[tuple[str, int]]:
    return [(clean_text(text), page_num) for text, page_num in pages if text.strip()]
