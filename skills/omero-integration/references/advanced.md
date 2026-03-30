# Advanced Features

This reference covers advanced OMERO operations including permissions, deletion, filesets, and administrative tasks.

## Deleting Objects

### Delete with Wait

```python
# Delete objects and wait for completion
project_ids = [1, 2, 3]
conn.deleteObjects("Project", project_ids, wait=True)
print("Deletion complete")

# Delete without waiting (asynchronous)
conn.deleteObjects("Dataset", [dataset_id], wait=False)
```

### Delete with Callback Monitoring

```python
from omero.callbacks import CmdCallbackI

# Start delete operation
handle = conn.deleteObjects("Project", [project_id])

# Create callback to monitor progress
cb = CmdCallbackI(conn.c, handle)
print("Deleting, please wait...")

# Poll for completion
while not cb.block(500):  # Check every 500ms
    print(".", end="", flush=True)

print("\nDeletion finished")

# Check for errors
response = cb.getResponse()
if isinstance(response, omero.cmd.ERR):
    print("Error occurred:")
    print(response)
else:
    print("Deletion successful")

# Clean up
cb.close(True)  # Also closes handle
```

### Delete Different Object Types

```python
# Delete images
image_ids = [101, 102, 103]
conn.deleteObjects("Image", image_ids, wait=True)

# Delete datasets
dataset_ids = [10, 11]
conn.deleteObjects("Dataset", dataset_ids, wait=True)

# Delete ROIs
roi_ids = [201, 202]
conn.deleteObjects("Roi", roi_ids, wait=True)

# Delete annotations
annotation_ids = [301, 302]
conn.deleteObjects("Annotation", annotation_ids, wait=True)
```

### Delete with Cascade

```python
# Deleting a project will cascade to contained datasets
# This behavior depends on server configuration
project_id = 123
conn.deleteObjects("Project", [project_id], wait=True)

# Datasets and images may be deleted or orphaned
# depending on delete specifications
```

## Filesets

Filesets represent collections of original imported files. They were introduced in OMERO 5.0.

### Check if Image Has Fileset

```python
image = conn.getObject("Image", image_id)

fileset = image.getFileset()
if fileset:
    print(f"Image is part of fileset {fileset.getId()}")
else:
    print("Image has no fileset (pre-OMERO 5.0)")
```

### Access Fileset Information

```python
image = conn.getObject("Image", image_id)
fileset = image.getFileset()

if fileset:
    fs_id = fileset.getId()
    print(f"Fileset ID: {fs_id}")

    # List all images in this fileset
    print("Images in fileset:")
    for fs_image in fileset.copyImages():
        print(f"  {fs_image.getId()}: {fs_image.getName()}")

    # List original imported files
    print("\nOriginal files:")
    for orig_file in fileset.listFiles():
        print(f"  {orig_file.getPath()}/{orig_file.getName()}")
        print(f"    Size: {orig_file.getSize()} bytes")
```

### Get Fileset Directly

```python
# Get fileset object
fileset = conn.getObject("Fileset", fileset_id)

if fileset:
    # Access images
    for image in fileset.copyImages():
        print(f"Image: {image.getName()}")

    # Access files
    for orig_file in fileset.listFiles():
        print(f"File: {orig_file.getName()}")
```

### Download Original Files

```python
import os

fileset = image.getFileset()

if fileset:
    download_dir = "./original_files"
    os.makedirs(download_dir, exist_ok=True)

    for orig_file in fileset.listFiles():
        file_name = orig_file.getName()
        file_path = os.path.join(download_dir, file_name)

        print(f"Downloading: {file_name}")

        # Get file as RawFileStore
        raw_file_store = conn.createRawFileStore()
        raw_file_store.setFileId(orig_file.getId())

        # Download in chunks
        with open(file_path, 'wb') as f:
            offset = 0
            chunk_size = 1024 * 1024  # 1MB chunks
            size = orig_file.getSize()

            while offset < size:
                chunk = raw_file_store.read(offset, chunk_size)
                f.write(chunk)
                offset += len(chunk)

        raw_file_store.close()
        print(f"Saved to: {file_path}")
```

## Group Permissions

OMERO uses group-based permissions to control data access.

### Permission Levels

- **PRIVATE** (`rw----`): Only owner can read/write
- **READ-ONLY** (`rwr---`): Group members can read, only owner can write
- **READ-ANNOTATE** (`rwra--`): Group members can read and annotate
- **READ-WRITE** (`rwrw--`): Group members can read and write

### Check Current Group Permissions

```python
# Get current group
group = conn.getGroupFromContext()

# Get permissions
permissions = group.getDetails().getPermissions()
perm_string = str(permissions)

# Map to readable names
permission_names = {
    'rw----': 'PRIVATE',
    'rwr---': 'READ-ONLY',
    'rwra--': 'READ-ANNOTATE',
    'rwrw--': 'READ-WRITE'
}

perm_name = permission_names.get(perm_string, 'UNKNOWN')
print(f"Group: {group.getName()}")
print(f"Permissions: {perm_name} ({perm_string})")
```

### List User's Groups

```python
# Get all groups for current user
print("User's groups:")
for group in conn.getGroupsMemberOf():
    print(f"  {group.getName()} (ID: {group.getId()})")

    # Get group permissions
    perms = group.getDetails().getPermissions()
    print(f"    Permissions: {perms}")
```

### Get Group Members

```python
# Get group
group = conn.getObject("ExperimenterGroup", group_id)

# List members
print(f"Members of {group.getName()}:")
for member in group.getMembers():
    print(f"  {member.getFullName()} ({member.getOmeName()})")
```

## Cross-Group Queries

### Query Across All Groups

```python
# Set context to query all accessible groups
conn.SERVICE_OPTS.setOmeroGroup('-1')

# Now queries span all groups
image = conn.getObject("Image", image_id)
if image:
    group = image.getDetails().getGroup()
    print(f"Image found in group: {group.getName()}")

# List projects across all groups
for project in conn.getObjects("Project"):
    group = project.getDetails().getGroup()
    print(f"Project: {project.getName()} (Group: {group.getName()})")
```

### Switch to Specific Group

```python
# Get image's group
image = conn.getObject("Image", image_id)
group_id = image.getDetails().getGroup().getId()

# Switch to that group's context
conn.SERVICE_OPTS.setOmeroGroup(group_id)

# Subsequent operations use this group
projects = conn.listProjects()  # Only from this group
```

### Reset to Default Group

```python
# Get default group
default_group_id = conn.getEventContext().groupId

# Switch back to default
conn.SERVICE_OPTS.setOmeroGroup(default_group_id)
```

## Administrative Operations

### Check Admin Status

```python
# Check if current user is admin
if conn.isAdmin():
    print("User has admin privileges")

# Check if full admin
if conn.isFullAdmin():
    print("User is full administrator")
else:
    # Check specific privileges
    privileges = conn.getCurrentAdminPrivileges()
    print(f"Admin privileges: {privileges}")
```

### List Administrators

```python
# Get all administrators
print("Administrators:")
for admin in conn.getAdministrators():
    print(f"  ID: {admin.getId()}")
    print(f"  Username: {admin.getOmeName()}")
    print(f"  Full Name: {admin.getFullName()}")
```

### Set Object Owner (Admin Only)

```python
import omero.model

# Create annotation with specific owner (requires admin)
tag_ann = omero.gateway.TagAnnotationWrapper(conn)
tag_ann.setValue("Admin-created tag")

# Set owner
user_id = 5
tag_ann._obj.details.owner = omero.model.ExperimenterI(user_id, False)
tag_ann.save()

print(f"Created annotation owned by user {user_id}")
```

### Substitute User Connection (Admin Only)

```python
# Connect as admin
admin_conn = BlitzGateway(admin_user, admin_pass, host=host, port=4064)
admin_conn.connect()

# Get target user
target_user_id = 10
user = admin_conn.getObject("Experimenter", target_user_id)
username = user.getOmeName()

# Create connection as that user
user_conn = admin_conn.suConn(username)

print(f"Connected as {username}")

# Perform operations as that user
for project in user_conn.listProjects():
    print(f"  {project.getName()}")

# Close connections
user_conn.close()
admin_conn.close()
```

### List All Users

```python
# Get all users (admin operation)
print("All users:")
for user in conn.getObjects("Experimenter"):
    print(f"  ID: {user.getId()}")
    print(f"  Username: {user.getOmeName()}")
    print(f"  Full Name: {user.getFullName()}")
    print(f"  Email: {user.getEmail()}")
    print()
```

## Service Access

OMERO provides various services for specific operations.

### Update Service

```python
# Get update service
updateService = conn.getUpdateService()

# Save and return object
roi = omero.model.RoiI()
roi.setImage(image._obj)
saved_roi = updateService.saveAndReturnObject(roi)

# Save multiple objects
objects = [obj1, obj2, obj3]
saved_objects = updateService.saveAndReturnArray(objects)
```

### ROI Service

```python
# Get ROI service
roi_service = conn.getRoiService()

# Find ROIs for image
result = roi_service.findByImage(image_id, None)

# Get shape statistics
shape_ids = [shape.id.val for roi in result.rois
             for shape in roi.copyShapes()]
stats = roi_service.getShapeStatsRestricted(shape_ids, 0, 0, [0])
```

### Metadata Service

```python
# Get metadata service
metadataService = conn.getMetadataService()

# Load annotations by type and namespace
ns_to_include = ["mylab.analysis"]
ns_to_exclude = []

annotations = metadataService.loadSpecifiedAnnotations(
    'omero.model.FileAnnotation',
    ns_to_include,
    ns_to_exclude,
    None
)

for ann in annotations:
    print(f"Annotation: {ann.getId().getValue()}")
```

### Query Service

```python
# Get query service
queryService = conn.getQueryService()

# Build query (more complex queries)
params = omero.sys.ParametersI()
params.addLong("image_id", image_id)

query = "select i from Image i where i.id = :image_id"
image = queryService.findByQuery(query, params)
```

### Thumbnail Service

```python
# Get thumbnail service
thumbnailService = conn.createThumbnailStore()

# Set current image
thumbnailService.setPixelsId(image.getPrimaryPixels().getId())

# Get thumbnail
thumbnail = thumbnailService.getThumbnail(96, 96)

# Close service
thumbnailService.close()
```

### Raw File Store

```python
# Get raw file store
rawFileStore = conn.createRawFileStore()

# Set file ID
rawFileStore.setFileId(orig_file_id)

# Read file
data = rawFileStore.read(0, rawFileStore.size())

# Close
rawFileStore.close()
```

## Object Ownership and Details

### Get Object Details

```python
image = conn.getObject("Image", image_id)

# Get details
details = image.getDetails()

# Owner information
owner = details.getOwner()
print(f"Owner ID: {owner.getId()}")
print(f"Username: {owner.getOmeName()}")
print(f"Full Name: {owner.getFullName()}")

# Group information
group = details.getGroup()
print(f"Group: {group.getName()} (ID: {group.getId()})")

# Creation information
creation_event = details.getCreationEvent()
print(f"Created: {creation_event.getTime()}")

# Update information
update_event = details.getUpdateEvent()
print(f"Updated: {update_event.getTime()}")
```

### Get Permissions

```python
# Get object permissions
details = image.getDetails()
permissions = details.getPermissions()

# Check specific permissions
can_edit = permissions.canEdit()
can_annotate = permissions.canAnnotate()
can_link = permissions.canLink()
can_delete = permissions.canDelete()

print(f"Can edit: {can_edit}")
print(f"Can annotate: {can_annotate}")
print(f"Can link: {can_link}")
print(f"Can delete: {can_delete}")
```

## Event Context

### Get Current Event Context

```python
# Get event context (current session info)
ctx = conn.getEventContext()

print(f"User ID: {ctx.userId}")
print(f"Username: {ctx.userName}")
print(f"Group ID: {ctx.groupId}")
print(f"Group Name: {ctx.groupName}")
print(f"Session ID: {ctx.sessionId}")
print(f"Is Admin: {ctx.isAdmin}")
```

## Complete Admin Example

```python
from omero.gateway import BlitzGateway

# Connect as admin
ADMIN_USER = 'root'
ADMIN_PASS = 'password'
HOST = 'omero.example.com'
PORT = 4064

with BlitzGateway(ADMIN_USER, ADMIN_PASS, host=HOST, port=PORT) as admin_conn:
    print("=== Administrator Operations ===\n")

    # List all users
    print("All Users:")
    for user in admin_conn.getObjects("Experimenter"):
        print(f"  {user.getOmeName()}: {user.getFullName()}")

    # List all groups
    print("\nAll Groups:")
    for group in admin_conn.getObjects("ExperimenterGroup"):
        perms = group.getDetails().getPermissions()
        print(f"  {group.getName()}: {perms}")

        # List members
        for member in group.getMembers():
            print(f"    - {member.getOmeName()}")

    # Query across all groups
    print("\nAll Projects (all groups):")
    admin_conn.SERVICE_OPTS.setOmeroGroup('-1')

    for project in admin_conn.getObjects("Project"):
        owner = project.getDetails().getOwner()
        group = project.getDetails().getGroup()
        print(f"  {project.getName()}")
        print(f"    Owner: {owner.getOmeName()}")
        print(f"    Group: {group.getName()}")

    # Connect as another user
    target_user_id = 5
    user = admin_conn.getObject("Experimenter", target_user_id)

    if user:
        print(f"\n=== Operating as {user.getOmeName()} ===\n")

        user_conn = admin_conn.suConn(user.getOmeName())

        # List that user's projects
        for project in user_conn.listProjects():
            print(f"  {project.getName()}")

        user_conn.close()
```

## Best Practices

1. **Permissions**: Always check permissions before operations
2. **Group Context**: Set appropriate group context for queries
3. **Admin Operations**: Use admin privileges sparingly and carefully
4. **Delete Confirmation**: Always confirm before deleting objects
5. **Callback Monitoring**: Monitor long delete operations with callbacks
6. **Fileset Awareness**: Check for filesets when working with images
7. **Service Cleanup**: Close services when done (thumbnailStore, rawFileStore)
8. **Cross-Group Queries**: Use `-1` group ID for cross-group access
9. **Error Handling**: Always handle permission and access errors
10. **Documentation**: Document administrative operations clearly

## Troubleshooting

### Permission Denied

```python
try:
    conn.deleteObjects("Project", [project_id], wait=True)
except Exception as e:
    if "SecurityViolation" in str(e):
        print("Permission denied: You don't own this object")
    else:
        raise
```

### Object Not Found

```python
# Check if object exists before accessing
obj = conn.getObject("Image", image_id)
if obj is None:
    print(f"Image {image_id} not found or not accessible")
else:
    # Process object
    pass
```

### Group Context Issues

```python
# If object not found, try cross-group query
conn.SERVICE_OPTS.setOmeroGroup('-1')
obj = conn.getObject("Image", image_id)

if obj:
    # Switch to object's group for further operations
    group_id = obj.getDetails().getGroup().getId()
    conn.SERVICE_OPTS.setOmeroGroup(group_id)
```
