"""Provider-specific prompt template helpers."""

from __future__ import annotations

TEMPLATES: dict[str, str] = {}


def get_template(name: str) -> str | None:
    """Return a named prompt template when one is registered."""
    return TEMPLATES.get(name)


def get_template_or_default(name: str, default: str = "") -> str:
    """Return a named prompt template or a caller-provided default."""
    return TEMPLATES.get(name, default)
