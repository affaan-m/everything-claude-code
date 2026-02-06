"""Tests for parse_instinct_file() — verifies content after frontmatter is preserved."""

import importlib.util
import os

# Load instinct-cli.py (hyphenated filename requires importlib)
_spec = importlib.util.spec_from_file_location(
    "instinct_cli",
    os.path.join(os.path.dirname(__file__), "instinct-cli.py"),
)
_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_mod)
parse_instinct_file = _mod.parse_instinct_file


MULTI_SECTION = """\
---
id: instinct-a
trigger: "when coding"
confidence: 0.9
domain: general
---

## Action
Do thing A.

## Examples
- Example A1

---
id: instinct-b
trigger: "when testing"
confidence: 0.7
domain: testing
---

## Action
Do thing B.
"""


def test_multiple_instincts_preserve_content():
    result = parse_instinct_file(MULTI_SECTION)
    assert len(result) == 2
    assert "Do thing A." in result[0]["content"]
    assert "Example A1" in result[0]["content"]
    assert "Do thing B." in result[1]["content"]


def test_single_instinct_preserves_content():
    content = """\
---
id: solo
trigger: "when reviewing"
confidence: 0.8
domain: review
---

## Action
Check for security issues.

## Evidence
Prevents vulnerabilities.
"""
    result = parse_instinct_file(content)
    assert len(result) == 1
    assert "Check for security issues." in result[0]["content"]
    assert "Prevents vulnerabilities." in result[0]["content"]


def test_empty_content_no_error():
    content = """\
---
id: empty
trigger: "placeholder"
confidence: 0.5
domain: general
---
"""
    result = parse_instinct_file(content)
    assert len(result) == 1
    assert result[0]["content"] == ""
