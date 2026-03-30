# Paper2Video: Presentation Video Generation

## Overview

Paper2Video generates presentation videos from LaTeX sources, transforming academic papers into engaging video presentations. The system processes papers through multiple specialized modules to create professional presentation videos complete with slides, narration, and optional talking-head video.

## Core Components

### 1. Slide Generation Module
- Extracts key content from paper structure
- Creates visually appealing presentation slides
- Organizes content in logical flow
- Includes figures, tables, and equations
- Optimizes text density for readability

### 2. Subtitle Generation Module
- Generates natural presentation script
- Synchronizes text with slide transitions
- Creates speaker notes and timing
- Supports multiple languages
- Optimizes for speech synthesis

### 3. Speech Synthesis Module
- Converts subtitles to natural-sounding speech
- Supports multiple voices and accents
- Controls pacing and emphasis
- Generates audio track for video
- Handles technical terminology

### 4. Cursor Movement Module
- Simulates presenter cursor movements
- Highlights key points on slides
- Guides viewer attention
- Creates natural presentation flow
- Synchronizes with narration

### 5. Talking-Head Video Generation (Optional)
- Uses Hallo2 for realistic presenter video
- Lip-syncs with generated audio
- Requires reference image or video
- GPU-intensive (NVIDIA A6000 48GB minimum)
- Creates engaging presenter presence

## Usage

### Basic Video Generation (Without Talking-Head)

```bash
python pipeline_light.py \
  --model_name_t gpt-4.1 \
  --model_name_v gpt-4.1 \
  --result_dir /path/to/output \
  --paper_latex_root /path/to/paper
```

### Full Video Generation (With Talking-Head)

```bash
python pipeline_all.py \
  --input-dir "path/to/papers" \
  --output-dir "path/to/output" \
  --model-choice 1 \
  --enable-talking-head
```

### Parameters

**Model Configuration:**
- `--model_name_t`: Model for text/subtitle generation (default: gpt-4.1)
- `--model_name_v`: Model for visual/slide generation (default: gpt-4.1)
- `--model-choice`: Preset model configuration (1=GPT-4, 2=GPT-4.1)

**Input/Output:**
- `--paper_latex_root`: Root directory of LaTeX paper source
- `--result_dir` or `--output-dir`: Output directory for generated videos
- `--input-dir`: Directory containing multiple papers to process

**Video Options:**
- `--enable-talking-head`: Enable talking-head video generation (requires GPU)
- `--video-duration`: Target video duration in seconds (default: auto-calculated)
- `--slides-per-minute`: Control presentation pacing (default: 2-3)
- `--voice`: Voice selection for speech synthesis

**Quality Settings:**
- `--video-resolution`: Output resolution (default: 1920x1080)
- `--video-fps`: Frame rate (default: 30)
- `--audio-quality`: Audio bitrate (default: 192kbps)

## Input Requirements

### LaTeX Source Structure
```
paper_directory/
├── main.tex              # Main paper file
├── sections/             # Section files (if split)
│   ├── introduction.tex
│   ├── methods.tex
│   └── results.tex
├── figures/              # Figure files
│   ├── fig1.pdf
│   ├── fig2.png
│   └── ...
├── tables/               # Table files
└── bibliography.bib      # References
```

### Required Elements
- Valid LaTeX source that compiles
- Proper section structure (abstract, introduction, methods, results, conclusion)
- High-quality figures (vector formats preferred)
- Complete bibliography

### Optional Elements
- Author photos for talking-head generation
- Custom slide templates
- Background music or sound effects
- Institution branding assets

## Output Structure

```
output/paper_name/video/
├── final_video.mp4           # Complete presentation video
├── slides/                   # Generated slide images
│   ├── slide_001.png
│   ├── slide_002.png
│   └── ...
├── audio/                    # Audio components
│   ├── narration.mp3         # Speech synthesis output
│   └── background.mp3        # Optional background audio
├── subtitles/                # Subtitle files
│   ├── subtitles.srt         # Standard subtitle format
│   └── subtitles.vtt         # WebVTT format
├── script/                   # Presentation script
│   ├── full_script.txt       # Complete narration text
│   └── slide_notes.json      # Slide-by-slide notes
└── metadata/                 # Video metadata
    ├── timings.json          # Slide timing information
    └── video_info.json       # Video properties
```

## Video Generation Process

### Phase 1: Content Analysis
1. Parse LaTeX source structure
2. Extract key concepts and findings
3. Identify important figures and equations
4. Determine logical presentation flow

### Phase 2: Slide Creation
1. Design slide layouts based on content
2. Allocate content across appropriate number of slides
3. Incorporate figures and visual elements
4. Apply consistent styling and branding

### Phase 3: Script Generation
1. Write natural presentation narration
2. Time script sections to slides
3. Add transitions and emphasis
4. Optimize for speech synthesis

### Phase 4: Audio Production
1. Generate speech from script
2. Add emphasis and pacing
3. Include pauses for slide transitions
4. Mix with optional background audio

### Phase 5: Video Assembly
1. Combine slides with timing information
2. Synchronize audio track
3. Add cursor movements and highlights
4. Generate talking-head video (if enabled)
5. Render final video file

## Customization Options

### Presentation Style
- **Academic**: Formal, detailed, comprehensive
- **Conference**: Focused on key findings, faster pace
- **Public**: Simplified language, engaging storytelling
- **Tutorial**: Step-by-step explanation, educational focus

### Voice Configuration
Available voice options (via speech synthesis):
- Multiple languages and accents
- Male/female voice selection
- Speaking rate adjustment
- Pitch and tone customization

### Visual Themes
- Institution branding colors
- Conference template matching
- Custom backgrounds and fonts
- Dark mode presentations

## Quality Assessment

### Content Quality Metrics
- **Completeness**: Coverage of paper content
- **Clarity**: Explanation quality and coherence
- **Flow**: Logical progression of ideas
- **Engagement**: Visual appeal and pacing

### Technical Quality Metrics
- **Audio quality**: Speech clarity and naturalness
- **Video quality**: Resolution and encoding
- **Synchronization**: Audio-visual alignment
- **Timing**: Appropriate slide duration

## Advanced Features

### Multi-Language Support
- Generate presentations in multiple languages
- Automatic translation of script
- Language-appropriate voice selection
- Cultural adaptation of presentation style

### Talking-Head Generation with Hallo2
Requires:
- NVIDIA A6000 GPU (48GB minimum)
- Reference image or short video of presenter
- Additional processing time (2-3x longer)

Benefits:
- More engaging presentation
- Professional presenter appearance
- Natural gestures and expressions
- Lip-sync accuracy

### Interactive Elements
- Embedded clickable links
- Navigation menu
- Chapter markers
- Supplementary material links

## Best Practices

### Input Preparation
1. **Clean LaTeX source**: Remove unnecessary comments and artifacts
2. **High-quality figures**: Use vector formats when possible
3. **Clear structure**: Well-organized sections and subsections
4. **Complete content**: Include all necessary files and references

### Model Selection
- **Text generation (model_name_t)**: GPT-4.1 for best script quality
- **Visual generation (model_name_v)**: GPT-4.1 for optimal slide design
- For faster processing with acceptable quality: GPT-3.5-turbo

### Video Optimization
1. **Target duration**: 10-15 minutes for conference talks, 30-45 for detailed presentations
2. **Pacing**: 2-3 slides per minute for technical content
3. **Resolution**: 1920x1080 for standard, 3840x2160 for high-quality
4. **Audio**: 192kbps minimum for clear speech

### Quality Review
Before finalizing:
1. Watch entire video for content accuracy
2. Check audio synchronization with slides
3. Verify figure quality and readability
4. Test subtitle accuracy and timing
5. Review cursor movements for natural flow

## Performance Considerations

### Processing Time
- **Without talking-head**: 10-30 minutes per paper (depending on length)
- **With talking-head**: 30-120 minutes per paper
- **Factors**: Paper length, figure count, model speed, GPU availability

### Resource Requirements
- **CPU**: Multi-core recommended for parallel processing
- **RAM**: 16GB minimum, 32GB for large papers
- **GPU**: Optional for standard, required for talking-head (A6000 48GB)
- **Storage**: 1-5GB per video depending on length and quality

## Troubleshooting

### Common Issues

**1. LaTeX parsing errors**
- Ensure LaTeX source compiles successfully
- Check for special packages or custom commands
- Verify all referenced files are present

**2. Speech synthesis problems**
- Check audio quality settings
- Verify text is properly formatted
- Test with different voice options

**3. Video rendering failures**
- Check available disk space
- Verify all dependencies are installed
- Review error logs for specific issues

**4. Talking-head generation errors**
- Confirm GPU memory (48GB required)
- Check CUDA drivers are up to date
- Verify reference image quality and format

## Integration with Other Components

Combine Paper2Video with:
- **Paper2Web**: Embed video in generated website
- **Paper2Poster**: Use matching visual style
- **AutoPR**: Create promotional clips from full video
