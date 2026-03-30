---
name: protocolsio-integration
description: Integration with protocols.io API for managing scientific protocols. This skill should be used when working with protocols.io to search, create, update, or publish protocols; manage protocol steps and materials; handle discussions and comments; organize workspaces; upload and manage files; or integrate protocols.io functionality into workflows. Applicable for protocol discovery, collaborative protocol development, experiment tracking, lab protocol management, and scientific documentation.
license: Unknown
metadata:
    skill-author: K-Dense Inc.
---

# Protocols.io Integration

## Overview

Protocols.io is a comprehensive platform for developing, sharing, and managing scientific protocols. This skill provides complete integration with the protocols.io API v3, enabling programmatic access to protocols, workspaces, discussions, file management, and collaboration features.

## When to Use This Skill

Use this skill when working with protocols.io in any of the following scenarios:

- **Protocol Discovery**: Searching for existing protocols by keywords, DOI, or category
- **Protocol Management**: Creating, updating, or publishing scientific protocols
- **Step Management**: Adding, editing, or organizing protocol steps and procedures
- **Collaborative Development**: Working with team members on shared protocols
- **Workspace Organization**: Managing lab or institutional protocol repositories
- **Discussion & Feedback**: Adding or responding to protocol comments
- **File Management**: Uploading data files, images, or documents to protocols
- **Experiment Tracking**: Documenting protocol executions and results
- **Data Export**: Backing up or migrating protocol collections
- **Integration Projects**: Building tools that interact with protocols.io

## Core Capabilities

This skill provides comprehensive guidance across five major capability areas:

### 1. Authentication & Access

Manage API authentication using access tokens and OAuth flows. Includes both client access tokens (for personal content) and OAuth tokens (for multi-user applications).

**Key operations:**
- Generate authorization links for OAuth flow
- Exchange authorization codes for access tokens
- Refresh expired tokens
- Manage rate limits and permissions

**Reference:** Read `references/authentication.md` for detailed authentication procedures, OAuth implementation, and security best practices.

### 2. Protocol Operations

Complete protocol lifecycle management from creation to publication.

**Key operations:**
- Search and discover protocols by keywords, filters, or DOI
- Retrieve detailed protocol information with all steps
- Create new protocols with metadata and tags
- Update protocol information and settings
- Manage protocol steps (create, update, delete, reorder)
- Handle protocol materials and reagents
- Publish protocols with DOI issuance
- Bookmark protocols for quick access
- Generate protocol PDFs

**Reference:** Read `references/protocols_api.md` for comprehensive protocol management guidance, including API endpoints, parameters, common workflows, and examples.

### 3. Discussions & Collaboration

Enable community engagement through comments and discussions.

**Key operations:**
- View protocol-level and step-level comments
- Create new comments and threaded replies
- Edit or delete your own comments
- Analyze discussion patterns and feedback
- Respond to user questions and issues

**Reference:** Read `references/discussions.md` for discussion management, comment threading, and collaboration workflows.

### 4. Workspace Management

Organize protocols within team workspaces with role-based permissions.

**Key operations:**
- List and access user workspaces
- Retrieve workspace details and member lists
- Request access or join workspaces
- List workspace-specific protocols
- Create protocols within workspaces
- Manage workspace permissions and collaboration

**Reference:** Read `references/workspaces.md` for workspace organization, permission management, and team collaboration patterns.

### 5. File Operations

Upload, organize, and manage files associated with protocols.

**Key operations:**
- Search workspace files and folders
- Upload files with metadata and tags
- Download files and verify uploads
- Organize files into folder hierarchies
- Update file metadata
- Delete and restore files
- Manage storage and organization

**Reference:** Read `references/file_manager.md` for file upload procedures, organization strategies, and storage management.

### 6. Additional Features

Supplementary functionality including profiles, notifications, and exports.

**Key operations:**
- Manage user profiles and settings
- Query recently published protocols
- Create and track experiment records
- Receive and manage notifications
- Export organization data for archival

**Reference:** Read `references/additional_features.md` for profile management, publication discovery, experiment tracking, and data export.

## Getting Started

### Step 1: Authentication Setup

Before using any protocols.io API functionality:

1. Obtain an access token (CLIENT_ACCESS_TOKEN or OAUTH_ACCESS_TOKEN)
2. Read `references/authentication.md` for detailed authentication procedures
3. Store the token securely
4. Include in all requests as: `Authorization: Bearer YOUR_TOKEN`

### Step 2: Identify Your Use Case

Determine which capability area addresses your needs:

- **Working with protocols?** → Read `references/protocols_api.md`
- **Managing team protocols?** → Read `references/workspaces.md`
- **Handling comments/feedback?** → Read `references/discussions.md`
- **Uploading files/data?** → Read `references/file_manager.md`
- **Tracking experiments or profiles?** → Read `references/additional_features.md`

### Step 3: Implement Integration

Follow the guidance in the relevant reference files:

- Each reference includes detailed endpoint documentation
- API parameters and request/response formats are specified
- Common use cases and workflows are provided with examples
- Best practices and error handling guidance included

## Base URL and Request Format

All API requests use the base URL:
```
https://protocols.io/api/v3
```

All requests require the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

Most endpoints support JSON request/response format with `Content-Type: application/json`.

## Content Format Options

Many endpoints support a `content_format` parameter to control how protocol content is returned:

- `json`: Draft.js JSON format (default)
- `html`: HTML format
- `markdown`: Markdown format

Include as query parameter: `?content_format=html`

## Rate Limiting

Be aware of API rate limits:

- **Standard endpoints**: 100 requests per minute per user
- **PDF endpoint**: 5 requests/minute (signed-in), 3 requests/minute (unsigned)

Implement exponential backoff for rate limit errors (HTTP 429).

## Common Workflows

### Workflow 1: Import and Analyze Protocol

To analyze an existing protocol from protocols.io:

1. **Search**: Use `GET /protocols` with keywords to find relevant protocols
2. **Retrieve**: Get full details with `GET /protocols/{protocol_id}`
3. **Extract**: Parse steps, materials, and metadata for analysis
4. **Review discussions**: Check `GET /protocols/{id}/comments` for user feedback
5. **Export**: Generate PDF if needed for offline reference

**Reference files**: `protocols_api.md`, `discussions.md`

### Workflow 2: Create and Publish Protocol

To create a new protocol and publish with DOI:

1. **Authenticate**: Ensure you have valid access token (see `authentication.md`)
2. **Create**: Use `POST /protocols` with title and description
3. **Add steps**: For each step, use `POST /protocols/{id}/steps`
4. **Add materials**: Document reagents in step components
5. **Review**: Verify all content is complete and accurate
6. **Publish**: Issue DOI with `POST /protocols/{id}/publish`

**Reference files**: `protocols_api.md`, `authentication.md`

### Workflow 3: Collaborative Lab Workspace

To set up team protocol management:

1. **Create/join workspace**: Access or request workspace membership (see `workspaces.md`)
2. **Organize structure**: Create folder hierarchy for lab protocols (see `file_manager.md`)
3. **Create protocols**: Use `POST /workspaces/{id}/protocols` for team protocols
4. **Upload files**: Add experimental data and images
5. **Enable discussions**: Team members can comment and provide feedback
6. **Track experiments**: Document protocol executions with experiment records

**Reference files**: `workspaces.md`, `file_manager.md`, `protocols_api.md`, `discussions.md`, `additional_features.md`

### Workflow 4: Experiment Documentation

To track protocol executions and results:

1. **Execute protocol**: Perform protocol in laboratory
2. **Upload data**: Use File Manager API to upload results (see `file_manager.md`)
3. **Create record**: Document execution with `POST /protocols/{id}/runs`
4. **Link files**: Reference uploaded data files in experiment record
5. **Note modifications**: Document any protocol deviations or optimizations
6. **Analyze**: Review multiple runs for reproducibility assessment

**Reference files**: `additional_features.md`, `file_manager.md`, `protocols_api.md`

### Workflow 5: Protocol Discovery and Citation

To find and cite protocols in research:

1. **Search**: Query published protocols with `GET /publications`
2. **Filter**: Use category and keyword filters for relevant protocols
3. **Review**: Read protocol details and community comments
4. **Bookmark**: Save useful protocols with `POST /protocols/{id}/bookmarks`
5. **Cite**: Use protocol DOI in publications (proper attribution)
6. **Export PDF**: Generate formatted PDF for offline reference

**Reference files**: `protocols_api.md`, `additional_features.md`

## Python Request Examples

### Basic Protocol Search

```python
import requests

token = "YOUR_ACCESS_TOKEN"
headers = {"Authorization": f"Bearer {token}"}

# Search for CRISPR protocols
response = requests.get(
    "https://protocols.io/api/v3/protocols",
    headers=headers,
    params={
        "filter": "public",
        "key": "CRISPR",
        "page_size": 10,
        "content_format": "html"
    }
)

protocols = response.json()
for protocol in protocols["items"]:
    print(f"{protocol['title']} - {protocol['doi']}")
```

### Create New Protocol

```python
import requests

token = "YOUR_ACCESS_TOKEN"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Create protocol
data = {
    "title": "CRISPR-Cas9 Gene Editing Protocol",
    "description": "Comprehensive protocol for CRISPR gene editing",
    "tags": ["CRISPR", "gene editing", "molecular biology"]
}

response = requests.post(
    "https://protocols.io/api/v3/protocols",
    headers=headers,
    json=data
)

protocol_id = response.json()["item"]["id"]
print(f"Created protocol: {protocol_id}")
```

### Upload File to Workspace

```python
import requests

token = "YOUR_ACCESS_TOKEN"
headers = {"Authorization": f"Bearer {token}"}

# Upload file
with open("data.csv", "rb") as f:
    files = {"file": f}
    data = {
        "folder_id": "root",
        "description": "Experimental results",
        "tags": "experiment,data,2025"
    }

    response = requests.post(
        "https://protocols.io/api/v3/workspaces/12345/files/upload",
        headers=headers,
        files=files,
        data=data
    )

file_id = response.json()["item"]["id"]
print(f"Uploaded file: {file_id}")
```

## Error Handling

Implement robust error handling for API requests:

```python
import requests
import time

def make_request_with_retry(url, headers, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.get(url, headers=headers)

            if response.status_code == 200:
                return response.json()
            elif response.status_code == 429:  # Rate limit
                retry_after = int(response.headers.get('Retry-After', 60))
                time.sleep(retry_after)
                continue
            elif response.status_code >= 500:  # Server error
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
            else:
                response.raise_for_status()

        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)

    raise Exception("Max retries exceeded")
```

## Reference Files

Load the appropriate reference file based on your task:

- **`authentication.md`**: OAuth flows, token management, rate limiting
- **`protocols_api.md`**: Protocol CRUD, steps, materials, publishing, PDFs
- **`discussions.md`**: Comments, replies, collaboration
- **`workspaces.md`**: Team workspaces, permissions, organization
- **`file_manager.md`**: File upload, folders, storage management
- **`additional_features.md`**: Profiles, publications, experiments, notifications

To load a reference file, read the file from the `references/` directory when needed for specific functionality.

## Best Practices

1. **Authentication**: Store tokens securely, never in code or version control
2. **Rate Limiting**: Implement exponential backoff and respect rate limits
3. **Error Handling**: Handle all HTTP error codes appropriately
4. **Data Validation**: Validate input before API calls
5. **Documentation**: Document protocol steps thoroughly
6. **Collaboration**: Use comments and discussions for team communication
7. **Organization**: Maintain consistent naming and tagging conventions
8. **Versioning**: Track protocol versions when making updates
9. **Attribution**: Properly cite protocols using DOIs
10. **Backup**: Regularly export important protocols and workspace data

## Additional Resources

- **Official API Documentation**: https://apidoc.protocols.io/
- **Protocols.io Platform**: https://www.protocols.io/
- **Support**: Contact protocols.io support for API access and technical issues
- **Community**: Engage with protocols.io community for best practices

## Troubleshooting

**Authentication Issues:**
- Verify token is valid and not expired
- Check Authorization header format: `Bearer YOUR_TOKEN`
- Ensure appropriate token type (CLIENT vs OAUTH)

**Rate Limiting:**
- Implement exponential backoff for 429 errors
- Monitor request frequency
- Consider caching frequent requests

**Permission Errors:**
- Verify workspace/protocol access permissions
- Check user role in workspace
- Ensure protocol is not private if accessing without permission

**File Upload Failures:**
- Check file size against workspace limits
- Verify file type is supported
- Ensure multipart/form-data encoding is correct

For detailed troubleshooting guidance, refer to the specific reference files covering each capability area.

