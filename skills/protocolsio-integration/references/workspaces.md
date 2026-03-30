# Workspaces API

## Overview

Workspaces in protocols.io enable team collaboration by organizing protocols, managing members, and controlling access permissions. The Workspaces API allows you to list workspaces, manage memberships, and access workspace-specific protocols.

## Base URL

All workspace endpoints use the base URL: `https://protocols.io/api/v3`

## Workspace Operations

### List User Workspaces

Retrieve all workspaces the authenticated user has access to.

**Endpoint:** `GET /workspaces`

**Query Parameters:**
- `page_size`: Number of results per page (default: 10, max: 50)
- `page_id`: Page number for pagination (starts at 0)

**Response includes:**
- Workspace ID and name
- Workspace type (personal, group, institutional)
- Member count
- Access level (owner, admin, member, viewer)
- Creation date

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://protocols.io/api/v3/workspaces"
```

### Get Workspace Details

Retrieve detailed information about a specific workspace.

**Endpoint:** `GET /workspaces/{workspace_id}`

**Path Parameters:**
- `workspace_id`: The workspace's unique identifier

**Response includes:**
- Complete workspace metadata
- Member list with roles
- Workspace settings and permissions
- Protocol count and categories

## Workspace Membership

### List Workspace Members

Retrieve all members of a workspace.

**Endpoint:** `GET /workspaces/{workspace_id}/members`

**Query Parameters:**
- `page_size`: Number of results per page
- `page_id`: Page number for pagination

**Response includes:**
- Member name and email
- Role (owner, admin, member, viewer)
- Join date
- Activity status

### Request Workspace Access

Request to join a workspace.

**Endpoint:** `POST /workspaces/{workspace_id}/join-request`

**Request Body:**
- `message` (optional): Message to workspace admins explaining the request

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am collaborating with Dr. Smith on the CRISPR project and would like to access the shared protocols."
  }' \
  "https://protocols.io/api/v3/workspaces/12345/join-request"
```

### Join Public Workspace

Directly join a public workspace without approval.

**Endpoint:** `POST /workspaces/{workspace_id}/join`

**Note**: Only available for workspaces configured to allow public joining

## Workspace Protocols

### List Workspace Protocols

Retrieve all protocols in a workspace.

**Endpoint:** `GET /workspaces/{workspace_id}/protocols`

**Query Parameters:**
- `filter`: Filter protocols
  - `all`: All protocols in the workspace
  - `own`: Only protocols you created
  - `shared`: Protocols shared with you
- `key`: Search keywords
- `order_field`: Sort field (`activity`, `created_on`, `modified_on`, `name`)
- `order_dir`: Sort direction (`desc`, `asc`)
- `page_size`: Number of results per page
- `page_id`: Page number for pagination
- `content_format`: Content format (`json`, `html`, `markdown`)

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://protocols.io/api/v3/workspaces/12345/protocols?filter=all&order_field=modified_on&order_dir=desc"
```

### Create Protocol in Workspace

Create a new protocol within a specific workspace.

**Endpoint:** `POST /workspaces/{workspace_id}/protocols`

**Request Body**: Same parameters as standard protocol creation (see protocols_api.md)

**Note**: The protocol will be created within the workspace and inherit workspace permissions

## Workspace Types and Permissions

### Workspace Types

1. **Personal Workspace**
   - Default workspace for individual users
   - Private by default
   - Can share specific protocols

2. **Group Workspace**
   - Collaborative workspace for teams
   - Shared access for all members
   - Role-based permissions

3. **Institutional Workspace**
   - Organization-wide workspace
   - Often includes branding
   - Centralized protocol management

### Permission Levels

1. **Owner**
   - Full workspace control
   - Manage members and permissions
   - Delete workspace

2. **Admin**
   - Manage protocols and members
   - Configure workspace settings
   - Cannot delete workspace

3. **Member**
   - Create and edit protocols
   - View all workspace protocols
   - Comment and collaborate

4. **Viewer**
   - View-only access
   - Can comment on protocols
   - Cannot create or edit

## Common Use Cases

### 1. Lab Protocol Repository

Organize lab protocols in a shared workspace:

1. Create or join lab workspace: `GET /workspaces`
2. List existing protocols: `GET /workspaces/{id}/protocols`
3. Create new protocols: `POST /workspaces/{id}/protocols`
4. Invite lab members: Share workspace invitation
5. Organize by categories or tags

### 2. Collaborative Protocol Development

Develop protocols with team members:

1. Identify target workspace: `GET /workspaces`
2. Create draft protocol in workspace
3. Share with team members automatically via workspace
4. Gather feedback through comments
5. Iterate and publish final version

### 3. Cross-Institutional Collaboration

Work with external collaborators:

1. Create or identify shared workspace
2. Request access: `POST /workspaces/{id}/join-request`
3. Once approved, access shared protocols
4. Contribute new protocols or updates
5. Maintain institutional protocol copies in personal workspace

### 4. Protocol Migration

Move protocols between workspaces:

1. List source workspace protocols: `GET /workspaces/{source_id}/protocols`
2. For each protocol, retrieve full details
3. Create protocol in target workspace: `POST /workspaces/{target_id}/protocols`
4. Copy all steps and metadata
5. Update references and links

### 5. Workspace Audit

Review workspace activity and content:

1. List all workspaces: `GET /workspaces`
2. For each workspace, get member list
3. Retrieve protocol lists with activity dates
4. Identify inactive or outdated protocols
5. Generate activity reports

## Workspace Management Best Practices

1. **Organization**
   - Use consistent naming conventions
   - Tag protocols by project or category
   - Maintain workspace directory or index

2. **Access Control**
   - Review member list regularly
   - Assign appropriate permission levels
   - Remove inactive members

3. **Protocol Standards**
   - Establish workspace-wide protocol templates
   - Define required metadata fields
   - Implement quality review process

4. **Collaboration**
   - Communicate workspace guidelines to members
   - Encourage protocol documentation
   - Facilitate knowledge sharing

5. **Backup and Archival**
   - Regularly export workspace protocols
   - Maintain protocol version history
   - Archive completed projects

## Organizations and Workspaces

Organizations are higher-level entities that can contain multiple workspaces.

### Export Organization Data

**Endpoint:** `GET /organizations/{org_id}/export`

**Use case**: Bulk export of all protocols and workspace data for institutional archives or backups

## Notifications and Activity

Workspace activity may trigger notifications:

- New protocols added to workspace
- Protocol updates by team members
- New comments on workspace protocols
- Member joins or leaves workspace
- Permission changes

Configure notification preferences in account settings.

## Error Handling

Common error responses:

- `400 Bad Request`: Invalid workspace ID or parameters
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient workspace permissions
- `404 Not Found`: Workspace not found or no access
- `429 Too Many Requests`: Rate limit exceeded

## Integration Considerations

When integrating workspace functionality:

1. **Cache workspace list**: Avoid repeated workspace list calls
2. **Respect permissions**: Check user's role before attempting operations
3. **Handle join requests**: Implement workflow for workspace access approval
4. **Sync regularly**: Update local workspace data periodically
5. **Support offline access**: Cache protocols for offline work with sync on reconnection
