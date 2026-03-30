#!/usr/bin/env python3
"""
Parallel Web Systems API Client

Provides web search, URL content extraction, and deep research capabilities
using the Parallel Web Systems APIs (https://docs.parallel.ai).

Primary interface: Parallel Chat API (OpenAI-compatible) for search and research.
Secondary interface: Extract API for URL verification and special cases.

Main classes:
  - ParallelChat:         Core Chat API client (base/core models)
  - ParallelSearch:       Web search via Chat API (base model)
  - ParallelDeepResearch: Deep research via Chat API (core model)
  - ParallelExtract:      URL content extraction (Extract API, verification only)

Environment variable required:
  PARALLEL_API_KEY - Your Parallel API key from https://platform.parallel.ai
"""

import os
import sys
import json
import argparse
from datetime import datetime
from typing import Any, Dict, List, Optional


def _get_api_key():
    """Validate and return the Parallel API key."""
    api_key = os.getenv("PARALLEL_API_KEY")
    if not api_key:
        raise ValueError(
            "PARALLEL_API_KEY environment variable not set.\n"
            "Get your key at https://platform.parallel.ai and set it:\n"
            "  export PARALLEL_API_KEY='your_key_here'"
        )
    return api_key


def _get_extract_client():
    """Create and return a Parallel SDK client for the Extract API."""
    try:
        from parallel import Parallel
    except ImportError:
        raise ImportError(
            "The 'parallel-web' package is required for extract. Install it with:\n"
            "  pip install parallel-web"
        )
    return Parallel(api_key=_get_api_key())


class ParallelChat:
    """Core client for the Parallel Chat API.

    OpenAI-compatible chat completions endpoint that performs web research
    and returns synthesized responses with citations.

    Models:
      - base  : Standard research, factual queries (15-100s latency)
      - core  : Complex research, multi-source synthesis (60s-5min latency)
    """

    CHAT_BASE_URL = "https://api.parallel.ai"

    def __init__(self):
        try:
            from openai import OpenAI
        except ImportError:
            raise ImportError(
                "The 'openai' package is required. Install it with:\n"
                "  pip install openai"
            )

        self.client = OpenAI(
            api_key=_get_api_key(),
            base_url=self.CHAT_BASE_URL,
        )

    def query(
        self,
        user_message: str,
        system_message: Optional[str] = None,
        model: str = "base",
    ) -> Dict[str, Any]:
        """Send a query to the Parallel Chat API.

        Args:
            user_message: The research query or question.
            system_message: Optional system prompt to guide response style.
            model: Chat model to use ('base' or 'core').

        Returns:
            Dict with 'content' (response text), 'sources' (citations), and metadata.
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        messages = []
        if system_message:
            messages.append({"role": "system", "content": system_message})
        messages.append({"role": "user", "content": user_message})

        try:
            print(f"[Parallel Chat] Querying model={model}...", file=sys.stderr)

            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                stream=False,
            )

            content = ""
            if response.choices and len(response.choices) > 0:
                content = response.choices[0].message.content or ""

            sources = self._extract_basis(response)

            return {
                "success": True,
                "content": content,
                "sources": sources,
                "citation_count": len(sources),
                "model": model,
                "timestamp": timestamp,
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": model,
                "timestamp": timestamp,
            }

    def _extract_basis(self, response) -> List[Dict[str, str]]:
        """Extract citation sources from the Chat API research basis."""
        sources = []
        basis = getattr(response, "basis", None)
        if not basis:
            return sources

        seen_urls = set()
        if isinstance(basis, list):
            for item in basis:
                citations = (
                    item.get("citations", []) if isinstance(item, dict)
                    else getattr(item, "citations", None) or []
                )
                for cit in citations:
                    url = cit.get("url", "") if isinstance(cit, dict) else getattr(cit, "url", "")
                    if url and url not in seen_urls:
                        seen_urls.add(url)
                        title = cit.get("title", "") if isinstance(cit, dict) else getattr(cit, "title", "")
                        excerpts = cit.get("excerpts", []) if isinstance(cit, dict) else getattr(cit, "excerpts", [])
                        sources.append({
                            "type": "source",
                            "url": url,
                            "title": title,
                            "excerpts": excerpts,
                        })

        return sources


class ParallelSearch:
    """Web search using the Parallel Chat API (base model).

    Sends a search query to the Chat API which performs web research and
    returns a synthesized summary with cited sources.
    """

    SYSTEM_PROMPT = (
        "You are a web research assistant. Search the web and synthesize information "
        "about the user's query. Provide a clear, well-organized summary with:\n"
        "- Key facts, data points, and statistics\n"
        "- Specific names, dates, and numbers when available\n"
        "- Multiple perspectives if the topic is debated\n"
        "Cite your sources inline. Be comprehensive but concise."
    )

    def __init__(self):
        self.chat = ParallelChat()

    def search(
        self,
        objective: str,
        model: str = "base",
    ) -> Dict[str, Any]:
        """Execute a web search via the Chat API.

        Args:
            objective: Natural language description of the search goal.
            model: Chat model to use ('base' or 'core', default 'base').

        Returns:
            Dict with 'response' (synthesized text), 'sources', and metadata.
        """
        result = self.chat.query(
            user_message=objective,
            system_message=self.SYSTEM_PROMPT,
            model=model,
        )

        if not result["success"]:
            return {
                "success": False,
                "objective": objective,
                "error": result.get("error", "Unknown error"),
                "timestamp": result["timestamp"],
            }

        return {
            "success": True,
            "objective": objective,
            "response": result["content"],
            "sources": result["sources"],
            "citation_count": result["citation_count"],
            "model": result["model"],
            "backend": "parallel-chat",
            "timestamp": result["timestamp"],
        }


class ParallelExtract:
    """Extract clean content from URLs using Parallel's Extract API.

    Converts any public URL into clean, LLM-optimized markdown.
    Use for citation verification and special cases only.
    For general research, use ParallelSearch or ParallelDeepResearch instead.
    """

    def __init__(self):
        self.client = _get_extract_client()

    def extract(
        self,
        urls: List[str],
        objective: Optional[str] = None,
        excerpts: bool = True,
        full_content: bool = False,
    ) -> Dict[str, Any]:
        """Extract content from one or more URLs.

        Args:
            urls: List of URLs to extract content from.
            objective: Optional objective to focus extraction.
            excerpts: Whether to return focused excerpts (default True).
            full_content: Whether to return full page content (default False).

        Returns:
            Dict with 'results' list containing url, title, excerpts/content.
        """
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        kwargs = {
            "urls": urls,
            "excerpts": excerpts,
            "full_content": full_content,
        }
        if objective:
            kwargs["objective"] = objective

        try:
            response = self.client.beta.extract(**kwargs)

            results = []
            if hasattr(response, "results") and response.results:
                for r in response.results:
                    result = {
                        "url": getattr(r, "url", ""),
                        "title": getattr(r, "title", ""),
                        "publish_date": getattr(r, "publish_date", None),
                        "excerpts": getattr(r, "excerpts", []),
                        "full_content": getattr(r, "full_content", None),
                    }
                    results.append(result)

            errors = []
            if hasattr(response, "errors") and response.errors:
                errors = [str(e) for e in response.errors]

            return {
                "success": True,
                "urls": urls,
                "results": results,
                "errors": errors,
                "timestamp": timestamp,
                "extract_id": getattr(response, "extract_id", None),
            }

        except Exception as e:
            return {
                "success": False,
                "urls": urls,
                "error": str(e),
                "timestamp": timestamp,
            }


class ParallelDeepResearch:
    """Deep research using the Parallel Chat API (core model).

    Sends complex research queries to the Chat API which performs
    multi-source web research and returns comprehensive reports with citations.
    """

    SYSTEM_PROMPT = (
        "You are a deep research analyst. Provide a comprehensive, well-structured "
        "research report on the user's topic. Include:\n"
        "- Executive summary of key findings\n"
        "- Detailed analysis organized by themes\n"
        "- Specific data, statistics, and quantitative evidence\n"
        "- Multiple authoritative sources\n"
        "- Implications and future outlook where relevant\n"
        "Use markdown formatting with clear section headers. "
        "Cite all sources inline."
    )

    def __init__(self):
        self.chat = ParallelChat()

    def research(
        self,
        query: str,
        model: str = "core",
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Run deep research via the Chat API.

        Args:
            query: The research question or topic.
            model: Chat model to use ('base' or 'core', default 'core').
            system_prompt: Optional override for the system prompt.

        Returns:
            Dict with 'response' (markdown report), 'citations', and metadata.
        """
        result = self.chat.query(
            user_message=query,
            system_message=system_prompt or self.SYSTEM_PROMPT,
            model=model,
        )

        if not result["success"]:
            return {
                "success": False,
                "query": query,
                "error": result.get("error", "Unknown error"),
                "model": model,
                "timestamp": result["timestamp"],
            }

        return {
            "success": True,
            "query": query,
            "response": result["content"],
            "output": result["content"],
            "citations": result["sources"],
            "sources": result["sources"],
            "citation_count": result["citation_count"],
            "model": model,
            "backend": "parallel-chat",
            "timestamp": result["timestamp"],
        }


# ---------------------------------------------------------------------------
# CLI Interface
# ---------------------------------------------------------------------------

def _print_search_results(result: Dict[str, Any], output_file=None):
    """Print search results (synthesized summary + sources)."""
    def write(text):
        if output_file:
            output_file.write(text + "\n")
        else:
            print(text)

    if not result["success"]:
        write(f"Error: {result.get('error', 'Unknown error')}")
        return

    write(f"\n{'='*80}")
    write(f"Search: {result['objective']}")
    write(f"Model: {result['model']} | Time: {result['timestamp']}")
    write(f"{'='*80}\n")

    write(result.get("response", "No response received."))

    sources = result.get("sources", [])
    if sources:
        write(f"\n\n{'='*40} SOURCES {'='*40}")
        for i, src in enumerate(sources):
            title = src.get("title", "Untitled")
            url = src.get("url", "")
            write(f"  [{i+1}] {title}")
            if url:
                write(f"      {url}")


def _print_extract_results(result: Dict[str, Any], output_file=None):
    """Pretty-print extract results."""
    def write(text):
        if output_file:
            output_file.write(text + "\n")
        else:
            print(text)

    if not result["success"]:
        write(f"Error: {result.get('error', 'Unknown error')}")
        return

    write(f"\n{'='*80}")
    write(f"Extracted from: {', '.join(result['urls'])}")
    write(f"Time: {result['timestamp']}")
    write(f"{'='*80}")

    for i, r in enumerate(result["results"]):
        write(f"\n--- [{i+1}] {r['title']} ---")
        write(f"URL: {r['url']}")
        if r.get("full_content"):
            write(f"\n{r['full_content']}")
        elif r.get("excerpts"):
            for j, excerpt in enumerate(r["excerpts"]):
                write(f"\nExcerpt {j+1}:")
                write(excerpt[:2000] if len(excerpt) > 2000 else excerpt)

    if result.get("errors"):
        write(f"\nErrors: {result['errors']}")


def _print_research_results(result: Dict[str, Any], output_file=None):
    """Print deep research results (report + sources)."""
    def write(text):
        if output_file:
            output_file.write(text + "\n")
        else:
            print(text)

    if not result["success"]:
        write(f"Error: {result.get('error', 'Unknown error')}")
        return

    write(f"\n{'='*80}")
    query_display = result['query'][:100]
    if len(result['query']) > 100:
        query_display += "..."
    write(f"Research: {query_display}")
    write(f"Model: {result['model']} | Citations: {result.get('citation_count', 0)} | Time: {result['timestamp']}")
    write(f"{'='*80}\n")

    write(result.get("response", result.get("output", "No output received.")))

    citations = result.get("citations", result.get("sources", []))
    if citations:
        write(f"\n\n{'='*40} SOURCES {'='*40}")
        seen_urls = set()
        for cit in citations:
            url = cit.get("url", "")
            if url and url not in seen_urls:
                seen_urls.add(url)
                title = cit.get("title", "Untitled")
                write(f"  [{len(seen_urls)}] {title}")
                write(f"      {url}")


def main():
    parser = argparse.ArgumentParser(
        description="Parallel Web Systems API Client - Search, Extract, and Deep Research",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python parallel_web.py search "latest advances in quantum computing"
  python parallel_web.py search "climate policy 2025" --model core
  python parallel_web.py extract "https://example.com" --objective "key findings"
  python parallel_web.py research "comprehensive analysis of EV battery market"
  python parallel_web.py research "compare mRNA vs protein subunit vaccines" --model base
  python parallel_web.py research "AI regulation landscape 2025" -o report.md
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="API command")

    # --- search subcommand ---
    search_parser = subparsers.add_parser("search", help="Web search via Chat API (synthesized results)")
    search_parser.add_argument("objective", help="Natural language search objective")
    search_parser.add_argument("--model", default="base", choices=["base", "core"],
                               help="Chat model to use (default: base)")
    search_parser.add_argument("-o", "--output", help="Write output to file")
    search_parser.add_argument("--json", action="store_true", help="Output as JSON")

    # --- extract subcommand ---
    extract_parser = subparsers.add_parser("extract", help="Extract content from URLs (verification only)")
    extract_parser.add_argument("urls", nargs="+", help="One or more URLs to extract")
    extract_parser.add_argument("--objective", help="Objective to focus extraction")
    extract_parser.add_argument("--full-content", action="store_true", help="Return full page content")
    extract_parser.add_argument("-o", "--output", help="Write output to file")
    extract_parser.add_argument("--json", action="store_true", help="Output as JSON")

    # --- research subcommand ---
    research_parser = subparsers.add_parser("research", help="Deep research via Chat API (comprehensive report)")
    research_parser.add_argument("query", help="Research question or topic")
    research_parser.add_argument("--model", default="core", choices=["base", "core"],
                                 help="Chat model to use (default: core)")
    research_parser.add_argument("-o", "--output", help="Write output to file")
    research_parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return 1

    output_file = None
    if hasattr(args, "output") and args.output:
        output_file = open(args.output, "w", encoding="utf-8")

    try:
        if args.command == "search":
            searcher = ParallelSearch()
            result = searcher.search(
                objective=args.objective,
                model=args.model,
            )
            if args.json:
                text = json.dumps(result, indent=2, ensure_ascii=False, default=str)
                (output_file or sys.stdout).write(text + "\n")
            else:
                _print_search_results(result, output_file)

        elif args.command == "extract":
            extractor = ParallelExtract()
            result = extractor.extract(
                urls=args.urls,
                objective=args.objective,
                full_content=args.full_content,
            )
            if args.json:
                text = json.dumps(result, indent=2, ensure_ascii=False, default=str)
                (output_file or sys.stdout).write(text + "\n")
            else:
                _print_extract_results(result, output_file)

        elif args.command == "research":
            researcher = ParallelDeepResearch()
            result = researcher.research(
                query=args.query,
                model=args.model,
            )
            if args.json:
                text = json.dumps(result, indent=2, ensure_ascii=False, default=str)
                (output_file or sys.stdout).write(text + "\n")
            else:
                _print_research_results(result, output_file)

        return 0

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        return 1

    finally:
        if output_file:
            output_file.close()


if __name__ == "__main__":
    sys.exit(main())
