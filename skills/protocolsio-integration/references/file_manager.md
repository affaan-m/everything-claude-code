# File Manager API

## Overview

The File Manager API enables file operations within protocols.io workspaces, including uploading files, organizing folders, searching content, and managing file lifecycle. This is useful for attaching data files, images, documents, and other resources to protocols.

## Base URL

All file manager endpoints use the base URL: `https://protocols.io/api/v3`

## Search and Browse

### Search Workspace Files

Search for files and folders within a workspace.

**Endpoint:** `GET /workspaces/{workspace_id}/files/search`

**Path Parameters:**
- `workspace_id`: The workspace's unique identifier

**Query Parameters:**
- `query`: Search keywords (searches filenames and metadata)
- `type`: Filter by type
  - `file`: Files only
  - `folder`: Folders only
  - `all`: Both files and folders (default)
- `folder_id`: Limit search to specific folder
- `page_size`: Number of results per page (default: 20, max: 100)
- `page_id`: Page number for pagination (starts at 0)

**Response includes:**
- File/folder ID and name
- File size and type
- Creation and modification dates
- File path in workspace
- Download URL (for files)

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://protocols.io/api/v3/workspaces/12345/files/search?query=microscopy&type=file"
```

### List Folder Contents

Browse files and folders within a specific folder.

**Endpoint:** `GET /workspaces/{workspace_id}/folders/{folder_id}`

**Path Parameters:**
- `workspace_id`: The workspace's unique identifier
- `folder_id`: The folder's unique identifier (use `root` for workspace root)

**Query Parameters:**
- `order_by`: Sort field (`name`, `size`, `created`, `modified`)
- `order_dir`: Sort direction (`asc`, `desc`)
- `page_size`: Number of results per page
- `page_id`: Page number for pagination

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://protocols.io/api/v3/workspaces/12345/folders/root?order_by=modified&order_dir=desc"
```

## File Upload

### Upload File

Upload a file to a workspace folder.

**Endpoint:** `POST /workspaces/{workspace_id}/files/upload`

**Request Format**: `multipart/form-data`

**Form Parameters:**
- `file` (required): The file to upload
- `folder_id`: Target folder ID (omit or use `root` for workspace root)
- `name`: Custom filename (optional, uses original filename if omitted)
- `description`: File description
- `tags`: Comma-separated tags

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/local/data.xlsx" \
  -F "folder_id=67890" \
  -F "description=Experimental results from trial #3" \
  -F "tags=experiment,data,2025" \
  "https://protocols.io/api/v3/workspaces/12345/files/upload"
```

### Upload Verification

After upload, verify the file was processed correctly.

**Endpoint:** `GET /workspaces/{workspace_id}/files/{file_id}/status`

**Response includes:**
- Upload status (`processing`, `complete`, `failed`)
- File metadata
- Any processing errors

## File Operations

### Download File

Download a file from the workspace.

**Endpoint:** `GET /workspaces/{workspace_id}/files/{file_id}/download`

**Path Parameters:**
- `workspace_id`: The workspace's unique identifier
- `file_id`: The file's unique identifier

**Response**: Binary file data with appropriate Content-Type header

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  -o "downloaded_file.xlsx" \
  "https://protocols.io/api/v3/workspaces/12345/files/67890/download"
```

### Get File Metadata

Retrieve file information without downloading.

**Endpoint:** `GET /workspaces/{workspace_id}/files/{file_id}`

**Response includes:**
- File name, size, and type
- Upload date and author
- Description and tags
- File path and location
- Download URL
- Sharing permissions

### Update File Metadata

Update file description, tags, or other metadata.

**Endpoint:** `PATCH /workspaces/{workspace_id}/files/{file_id}`

**Request Body:**
- `name`: New filename
- `description`: Updated description
- `tags`: Updated tags (comma-separated)
- `folder_id`: Move to different folder

**Example Request:**
```bash
curl -X PATCH \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Experimental results from trial #3 - REVISED",
    "tags": "experiment,data,2025,revised"
  }' \
  "https://protocols.io/api/v3/workspaces/12345/files/67890"
```

### Delete File

Move a file to trash (soft delete).

**Endpoint:** `DELETE /workspaces/{workspace_id}/files/{file_id}`

**Note**: Deleted files may be recoverable from trash for a limited time

### Restore File

Restore a deleted file from trash.

**Endpoint:** `POST /workspaces/{workspace_id}/files/{file_id}/restore`

## Folder Operations

### Create Folder

Create a new folder in the workspace.

**Endpoint:** `POST /workspaces/{workspace_id}/folders`

**Request Body:**
- `name` (required): Folder name
- `parent_folder_id`: Parent folder ID (omit for workspace root)
- `description`: Folder description

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "2025 Experiments",
    "parent_folder_id": "root",
    "description": "All experimental data from 2025"
  }' \
  "https://protocols.io/api/v3/workspaces/12345/folders"
```

### Rename Folder

**Endpoint:** `PATCH /workspaces/{workspace_id}/folders/{folder_id}`

**Request Body:**
- `name`: New folder name
- `description`: Updated description

### Delete Folder

Delete a folder and optionally its contents.

**Endpoint:** `DELETE /workspaces/{workspace_id}/folders/{folder_id}`

**Query Parameters:**
- `recursive`: Set to `true` to delete folder and all contents (default: `false`)

**Warning**: Recursive deletion cannot be easily undone

## Common Use Cases

### 1. Protocol Data Attachment

Attach experimental data files to protocols:

1. Upload data files: `POST /workspaces/{id}/files/upload`
2. Verify upload completion
3. Reference file IDs in protocol steps
4. Include download links in protocol description

**Example Workflow:**
```bash
# Upload the data file
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@results.csv" \
  -F "description=Results from protocol execution" \
  "https://protocols.io/api/v3/workspaces/12345/files/upload"

# Note the file_id from response, then reference in protocol
```

### 2. Workspace Organization

Organize files into logical folder structures:

1. Create folder hierarchy: `POST /workspaces/{id}/folders`
2. Upload files to appropriate folders
3. Use consistent naming conventions
4. Tag files for easy search

**Example Structure:**
```
Workspace Root
├── Protocols
│   ├── Published
│   └── Drafts
├── Data
│   ├── Raw
│   └── Processed
├── Images
│   ├── Microscopy
│   └── Gels
└── Documents
    ├── Papers
    └── Presentations
```

### 3. File Search and Discovery

Find files across workspace:

1. Search by keywords: `GET /workspaces/{id}/files/search?query=keywords`
2. Filter by type and date
3. Download relevant files
4. Update metadata for better organization

### 4. Batch File Upload

Upload multiple related files:

1. Create target folder
2. For each file:
   - Upload file
   - Verify upload status
   - Add consistent tags
3. Create index or manifest file listing all uploads

### 5. Data Backup and Export

Export workspace files for backup:

1. List all folders: `GET /workspaces/{id}/folders/root`
2. For each folder, list files
3. Download all files: `GET /workspaces/{id}/files/{file_id}/download`
4. Maintain folder structure locally
5. Store metadata separately for restoration

### 6. File Versioning

Manage file versions manually:

1. Upload new version with versioned name (e.g., `data_v2.csv`)
2. Update previous version metadata to indicate superseded
3. Maintain version history in folder structure
4. Reference specific versions in protocols

## Supported File Types

Protocols.io supports various file types:

**Data Files:**
- Spreadsheets: `.xlsx`, `.xls`, `.csv`, `.tsv`
- Statistical data: `.rds`, `.rdata`, `.sav`, `.dta`
- Plain text: `.txt`, `.log`, `.json`, `.xml`

**Images:**
- Common formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.tif`, `.tiff`
- Scientific: `.czi`, `.nd2`, `.lsm` (may require special handling)

**Documents:**
- PDF: `.pdf`
- Word: `.docx`, `.doc`
- PowerPoint: `.pptx`, `.ppt`

**Code and Scripts:**
- Python: `.py`, `.ipynb`
- R: `.r`, `.rmd`
- Shell: `.sh`, `.bash`

**Multimedia:**
- Video: `.mp4`, `.avi`, `.mov`
- Audio: `.mp3`, `.wav`

**Archives:**
- Compressed: `.zip`, `.tar.gz`, `.7z`

**File Size Limits:**
- Standard files: Check workspace limits (typically 100 MB - 1 GB)
- Large files: May require chunked upload or special handling

## Best Practices

1. **File Naming**
   - Use descriptive, consistent naming conventions
   - Include dates in ISO format (YYYY-MM-DD)
   - Avoid special characters and spaces (use underscores)
   - Example: `experiment_results_2025-10-26.csv`

2. **Organization**
   - Create logical folder hierarchy
   - Group related files together
   - Separate raw data from processed results
   - Keep protocol-specific files in dedicated folders

3. **Metadata**
   - Add detailed descriptions
   - Tag files consistently
   - Include version information
   - Document processing steps

4. **Storage Management**
   - Regularly review and archive old files
   - Delete unnecessary duplicates
   - Compress large datasets
   - Monitor workspace storage limits

5. **Collaboration**
   - Use clear file names for team members
   - Document file purposes in descriptions
   - Maintain consistent folder structures
   - Communicate major organizational changes

6. **Security**
   - Avoid uploading sensitive data without proper permissions
   - Be aware of workspace visibility settings
   - Use appropriate access controls
   - Regularly audit file access

## Error Handling

Common error responses:

- `400 Bad Request`: Invalid file format or parameters
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient workspace permissions
- `404 Not Found`: File or folder not found
- `413 Payload Too Large`: File exceeds size limit
- `422 Unprocessable Entity`: File validation failed
- `429 Too Many Requests`: Rate limit exceeded
- `507 Insufficient Storage`: Workspace storage limit reached

## Performance Considerations

1. **Large Files**
   - Consider chunked upload for files > 100 MB
   - Use compression for large datasets
   - Upload during off-peak hours if possible

2. **Batch Operations**
   - Implement retry logic for failed uploads
   - Use exponential backoff for rate limits
   - Process uploads in parallel where possible

3. **Download Optimization**
   - Cache frequently accessed files locally
   - Use streaming for large file downloads
   - Implement resume capability for interrupted downloads
