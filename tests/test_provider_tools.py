from types import SimpleNamespace

from llm.core.types import LLMInput, Message, Role, ToolDefinition
from llm.providers.claude import ClaudeProvider
from llm.providers.openai import OpenAIProvider


class _OpenAICompletions:
    def __init__(self):
        self.params = None

    def create(self, **params):
        self.params = params
        return SimpleNamespace(
            choices=[
                SimpleNamespace(
                    message=SimpleNamespace(content="done", tool_calls=None),
                    finish_reason="stop",
                )
            ],
            model=params["model"],
            usage=SimpleNamespace(prompt_tokens=1, completion_tokens=2, total_tokens=3),
        )


class _AnthropicMessages:
    def __init__(self):
        self.params = None

    def create(self, **params):
        self.params = params
        return SimpleNamespace(
            content=[SimpleNamespace(type="text", text="done")],
            model=params["model"],
            usage=SimpleNamespace(input_tokens=1, output_tokens=2),
            stop_reason="end_turn",
        )


def _llm_input_with_tool():
    return LLMInput(
        messages=[Message(role=Role.USER, content="Search for docs")],
        tools=[
            ToolDefinition(
                name="search",
                description="Search docs",
                parameters={
                    "type": "object",
                    "properties": {"query": {"type": "string"}},
                    "required": ["query"],
                },
            )
        ],
    )


def test_openai_provider_serializes_tools_as_functions():
    provider = OpenAIProvider(api_key="test")
    completions = _OpenAICompletions()
    provider.client = SimpleNamespace(chat=SimpleNamespace(completions=completions))

    provider.generate(_llm_input_with_tool())

    assert completions.params["tools"] == [
        {
            "type": "function",
            "function": {
                "name": "search",
                "description": "Search docs",
                "parameters": {
                    "type": "object",
                    "properties": {"query": {"type": "string"}},
                    "required": ["query"],
                },
                "strict": True,
            },
        }
    ]


def test_claude_provider_serializes_tools_as_input_schemas():
    provider = ClaudeProvider(api_key="test")
    messages = _AnthropicMessages()
    provider.client = SimpleNamespace(messages=messages)

    provider.generate(_llm_input_with_tool())

    assert messages.params["tools"] == [
        {
            "name": "search",
            "description": "Search docs",
            "input_schema": {
                "type": "object",
                "properties": {"query": {"type": "string"}},
                "required": ["query"],
            },
        }
    ]
