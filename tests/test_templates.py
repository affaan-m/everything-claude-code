import pytest

from llm.prompt import TEMPLATES, get_template, get_template_or_default, register_template


def test_register_template_exposes_read_only_template_mapping():
    register_template("system", "You are helpful.")

    assert get_template("system") == "You are helpful."
    assert get_template_or_default("missing", "fallback") == "fallback"
    assert TEMPLATES["system"] == "You are helpful."
    with pytest.raises(TypeError):
        TEMPLATES["other"] = "mutable"  # type: ignore[index]
