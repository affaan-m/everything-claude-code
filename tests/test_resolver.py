import pytest
from llm.core.types import ProviderType
from llm.providers import ClaudeProvider, OpenAIProvider, OllamaProvider, AstraflowProvider, AstraflowCNProvider, get_provider


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

    def test_get_astraflow_provider(self):
        provider = get_provider("astraflow")
        assert isinstance(provider, AstraflowProvider)
        assert provider.provider_type == ProviderType.ASTRAFLOW

    def test_get_astraflow_cn_provider(self):
        provider = get_provider("astraflow_cn")
        assert isinstance(provider, AstraflowCNProvider)
        assert provider.provider_type == ProviderType.ASTRAFLOW_CN

    def test_astraflow_default_model(self):
        provider = get_provider("astraflow")
        assert provider.get_default_model() == "deepseek-v3"

    def test_astraflow_cn_default_model(self):
        provider = get_provider("astraflow_cn")
        assert provider.get_default_model() == "deepseek-v3"

    def test_astraflow_list_models(self):
        provider = get_provider("astraflow")
        models = provider.list_models()
        assert len(models) > 0
        assert all(m.provider == ProviderType.ASTRAFLOW for m in models)

    def test_astraflow_cn_list_models(self):
        provider = get_provider("astraflow_cn")
        models = provider.list_models()
        assert len(models) > 0
        assert all(m.provider == ProviderType.ASTRAFLOW_CN for m in models)

    def test_invalid_provider_raises(self):
        with pytest.raises(ValueError, match="Unknown provider type"):
            get_provider("invalid")
