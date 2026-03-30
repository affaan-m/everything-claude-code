# Paper2Web: Academic Homepage Generation

## Overview

Paper2Web converts academic papers into interactive, explorable academic homepages. Unlike traditional approaches (direct generation, template-based, or HTML conversion), Paper2Web creates layout-aware, interactive websites through an iterative refinement process.

## Core Capabilities

### 1. Layout-Aware Generation
- Analyzes paper structure and content organization
- Creates responsive, multi-section layouts
- Adapts design based on paper type (research article, review, preprint, etc.)

### 2. Interactive Elements
- Expandable sections for detailed content
- Interactive figures and tables
- Embedded citations and references
- Navigation menu for easy browsing
- Mobile-responsive design

### 3. Content Refinement
The system uses an iterative pipeline:
1. Initial content extraction and structuring
2. Layout generation with visual hierarchy
3. Interactive element integration
4. Aesthetic refinement
5. Quality assessment and validation

## Usage

### Basic Website Generation

```bash
python pipeline_all.py \
  --input-dir "path/to/papers" \
  --output-dir "path/to/output" \
  --model-choice 1
```

### Parameters

- `--input-dir`: Directory containing paper files (PDF or LaTeX)
- `--output-dir`: Directory for generated website files
- `--model-choice`: LLM model selection (1=GPT-4, 2=GPT-4.1)
- `--enable-logo-search`: Use Google Search API to find institution logos (optional)

### Input Format Requirements

**Supported Input Formats:**
1. **LaTeX source** (preferred for best results)
   - Main file: `main.tex`
   - Include all referenced figures, tables, and bibliography files
   - Organize in a single directory per paper

2. **PDF files**
   - High-quality PDF with selectable text
   - Embedded figures should be high resolution
   - Proper section headers and structure

**Directory Structure:**
```
input/
└── paper_name/
    ├── main.tex           # LaTeX source
    ├── bibliography.bib   # References
    ├── figures/           # Figure files
    │   ├── fig1.png
    │   └── fig2.pdf
    └── tables/            # Table files
```

## Output Structure

Generated websites include:

```
output/paper_name/website/
├── index.html          # Main webpage
├── styles.css          # Styling
├── script.js           # Interactive features
├── assets/             # Images and media
│   ├── figures/
│   └── logos/
└── data/               # Structured data (optional)
```

## Customization Options

### Visual Design
The generated websites automatically include:
- Professional color schemes based on paper content
- Typography optimized for readability
- Consistent spacing and visual hierarchy
- Dark mode support (optional)

### Content Sections
Standard sections include:
- Abstract
- Key findings/contributions
- Methodology overview
- Results and visualizations
- Discussion and implications
- References and citations
- Author information and affiliations

Additional sections are automatically added based on paper content:
- Code repositories
- Dataset links
- Supplementary materials
- Related publications

## Quality Assessment

Paper2Web includes built-in evaluation:

### Aesthetic Metrics
- Layout balance and spacing
- Color harmony
- Typography consistency
- Visual hierarchy effectiveness

### Informativeness Metrics
- Content completeness
- Key finding clarity
- Method explanation adequacy
- Results presentation quality

### Technical Metrics
- Page load time
- Mobile responsiveness
- Browser compatibility
- Accessibility compliance

## Advanced Features

### Logo Discovery
When enabled with Google Search API:
- Automatically finds institution logos
- Matches author affiliations
- Downloads and optimizes logo images
- Integrates into website header

### Citation Integration
- Interactive reference list
- Hover previews for citations
- Links to DOI and external sources
- Citation count tracking (if available)

### Figure Enhancement
- High-resolution figure rendering
- Zoom and pan functionality
- Caption and description integration
- Multi-panel figure navigation

## Best Practices

### Input Preparation
1. **Use LaTeX when possible**: Provides best structure extraction
2. **Include all assets**: Figures, tables, and bibliography files
3. **Clean formatting**: Remove compilation artifacts and temporary files
4. **High-quality figures**: Use vector formats (PDF, SVG) when available

### Model Selection
- **GPT-4**: Best balance of quality and cost
- **GPT-4.1**: Latest features, higher cost
- **GPT-3.5-turbo**: Faster processing, acceptable for simple papers

### Output Optimization
1. Review generated content for accuracy
2. Check that all figures render correctly
3. Test interactive elements functionality
4. Verify mobile responsiveness
5. Validate external links

## Limitations

- Complex mathematical equations may require manual review
- Multi-column layouts in PDF may affect extraction quality
- Large papers (>50 pages) may require extended processing time
- Some specialized figure types may need manual adjustment

## Integration with Other Components

Paper2Web can be combined with:
- **Paper2Video**: Generate companion video for the website
- **Paper2Poster**: Create matching poster design
- **AutoPR**: Generate promotional content linking to website
