# Usage Examples and Workflows

## Complete Workflow Examples

### Example 1: Conference Presentation Package

**Scenario**: Preparing for a major conference presentation with website, poster, and video.

**User Request**: "I need to create a complete presentation package for my NeurIPS paper submission. Generate a website, poster, and video presentation."

**Workflow**:

```bash
# Step 1: Organize paper files
mkdir -p input/neurips2025_paper
cp main.tex input/neurips2025_paper/
cp -r figures/ input/neurips2025_paper/
cp -r tables/ input/neurips2025_paper/
cp bibliography.bib input/neurips2025_paper/

# Step 2: Generate all components
python pipeline_all.py \
  --input-dir input/neurips2025_paper \
  --output-dir output/ \
  --model-choice 1 \
  --generate-website \
  --generate-poster \
  --generate-video \
  --poster-width-inches 48 \
  --poster-height-inches 36 \
  --enable-logo-search

# Step 3: Review outputs
ls -R output/neurips2025_paper/
# - website/index.html
# - poster/poster_final.pdf
# - video/final_video.mp4
```

**Output**:
- Interactive website showcasing research
- 4'×3' conference poster (print-ready)
- 12-minute presentation video
- Processing time: ~45 minutes (without talking-head)

---

### Example 2: Quick Website for Preprint

**Scenario**: Creating an explorable homepage for a bioRxiv preprint.

**User Request**: "Convert my genomics preprint to an interactive website to accompany the bioRxiv submission."

**Workflow**:

```bash
# Using PDF input (LaTeX not available)
python pipeline_all.py \
  --input-dir papers/genomics_preprint/ \
  --output-dir output/genomics_web/ \
  --model-choice 1 \
  --generate-website

# Deploy to GitHub Pages or personal server
cd output/genomics_web/website/
# Add link to bioRxiv paper, data repositories, code
# Upload to hosting service
```

**Tips**:
- Include links to bioRxiv DOI
- Add GitHub repository links
- Include data availability section
- Embed interactive visualizations if possible

---

### Example 3: Video Abstract for Journal Submission

**Scenario**: Creating a video abstract for a journal that encourages multimedia submissions.

**User Request**: "Generate a 5-minute video abstract for my Nature Communications submission."

**Workflow**:

```bash
# Generate concise video focusing on key findings
python pipeline_light.py \
  --model_name_t gpt-4.1 \
  --model_name_v gpt-4.1 \
  --result_dir output/video_abstract/ \
  --paper_latex_root papers/nature_comms/ \
  --video-duration 300 \
  --slides-per-minute 3

# Optional: Add custom intro/outro slides
# Optional: Include talking-head for introduction
```

**Output**:
- 5-minute video abstract
- Focus on visual results
- Clear, accessible narration
- Journal-ready format

---

### Example 4: Multi-Paper Website Generation

**Scenario**: Creating websites for multiple papers from a research group.

**User Request**: "Generate websites for all 5 papers our lab published this year."

**Workflow**:

```bash
# Organize papers
mkdir -p batch_input/
# Create subdirectories: paper1/, paper2/, paper3/, paper4/, paper5/
# Each with their LaTeX sources

# Batch process
python pipeline_all.py \
  --input-dir batch_input/ \
  --output-dir batch_output/ \
  --model-choice 1 \
  --generate-website \
  --enable-logo-search

# Creates:
# batch_output/paper1/website/
# batch_output/paper2/website/
# batch_output/paper3/website/
# batch_output/paper4/website/
# batch_output/paper5/website/
```

**Best Practice**:
- Use consistent naming conventions
- Process overnight for large batches
- Review each website for accuracy
- Deploy to unified lab website

---

### Example 5: Poster for Virtual Conference

**Scenario**: Creating a digital poster for a virtual conference with interactive elements.

**User Request**: "Create a poster for the virtual ISMB conference with clickable links to code and data."

**Workflow**:

```bash
# Generate poster with QR codes and links
python pipeline_all.py \
  --input-dir papers/ismb_submission/ \
  --output-dir output/ismb_poster/ \
  --model-choice 1 \
  --generate-poster \
  --poster-width-inches 48 \
  --poster-height-inches 36 \
  --enable-qr-codes

# Manually add QR codes to:
# - GitHub repository
# - Interactive results dashboard
# - Supplementary data
# - Video presentation
```

**Digital Enhancements**:
- PDF with embedded hyperlinks
- High-resolution PNG for virtual platform
- Separate PDF with video links for download

---

### Example 6: Promotional Video Clip

**Scenario**: Creating a short promotional video for social media.

**User Request**: "Generate a 2-minute highlight video of our Cell paper for Twitter."

**Workflow**:

```bash
# Generate short, engaging video
python pipeline_light.py \
  --model_name_t gpt-4.1 \
  --model_name_v gpt-4.1 \
  --result_dir output/promo_video/ \
  --paper_latex_root papers/cell_paper/ \
  --video-duration 120 \
  --presentation-style public

# Post-process:
# - Extract key 30-second clip for Twitter
# - Add captions for sound-off viewing
# - Optimize file size for social media
```

**Social Media Optimization**:
- Square format (1:1) for Instagram
- Horizontal format (16:9) for Twitter/LinkedIn
- Vertical format (9:16) for TikTok/Stories
- Add text overlays for key findings

---

## Common Use Case Patterns

### Pattern 1: LaTeX Paper → Full Package

**Input**: LaTeX source with all assets
**Output**: Website + Poster + Video
**Time**: 45-90 minutes
**Best for**: Major publications, conference presentations

```bash
python pipeline_all.py \
  --input-dir [latex_dir] \
  --output-dir [output_dir] \
  --model-choice 1 \
  --generate-website \
  --generate-poster \
  --generate-video
```

---

### Pattern 2: PDF → Interactive Website

**Input**: Published PDF paper
**Output**: Explorable website
**Time**: 15-30 minutes
**Best for**: Post-publication promotion, preprint enhancement

```bash
python pipeline_all.py \
  --input-dir [pdf_dir] \
  --output-dir [output_dir] \
  --model-choice 1 \
  --generate-website
```

---

### Pattern 3: LaTeX → Conference Poster

**Input**: LaTeX paper
**Output**: Print-ready poster (custom size)
**Time**: 10-20 minutes
**Best for**: Conference poster sessions

```bash
python pipeline_all.py \
  --input-dir [latex_dir] \
  --output-dir [output_dir] \
  --model-choice 1 \
  --generate-poster \
  --poster-width-inches [width] \
  --poster-height-inches [height]
```

---

### Pattern 4: LaTeX → Presentation Video

**Input**: LaTeX paper
**Output**: Narrated presentation video
**Time**: 20-60 minutes (without talking-head)
**Best for**: Video abstracts, online presentations, course materials

```bash
python pipeline_light.py \
  --model_name_t gpt-4.1 \
  --model_name_v gpt-4.1 \
  --result_dir [output_dir] \
  --paper_latex_root [latex_dir]
```

---

## Platform-Specific Outputs

### Twitter/X Promotional Content

The system auto-detects Twitter targeting for numeric folder names:

```bash
# Create Twitter-optimized content
mkdir -p input/001_twitter_post/
# System generates English promotional content
```

**Generated Output**:
- Short, engaging summary
- Key figure highlights
- Hashtag recommendations
- Thread-ready format

---

### Xiaohongshu (小红书) Content

For Chinese social media, use alphanumeric folder names:

```bash
# Create Xiaohongshu-optimized content
mkdir -p input/xhs_genomics/
# System generates Chinese promotional content
```

**Generated Output**:
- Chinese language content
- Platform-appropriate formatting
- Visual-first presentation
- Engagement optimizations

---

## Troubleshooting Common Scenarios

### Scenario: Large Paper (>50 pages)

**Challenge**: Processing time and content selection
**Solution**:
```bash
# Option 1: Focus on key sections
# Edit LaTeX to comment out less critical sections

# Option 2: Process in parts
# Generate website for overview
# Generate separate detailed videos for methods/results

# Option 3: Use faster model for initial pass
# Review and regenerate critical components with better model
```

---

### Scenario: Complex Mathematical Content

**Challenge**: Equations may not render perfectly
**Solution**:
- Use LaTeX input (not PDF) for best equation handling
- Review generated content for equation accuracy
- Manually adjust complex equations if needed
- Consider using figure screenshots for critical equations

---

### Scenario: Non-Standard Paper Structure

**Challenge**: Paper doesn't follow standard IMRAD format
**Solution**:
- Provide custom section guidance in paper metadata
- Review generated structure and adjust
- Use more powerful model (GPT-4.1) for better adaptation
- Consider manual section annotation in LaTeX comments

---

### Scenario: Limited API Budget

**Challenge**: Reducing costs while maintaining quality
**Solution**:
```bash
# Use GPT-3.5-turbo for simple papers
python pipeline_all.py \
  --input-dir [paper_dir] \
  --output-dir [output_dir] \
  --model-choice 3

# Generate only needed components
# Website-only (cheapest)
# Poster-only (moderate)
# Video without talking-head (moderate)
```

---

### Scenario: Tight Deadline

**Challenge**: Need outputs quickly
**Solution**:
```bash
# Parallel processing if multiple papers
# Use faster models (GPT-3.5-turbo)
# Generate only essential component first
# Skip optional features (logo search, talking-head)

python pipeline_light.py \
  --model_name_t gpt-3.5-turbo \
  --model_name_v gpt-3.5-turbo \
  --result_dir [output_dir] \
  --paper_latex_root [latex_dir]
```

**Priority Order**:
1. Website (fastest, most versatile)
2. Poster (moderate speed, print deadline)
3. Video (slowest, can be generated later)

---

## Quality Optimization Tips

### For Best Website Results
1. Use LaTeX input with all assets
2. Include high-resolution figures
3. Ensure paper has clear section structure
4. Enable logo search for professional appearance
5. Review and test all interactive elements

### For Best Poster Results
1. Provide high-resolution figures (300+ DPI)
2. Specify exact poster dimensions needed
3. Include institution branding information
4. Use professional color scheme
5. Test print small preview before full poster

### For Best Video Results
1. Use LaTeX for clearest content extraction
2. Specify target duration appropriately
3. Review script before video generation
4. Choose appropriate presentation style
5. Test audio quality and pacing

### For Best Overall Results
1. Start with clean, well-organized LaTeX source
2. Use GPT-4 or GPT-4.1 for highest quality
3. Review all outputs before finalizing
4. Iterate on any component that needs adjustment
5. Combine components for cohesive presentation package
