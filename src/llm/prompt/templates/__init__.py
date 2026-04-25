"""Provider-specific prompt template helpers."""

from __future__ import annotations

from types import MappingProxyType
from typing import Mapping

_TEMPLATE_REGISTRY: dict[str, str] = {}
TEMPLATES: Mapping[str, str] = MappingProxyType(_TEMPLATE_REGISTRY)


def register_template(name: str, template: str) -> None:
    """Register or replace a named prompt template."""
    _TEMPLATE_REGISTRY[name] = template


def get_template(name: str) -> str | None:
    """Return a named prompt template when one is registered."""
    return _TEMPLATE_REGISTRY.get(name)


def get_template_or_default(name: str, default: str = "") -> str:
    """Return a named prompt template or a caller-provided default."""
    return _TEMPLATE_REGISTRY.get(name, default)
