"""Astraflow provider adapter (OpenAI-compatible, 200+ models).

Astraflow is an AI model aggregation platform by UCloud / 优刻得.

Endpoints
---------
Global : https://api-us-ca.umodelverse.ai/v1  (env: ASTRAFLOW_API_KEY)
China  : https://api.modelverse.cn/v1         (env: ASTRAFLOW_CN_API_KEY)

Sign up at https://astraflow.ucloud.cn/
"""

from __future__ import annotations

import json
import os
from typing import Any

from openai import OpenAI

from llm.core.interface import (
    AuthenticationError,
    ContextLengthError,
    LLMProvider,
    RateLimitError,
)
from llm.core.types import LLMInput, LLMOutput, ModelInfo, ProviderType, ToolCall


_ASTRAFLOW_GLOBAL_BASE_URL = "https://api-us-ca.umodelverse.ai/v1"
_ASTRAFLOW_CN_BASE_URL = "https://api.modelverse.cn/v1"


def _make_models(provider: ProviderType) -> list[ModelInfo]:
    """Return a representative set of models available on Astraflow."""
    return [
        ModelInfo(
            name="gpt-4o",
            provider=provider,
            supports_tools=True,
            supports_vision=True,
            max_tokens=4096,
            context_window=128000,
        ),
        ModelInfo(
            name="gpt-4o-mini",
            provider=provider,
            supports_tools=True,
            supports_vision=True,
            max_tokens=4096,
            context_window=128000,
        ),
        ModelInfo(
            name="claude-3-5-sonnet-20241022",
            provider=provider,
            supports_tools=True,
            supports_vision=True,
            max_tokens=8192,
            context_window=200000,
        ),
        ModelInfo(
            name="claude-3-5-haiku-20241022",
            provider=provider,
            supports_tools=True,
            supports_vision=False,
            max_tokens=4096,
            context_window=200000,
        ),
        ModelInfo(
            name="deepseek-chat",
            provider=provider,
            supports_tools=True,
            supports_vision=False,
            max_tokens=4096,
            context_window=64000,
        ),
        ModelInfo(
            name="deepseek-r1",
            provider=provider,
            supports_tools=False,
            supports_vision=False,
            max_tokens=8192,
            context_window=64000,
        ),
        ModelInfo(
            name="gemini-1.5-pro",
            provider=provider,
            supports_tools=True,
            supports_vision=True,
            max_tokens=8192,
            context_window=1000000,
        ),
        ModelInfo(
            name="gemini-1.5-flash",
            provider=provider,
            supports_tools=True,
            supports_vision=True,
            max_tokens=8192,
            context_window=1000000,
        ),
        ModelInfo(
            name="llama-3.3-70b-instruct",
            provider=provider,
            supports_tools=True,
            supports_vision=False,
            max_tokens=4096,
            context_window=128000,
        ),
        ModelInfo(
            name="qwen2.5-72b-instruct",
            provider=provider,
            supports_tools=True,
            supports_vision=False,
            max_tokens=4096,
            context_window=128000,
        ),
    ]


def _generate(client: OpenAI, input: LLMInput, default_model: str, provider: ProviderType) -> LLMOutput:
    """Shared generation logic for both Astraflow endpoint variants."""
    try:
        params: dict[str, Any] = {
            "model": input.model or default_model,
            "messages": [msg.to_dict() for msg in input.messages],
            "temperature": input.temperature,
        }
        if input.max_tokens:
            params["max_tokens"] = input.max_tokens
        if input.tools:
            params["tools"] = [tool.to_dict() for tool in input.tools]

        response = client.chat.completions.create(**params)
        choice = response.choices[0]

        tool_calls = None
        if choice.message.tool_calls:
            tool_calls = [
                ToolCall(
                    id=tc.id or "",
                    name=tc.function.name,
                    arguments={} if not tc.function.arguments else json.loads(tc.function.arguments),
                )
                for tc in choice.message.tool_calls
            ]

        return LLMOutput(
            content=choice.message.content or "",
            tool_calls=tool_calls,
            model=response.model,
            usage={
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            },
            stop_reason=choice.finish_reason,
        )
    except Exception as e:
        msg = str(e)
        if "401" in msg or "authentication" in msg.lower():
            raise AuthenticationError(msg, provider=provider) from e
        if "429" in msg or "rate_limit" in msg.lower():
            raise RateLimitError(msg, provider=provider) from e
        if "context" in msg.lower() and "length" in msg.lower():
            raise ContextLengthError(msg, provider=provider) from e
        raise


class AstraflowProvider(LLMProvider):
    """Astraflow global endpoint provider (api-us-ca.umodelverse.ai).

    Set ASTRAFLOW_API_KEY in your environment, or pass ``api_key`` explicitly.
    """

    provider_type = ProviderType.ASTRAFLOW

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        self.client = OpenAI(
            api_key=api_key or os.environ.get("ASTRAFLOW_API_KEY"),
            base_url=base_url or _ASTRAFLOW_GLOBAL_BASE_URL,
        )
        self._models = _make_models(ProviderType.ASTRAFLOW)

    def generate(self, input: LLMInput) -> LLMOutput:
        return _generate(self.client, input, self.get_default_model(), ProviderType.ASTRAFLOW)

    def list_models(self) -> list[ModelInfo]:
        return self._models.copy()

    def validate_config(self) -> bool:
        return bool(self.client.api_key)

    def get_default_model(self) -> str:
        return "gpt-4o-mini"


class AstraflowCNProvider(LLMProvider):
    """Astraflow China endpoint provider (api.modelverse.cn).

    Set ASTRAFLOW_CN_API_KEY in your environment, or pass ``api_key`` explicitly.
    """

    provider_type = ProviderType.ASTRAFLOW_CN

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        self.client = OpenAI(
            api_key=api_key or os.environ.get("ASTRAFLOW_CN_API_KEY"),
            base_url=base_url or _ASTRAFLOW_CN_BASE_URL,
        )
        self._models = _make_models(ProviderType.ASTRAFLOW_CN)

    def generate(self, input: LLMInput) -> LLMOutput:
        return _generate(self.client, input, self.get_default_model(), ProviderType.ASTRAFLOW_CN)

    def list_models(self) -> list[ModelInfo]:
        return self._models.copy()

    def validate_config(self) -> bool:
        return bool(self.client.api_key)

    def get_default_model(self) -> str:
        return "gpt-4o-mini"
