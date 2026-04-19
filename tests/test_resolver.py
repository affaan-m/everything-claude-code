import pytest
from llm.core.types import ProviderType
from llm.providers import ClaudeProvider, OpenAIProvider, OllamaProvider, get_provider


class TestGetProvider:
    def test_get_claude_provider(self):
        provider = get_provider("claude")
        assert isinstance(provider, ClaudeProvider)
        assert provider.provider_type == ProviderType.CLAUDE

    def test_get_openai_provider(self):
        provider = get_provider("openai")
        assert isinstance(provider, OpenAIProvider)
        assert provider.provider_type == ProviderType.OPENAI

    def test_get_ollama_provider(self):
        provider = get_provider("ollama")
        assert isinstance(provider, OllamaProvider)
        assert provider.provider_type == ProviderType.OLLAMA

    def test_get_provider_by_enum(self):
        provider = get_provider(ProviderType.CLAUDE)
        assert isinstance(provider, ClaudeProvider)

    def test_invalid_provider_raises(self):
        with pytest.raises(ValueError, match="Unknown provider type"):
            get_provider("invalid")
