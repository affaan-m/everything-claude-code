import pytest
from llm.core.types import LLMInput, Message, Role, ToolDefinition
from llm.prompt import PromptBuilder, adapt_messages_for_provider
from llm.prompt.builder import PromptConfig


class TestPromptBuilder:
    def test_build_without_system(self):
        messages = [Message(role=Role.USER, content="Hello")]
        builder = PromptBuilder()
        result = builder.build(messages)

        assert len(result) == 1
        assert result[0].role == Role.USER

    def test_build_with_system(self):
        messages = [
            Message(role=Role.SYSTEM, content="You are helpful."),
            Message(role=Role.USER, content="Hello"),
        ]
        builder = PromptBuilder()
        result = builder.build(messages)

        assert len(result) == 2
        assert result[0].role == Role.SYSTEM

    def test_build_adds_system_from_config(self):
        messages = [Message(role=Role.USER, content="Hello")]
        builder = PromptBuilder(system_template="You are a pirate.")
        result = builder.build(messages)

        assert len(result) == 2
        assert "pirate" in result[0].content

    def test_build_adds_system_from_config(self):
        messages = [Message(role=Role.USER, content="Hello")]
        builder = PromptBuilder(config=PromptConfig(system_template="You are a pirate."))
        result = builder.build(messages)

        assert len(result) == 2
        assert "pirate" in result[0].content
    def test_build_with_tools(self):
        messages = [Message(role=Role.USER, content="Search for something")]
        tools = [
            ToolDefinition(name="search", description="Search the web", parameters={}),
        ]
        builder = PromptBuilder(include_tools_in_system=True)
        result = builder.build(messages, tools)

        assert len(result) == 2
        assert "search" in result[0].content
        assert "Available Tools" in result[0].content


class TestAdaptMessagesForProvider:
    def test_adapt_for_claude(self):
        messages = [Message(role=Role.USER, content="Hello")]
        result = adapt_messages_for_provider(messages, "claude")
        assert len(result) == 1

    def test_adapt_for_openai(self):
        messages = [Message(role=Role.USER, content="Hello")]
        result = adapt_messages_for_provider(messages, "openai")
        assert len(result) == 1

    def test_adapt_for_ollama(self):
        messages = [Message(role=Role.USER, content="Hello")]
        result = adapt_messages_for_provider(messages, "ollama")
        assert len(result) == 1
