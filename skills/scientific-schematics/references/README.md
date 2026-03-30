# Scientific Schematics - Nano Banana 2

**Generate any scientific diagram by describing it in natural language.**

Nano Banana 2 creates publication-quality diagrams automatically - no coding, no templates, no manual drawing required.

## Quick Start

### Generate Any Diagram

```bash
# Set your OpenRouter API key
export OPENROUTER_API_KEY='your_api_key_here'

# Generate any scientific diagram
python scripts/generate_schematic.py "CONSORT participant flow diagram" -o figures/consort.png

# Neural network architecture
python scripts/generate_schematic.py "Transformer encoder-decoder architecture" -o figures/transformer.png

# Biological pathway
python scripts/generate_schematic.py "MAPK signaling pathway" -o figures/pathway.png
```

### What You Get

- **Up to two iterations** (v1, v2) with progressive refinement
- **Automatic quality review** after each iteration
- **Detailed review log** with scores and critiques (JSON format)
- **Publication-ready images** following scientific standards

## Features

### Iterative Refinement Process

1. **Generation 1**: Create initial diagram from your description
2. **Review 1**: AI evaluates clarity, labels, accuracy, accessibility
3. **Generation 2**: Improve based on critique
4. **Review 2**: Second evaluation with specific feedback
5. **Generation 3**: Final polished version

### Automatic Quality Standards

All diagrams automatically follow:
- Clean white/light background
- High contrast for readability
- Clear labels (minimum 10pt font)
- Professional typography
- Colorblind-friendly colors
- Proper spacing between elements
- Scale bars, legends, axes where appropriate

## Installation

### For AI Generation

```bash
# Get OpenRouter API key
# Visit: https://openrouter.ai/keys

# Set environment variable
export OPENROUTER_API_KEY='sk-or-v1-...'

# Or add to .env file
echo "OPENROUTER_API_KEY=sk-or-v1-..." >> .env

# Install Python dependencies (if not already installed)
pip install requests
```

## Usage Examples

### Example 1: CONSORT Flowchart

```bash
python scripts/generate_schematic.py \
  "CONSORT participant flow diagram for RCT. \
   Assessed for eligibility (n=500). \
   Excluded (n=150): age<18 (n=80), declined (n=50), other (n=20). \
   Randomized (n=350) into Treatment (n=175) and Control (n=175). \
   Lost to follow-up: 15 and 10 respectively. \
   Final analysis: 160 and 165." \
  -o figures/consort.png
```

**Output:**
- `figures/consort_v1.png` - Initial generation
- `figures/consort_v2.png` - After first review
- `figures/consort_v3.png` - Final version
- `figures/consort.png` - Copy of final version
- `figures/consort_review_log.json` - Detailed review log

### Example 2: Neural Network Architecture

```bash
python scripts/generate_schematic.py \
  "Transformer architecture with encoder on left (input embedding, \
   positional encoding, multi-head attention, feed-forward) and \
   decoder on right (masked attention, cross-attention, feed-forward). \
   Show cross-attention connection from encoder to decoder." \
  -o figures/transformer.png \
  --iterations 2
```

### Example 3: Biological Pathway

```bash
python scripts/generate_schematic.py \
  "MAPK signaling pathway: EGFR receptor → RAS → RAF → MEK → ERK → nucleus. \
   Label each step with phosphorylation. Use different colors for each kinase." \
  -o figures/mapk.png
```

### Example 4: System Architecture

```bash
python scripts/generate_schematic.py \
  "IoT system block diagram: sensors (bottom) → microcontroller → \
   WiFi module and display (middle) → cloud server → mobile app (top). \
   Label all connections with protocols." \
  -o figures/iot_system.png
```

## Command-Line Options

```bash
python scripts/generate_schematic.py [OPTIONS] "description" -o output.png

Options:
  --iterations N          Number of AI refinement iterations (default: 2, max: 2)
  --api-key KEY          OpenRouter API key (or use env var)
  -v, --verbose          Verbose output
  -h, --help             Show help message
```

## Python API

```python
from scripts.generate_schematic_ai import ScientificSchematicGenerator

# Initialize
generator = ScientificSchematicGenerator(
    api_key="your_key",
    verbose=True
)

# Generate with iterative refinement
results = generator.generate_iterative(
    user_prompt="CONSORT flowchart",
    output_path="figures/consort.png",
    iterations=2
)

# Access results
print(f"Final score: {results['final_score']}/10")
print(f"Final image: {results['final_image']}")

# Review iterations
for iteration in results['iterations']:
    print(f"Iteration {iteration['iteration']}: {iteration['score']}/10")
    print(f"Critique: {iteration['critique']}")
```

## Prompt Engineering Tips

### Be Specific About Layout
✓ "Flowchart with vertical flow, top to bottom"  
✓ "Architecture diagram with encoder on left, decoder on right"  
✗ "Make a diagram" (too vague)

### Include Quantitative Details
✓ "Neural network: input (784), hidden (128), output (10)"  
✓ "Flowchart: n=500 screened, n=150 excluded, n=350 randomized"  
✗ "Some numbers" (not specific)

### Specify Visual Style
✓ "Minimalist block diagram with clean lines"  
✓ "Detailed biological pathway with protein structures"  
✓ "Technical schematic with engineering notation"

### Request Specific Labels
✓ "Label all arrows with activation/inhibition"  
✓ "Include layer dimensions in each box"  
✓ "Show time progression with timestamps"

### Mention Color Requirements
✓ "Use colorblind-friendly colors"  
✓ "Grayscale-compatible design"  
✓ "Color-code by function: blue=input, green=processing, red=output"

## Review Log Format

Each generation produces a JSON review log:

```json
{
  "user_prompt": "CONSORT participant flow diagram...",
  "iterations": [
    {
      "iteration": 1,
      "image_path": "figures/consort_v1.png",
      "prompt": "Full generation prompt...",
      "critique": "Score: 7/10. Issues: font too small...",
      "score": 7.0,
      "success": true
    },
    {
      "iteration": 2,
      "image_path": "figures/consort_v2.png",
      "score": 8.5,
      "critique": "Much improved. Remaining issues..."
    },
    {
      "iteration": 3,
      "image_path": "figures/consort_v3.png",
      "score": 9.5,
      "critique": "Excellent. Publication ready."
    }
  ],
  "final_image": "figures/consort_v3.png",
  "final_score": 9.5,
  "success": true
}
```

## Why Use Nano Banana 2

**Simply describe what you want - Nano Banana 2 creates it:**

- ✓ **Fast**: Results in minutes
- ✓ **Easy**: Natural language descriptions (no coding)
- ✓ **Quality**: Automatic review and refinement
- ✓ **Universal**: Works for all diagram types
- ✓ **Publication-ready**: High-quality output immediately

**Just describe your diagram, and it's generated automatically.**

## Troubleshooting

### API Key Issues

```bash
# Check if key is set
echo $OPENROUTER_API_KEY

# Set temporarily
export OPENROUTER_API_KEY='your_key'

# Set permanently (add to ~/.bashrc or ~/.zshrc)
echo 'export OPENROUTER_API_KEY="your_key"' >> ~/.bashrc
```

### Import Errors

```bash
# Install requests library
pip install requests

# Or use the package manager
pip install -r requirements.txt
```

### Generation Fails

```bash
# Use verbose mode to see detailed errors
python scripts/generate_schematic.py "diagram" -o out.png -v

# Check API status
curl https://openrouter.ai/api/v1/models
```

### Low Quality Scores

If iterations consistently score below 7/10:
1. Make your prompt more specific
2. Include more details about layout and labels
3. Specify visual requirements explicitly
4. Increase iterations: `--iterations 2`

## Testing

Run verification tests:

```bash
python test_ai_generation.py
```

This tests:
- File structure
- Module imports
- Class initialization
- Error handling
- Prompt engineering
- Wrapper script

## Cost Considerations

OpenRouter pricing for models used:
- **Nano Banana 2**: ~$2/M input tokens, ~$12/M output tokens

Typical costs per diagram:
- Simple diagram (1 iteration): ~$0.05-0.15
- Complex diagram (2 iterations): ~$0.10-0.30

## Examples Gallery

See the full SKILL.md for extensive examples including:
- CONSORT flowcharts
- Neural network architectures (Transformers, CNNs, RNNs)
- Biological pathways
- Circuit diagrams
- System architectures
- Block diagrams

## Support

For issues or questions:
1. Check SKILL.md for detailed documentation
2. Run test_ai_generation.py to verify setup
3. Use verbose mode (-v) to see detailed errors
4. Review the review_log.json for quality feedback

## License

Part of the scientific-writer package. See main repository for license information.

