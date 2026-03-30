#!/usr/bin/env python3
"""
Perplexity Search via LitLLM and OpenRouter

This script performs AI-powered web searches using Perplexity models through
LiteLLM and OpenRouter. It provides real-time, grounded answers with source citations.

Usage:
    python perplexity_search.py "search query" [options]

Requirements:
    - OpenRouter API key set in OPENROUTER_API_KEY environment variable
    - LiteLLM installed: uv pip install litellm

Author: Scientific Skills
License: MIT
"""

import os
import sys
import json
import argparse
from typing import Optional, Dict, Any, List


def check_dependencies():
    """Check if required packages are installed."""
    try:
        import litellm
        return True
    except ImportError:
        print("Error: LiteLLM is not installed.", file=sys.stderr)
        print("Install it with: uv pip install litellm", file=sys.stderr)
        return False


def check_api_key() -> Optional[str]:
    """Check if OpenRouter API key is configured."""
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY environment variable is not set.", file=sys.stderr)
        print("\nTo set up your API key:", file=sys.stderr)
        print("1. Get an API key from https://openrouter.ai/keys", file=sys.stderr)
        print("2. Set the environment variable:", file=sys.stderr)
        print("   export OPENROUTER_API_KEY='your-api-key-here'", file=sys.stderr)
        print("\nOr create a .env file with:", file=sys.stderr)
        print("   OPENROUTER_API_KEY=your-api-key-here", file=sys.stderr)
        return None
    return api_key


def search_with_perplexity(
    query: str,
    model: str = "openrouter/perplexity/sonar-pro",
    max_tokens: int = 4000,
    temperature: float = 0.2,
    verbose: bool = False
) -> Dict[str, Any]:
    """
    Perform a search using Perplexity models via LiteLLM and OpenRouter.

    Args:
        query: The search query
        model: Model to use (default: sonar-pro)
        max_tokens: Maximum tokens in response
        temperature: Response temperature (0.0-1.0)
        verbose: Print detailed information

    Returns:
        Dictionary containing the search results and metadata
    """
    try:
        from litellm import completion
    except ImportError:
        return {
            "success": False,
            "error": "LiteLLM not installed. Run: uv pip install litellm"
        }

    # Check API key
    api_key = check_api_key()
    if not api_key:
        return {
            "success": False,
            "error": "OpenRouter API key not configured"
        }

    if verbose:
        print(f"Model: {model}", file=sys.stderr)
        print(f"Query: {query}", file=sys.stderr)
        print(f"Max tokens: {max_tokens}", file=sys.stderr)
        print(f"Temperature: {temperature}", file=sys.stderr)
        print("", file=sys.stderr)

    try:
        # Perform the search using LiteLLM
        response = completion(
            model=model,
            messages=[{
                "role": "user",
                "content": query
            }],
            max_tokens=max_tokens,
            temperature=temperature
        )

        # Extract the response
        result = {
            "success": True,
            "query": query,
            "model": model,
            "answer": response.choices[0].message.content,
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens
            }
        }

        # Check if citations are available in the response
        if hasattr(response.choices[0].message, 'citations'):
            result["citations"] = response.choices[0].message.citations

        return result

    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "query": query,
            "model": model
        }


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description="Perform AI-powered web searches using Perplexity via LiteLLM and OpenRouter",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Basic search
  python perplexity_search.py "What are the latest developments in CRISPR?"

  # Use Sonar Pro Search for deeper analysis
  python perplexity_search.py "Compare mRNA and viral vector vaccines" --model sonar-pro-search

  # Use Sonar Reasoning for complex queries
  python perplexity_search.py "Explain quantum entanglement" --model sonar-reasoning-pro

  # Save output to file
  python perplexity_search.py "COVID-19 vaccine efficacy studies" --output results.json

  # Verbose mode
  python perplexity_search.py "Machine learning trends 2024" --verbose

Available Models:
  - sonar-pro (default): General-purpose search with good balance
  - sonar-pro-search: Most advanced agentic search with multi-step reasoning
  - sonar: Standard model for basic searches
  - sonar-reasoning-pro: Advanced reasoning capabilities
  - sonar-reasoning: Basic reasoning model
        """
    )

    parser.add_argument(
        "query",
        help="The search query"
    )

    parser.add_argument(
        "--model",
        default="sonar-pro",
        choices=[
            "sonar-pro",
            "sonar-pro-search",
            "sonar",
            "sonar-reasoning-pro",
            "sonar-reasoning"
        ],
        help="Perplexity model to use (default: sonar-pro)"
    )

    parser.add_argument(
        "--max-tokens",
        type=int,
        default=4000,
        help="Maximum tokens in response (default: 4000)"
    )

    parser.add_argument(
        "--temperature",
        type=float,
        default=0.2,
        help="Response temperature 0.0-1.0 (default: 0.2)"
    )

    parser.add_argument(
        "--output",
        help="Save results to JSON file"
    )

    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Print detailed information"
    )

    parser.add_argument(
        "--check-setup",
        action="store_true",
        help="Check if dependencies and API key are configured"
    )

    args = parser.parse_args()

    # Check setup if requested
    if args.check_setup:
        print("Checking setup...")
        deps_ok = check_dependencies()
        api_key_ok = check_api_key() is not None

        if deps_ok and api_key_ok:
            print("\n✓ Setup complete! Ready to search.")
            return 0
        else:
            print("\n✗ Setup incomplete. Please fix the issues above.")
            return 1

    # Check dependencies
    if not check_dependencies():
        return 1

    # Prepend openrouter/ to model name if not already present
    model = args.model
    if not model.startswith("openrouter/"):
        model = f"openrouter/perplexity/{model}"

    # Perform the search
    result = search_with_perplexity(
        query=args.query,
        model=model,
        max_tokens=args.max_tokens,
        temperature=args.temperature,
        verbose=args.verbose
    )

    # Handle results
    if not result["success"]:
        print(f"Error: {result['error']}", file=sys.stderr)
        return 1

    # Print answer
    print("\n" + "="*80)
    print("ANSWER")
    print("="*80)
    print(result["answer"])
    print("="*80)

    # Print usage stats if verbose
    if args.verbose:
        print(f"\nUsage:", file=sys.stderr)
        print(f"  Prompt tokens: {result['usage']['prompt_tokens']}", file=sys.stderr)
        print(f"  Completion tokens: {result['usage']['completion_tokens']}", file=sys.stderr)
        print(f"  Total tokens: {result['usage']['total_tokens']}", file=sys.stderr)

    # Save to file if requested
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"\n✓ Results saved to {args.output}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
