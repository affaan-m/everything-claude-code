# Installation and Configuration

## System Requirements

### Hardware Requirements
- **GPU**: NVIDIA A6000 (48GB minimum) required for video generation with talking-head features
- **CPU**: Multi-core processor recommended for PDF processing and document conversion
- **RAM**: 16GB minimum, 32GB recommended for large papers

### Software Requirements
- **Python**: 3.11 or higher
- **Conda**: Environment manager for dependency isolation
- **LibreOffice**: Required for document format conversion (PDF to PPTX, etc.)
- **Poppler utilities**: Required for PDF processing and manipulation

## Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/YuhangChen1/Paper2All.git
cd Paper2All
```

### 2. Create Conda Environment
```bash
conda create -n paper2all python=3.11
conda activate paper2all
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Install System Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get install libreoffice poppler-utils
```

**macOS:**
```bash
brew install libreoffice poppler
```

**Windows:**
- Download and install LibreOffice from https://www.libreoffice.org/
- Download and install Poppler from https://github.com/oschwartz10612/poppler-windows

## API Configuration

Create a `.env` file in the project root with the following credentials:

### Required API Keys

**Option 1: OpenAI API**
```
OPENAI_API_KEY=your_openai_api_key_here
```

**Option 2: OpenRouter API** (alternative to OpenAI)
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### Optional API Keys

**Google Search API** (for automatic logo discovery)
```
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_custom_search_engine_id_here
```

## Model Configuration

The system supports multiple LLM backends:

### Supported Models
- GPT-4 (recommended for best quality)
- GPT-4.1 (latest version)
- GPT-3.5-turbo (faster, lower cost)
- Claude models via OpenRouter
- Other OpenRouter-supported models

### Model Selection

Specify models using the `--model-choice` parameter or `--model_name_t` and `--model_name_v` parameters:
- Model choice 1: GPT-4 for all components
- Model choice 2: GPT-4.1 for all components
- Custom: Specify separate models for text and visual processing

## Verification

Test the installation:

```bash
python pipeline_all.py --help
```

If successful, you should see the help menu with all available options.

## Troubleshooting

### Common Issues

**1. LibreOffice not found**
- Ensure LibreOffice is installed and in your system PATH
- Try running `libreoffice --version` to verify

**2. Poppler utilities not found**
- Verify installation with `pdftoppm -v`
- Add Poppler bin directory to PATH if needed

**3. GPU/CUDA errors for video generation**
- Ensure NVIDIA drivers are up to date
- Verify CUDA toolkit is installed
- Check GPU memory with `nvidia-smi`

**4. API key errors**
- Verify `.env` file is in the project root
- Check that API keys are valid and have sufficient credits
- Ensure no extra spaces or quotes around keys in `.env`

## Directory Structure

After installation, organize your workspace:

```
Paper2All/
├── .env                  # API credentials
├── input/               # Place your paper files here
│   └── paper_name/      # Each paper in its own directory
│       └── main.tex     # LaTeX source or PDF
├── output/              # Generated outputs
│   └── paper_name/
│       ├── website/     # Generated website files
│       ├── video/       # Generated video files
│       └── poster/      # Generated poster files
└── ...
```
