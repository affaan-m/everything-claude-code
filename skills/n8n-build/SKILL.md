---
name: n8n-build
description: Build and validate n8n workflow from requirements. Creates production-ready workflows.
---

# n8n Workflow Builder

Build an n8n workflow based on the provided requirements.

## Process

1. **Analyze Requirements**
   - Identify trigger type (webhook, schedule, manual)
   - List required integrations
   - Define data flow

2. **Search for Nodes**
   - Use `search_nodes` to find appropriate nodes
   - Check node documentation with `get_node`
   - Verify node capabilities match requirements

3. **Design Workflow**
   - Plan node sequence
   - Define connections between nodes
   - Plan error handling

4. **Build Workflow**
   - Create nodes with proper configuration
   - Set up connections
   - Add error handling nodes
   - Include sticky notes for documentation

5. **Validate**
   - Use `validate_workflow` to check for errors
   - Fix any validation issues
   - Test with sample data

6. **Deploy**
   - Create workflow in n8n instance
   - Activate if requested
   - Return workflow ID and URL

## Standards

- Use meaningful node names (e.g., "Fetch User Data" not "HTTP Request")
- Add error handling for all external API calls
- Include sticky notes explaining workflow purpose
- Follow n8n expression syntax: `={{ $json.field }}`
- Store sensitive data in credentials, not expressions

## Common Node Patterns

### Webhook Trigger
- Set unique webhook path
- Configure response mode appropriately
- Add authentication if needed

### HTTP Request
- Use proper authentication
- Handle errors with error output
- Parse response appropriately

### Data Transformation
- Use Set node for field mapping
- Code node for complex logic
- Split in Batches for large datasets

## Output

Provide:
- Workflow JSON
- Setup instructions
- Required credentials list
- Test instructions
