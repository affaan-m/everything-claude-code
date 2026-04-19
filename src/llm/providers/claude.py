"""Claude provider adapter."""

from __future__ import annotations

import os
from typing import Any

from anthropic import Anthropic

from llm.core.interface import (
    AuthenticationError,
    ContextLengthError,
    LLMProvider,
    RateLimitError,
)
from llm.core.types import LLMInput, LLMOutput, Message, ModelInfo, ProviderType, ToolCall


class ClaudeProvider(LLMProvider):
    provider_type = ProviderType.CLAUDE

    def __init__(self, api_key: str | None = None, base_url: str | None = None) -> None:
        self.client = Anthropic(api_key=api_key or os.environ.get("ANTHROPIC_API_KEY"), base_url=base_url)
        self._models = [
            ModelInfo(
                name="claude-opus-4-5",
                provider=ProviderType.CLAUDE,
                supports_tools=True,
                supports_vision=True,
                max_tokens=8192,
                context_window=200000,
            ),
            ModelInfo(
                name="claude-sonnet-4-7",
                provider=ProviderType.CLAUDE,
                supports_tools=True,
                supports_vision=True,
                max_tokens=8192,
                context_window=200000,
            ),
            ModelInfo(
                name="claude-haiku-4-7",
                provider=ProviderType.CLAUDE,
                supports_tools=True,
                supports_vision=False,
                max_tokens=4096,
                context_window=200000,
            ),
        ]

    def generate(self, input: LLMInput) -> LLMOutput:
        try:
            params: dict[str, Any] = {
                "model": input.model or "claude-sonnet-4-7",
                "messages": [msg.to_dict() for msg in input.messages],
                "temperature": input.temperature,
            }
            if input.max_tokens:
                params["max_tokens"] = input.max_tokens
            else:
                params["max_tokens"] = 8192  # required by Anthropic API
            if input.tools:
                params["tools"] = [tool.to_dict() for tool in input.tools]

            response = self.client.messages.create(**params)

            tool_calls = None
            if response.content and hasattr(response.content[0], "type"):
                if response.content[0].type == "tool_use":
                    tool_calls = [
                        ToolCall(
                            id=getattr(response.content[0], "id", ""),
                            name=getattr(response.content[0], "name", ""),
                            arguments=getattr(response.content[0].input, "__dict__", {}),
                        )
                    ]

            return LLMOutput(
                content=response.content[0].text if response.content else "",
                tool_calls=tool_calls,
                model=response.model,
                usage={
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                },
                stop_reason=response.stop_reason,
            )
        except Exception as e:
            msg = str(e)
            if "401" in msg or "authentication" in msg.lower():
                raise AuthenticationError(msg, provider=ProviderType.CLAUDE) from e
            if "429" in msg or "rate_limit" in msg.lower():
                raise RateLimitError(msg, provider=ProviderType.CLAUDE) from e
            if "context" in msg.lower() and "length" in msg.lower():
                raise ContextLengthError(msg, provider=ProviderType.CLAUDE) from e
            raise

    def list_models(self) -> list[ModelInfo]:
        return self._models.copy()

    def validate_config(self) -> bool:
        return bool(self.client.api_key)

    def get_default_model(self) -> str:
        return "claude-sonnet-4-7"
