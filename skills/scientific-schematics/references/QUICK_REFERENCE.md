# Scientific Schematics - Quick Reference

**How it works:** Describe your diagram → Nano Banana 2 generates it automatically

## Setup (One-Time)

```bash
# Get API key from https://openrouter.ai/keys
export OPENROUTER_API_KEY='sk-or-v1-your_key_here'

# Add to shell profile for persistence
echo 'export OPENROUTER_API_KEY="sk-or-v1-your_key"' >> ~/.bashrc  # or ~/.zshrc
```

## Basic Usage

```bash
# Describe your diagram, Nano Banana 2 creates it
python scripts/generate_schematic.py "your diagram description" -o output.png

# That's it! Automatic:
# - Iterative refinement (3 rounds)
# - Quality review and improvement
# - Publication-ready output
```

## Common Examples

### CONSORT Flowchart
```bash
python scripts/generate_schematic.py \
  "CONSORT flow: screened n=500, excluded n=150, randomized n=350" \
  -o consort.png
```

### Neural Network
```bash
python scripts/generate_schematic.py \
  "Transformer architecture with encoder and decoder stacks" \
  -o transformer.png
```

### Biological Pathway
```bash
python scripts/generate_schematic.py \
  "MAPK pathway: EGFR → RAS → RAF → MEK → ERK" \
  -o mapk.png
```

### Circuit Diagram
```bash
python scripts/generate_schematic.py \
  "Op-amp circuit with 1kΩ resistor and 10µF capacitor" \
  -o circuit.png
```

## Command Options

| Option | Description | Example |
|--------|-------------|---------|
| `-o, --output` | Output file path | `-o figures/diagram.png` |
| `--iterations N` | Number of refinements (1-2) | `--iterations 2` |
| `-v, --verbose` | Show detailed output | `-v` |
| `--api-key KEY` | Provide API key | `--api-key sk-or-v1-...` |

## Prompt Tips

### ✓ Good Prompts (Specific)
- "CONSORT flowchart with screening (n=500), exclusion (n=150), randomization (n=350)"
- "Transformer architecture: encoder on left with 6 layers, decoder on right, cross-attention connections"
- "MAPK signaling: receptor → RAS → RAF → MEK → ERK → nucleus, label each phosphorylation"

### ✗ Avoid (Too Vague)
- "Make a flowchart"
- "Neural network"
- "Pathway diagram"

## Output Files

For input `diagram.png`, you get:
- `diagram_v1.png` - First iteration
- `diagram_v2.png` - Second iteration  
- `diagram_v3.png` - Final iteration
- `diagram.png` - Copy of final
- `diagram_review_log.json` - Quality scores and critiques

## Review Log

```json
{
  "iterations": [
    {
      "iteration": 1,
      "score": 7.0,
      "critique": "Good start. Font too small..."
    },
    {
      "iteration": 2,
      "score": 8.5,
      "critique": "Much improved. Minor spacing issues..."
    },
    {
      "iteration": 3,
      "score": 9.5,
      "critique": "Excellent. Publication ready."
    }
  ],
  "final_score": 9.5
}
```

## Python API

```python
from scripts.generate_schematic_ai import ScientificSchematicGenerator

# Initialize
gen = ScientificSchematicGenerator(api_key="your_key")

# Generate
results = gen.generate_iterative(
    user_prompt="diagram description",
    output_path="output.png",
    iterations=2
)

# Check quality
print(f"Score: {results['final_score']}/10")
```

## Troubleshooting

### API Key Not Found
```bash
# Check if set
echo $OPENROUTER_API_KEY

# Set it
export OPENROUTER_API_KEY='your_key'
```

### Import Error
```bash
# Install requests
pip install requests
```

### Low Quality Score
- Make prompt more specific
- Include layout details (left-to-right, top-to-bottom)
- Specify label requirements
- Increase iterations: `--iterations 2`

## Testing

```bash
# Verify installation
python test_ai_generation.py

# Should show: "6/6 tests passed"
```

## Cost

Typical cost per diagram (max 2 iterations):
- Simple (1 iteration): $0.05-0.15
- Complex (2 iterations): $0.10-0.30

## How Nano Banana 2 Works

**Simply describe your diagram in natural language:**
- ✓ No coding required
- ✓ No templates needed
- ✓ No manual drawing
- ✓ Automatic quality review
- ✓ Publication-ready output
- ✓ Works for any diagram type

**Just describe what you want, and it's generated automatically.**

## Getting Help

```bash
# Show help
python scripts/generate_schematic.py --help

# Verbose mode for debugging
python scripts/generate_schematic.py "diagram" -o out.png -v
```

## Quick Start Checklist

- [ ] Set `OPENROUTER_API_KEY` environment variable
- [ ] Run `python test_ai_generation.py` (should pass 6/6)
- [ ] Try: `python scripts/generate_schematic.py "test diagram" -o test.png`
- [ ] Review output files (test_v1.png, v2, v3, review_log.json)
- [ ] Read SKILL.md for detailed documentation
- [ ] Check README.md for examples

## Resources

- Full documentation: `SKILL.md`
- Detailed guide: `README.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`
- Example script: `example_usage.sh`
- Get API key: https://openrouter.ai/keys

