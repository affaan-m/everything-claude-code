from types import SimpleNamespace

from llm.core.types import LLMInput, Message, Role, ToolDefinition
from llm.providers.claude import ClaudeProvider
from llm.providers.openai import OpenAIProvider


def _tool() -> ToolDefinition:
    return ToolDefinition(
        name="search",
        description="Search",
        parameters={"type": "object", "properties": {"query": {"type": "string"}}},
    )


class _OpenAICompletions:
    def __init__(self) -> None:
        self.params = None

    def create(self, **params):
        self.params = params
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content="ok", tool_calls=None), finish_reason="stop")],
            model=params["model"],
            usage=SimpleNamespace(prompt_tokens=1, completion_tokens=1, total_tokens=2),
        )


class _OpenAIClient:
    def __init__(self) -> None:
        self.completions = _OpenAICompletions()
        self.chat = SimpleNamespace(completions=self.completions)


class _AnthropicMessages:
    def __init__(self) -> None:
        self.params = None

    def create(self, **params):
        self.params = params
        return SimpleNamespace(
            content=[SimpleNamespace(text="ok", type="text")],
            model=params["model"],
            usage=SimpleNamespace(input_tokens=1, output_tokens=1),
            stop_reason="end_turn",
        )


class _AnthropicClient:
    def __init__(self) -> None:
        self.messages = _AnthropicMessages()
        self.api_key = "test"


def test_openai_provider_serializes_tools_for_chat_completions():
    provider = OpenAIProvider(api_key="test")
    client = _OpenAIClient()
    provider.client = client

    provider.generate(LLMInput(messages=[Message(role=Role.USER, content="hi")], tools=[_tool()]))

    assert client.completions.params["tools"] == [
        {
            "type": "function",
            "function": {
                "name": "search",
                "description": "Search",
                "parameters": {"type": "object", "properties": {"query": {"type": "string"}}},
                "strict": True,
            },
        }
    ]


def test_claude_provider_serializes_tools_for_messages_api():
    provider = ClaudeProvider(api_key="test")
    client = _AnthropicClient()
    provider.client = client

    provider.generate(LLMInput(messages=[Message(role=Role.USER, content="hi")], tools=[_tool()]))

    assert client.messages.params["tools"] == [
        {
            "name": "search",
            "description": "Search",
            "input_schema": {"type": "object", "properties": {"query": {"type": "string"}}},
        }
    ]
