#!/usr/bin/env python3
"""
Convert documents to Markdown with AI-enhanced image descriptions.

This script demonstrates how to use MarkItDown with OpenRouter to generate
detailed descriptions of images in documents (PowerPoint, PDFs with images, etc.)
"""

import argparse
import os
import sys
from pathlib import Path
from markitdown import MarkItDown
from openai import OpenAI


# Predefined prompts for different use cases
PROMPTS = {
    'scientific': """
Analyze this scientific image or diagram. Provide:
1. Type of visualization (graph, chart, microscopy, diagram, etc.)
2. Key data points, trends, or patterns
3. Axes labels, legends, and scales
4. Notable features or findings
5. Scientific context and significance
Be precise, technical, and detailed.
    """.strip(),
    
    'presentation': """
Describe this presentation slide image. Include:
1. Main visual elements and their arrangement
2. Key points or messages conveyed
3. Data or information presented
4. Visual hierarchy and emphasis
Keep the description clear and informative.
    """.strip(),
    
    'general': """
Describe this image in detail. Include:
1. Main subjects and objects
2. Visual composition and layout
3. Text content (if any)
4. Notable details
5. Overall context and purpose
Be comprehensive and accurate.
    """.strip(),
    
    'data_viz': """
Analyze this data visualization. Provide:
1. Type of chart/graph (bar, line, scatter, pie, etc.)
2. Variables and axes
3. Data ranges and scales
4. Key patterns, trends, or outliers
5. Statistical insights
Focus on quantitative accuracy.
    """.strip(),
    
    'medical': """
Describe this medical image. Include:
1. Type of medical imaging (X-ray, MRI, CT, microscopy, etc.)
2. Anatomical structures visible
3. Notable findings or abnormalities
4. Image quality and contrast
5. Clinical relevance
Be professional and precise.
    """.strip()
}


def convert_with_ai(
    input_file: Path,
    output_file: Path,
    api_key: str,
    model: str = "anthropic/claude-opus-4.5",
    prompt_type: str = "general",
    custom_prompt: str = None
) -> bool:
    """
    Convert a file to Markdown with AI image descriptions.
    
    Args:
        input_file: Path to input file
        output_file: Path to output Markdown file
        api_key: OpenRouter API key
        model: Model name (default: anthropic/claude-opus-4.5)
        prompt_type: Type of prompt to use
        custom_prompt: Custom prompt (overrides prompt_type)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Initialize OpenRouter client (OpenAI-compatible)
        client = OpenAI(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1"
        )
        
        # Select prompt
        if custom_prompt:
            prompt = custom_prompt
        else:
            prompt = PROMPTS.get(prompt_type, PROMPTS['general'])
        
        print(f"Using model: {model}")
        print(f"Prompt type: {prompt_type if not custom_prompt else 'custom'}")
        print(f"Converting: {input_file}")
        
        # Create MarkItDown with AI support
        md = MarkItDown(
            llm_client=client,
            llm_model=model,
            llm_prompt=prompt
        )
        
        # Convert file
        result = md.convert(str(input_file))
        
        # Create output with metadata
        content = f"# {result.title or input_file.stem}\n\n"
        content += f"**Source**: {input_file.name}\n"
        content += f"**Format**: {input_file.suffix}\n"
        content += f"**AI Model**: {model}\n"
        content += f"**Prompt Type**: {prompt_type if not custom_prompt else 'custom'}\n\n"
        content += "---\n\n"
        content += result.text_content
        
        # Write output
        output_file.parent.mkdir(parents=True, exist_ok=True)
        output_file.write_text(content, encoding='utf-8')
        
        print(f"✓ Successfully converted to: {output_file}")
        return True
        
    except Exception as e:
        print(f"✗ Error: {str(e)}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description="Convert documents to Markdown with AI-enhanced image descriptions",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Available prompt types:
  scientific    - For scientific diagrams, graphs, and charts
  presentation  - For presentation slides
  general       - General-purpose image description
  data_viz      - For data visualizations and charts
  medical       - For medical imaging

Examples:
  # Convert a scientific paper
  python convert_with_ai.py paper.pdf output.md --prompt-type scientific
  
  # Convert a presentation with custom model
  python convert_with_ai.py slides.pptx slides.md --model anthropic/claude-opus-4.5 --prompt-type presentation
  
  # Use custom prompt with advanced vision model
  python convert_with_ai.py diagram.png diagram.md --model anthropic/claude-opus-4.5 --custom-prompt "Describe this technical diagram"
  
  # Set API key via environment variable
  export OPENROUTER_API_KEY="sk-or-v1-..."
  python convert_with_ai.py image.jpg image.md

Environment Variables:
  OPENROUTER_API_KEY    OpenRouter API key (required if not passed via --api-key)

Popular Models (use with --model):
  anthropic/claude-opus-4.5 - Recommended for scientific vision
  google/gemini-3-pro-preview   - Gemini Pro Vision
        """
    )
    
    parser.add_argument('input', type=Path, help='Input file')
    parser.add_argument('output', type=Path, help='Output Markdown file')
    parser.add_argument(
        '--api-key', '-k',
        help='OpenRouter API key (or set OPENROUTER_API_KEY env var)'
    )
    parser.add_argument(
        '--model', '-m',
        default='anthropic/claude-opus-4.5',
        help='Model to use via OpenRouter (default: anthropic/claude-opus-4.5)'
    )
    parser.add_argument(
        '--prompt-type', '-t',
        choices=list(PROMPTS.keys()),
        default='general',
        help='Type of prompt to use (default: general)'
    )
    parser.add_argument(
        '--custom-prompt', '-p',
        help='Custom prompt (overrides --prompt-type)'
    )
    parser.add_argument(
        '--list-prompts', '-l',
        action='store_true',
        help='List available prompt types and exit'
    )
    
    args = parser.parse_args()
    
    # List prompts and exit
    if args.list_prompts:
        print("Available prompt types:\n")
        for name, prompt in PROMPTS.items():
            print(f"[{name}]")
            print(prompt)
            print("\n" + "="*60 + "\n")
        sys.exit(0)
    
    # Get API key
    api_key = args.api_key or os.environ.get('OPENROUTER_API_KEY')
    if not api_key:
        print("Error: OpenRouter API key required. Set OPENROUTER_API_KEY environment variable or use --api-key")
        print("Get your API key at: https://openrouter.ai/keys")
        sys.exit(1)
    
    # Validate input file
    if not args.input.exists():
        print(f"Error: Input file '{args.input}' does not exist")
        sys.exit(1)
    
    # Convert file
    success = convert_with_ai(
        input_file=args.input,
        output_file=args.output,
        api_key=api_key,
        model=args.model,
        prompt_type=args.prompt_type,
        custom_prompt=args.custom_prompt
    )
    
    sys.exit(0 if success else 1)


if __name__ == '__main__':
    main()

