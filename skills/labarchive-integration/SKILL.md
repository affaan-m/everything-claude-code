---
name: labarchive-integration
description: Electronic lab notebook API integration. Access notebooks, manage entries/attachments, backup notebooks, integrate with Protocols.io/Jupyter/REDCap, for programmatic ELN workflows.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# LabArchives Integration

## Overview

LabArchives is an electronic lab notebook platform for research documentation and data management. Access notebooks, manage entries and attachments, generate reports, and integrate with third-party tools programmatically via REST API.

## When to Use This Skill

This skill should be used when:
- Working with LabArchives REST API for notebook automation
- Backing up notebooks programmatically
- Creating or managing notebook entries and attachments
- Generating site reports and analytics
- Integrating LabArchives with third-party tools (Protocols.io, Jupyter, REDCap)
- Automating data upload to electronic lab notebooks
- Managing user access and permissions programmatically

## Core Capabilities

### 1. Authentication and Configuration

Set up API access credentials and regional endpoints for LabArchives API integration.

**Prerequisites:**
- Enterprise LabArchives license with API access enabled
- API access key ID and password from LabArchives administrator
- User authentication credentials (email and external applications password)

**Configuration setup:**

Use the `scripts/setup_config.py` script to create a configuration file:

```bash
python3 scripts/setup_config.py
```

This creates a `config.yaml` file with the following structure:

```yaml
api_url: https://api.labarchives.com/api  # or regional endpoint
access_key_id: YOUR_ACCESS_KEY_ID
access_password: YOUR_ACCESS_PASSWORD
```

**Regional API endpoints:**
- US/International: `https://api.labarchives.com/api`
- Australia: `https://auapi.labarchives.com/api`
- UK: `https://ukapi.labarchives.com/api`

For detailed authentication instructions and troubleshooting, refer to `references/authentication_guide.md`.

### 2. User Information Retrieval

Obtain user ID (UID) and access information required for subsequent API operations.

**Workflow:**

1. Call the `users/user_access_info` API method with login credentials
2. Parse the XML/JSON response to extract the user ID (UID)
3. Use the UID to retrieve detailed user information via `users/user_info_via_id`

**Example using Python wrapper:**

```python
from labarchivespy.client import Client

# Initialize client
client = Client(api_url, access_key_id, access_password)

# Get user access info
login_params = {'login_or_email': user_email, 'password': auth_token}
response = client.make_call('users', 'user_access_info', params=login_params)

# Extract UID from response
import xml.etree.ElementTree as ET
uid = ET.fromstring(response.content)[0].text

# Get detailed user info
params = {'uid': uid}
user_info = client.make_call('users', 'user_info_via_id', params=params)
```

### 3. Notebook Operations

Manage notebook access, backup, and metadata retrieval.

**Key operations:**

- **List notebooks:** Retrieve all notebooks accessible to a user
- **Backup notebooks:** Download complete notebook data with optional attachment inclusion
- **Get notebook IDs:** Retrieve institution-defined notebook identifiers for integration with grants/project management systems
- **Get notebook members:** List all users with access to a specific notebook
- **Get notebook settings:** Retrieve configuration and permissions for notebooks

**Notebook backup example:**

Use the `scripts/notebook_operations.py` script:

```bash
# Backup with attachments (default, creates 7z archive)
python3 scripts/notebook_operations.py backup --uid USER_ID --nbid NOTEBOOK_ID

# Backup without attachments, JSON format
python3 scripts/notebook_operations.py backup --uid USER_ID --nbid NOTEBOOK_ID --json --no-attachments
```

**API endpoint format:**
```
https://<api_url>/notebooks/notebook_backup?uid=<UID>&nbid=<NOTEBOOK_ID>&json=true&no_attachments=false
```

For comprehensive API method documentation, refer to `references/api_reference.md`.

### 4. Entry and Attachment Management

Create, modify, and manage notebook entries and file attachments.

**Entry operations:**
- Create new entries in notebooks
- Add comments to existing entries
- Create entry parts/components
- Upload file attachments to entries

**Attachment workflow:**

Use the `scripts/entry_operations.py` script:

```bash
# Upload attachment to an entry
python3 scripts/entry_operations.py upload --uid USER_ID --nbid NOTEBOOK_ID --entry-id ENTRY_ID --file /path/to/file.pdf

# Create a new entry with text content
python3 scripts/entry_operations.py create --uid USER_ID --nbid NOTEBOOK_ID --title "Experiment Results" --content "Results from today's experiment..."
```

**Supported file types:**
- Documents (PDF, DOCX, TXT)
- Images (PNG, JPG, TIFF)
- Data files (CSV, XLSX, HDF5)
- Scientific formats (CIF, MOL, PDB)
- Archives (ZIP, 7Z)

### 5. Site Reports and Analytics

Generate institutional reports on notebook usage, activity, and compliance (Enterprise feature).

**Available reports:**
- Detailed Usage Report: User activity metrics and engagement statistics
- Detailed Notebook Report: Notebook metadata, member lists, and settings
- PDF/Offline Notebook Generation Report: Export tracking for compliance
- Notebook Members Report: Access control and collaboration analytics
- Notebook Settings Report: Configuration and permission auditing

**Report generation:**

```python
# Generate detailed usage report
response = client.make_call('site_reports', 'detailed_usage_report',
                           params={'start_date': '2025-01-01', 'end_date': '2025-10-20'})
```

### 6. Third-Party Integrations

LabArchives integrates with numerous scientific software platforms. This skill provides guidance on leveraging these integrations programmatically.

**Supported integrations:**
- **Protocols.io:** Export protocols directly to LabArchives notebooks
- **GraphPad Prism:** Export analyses and figures (Version 8+)
- **SnapGene:** Direct molecular biology workflow integration
- **Geneious:** Bioinformatics analysis export
- **Jupyter:** Embed Jupyter notebooks as entries
- **REDCap:** Clinical data capture integration
- **Qeios:** Research publishing platform
- **SciSpace:** Literature management

**OAuth authentication:**
LabArchives now uses OAuth for all new integrations. Legacy integrations may use API key authentication.

For detailed integration setup instructions and use cases, refer to `references/integrations.md`.

## Common Workflows

### Complete notebook backup workflow

1. Authenticate and obtain user ID
2. List all accessible notebooks
3. Iterate through notebooks and backup each one
4. Store backups with timestamp metadata

```bash
# Complete backup script
python3 scripts/notebook_operations.py backup-all --email user@example.edu --password AUTH_TOKEN
```

### Automated data upload workflow

1. Authenticate with LabArchives API
2. Identify target notebook and entry
3. Upload experimental data files
4. Add metadata comments to entries
5. Generate activity report

### Integration workflow example (Jupyter → LabArchives)

1. Export Jupyter notebook to HTML or PDF
2. Use entry_operations.py to upload to LabArchives
3. Add comment with execution timestamp and environment info
4. Tag entry for easy retrieval

## Python Package Installation

Install the `labarchives-py` wrapper for simplified API access:

```bash
git clone https://github.com/mcmero/labarchives-py
cd labarchives-py
uv pip install .
```

Alternatively, use direct HTTP requests via Python's `requests` library for custom implementations.

## Best Practices

1. **Rate limiting:** Implement appropriate delays between API calls to avoid throttling
2. **Error handling:** Always wrap API calls in try-except blocks with appropriate logging
3. **Authentication security:** Store credentials in environment variables or secure config files (never in code)
4. **Backup verification:** After notebook backup, verify file integrity and completeness
5. **Incremental operations:** For large notebooks, use pagination and batch processing
6. **Regional endpoints:** Use the correct regional API endpoint for optimal performance

## Troubleshooting

**Common issues:**

- **401 Unauthorized:** Verify access key ID and password are correct; check API access is enabled for your account
- **404 Not Found:** Confirm notebook ID (nbid) exists and user has access permissions
- **403 Forbidden:** Check user permissions for the requested operation
- **Empty response:** Ensure required parameters (uid, nbid) are provided correctly
- **Attachment upload failures:** Verify file size limits and format compatibility

For additional support, contact LabArchives at support@labarchives.com.

## Resources

This skill includes bundled resources to support LabArchives API integration:

### scripts/

- `setup_config.py`: Interactive configuration file generator for API credentials
- `notebook_operations.py`: Utilities for listing, backing up, and managing notebooks
- `entry_operations.py`: Tools for creating entries and uploading attachments

### references/

- `api_reference.md`: Comprehensive API endpoint documentation with parameters and examples
- `authentication_guide.md`: Detailed authentication setup and configuration instructions
- `integrations.md`: Third-party integration setup guides and use cases

