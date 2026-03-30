#!/usr/bin/env python3
"""
Setup script for Perplexity Search environment configuration.

This script helps users configure their OpenRouter API key and validates the setup.

Usage:
    python setup_env.py [--api-key YOUR_KEY] [--env-file .env]

Author: Scientific Skills
License: MIT
"""

import os
import sys
import argparse
from pathlib import Path


def create_env_file(api_key: str, env_file: str = ".env") -> bool:
    """
    Create or update .env file with OpenRouter API key.

    Args:
        api_key: The OpenRouter API key
        env_file: Path to .env file (default: .env)

    Returns:
        True if successful, False otherwise
    """
    try:
        env_path = Path(env_file)

        # Read existing content if file exists
        existing_content = []
        if env_path.exists():
            with open(env_path, 'r') as f:
                existing_content = [
                    line for line in f.readlines()
                    if not line.startswith('OPENROUTER_API_KEY=')
                ]

        # Write new content
        with open(env_path, 'w') as f:
            # Write existing content (excluding old OPENROUTER_API_KEY)
            f.writelines(existing_content)

            # Add new API key
            if existing_content and not existing_content[-1].endswith('\n'):
                f.write('\n')
            f.write(f'OPENROUTER_API_KEY={api_key}\n')

        print(f"✓ API key saved to {env_file}")
        return True

    except Exception as e:
        print(f"Error creating .env file: {e}", file=sys.stderr)
        return False


def validate_setup() -> bool:
    """
    Validate that the environment is properly configured.

    Returns:
        True if setup is valid, False otherwise
    """
    print("Validating setup...")
    print()

    # Check for API key
    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not api_key:
        print("✗ OPENROUTER_API_KEY environment variable not set")
        print()
        print("To set up your API key:")
        print("1. Get an API key from https://openrouter.ai/keys")
        print("2. Run this script with --api-key flag:")
        print("   python setup_env.py --api-key YOUR_KEY")
        print()
        return False
    else:
        # Mask the key for display
        masked_key = api_key[:8] + "..." + api_key[-4:] if len(api_key) > 12 else "***"
        print(f"✓ OPENROUTER_API_KEY is set ({masked_key})")

    # Check for LiteLLM
    try:
        import litellm
        print(f"✓ LiteLLM is installed (version {litellm.__version__})")
    except ImportError:
        print("✗ LiteLLM is not installed")
        print()
        print("Install LiteLLM with:")
        print("   uv pip install litellm")
        print()
        return False

    print()
    print("✓ Setup is complete! You're ready to use Perplexity Search.")
    return True


def main():
    """Main entry point for the setup script."""
    parser = argparse.ArgumentParser(
        description="Setup Perplexity Search environment configuration",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Set up API key
  python setup_env.py --api-key sk-or-v1-xxxxx

  # Validate existing setup
  python setup_env.py --validate

  # Use custom .env file location
  python setup_env.py --api-key sk-or-v1-xxxxx --env-file /path/to/.env

Get your OpenRouter API key from:
  https://openrouter.ai/keys
        """
    )

    parser.add_argument(
        "--api-key",
        help="Your OpenRouter API key"
    )

    parser.add_argument(
        "--env-file",
        default=".env",
        help="Path to .env file (default: .env)"
    )

    parser.add_argument(
        "--validate",
        action="store_true",
        help="Validate existing setup"
    )

    args = parser.parse_args()

    # If no arguments, show validation
    if not args.api_key and not args.validate:
        args.validate = True

    # Handle API key setup
    if args.api_key:
        print("Setting up OpenRouter API key...")
        if create_env_file(args.api_key, args.env_file):
            print()
            print("Next steps:")
            print(f"1. Load the environment variables:")
            print(f"   source {args.env_file}")
            print("2. Or export directly:")
            print(f"   export OPENROUTER_API_KEY={args.api_key}")
            print("3. Test the setup:")
            print("   python perplexity_search.py --check-setup")
            print()

    # Validate setup
    if args.validate:
        if not validate_setup():
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
