"""Anthropic Claude AI client — tool_use powered repair intelligence."""

from __future__ import annotations

import json
from typing import Any

import anthropic

from src.models import AIConfig
from src.ai.base import BaseAIClient

_SYSTEM_PROMPT = """\
You are an expert CI/CD repair agent. Your job is to analyze pipeline failure logs,
identify the root cause, and produce precise code fixes.

Rules:
- Only fix what is broken. Do NOT refactor, improve, or add features.
- Return the COMPLETE fixed file content, not diffs or partial snippets.
- If you are not confident (< 0.5), say so — do not guess.
- Never introduce new dependencies unless absolutely required.
- Preserve existing code style, indentation, and conventions.
"""


class ClaudeClient(BaseAIClient):
    """Anthropic Claude implementation with structured tool_use."""

    def __init__(self, config: AIConfig) -> None:
        super().__init__(config)
        self._client = anthropic.AsyncAnthropic()  # reads ANTHROPIC_API_KEY from env

    async def analyze_failure(
        self,
        logs: str,
        changed_files: dict[str, str],
        context: str = "",
    ) -> dict[str, Any]:
        # Truncate logs to avoid token limits (keep last 8000 chars — where errors live)
        truncated_logs = logs[-8000:] if len(logs) > 8000 else logs

        files_summary = "\n".join(
            f"--- {path} ---\n{content[:2000]}"
            for path, content in changed_files.items()
        )

        tool = {
            "name": "report_diagnosis",
            "description": "Report the structured diagnosis of the CI failure.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "failure_type": {
                        "type": "string",
                        "enum": ["lint", "test", "coverage", "validation", "build", "unknown"],
                    },
                    "root_cause": {"type": "string"},
                    "affected_files": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "suggested_fixes": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "file_path": {"type": "string"},
                                "description": {"type": "string"},
                                "code_change": {"type": "string"},
                            },
                            "required": ["file_path", "description"],
                        },
                    },
                    "confidence": {"type": "number"},
                },
                "required": [
                    "failure_type",
                    "root_cause",
                    "affected_files",
                    "suggested_fixes",
                    "confidence",
                ],
            },
        }

        user_msg = (
            f"Analyze this CI pipeline failure.\n\n"
            f"## Failure Logs\n```\n{truncated_logs}\n```\n\n"
            f"## Changed Files\n{files_summary}\n\n"
        )
        if context:
            user_msg += f"## Additional Context\n{context}\n"

        user_msg += (
            "\nCall the report_diagnosis tool with your structured analysis. "
            "Be precise about affected files and root cause."
        )

        response = await self._client.messages.create(
            model=self._config.model,
            max_tokens=self._config.max_tokens,
            temperature=self._config.temperature,
            system=_SYSTEM_PROMPT,
            tools=[tool],
            tool_choice={"type": "tool", "name": "report_diagnosis"},
            messages=[{"role": "user", "content": user_msg}],
        )

        # Extract tool call result
        for block in response.content:
            if block.type == "tool_use" and block.name == "report_diagnosis":
                return block.input  # type: ignore[return-value]

        return {
            "failure_type": "unknown",
            "root_cause": "Could not determine root cause from logs",
            "affected_files": [],
            "suggested_fixes": [],
            "confidence": 0.0,
        }

    async def generate_fix(
        self,
        file_path: str,
        file_content: str,
        error_context: str,
        instruction: str,
    ) -> str:
        response = await self._client.messages.create(
            model=self._config.model,
            max_tokens=self._config.max_tokens,
            temperature=self._config.temperature,
            system=_SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Fix this file to resolve the CI failure.\n\n"
                        f"## File: {file_path}\n```\n{file_content}\n```\n\n"
                        f"## Error Context\n```\n{error_context}\n```\n\n"
                        f"## Instruction\n{instruction}\n\n"
                        f"Return ONLY the complete fixed file content. "
                        f"No explanations, no markdown fences, just the raw file."
                    ),
                }
            ],
        )

        return response.content[0].text.strip()

    async def generate_pr_description(
        self,
        failures: list[dict[str, Any]],
        fixes: list[dict[str, Any]],
        original_branch: str,
    ) -> dict[str, str]:
        tool = {
            "name": "report_pr",
            "description": "Return the PR title and Markdown body.",
            "input_schema": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "body": {"type": "string"},
                },
                "required": ["title", "body"],
            },
        }

        response = await self._client.messages.create(
            model=self._config.model,
            max_tokens=2048,
            temperature=self._config.temperature,
            system=_SYSTEM_PROMPT,
            tools=[tool],
            tool_choice={"type": "tool", "name": "report_pr"},
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Generate a PR description for an automated CI repair.\n\n"
                        f"Branch: {original_branch}\n\n"
                        f"## Failures Found\n{json.dumps(failures, indent=2)}\n\n"
                        f"## Fixes Applied\n{json.dumps(fixes, indent=2)}\n\n"
                        f"Write a clear, professional PR title and Markdown body. "
                        f"Include a summary of what was broken, what was fixed, "
                        f"and a note that this is an automated repair requiring human review."
                    ),
                }
            ],
        )

        for block in response.content:
            if block.type == "tool_use" and block.name == "report_pr":
                return block.input  # type: ignore[return-value]

        return {
            "title": f"fix(ai-repair): auto-fix CI failures on {original_branch}",
            "body": "Automated repair — please review changes carefully.",
        }

    async def close(self) -> None:
        await self._client.close()
