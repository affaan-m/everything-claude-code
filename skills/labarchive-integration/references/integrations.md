# LabArchives Third-Party Integrations

## Overview

LabArchives integrates with numerous scientific software platforms to streamline research workflows. This document covers programmatic integration approaches, automation strategies, and best practices for each supported platform.

## Integration Categories

### 1. Protocol Management

#### Protocols.io Integration

Export protocols directly from Protocols.io to LabArchives notebooks.

**Use cases:**
- Standardize experimental procedures across lab notebooks
- Maintain version control for protocols
- Link protocols to experimental results

**Setup:**
1. Enable Protocols.io integration in LabArchives settings
2. Authenticate with Protocols.io account
3. Browse and select protocols to export

**Programmatic approach:**
```python
# Export Protocols.io protocol as HTML/PDF
# Then upload to LabArchives via API

def import_protocol_to_labarchives(client, uid, nbid, protocol_id):
    """Import Protocols.io protocol to LabArchives entry"""
    # 1. Fetch protocol from Protocols.io API
    protocol_data = fetch_protocol_from_protocolsio(protocol_id)

    # 2. Create new entry in LabArchives
    entry_params = {
        'uid': uid,
        'nbid': nbid,
        'title': f"Protocol: {protocol_data['title']}",
        'content': protocol_data['html_content']
    }
    response = client.make_call('entries', 'create_entry', params=entry_params)

    # 3. Add protocol metadata as comment
    entry_id = extract_entry_id(response)
    comment_params = {
        'uid': uid,
        'nbid': nbid,
        'entry_id': entry_id,
        'comment': f"Protocols.io ID: {protocol_id}<br>Version: {protocol_data['version']}"
    }
    client.make_call('entries', 'create_comment', params=comment_params)

    return entry_id
```

**Updated:** September 22, 2025

### 2. Data Analysis Tools

#### GraphPad Prism Integration (Version 8+)

Export analyses, graphs, and figures directly from Prism to LabArchives.

**Use cases:**
- Archive statistical analyses with raw data
- Document figure generation for publications
- Maintain analysis audit trail for compliance

**Setup:**
1. Install GraphPad Prism 8 or higher
2. Configure LabArchives connection in Prism preferences
3. Use "Export to LabArchives" option from File menu

**Programmatic approach:**
```python
# Upload Prism files to LabArchives via API

def upload_prism_analysis(client, uid, nbid, entry_id, prism_file_path):
    """Upload GraphPad Prism file to LabArchives entry"""
    import requests

    url = f'{client.api_url}/entries/upload_attachment'
    files = {'file': open(prism_file_path, 'rb')}
    params = {
        'uid': uid,
        'nbid': nbid,
        'entry_id': entry_id,
        'filename': os.path.basename(prism_file_path),
        'access_key_id': client.access_key_id,
        'access_password': client.access_password
    }

    response = requests.post(url, files=files, data=params)
    return response
```

**Supported file types:**
- .pzfx (Prism project files)
- .png, .jpg, .pdf (exported graphs)
- .xlsx (exported data tables)

**Updated:** September 8, 2025

### 3. Molecular Biology & Bioinformatics

#### SnapGene Integration

Direct integration for molecular biology workflows, plasmid maps, and sequence analysis.

**Use cases:**
- Document cloning strategies
- Archive plasmid maps with experimental records
- Link sequences to experimental results

**Setup:**
1. Install SnapGene software
2. Enable LabArchives export in SnapGene preferences
3. Use "Send to LabArchives" feature

**File format support:**
- .dna (SnapGene files)
- .gb, .gbk (GenBank format)
- .fasta (sequence files)
- .png, .pdf (plasmid map exports)

**Programmatic workflow:**
```python
def upload_snapgene_file(client, uid, nbid, entry_id, snapgene_file):
    """Upload SnapGene file with preview image"""
    # Upload main SnapGene file
    upload_attachment(client, uid, nbid, entry_id, snapgene_file)

    # Generate and upload preview image (requires SnapGene CLI)
    preview_png = generate_snapgene_preview(snapgene_file)
    upload_attachment(client, uid, nbid, entry_id, preview_png)
```

#### Geneious Integration

Bioinformatics analysis export from Geneious to LabArchives.

**Use cases:**
- Archive sequence alignments and phylogenetic trees
- Document NGS analysis pipelines
- Link bioinformatics workflows to wet-lab experiments

**Supported exports:**
- Sequence alignments
- Phylogenetic trees
- Assembly reports
- Variant calling results

**File formats:**
- .geneious (Geneious documents)
- .fasta, .fastq (sequence data)
- .bam, .sam (alignment files)
- .vcf (variant files)

### 4. Computational Notebooks

#### Jupyter Integration

Embed Jupyter notebooks as LabArchives entries for reproducible computational research.

**Use cases:**
- Document data analysis workflows
- Archive computational experiments
- Link code, results, and narrative

**Workflow:**

```python
def export_jupyter_to_labarchives(notebook_path, client, uid, nbid):
    """Export Jupyter notebook to LabArchives"""
    import nbformat
    from nbconvert import HTMLExporter

    # Load notebook
    with open(notebook_path, 'r') as f:
        nb = nbformat.read(f, as_version=4)

    # Convert to HTML
    html_exporter = HTMLExporter()
    html_exporter.template_name = 'classic'
    (body, resources) = html_exporter.from_notebook_node(nb)

    # Create entry in LabArchives
    entry_params = {
        'uid': uid,
        'nbid': nbid,
        'title': f"Jupyter Notebook: {os.path.basename(notebook_path)}",
        'content': body
    }
    response = client.make_call('entries', 'create_entry', params=entry_params)

    # Upload original .ipynb file as attachment
    entry_id = extract_entry_id(response)
    upload_attachment(client, uid, nbid, entry_id, notebook_path)

    return entry_id
```

**Best practices:**
- Export with outputs included (Run All Cells before export)
- Include environment.yml or requirements.txt as attachment
- Add execution timestamp and system info in comments

### 5. Clinical Research

#### REDCap Integration

Clinical data capture integration with LabArchives for research compliance and audit trails.

**Use cases:**
- Link clinical data collection to research notebooks
- Maintain audit trails for regulatory compliance
- Document clinical trial protocols and amendments

**Integration approach:**
- REDCap API exports data to LabArchives entries
- Automated data synchronization for longitudinal studies
- HIPAA-compliant data handling

**Example workflow:**
```python
def sync_redcap_to_labarchives(redcap_api_token, client, uid, nbid):
    """Sync REDCap data to LabArchives"""
    # Fetch REDCap data
    redcap_data = fetch_redcap_data(redcap_api_token)

    # Create LabArchives entry
    entry_params = {
        'uid': uid,
        'nbid': nbid,
        'title': f"REDCap Data Export {datetime.now().strftime('%Y-%m-%d')}",
        'content': format_redcap_data_html(redcap_data)
    }
    response = client.make_call('entries', 'create_entry', params=entry_params)

    return response
```

**Compliance features:**
- 21 CFR Part 11 compliance
- Audit trail maintenance
- Data integrity verification

### 6. Research Publishing

#### Qeios Integration

Research publishing platform integration for preprints and peer review.

**Use cases:**
- Export research findings to preprint servers
- Document publication workflows
- Link published articles to lab notebooks

**Workflow:**
- Export formatted entries from LabArchives
- Submit to Qeios platform
- Maintain bidirectional links between notebook and publication

#### SciSpace Integration

Literature management and citation integration.

**Use cases:**
- Link references to experimental procedures
- Maintain literature review in notebooks
- Generate bibliographies for reports

**Features:**
- Citation import from SciSpace to LabArchives
- PDF annotation synchronization
- Reference management

## OAuth Authentication for Integrations

LabArchives now uses OAuth 2.0 for new third-party integrations.

**OAuth flow for app developers:**

```python
def labarchives_oauth_flow(client_id, client_secret, redirect_uri):
    """Implement OAuth 2.0 flow for LabArchives integration"""
    import requests

    # Step 1: Get authorization code
    auth_url = "https://mynotebook.labarchives.com/oauth/authorize"
    auth_params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'read write'
    }
    # User visits auth_url and grants permission

    # Step 2: Exchange code for access token
    token_url = "https://mynotebook.labarchives.com/oauth/token"
    token_params = {
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code',
        'code': authorization_code  # From redirect
    }

    response = requests.post(token_url, data=token_params)
    tokens = response.json()

    return tokens['access_token'], tokens['refresh_token']
```

**OAuth advantages:**
- More secure than API keys
- Fine-grained permission control
- Token refresh for long-running integrations
- Revocable access

## Custom Integration Development

### General Workflow

For tools not officially supported, develop custom integrations:

1. **Export data** from source application (API or file export)
2. **Transform format** to HTML or supported file type
3. **Authenticate** with LabArchives API
4. **Create entry** or upload attachment
5. **Add metadata** via comments for traceability

### Example: Custom Integration Template

```python
class LabArchivesIntegration:
    """Template for custom LabArchives integrations"""

    def __init__(self, config_path):
        self.client = self._init_client(config_path)
        self.uid = self._authenticate()

    def _init_client(self, config_path):
        """Initialize LabArchives client"""
        with open(config_path) as f:
            config = yaml.safe_load(f)
        return Client(config['api_url'],
                     config['access_key_id'],
                     config['access_password'])

    def _authenticate(self):
        """Get user ID"""
        # Implementation from authentication_guide.md
        pass

    def export_data(self, source_data, nbid, title):
        """Export data to LabArchives"""
        # Transform data to HTML
        html_content = self._transform_to_html(source_data)

        # Create entry
        params = {
            'uid': self.uid,
            'nbid': nbid,
            'title': title,
            'content': html_content
        }
        response = self.client.make_call('entries', 'create_entry', params=params)

        return extract_entry_id(response)

    def _transform_to_html(self, data):
        """Transform data to HTML format"""
        # Custom transformation logic
        pass
```

## Integration Best Practices

1. **Version control:** Track which software version generated the data
2. **Metadata preservation:** Include timestamps, user info, and processing parameters
3. **File format standards:** Use open formats when possible (CSV, JSON, HTML)
4. **Batch operations:** Implement rate limiting for bulk uploads
5. **Error handling:** Implement retry logic with exponential backoff
6. **Audit trails:** Log all API operations for compliance
7. **Testing:** Validate integrations in test notebooks before production use

## Troubleshooting Integrations

### Common Issues

**Integration not appearing in LabArchives:**
- Verify integration is enabled by administrator
- Check OAuth permissions if using OAuth
- Ensure compatible software version

**File upload failures:**
- Verify file size limits (typically 2GB per file)
- Check file format compatibility
- Ensure sufficient storage quota

**Authentication errors:**
- Verify API credentials are current
- Check if integration-specific tokens have expired
- Confirm user has necessary permissions

### Integration Support

For integration-specific issues:
- Check software vendor documentation (e.g., GraphPad, Protocols.io)
- Contact LabArchives support: support@labarchives.com
- Review LabArchives knowledge base: help.labarchives.com

## Future Integration Opportunities

Potential integrations for custom development:
- Electronic data capture (EDC) systems
- Laboratory information management systems (LIMS)
- Instrument data systems (chromatography, spectroscopy)
- Cloud storage platforms (Box, Dropbox, Google Drive)
- Project management tools (Asana, Monday.com)
- Grant management systems

For custom integration development, contact LabArchives for API partnership opportunities.
