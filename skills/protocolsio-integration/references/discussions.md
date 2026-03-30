# Discussions API

## Overview

The Discussions API enables collaborative commenting on protocols. Comments can be added at both the protocol level and the individual step level, with support for threaded replies, editing, and deletion.

## Base URL

All discussion endpoints use the base URL: `https://protocols.io/api/v3`

## Protocol-Level Comments

### List Protocol Comments

Retrieve all comments for a protocol.

**Endpoint:** `GET /protocols/{protocol_id}/comments`

**Path Parameters:**
- `protocol_id`: The protocol's unique identifier

**Query Parameters:**
- `page_size`: Number of results per page (default: 10, max: 50)
- `page_id`: Page number for pagination (starts at 0)

**Response includes:**
- Comment ID and content
- Author information (name, affiliation, avatar)
- Timestamp (created and modified)
- Reply count and thread structure

### Create Protocol Comment

Add a new comment to a protocol.

**Endpoint:** `POST /protocols/{protocol_id}/comments`

**Request Body:**
- `body` (required): Comment text (supports HTML or Markdown)
- `parent_comment_id` (optional): ID of parent comment for threaded replies

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "This protocol worked excellently for our CRISPR experiments. We achieved 85% editing efficiency."
  }' \
  "https://protocols.io/api/v3/protocols/12345/comments"
```

### Create Threaded Reply

To reply to an existing comment, include the parent comment ID:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "What cell type did you use?",
    "parent_comment_id": 67890
  }' \
  "https://protocols.io/api/v3/protocols/12345/comments"
```

### Update Comment

Edit your own comment.

**Endpoint:** `PATCH /protocols/{protocol_id}/comments/{comment_id}`

**Request Body:**
- `body` (required): Updated comment text

**Authorization**: Only the comment author can edit their comments

### Delete Comment

Remove a comment.

**Endpoint:** `DELETE /protocols/{protocol_id}/comments/{comment_id}`

**Authorization**: Only the comment author can delete their comments

**Note**: Deleting a parent comment may affect the entire thread, depending on API implementation

## Step-Level Comments

### List Step Comments

Retrieve all comments for a specific protocol step.

**Endpoint:** `GET /protocols/{protocol_id}/steps/{step_id}/comments`

**Path Parameters:**
- `protocol_id`: The protocol's unique identifier
- `step_id`: The step's unique identifier

**Query Parameters:**
- `page_size`: Number of results per page
- `page_id`: Page number for pagination

### Create Step Comment

Add a comment to a specific step.

**Endpoint:** `POST /protocols/{protocol_id}/steps/{step_id}/comments`

**Request Body:**
- `body` (required): Comment text
- `parent_comment_id` (optional): ID of parent comment for replies

**Example Request:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "body": "At this step, we found that increasing the incubation time to 2 hours improved results significantly."
  }' \
  "https://protocols.io/api/v3/protocols/12345/steps/67890/comments"
```

### Update Step Comment

**Endpoint:** `PATCH /protocols/{protocol_id}/steps/{step_id}/comments/{comment_id}`

**Request Body:**
- `body` (required): Updated comment text

### Delete Step Comment

**Endpoint:** `DELETE /protocols/{protocol_id}/steps/{step_id}/comments/{comment_id}`

## Common Use Cases

### 1. Discussion Thread Analysis

To analyze discussions around a protocol:

1. Retrieve protocol comments: `GET /protocols/{id}/comments`
2. For each step, retrieve step-specific comments
3. Build a discussion thread tree using `parent_comment_id`
4. Analyze feedback patterns and common issues

### 2. Collaborative Protocol Improvement

To gather feedback on a protocol:

1. Publish the protocol
2. Monitor new comments: `GET /protocols/{id}/comments`
3. Respond to questions with threaded replies
4. Update protocol based on feedback
5. Publish updated version with notes acknowledging contributors

### 3. Community Engagement

To engage with protocol users:

1. Set up monitoring for new comments on your protocols
2. Respond promptly to questions and issues
3. Use step-level comments to provide detailed clarifications
4. Create threaded discussions for complex topics

### 4. Protocol Troubleshooting

To document troubleshooting experiences:

1. Identify problematic steps in a protocol
2. Add step-level comments with specific issues encountered
3. Document solutions or workarounds
4. Create a discussion thread with other users experiencing similar issues

## Comment Formatting

Comments support rich text formatting:

- **HTML**: Use standard HTML tags for formatting
- **Markdown**: Use Markdown syntax for simpler formatting
- **Links**: Include URLs to related resources or publications
- **Mentions**: Reference other users (format may vary)

**Example with Markdown:**
```json
{
  "body": "## Important Note\n\nWe achieved better results with:\n\n- Increasing temperature to 37°C\n- Extending incubation to 2 hours\n- Using freshly prepared reagents\n\nSee our publication: [doi:10.xxxx/xxxxx](https://doi.org/...)"
}
```

## Best Practices

1. **Be specific**: When commenting on steps, reference specific parameters or conditions
2. **Provide context**: Include relevant experimental details (cell type, reagent batch, equipment)
3. **Use step-level comments**: Direct feedback to specific steps rather than protocol-level when appropriate
4. **Engage constructively**: Respond to questions and feedback promptly
5. **Update protocols**: Incorporate validated feedback into protocol updates
6. **Thread related discussions**: Use reply functionality to keep related comments together
7. **Document variations**: Share protocol modifications that worked in your hands

## Permissions and Privacy

- **Public protocols**: Anyone can comment on published public protocols
- **Private protocols**: Only collaborators with access can comment
- **Comment ownership**: Only comment authors can edit or delete their comments
- **Moderation**: Protocol authors may have additional moderation capabilities

## Error Handling

Common error responses:

- `400 Bad Request`: Invalid comment format or missing required fields
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient permissions (e.g., trying to edit another user's comment)
- `404 Not Found`: Protocol, step, or comment not found
- `429 Too Many Requests`: Rate limit exceeded

## Notifications

Comments may trigger notifications:

- Protocol authors receive notifications for new comments
- Comment authors receive notifications for replies
- Users can manage notification preferences in their account settings
