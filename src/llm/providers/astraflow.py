"""Astraflow provider adapter (OpenAI-compatible, 200+ models).

Astraflow is an AI model aggregation platform by UCloud (优刻得).
Documentation and API key signup: https://astraflow.ucloud.cn/

Two regional endpoints are supported via two separate provider classes:

* ``AstraflowProvider``   — global endpoint (env: ASTRAFLOW_API_KEY)
* ``AstraflowCNProvider`` — China  endpoint (env: ASTRAFLOW_CN_API_KEY)
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
from llm.core.types import LLMInput, LLMOutput, Message, ModelInfo, ProviderType, ToolCall


_GLOBAL_BASE_URL: str = "https://api-us-ca.umodelverse.ai/v1"
_CN_BASE_URL: str = "https://api.modelverse.cn/v1"


class AstraflowProvider(LLMProvider):
    """Astraflow global endpoint provider (ASTRAFLOW_API_KEY)."""

    provider_type = ProviderType.ASTRAFLOW

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
    ) -> None:
        self.client = OpenAI(
            api_key=api_key or os.environ.get("ASTRAFLOW_API_KEY"),
            base_url=base_url or _GLOBAL_BASE_URL,
        )
        self._models = [
            ModelInfo(
                name="deepseek-v3",
                provider=ProviderType.ASTRAFLOW,
                supports_tools=True,
                supports_vision=False,
                max_tokens=8192,
                context_window=128000,
            ),
            ModelInfo(
                name="qwen-max",
                provider=ProviderType.ASTRAFLOW,
                supports_tools=True,
                supports_vision=True,
                max_tokens=8192,
                context_window=32768,
            ),
            ModelInfo(
                name="llama-3.3-70b-instruct",
                provider=ProviderType.ASTRAFLOW,
                supports_tools=True,
                supports_vision=False,
                max_tokens=8192,
                context_window=128000,
            ),
            ModelInfo(
                name="gpt-4o",
                provider=ProviderType.ASTRAFLOW,
                supports_tools=True,
                supports_vision=True,
                max_tokens=4096,
                context_window=128000,
            ),
            ModelInfo(
                name="claude-3-5-sonnet",
                provider=ProviderType.ASTRAFLOW,
                supports_tools=True,
                supports_vision=True,
                max_tokens=8192,
                context_window=200000,
            ),
        ]

    def generate(self, input: LLMInput) -> LLMOutput:
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
                raise AuthenticationError(msg, provider=self.provider_type) from e
            if "429" in msg or "rate_limit" in msg.lower():
                raise RateLimitError(msg, provider=self.provider_type) from e
            if "context" in msg.lower() and "length" in msg.lower():
                raise ContextLengthError(msg, provider=self.provider_type) from e
            raise

    def list_models(self) -> list[ModelInfo]:
        return self._models.copy()

    def validate_config(self) -> bool:
        return bool(self.client.api_key)

    def get_default_model(self) -> str:
        return "deepseek-v3"


class AstraflowCNProvider(AstraflowProvider):
    """Astraflow China endpoint provider (ASTRAFLOW_CN_API_KEY)."""

    provider_type = ProviderType.ASTRAFLOW_CN

    def __init__(
        self,
        api_key: str | None = None,
        base_url: str | None = None,
    ) -> None:
        super().__init__(
            api_key=api_key or os.environ.get("ASTRAFLOW_CN_API_KEY"),
            base_url=base_url or _CN_BASE_URL,
        )
        # Re-stamp all model entries with the correct provider type
        self._models = [
            ModelInfo(
                name=m.name,
                provider=ProviderType.ASTRAFLOW_CN,
                supports_tools=m.supports_tools,
                supports_vision=m.supports_vision,
                max_tokens=m.max_tokens,
                context_window=m.context_window,
            )
            for m in self._models
        ]
