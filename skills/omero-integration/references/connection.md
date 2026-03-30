# Connection & Session Management

This reference covers establishing and managing connections to OMERO servers using BlitzGateway.

## Basic Connection

### Standard Connection Pattern

```python
from omero.gateway import BlitzGateway

# Create connection
conn = BlitzGateway(username, password, host=host, port=4064)

# Connect to server
if conn.connect():
    print("Connected successfully")
    # Perform operations
    conn.close()
else:
    print("Failed to connect")
```

### Connection Parameters

- **username** (str): OMERO user account name
- **password** (str): User password
- **host** (str): OMERO server hostname or IP address
- **port** (int): Server port (default: 4064)
- **secure** (bool): Force encrypted connection (default: False)

### Secure Connection

To ensure all data transfers are encrypted:

```python
conn = BlitzGateway(username, password, host=host, port=4064, secure=True)
conn.connect()
```

## Context Manager Pattern (Recommended)

Use context managers for automatic connection management and cleanup:

```python
from omero.gateway import BlitzGateway

with BlitzGateway(username, password, host=host, port=4064) as conn:
    # Connection automatically established
    for project in conn.getObjects('Project'):
        print(project.getName())
    # Connection automatically closed on exit
```

**Benefits:**
- Automatic `connect()` call
- Automatic `close()` call on exit
- Exception-safe resource cleanup
- Cleaner code

## Session Management

### Connection from Existing Client

Create BlitzGateway from an existing `omero.client` session:

```python
import omero.clients
from omero.gateway import BlitzGateway

# Create client and session
client = omero.client(host, port)
session = client.createSession(username, password)

# Create BlitzGateway from existing client
conn = BlitzGateway(client_obj=client)

# Use connection
# ...

# Close when done
conn.close()
```

### Retrieve Session Information

```python
# Get current user information
user = conn.getUser()
print(f"User ID: {user.getId()}")
print(f"Username: {user.getName()}")
print(f"Full Name: {user.getFullName()}")
print(f"Is Admin: {conn.isAdmin()}")

# Get current group
group = conn.getGroupFromContext()
print(f"Current Group: {group.getName()}")
print(f"Group ID: {group.getId()}")
```

### Check Admin Privileges

```python
if conn.isAdmin():
    print("User has admin privileges")

if conn.isFullAdmin():
    print("User is full administrator")
else:
    # Check specific admin privileges
    privileges = conn.getCurrentAdminPrivileges()
    print(f"Admin privileges: {privileges}")
```

## Group Context Management

OMERO uses groups to manage data access permissions. Users can belong to multiple groups.

### Get Current Group Context

```python
# Get the current group context
group = conn.getGroupFromContext()
print(f"Current group: {group.getName()}")
print(f"Group ID: {group.getId()}")
```

### Query Across All Groups

Use group ID `-1` to query across all accessible groups:

```python
# Set context to query all groups
conn.SERVICE_OPTS.setOmeroGroup('-1')

# Now queries span all accessible groups
image = conn.getObject("Image", image_id)
projects = conn.listProjects()
```

### Switch to Specific Group

Switch context to work within a specific group:

```python
# Get group ID from an object
image = conn.getObject("Image", image_id)
group_id = image.getDetails().getGroup().getId()

# Switch to that group's context
conn.SERVICE_OPTS.setOmeroGroup(group_id)

# Subsequent operations use this group context
projects = conn.listProjects()
```

### List Available Groups

```python
# Get all groups for current user
for group in conn.getGroupsMemberOf():
    print(f"Group: {group.getName()} (ID: {group.getId()})")
```

## Advanced Connection Features

### Substitute User Connection (Admin Only)

Administrators can create connections acting as other users:

```python
# Connect as admin
admin_conn = BlitzGateway(admin_user, admin_pass, host=host, port=4064)
admin_conn.connect()

# Get target user
target_user = admin_conn.getObject("Experimenter", user_id).getName()

# Create connection as that user
user_conn = admin_conn.suConn(target_user)

# Operations performed as target user
for project in user_conn.listProjects():
    print(project.getName())

# Close substitute connection
user_conn.close()
admin_conn.close()
```

### List Administrators

```python
# Get all administrators
for admin in conn.getAdministrators():
    print(f"ID: {admin.getId()}, Name: {admin.getFullName()}, "
          f"Username: {admin.getOmeName()}")
```

## Connection Lifecycle

### Closing Connections

Always close connections to free server resources:

```python
try:
    conn = BlitzGateway(username, password, host=host, port=4064)
    conn.connect()

    # Perform operations

except Exception as e:
    print(f"Error: {e}")
finally:
    if conn:
        conn.close()
```

### Check Connection Status

```python
if conn.isConnected():
    print("Connection is active")
else:
    print("Connection is closed")
```

## Error Handling

### Robust Connection Pattern

```python
from omero.gateway import BlitzGateway
import traceback

def connect_to_omero(username, password, host, port=4064):
    """
    Establish connection to OMERO server with error handling.

    Returns:
        BlitzGateway connection object or None if failed
    """
    try:
        conn = BlitzGateway(username, password, host=host, port=port, secure=True)
        if conn.connect():
            print(f"Connected to {host}:{port} as {username}")
            return conn
        else:
            print("Failed to establish connection")
            return None
    except Exception as e:
        print(f"Connection error: {e}")
        traceback.print_exc()
        return None

# Usage
conn = connect_to_omero(username, password, host)
if conn:
    try:
        # Perform operations
        pass
    finally:
        conn.close()
```

## Common Connection Patterns

### Pattern 1: Simple Script

```python
from omero.gateway import BlitzGateway

# Connection parameters
HOST = 'omero.example.com'
PORT = 4064
USERNAME = 'user'
PASSWORD = 'pass'

# Connect
with BlitzGateway(USERNAME, PASSWORD, host=HOST, port=PORT) as conn:
    print(f"Connected as {conn.getUser().getName()}")
    # Perform operations
```

### Pattern 2: Configuration-Based Connection

```python
import yaml
from omero.gateway import BlitzGateway

# Load configuration
with open('omero_config.yaml', 'r') as f:
    config = yaml.safe_load(f)

# Connect using config
with BlitzGateway(
    config['username'],
    config['password'],
    host=config['host'],
    port=config.get('port', 4064),
    secure=config.get('secure', True)
) as conn:
    # Perform operations
    pass
```

### Pattern 3: Environment Variables

```python
import os
from omero.gateway import BlitzGateway

# Get credentials from environment
USERNAME = os.environ.get('OMERO_USER')
PASSWORD = os.environ.get('OMERO_PASSWORD')
HOST = os.environ.get('OMERO_HOST', 'localhost')
PORT = int(os.environ.get('OMERO_PORT', 4064))

# Connect
with BlitzGateway(USERNAME, PASSWORD, host=HOST, port=PORT) as conn:
    # Perform operations
    pass
```

## Best Practices

1. **Use Context Managers**: Always prefer context managers for automatic cleanup
2. **Secure Connections**: Use `secure=True` for production environments
3. **Error Handling**: Wrap connection code in try-except blocks
4. **Close Connections**: Always close connections when done
5. **Group Context**: Set appropriate group context before queries
6. **Credential Security**: Never hardcode credentials; use environment variables or config files
7. **Connection Pooling**: For web applications, implement connection pooling
8. **Timeouts**: Consider implementing connection timeouts for long-running operations

## Troubleshooting

### Connection Refused

```
Unable to contact ORB
```

**Solutions:**
- Verify host and port are correct
- Check firewall settings
- Ensure OMERO server is running
- Verify network connectivity

### Authentication Failed

```
Cannot connect to server
```

**Solutions:**
- Verify username and password
- Check user account is active
- Verify group membership
- Check server logs for details

### Session Timeout

**Solutions:**
- Increase session timeout on server
- Implement session keepalive
- Reconnect on timeout
- Use connection pools for long-running applications
