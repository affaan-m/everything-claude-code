#!/usr/bin/env python3
"""
Scientific schematic generation using Nano Banana 2.

Generate any scientific diagram by describing it in natural language.
Nano Banana 2 handles everything automatically with smart iterative refinement.

Smart iteration: Only regenerates if quality is below threshold for your document type.
Quality review: Uses Gemini 3.1 Pro Preview for professional scientific evaluation.

Usage:
    # Generate for journal paper (highest quality threshold)
    python generate_schematic.py "CONSORT flowchart" -o flowchart.png --doc-type journal
    
    # Generate for presentation (lower threshold, faster)
    python generate_schematic.py "Transformer architecture" -o transformer.png --doc-type presentation
    
    # Generate for poster
    python generate_schematic.py "MAPK signaling pathway" -o pathway.png --doc-type poster
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path


def main():
    """Command-line interface."""
    parser = argparse.ArgumentParser(
        description="Generate scientific schematics using AI with smart iterative refinement",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
How it works:
  Simply describe your diagram in natural language
  Nano Banana 2 generates it automatically with:
  - Smart iteration (only regenerates if quality is below threshold)
  - Quality review by Gemini 3.1 Pro Preview
  - Document-type aware quality thresholds
  - Publication-ready output

Document Types (quality thresholds):
  journal      8.5/10  - Nature, Science, peer-reviewed journals
  conference   8.0/10  - Conference papers
  thesis       8.0/10  - Dissertations, theses
  grant        8.0/10  - Grant proposals
  preprint     7.5/10  - arXiv, bioRxiv, etc.
  report       7.5/10  - Technical reports
  poster       7.0/10  - Academic posters
  presentation 6.5/10  - Slides, talks
  default      7.5/10  - General purpose

Examples:
  # Generate for journal paper (strict quality)
  python generate_schematic.py "CONSORT participant flow" -o flowchart.png --doc-type journal
  
  # Generate for poster (moderate quality)
  python generate_schematic.py "Transformer architecture" -o arch.png --doc-type poster
  
  # Generate for slides (faster, lower threshold)
  python generate_schematic.py "System diagram" -o system.png --doc-type presentation
  
  # Custom max iterations
  python generate_schematic.py "Complex pathway" -o pathway.png --iterations 2
  
  # Verbose output
  python generate_schematic.py "Circuit diagram" -o circuit.png -v

Environment Variables:
  OPENROUTER_API_KEY    Required for AI generation
        """
    )
    
    parser.add_argument("prompt", 
                       help="Description of the diagram to generate")
    parser.add_argument("-o", "--output", required=True,
                       help="Output file path")
    parser.add_argument("--doc-type", default="default",
                       choices=["journal", "conference", "poster", "presentation",
                               "report", "grant", "thesis", "preprint", "default"],
                       help="Document type for quality threshold (default: default)")
    parser.add_argument("--iterations", type=int, default=2,
                       help="Maximum refinement iterations (default: 2, max: 2)")
    parser.add_argument("--api-key", 
                       help="OpenRouter API key (or use OPENROUTER_API_KEY env var)")
    parser.add_argument("-v", "--verbose", action="store_true",
                       help="Verbose output")
    
    args = parser.parse_args()
    
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
    ai_script = script_dir / "generate_schematic_ai.py"
    
    if not ai_script.exists():
        print(f"Error: AI generation script not found: {ai_script}")
        sys.exit(1)
    
    # Build command
    cmd = [sys.executable, str(ai_script), args.prompt, "-o", args.output]
    
    if args.doc_type != "default":
        cmd.extend(["--doc-type", args.doc_type])
    
    # Enforce max 2 iterations
    iterations = min(args.iterations, 2)
    if iterations != 2:
        cmd.extend(["--iterations", str(iterations)])
    
    if api_key:
        cmd.extend(["--api-key", api_key])
    
    if args.verbose:
        cmd.append("-v")
    
    # Execute
    try:
        result = subprocess.run(cmd, check=False)
        sys.exit(result.returncode)
    except Exception as e:
        print(f"Error executing AI generation: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()

