#!/usr/bin/env python3
"""
Generate professional infographics using Nano Banana Pro.

This script generates infographics with smart iterative refinement:
- Uses Nano Banana Pro (Gemini 3 Pro Image Preview) for generation
- Uses Gemini 3 Pro for quality review
- Only regenerates if quality is below threshold
- Supports 10 infographic types and industry style presets

Usage:
    python generate_infographic.py "5 benefits of exercise" -o benefits.png --type list
    python generate_infographic.py "Company history 2010-2025" -o timeline.png --type timeline --style corporate
    python generate_infographic.py --list-options
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path


# Available options for quick reference
INFOGRAPHIC_TYPES = [
    "statistical", "timeline", "process", "comparison", "list",
    "geographic", "hierarchical", "anatomical", "resume", "social"
]

STYLE_PRESETS = [
    "corporate", "healthcare", "technology", "nature", "education",
    "marketing", "finance", "nonprofit"
]

PALETTE_PRESETS = ["wong", "ibm", "tol"]

DOC_TYPES = [
    "marketing", "report", "presentation", "social", "internal", "draft", "default"
]


def list_options():
    """Print available types, styles, and palettes."""
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                    INFOGRAPHIC GENERATION OPTIONS                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 INFOGRAPHIC TYPES (--type):
──────────────────────────────────────────────────────────────────────────────
  statistical   Data-driven infographic with charts, numbers, and statistics
  timeline      Chronological events or milestones
  process       Step-by-step instructions or workflow
  comparison    Side-by-side comparison of options
  list          Tips, facts, or key points in list format
  geographic    Map-based data visualization
  hierarchical  Pyramid or organizational structure
  anatomical    Visual metaphor explaining a system
  resume        Professional skills and experience visualization
  social        Social media optimized content

🎨 STYLE PRESETS (--style):
──────────────────────────────────────────────────────────────────────────────
  corporate     Navy/gold, professional business style
  healthcare    Blue/cyan, trust-inducing medical style
  technology    Blue/violet, modern tech style
  nature        Green/brown, environmental organic style
  education     Blue/coral, friendly academic style
  marketing     Coral/teal/yellow, bold vibrant style
  finance       Navy/gold, conservative professional style
  nonprofit     Orange/sage/sand, warm human-centered style

🎨 COLORBLIND-SAFE PALETTES (--palette):
──────────────────────────────────────────────────────────────────────────────
  wong          Wong's palette (7 colors) - most widely recommended
  ibm           IBM colorblind-safe (8 colors)
  tol           Tol's qualitative (12 colors)

📄 DOCUMENT TYPES (--doc-type):
──────────────────────────────────────────────────────────────────────────────
  marketing     8.5/10 threshold - Marketing materials (highest quality)
  report        8.0/10 threshold - Business reports
  presentation  7.5/10 threshold - Slides and talks
  social        7.0/10 threshold - Social media content
  internal      7.0/10 threshold - Internal use
  draft         6.5/10 threshold - Working drafts (lowest quality)
  default       7.5/10 threshold - General purpose

──────────────────────────────────────────────────────────────────────────────
Examples:
  python generate_infographic.py "5 benefits of exercise" -o benefits.png --type list
  python generate_infographic.py "AI adoption 2020-2025" -o timeline.png --type timeline --style technology
  python generate_infographic.py "Product comparison" -o compare.png --type comparison --palette wong

""")


def main():
    """Command-line interface."""
    parser = argparse.ArgumentParser(
        description="Generate infographics using Nano Banana Pro with smart iterative refinement",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
How it works:
  1. (Optional) Research phase - gather facts using Perplexity Sonar
  2. Describe your infographic in natural language
  3. Nano Banana Pro generates it automatically with:
     - Smart iteration (only regenerates if quality is below threshold)
     - Quality review by Gemini 3 Pro
     - Document-type aware quality thresholds
     - Professional-quality output

Examples:
  # Simple list infographic
  python generate_infographic.py "5 benefits of meditation" -o benefits.png --type list
  
  # Corporate timeline
  python generate_infographic.py "Company history 2010-2025" -o timeline.png --type timeline --style corporate
  
  # Healthcare statistics with colorblind-safe colors
  python generate_infographic.py "Heart disease statistics" -o stats.png --type statistical --style healthcare --palette wong
  
  # Statistical infographic WITH RESEARCH for accurate data
  python generate_infographic.py "Global AI market size and growth" -o ai_market.png --type statistical --research
  
  # Social media infographic
  python generate_infographic.py "Save water tips" -o water.png --type social --style marketing

  # List all available options
  python generate_infographic.py --list-options

Environment Variables:
  OPENROUTER_API_KEY    Required for AI generation
        """
    )
    
    parser.add_argument("prompt", nargs="?",
                       help="Description of the infographic content")
    parser.add_argument("-o", "--output",
                       help="Output file path")
    parser.add_argument("--type", "-t", choices=INFOGRAPHIC_TYPES,
                       help="Infographic type preset")
    parser.add_argument("--style", "-s", choices=STYLE_PRESETS,
                       help="Industry style preset")
    parser.add_argument("--palette", "-p", choices=PALETTE_PRESETS,
                       help="Colorblind-safe palette")
    parser.add_argument("--background", "-b", default="white",
                       help="Background color (default: white)")
    parser.add_argument("--doc-type", default="default", choices=DOC_TYPES,
                       help="Document type for quality threshold (default: default)")
    parser.add_argument("--iterations", type=int, default=3,
                       help="Maximum refinement iterations (default: 3)")
    parser.add_argument("--api-key",
                       help="OpenRouter API key (or use OPENROUTER_API_KEY env var)")
    parser.add_argument("-v", "--verbose", action="store_true",
                       help="Verbose output")
    parser.add_argument("--research", "-r", action="store_true",
                       help="Research the topic first using Perplexity Sonar for accurate data")
    parser.add_argument("--list-options", action="store_true",
                       help="List all available types, styles, and palettes")
    
    args = parser.parse_args()
    
    # Handle --list-options
    if args.list_options:
        list_options()
        return
    
    # Validate required arguments
    if not args.prompt:
        parser.error("prompt is required unless using --list-options")
    if not args.output:
        parser.error("--output is required")
    
    # Check for API key
    api_key = args.api_key or os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("Error: OPENROUTER_API_KEY environment variable not set")
        print("\nFor AI generation, you need an OpenRouter API key.")
        print("Get one at: https://openrouter.ai/keys")
        print("\nSet it with:")
        print("  export OPENROUTER_API_KEY='your_api_key'")
        print("\nOr use --api-key flag")
        sys.exit(1)
    
    # Find AI generation script
    script_dir = Path(__file__).parent
    ai_script = script_dir / "generate_infographic_ai.py"
    
    if not ai_script.exists():
        print(f"Error: AI generation script not found: {ai_script}")
        sys.exit(1)
    
    # Build command
    cmd = [sys.executable, str(ai_script), args.prompt, "-o", args.output]
    
    if args.type:
        cmd.extend(["--type", args.type])
    
    if args.style:
        cmd.extend(["--style", args.style])
    
    if args.palette:
        cmd.extend(["--palette", args.palette])
    
    if args.background != "white":
        cmd.extend(["--background", args.background])
    
    if args.doc_type != "default":
        cmd.extend(["--doc-type", args.doc_type])
    
    if args.iterations != 3:
        cmd.extend(["--iterations", str(args.iterations)])
    
    if api_key:
        cmd.extend(["--api-key", api_key])
    
    if args.verbose:
        cmd.append("-v")
    
    if args.research:
        cmd.append("--research")
    
    # Execute
    try:
        result = subprocess.run(cmd, check=False)
        sys.exit(result.returncode)
    except Exception as e:
        print(f"Error executing AI generation: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
