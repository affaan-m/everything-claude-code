"""Astraflow provider adapter (OpenAI-compatible, UCloud / 优刻得).

Global endpoint : https://api-us-ca.umodelverse.ai/v1  (env: ASTRAFLOW_API_KEY)
China endpoint  : https://api.modelverse.cn/v1         (env: ASTRAFLOW_CN_API_KEY)
Sign up         : https://astraflow.ucloud.cn/
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

_GLOBAL_BASE_URL = "https://api-us-ca.umodelverse.ai/v1"
_CN_BASE_URL = "https://api.modelverse.cn/v1"

# Popular models available on the Astraflow platform.
# Both provider variants expose the same catalogue; the only difference is
# the endpoint and API-key environment variable used.
_ASTRAFLOW_MODELS: list[dict[str, Any]] = [
    {
        "name": "gpt-4o",
        "supports_tools": True,
        "supports_vision": True,
        "max_tokens": 4096,
        "context_window": 128000,
    },
    {
        "name": "gpt-4o-mini",
        "supports_tools": True,
        "supports_vision": True,
        "max_tokens": 4096,
        "context_window": 128000,
    },
    {
        "name": "claude-3-5-sonnet-20241022",
        "supports_tools": True,
        "supports_vision": True,
        "max_tokens": 8192,
        "context_window": 200000,
    },
    {
        "name": "claude-3-5-haiku-20241022",
        "supports_tools": True,
        "supports_vision": False,
        "max_tokens": 8192,
        "context_window": 200000,
    },
    {
        "name": "deepseek-chat",
        "supports_tools": True,
        "supports_vision": False,
        "max_tokens": 4096,
        "context_window": 64000,
    },
    {
        "name": "deepseek-reasoner",
        "supports_tools": False,
        "supports_vision": False,
        "max_tokens": 8000,
        "context_window": 64000,
    },
    {
        "name": "gemini-2.0-flash",
        "supports_tools": True,
        "supports_vision": True,
        "max_tokens": 8192,
        "context_window": 1000000,
    },
    {
        "name": "llama-3.3-70b-instruct",
        "supports_tools": True,
        "supports_vision": False,
        "max_tokens": 4096,
        "context_window": 128000,
    },
]


def _build_models(provider: ProviderType) -> list[ModelInfo]:
    return [
        ModelInfo(
            name=m["name"],
            provider=provider,
            supports_tools=m["supports_tools"],
            supports_vision=m["supports_vision"],
            max_tokens=m["max_tokens"],
            context_window=m["context_window"],
        )
        for m in _ASTRAFLOW_MODELS
    ]


def _make_generate(provider_type: ProviderType):  # noqa: ANN001
    """Return a generate() implementation bound to *provider_type*."""

    def generate(self: "_AstraflowBase", input: LLMInput) -> LLMOutput:  # type: ignore[name-defined]
        try:
            params: dict[str, Any] = {
                "model": input.model or self.get_default_model(),
                "messages": [msg.to_dict() for msg in input.messages],
                "temperature": input.temperature,
            }
            if input.max_tokens:
                params["max_tokens"] = input.max_tokens
            if input.tools:
                params["tools"] = [tool.to_dict() for tool in input.tools]

            response = self.client.chat.completions.create(**params)
            choice = response.choices[0]

            tool_calls = None
            if choice.message.tool_calls:
                tool_calls = [
                    ToolCall(
                        id=tc.id or "",
                        name=tc.function.name,
                        arguments=({} if not tc.function.arguments else json.loads(tc.function.arguments)),
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
                raise AuthenticationError(msg, provider=provider_type) from e
            if "429" in msg or "rate_limit" in msg.lower():
                raise RateLimitError(msg, provider=provider_type) from e
            if "context" in msg.lower() and "length" in msg.lower():
                raise ContextLengthError(msg, provider=provider_type) from e
            raise

    return generate


class _AstraflowBase(LLMProvider):
    """Shared base for both Astraflow endpoint variants."""

    def list_models(self) -> list[ModelInfo]:
        return self._models.copy()

    def validate_config(self) -> bool:
        return bool(self.client.api_key)

    def get_default_model(self) -> str:
        return "gpt-4o-mini"


class AstraflowProvider(_AstraflowBase):
    """Astraflow global endpoint (https://api-us-ca.umodelverse.ai/v1).

    Requires the environment variable ``ASTRAFLOW_API_KEY``.
    Sign up at https://astraflow.ucloud.cn/
    """

    provider_type = ProviderType.ASTRAFLOW

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        self.client = OpenAI(
            api_key=api_key or os.environ.get("ASTRAFLOW_API_KEY"),
            base_url=base_url or _GLOBAL_BASE_URL,
        )
        self._models = _build_models(ProviderType.ASTRAFLOW)

    generate = _make_generate(ProviderType.ASTRAFLOW)


class AstraflowCNProvider(_AstraflowBase):
    """Astraflow China endpoint (https://api.modelverse.cn/v1).

    Requires the environment variable ``ASTRAFLOW_CN_API_KEY``.
    Sign up at https://astraflow.ucloud.cn/
    """

    provider_type = ProviderType.ASTRAFLOW_CN

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        self.client = OpenAI(
            api_key=api_key or os.environ.get("ASTRAFLOW_CN_API_KEY"),
            base_url=base_url or _CN_BASE_URL,
        )
        self._models = _build_models(ProviderType.ASTRAFLOW_CN)

    generate = _make_generate(ProviderType.ASTRAFLOW_CN)
