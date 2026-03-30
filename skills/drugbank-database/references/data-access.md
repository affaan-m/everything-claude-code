# DrugBank Data Access

## Authentication and Setup

### Account Creation
DrugBank requires user authentication to access data:
1. Create account at go.drugbank.com
2. Accept the license agreement (free for academic use, paid for commercial)
3. Obtain username and password credentials

### Credential Management

**Environment Variables (Recommended)**
```bash
export DRUGBANK_USERNAME="your_username"
export DRUGBANK_PASSWORD="your_password"
```

**Configuration File**
Create `~/.config/drugbank.ini`:
```ini
[drugbank]
username = your_username
password = your_password
```

**Direct Specification**
```python
# Pass credentials directly (not recommended for production)
download_drugbank(username="user", password="pass")
```

## Python Package Installation

### drugbank-downloader
Primary tool for programmatic access:
```bash
pip install drugbank-downloader
```

**Requirements:** Python >=3.9

### Optional Dependencies
```bash
pip install bioversions  # For automatic latest version detection
pip install lxml  # For XML parsing optimization
```

## Data Download Methods

### Download Full Database
```python
from drugbank_downloader import download_drugbank

# Download specific version
path = download_drugbank(version='5.1.7')
# Returns: ~/.data/drugbank/5.1.7/full database.xml.zip

# Download latest version (requires bioversions)
path = download_drugbank()
```

### Custom Storage Location
```python
# Custom prefix for storage
path = download_drugbank(prefix=['custom', 'location', 'drugbank'])
# Stores at: ~/.data/custom/location/drugbank/[version]/
```

### Verify Download
```python
import os
if os.path.exists(path):
    size_mb = os.path.getsize(path) / (1024 * 1024)
    print(f"Downloaded successfully: {size_mb:.1f} MB")
```

## Working with Downloaded Data

### Open Zipped XML Without Extraction
```python
from drugbank_downloader import open_drugbank
import xml.etree.ElementTree as ET

# Open file directly from zip
with open_drugbank() as file:
    tree = ET.parse(file)
    root = tree.getroot()
```

### Parse XML Tree
```python
from drugbank_downloader import parse_drugbank, get_drugbank_root

# Get parsed tree
tree = parse_drugbank()

# Get root element directly
root = get_drugbank_root()
```

### CLI Usage
```bash
# Download using command line
drugbank_downloader --username USER --password PASS

# Download latest version
drugbank_downloader
```

## Data Formats and Versions

### Available Formats
- **XML**: Primary format, most comprehensive data
- **JSON**: Available via API (requires separate API key)
- **CSV/TSV**: Export from web interface or parse XML
- **SQL**: Database dumps available for download

### Version Management
```python
# Specify exact version for reproducibility
path = download_drugbank(version='5.1.10')

# List cached versions
from pathlib import Path
drugbank_dir = Path.home() / '.data' / 'drugbank'
if drugbank_dir.exists():
    versions = [d.name for d in drugbank_dir.iterdir() if d.is_dir()]
    print(f"Cached versions: {versions}")
```

### Version History
- **Version 6.0** (2024): Latest release, expanded drug entries
- **Version 5.1.x** (2019-2023): Incremental updates
- **Version 5.0** (2017): ~9,591 drug entries
- **Version 4.0** (2014): Added metabolite structures
- **Version 3.0** (2011): Added transporter and pathway data
- **Version 2.0** (2009): Added interactions and ADMET

## API Access

### REST API Endpoints
```python
import requests

# Query by DrugBank ID
drug_id = "DB00001"
url = f"https://go.drugbank.com/drugs/{drug_id}.json"
headers = {"Authorization": "Bearer YOUR_API_KEY"}

response = requests.get(url, headers=headers)
if response.status_code == 200:
    drug_data = response.json()
```

### Rate Limits
- **Development Key**: 3,000 requests/month
- **Production Key**: Custom limits based on license
- **Best Practice**: Cache results locally to minimize API calls

### Regional Scoping
DrugBank API is scoped by region:
- **USA**: FDA-approved drugs
- **Canada**: Health Canada-approved drugs
- **EU**: EMA-approved drugs

Specify region in API requests when applicable.

## Data Caching Strategy

### Intermediate Results
```python
import pickle
from pathlib import Path

# Cache parsed data
cache_file = Path("drugbank_parsed.pkl")

if cache_file.exists():
    with open(cache_file, 'rb') as f:
        data = pickle.load(f)
else:
    # Parse and process
    root = get_drugbank_root()
    data = process_drugbank_data(root)

    # Save cache
    with open(cache_file, 'wb') as f:
        pickle.dump(data, f)
```

### Version-Specific Caching
```python
version = "5.1.10"
cache_file = Path(f"drugbank_{version}_processed.pkl")
# Ensures cache invalidation when version changes
```

## Troubleshooting

### Common Issues

**Authentication Failures**
- Verify credentials are correct
- Check license agreement is accepted
- Ensure account has not expired

**Download Failures**
- Check internet connectivity
- Verify sufficient disk space (~1-2 GB needed)
- Try specifying an older version if latest fails

**Parsing Errors**
- Ensure complete download (check file size)
- Verify XML is not corrupted
- Use lxml parser for better error handling

### Error Handling
```python
from drugbank_downloader import download_drugbank
import logging

logging.basicConfig(level=logging.INFO)

try:
    path = download_drugbank()
    print(f"Success: {path}")
except Exception as e:
    print(f"Download failed: {e}")
    # Fallback: specify older stable version
    path = download_drugbank(version='5.1.7')
```

## Best Practices

1. **Version Specification**: Always specify exact version for reproducible research
2. **Credential Security**: Use environment variables, never hardcode credentials
3. **Caching**: Cache intermediate processing results to avoid re-parsing
4. **Documentation**: Document which DrugBank version was used in analysis
5. **License Compliance**: Ensure proper licensing for your use case
6. **Local Storage**: Keep local copies to reduce download frequency
7. **Error Handling**: Implement robust error handling for network issues
