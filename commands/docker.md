# Docker Command

Generate, optimize, and debug Docker configurations for the current project.

## Instructions

### Subcommand: `init` (default if no Dockerfile exists)

1. **Detect Project Type**
   - Identify language, framework, and package manager from project files
   - Report: `Detected: <language> / <framework> / <package-manager>`

2. **Generate Dockerfile**
   - Use multi-stage build (build stage + production stage)
   - Apply best practices: non-root user, minimal base image, layer cache optimization
   - Generate `.dockerignore` excluding `node_modules`, `.git`, `.env`, `dist`, build artifacts

3. **Generate docker-compose.yml** (if dependencies detected)
   - Add service definitions for detected dependencies (PostgreSQL, Redis, MongoDB, etc.)
   - Include health checks, volume mounts, and environment variables
   - Use named volumes for data persistence

### Subcommand: `optimize`

1. **Analyze Existing Dockerfile**
   - Check for: oversized base image, missing multi-stage, poor layer ordering, no `.dockerignore`
   - Check for: root user, unnecessary packages, missing health check
2. **Report Findings**
   - Show current image size estimate
   - List optimization opportunities with expected savings
3. **Apply Optimizations**
   - Rewrite Dockerfile with improvements
   - Update `.dockerignore` if needed

### Subcommand: `scan`

1. **Security Scan**
   - Run `docker scout cves` on the built image (or `trivy image` as fallback)
   - Check Dockerfile for: running as root, hardcoded secrets, `latest` tag usage
2. **Report Vulnerabilities**
   - Group by severity (CRITICAL, HIGH, MEDIUM, LOW)
   - Suggest remediation for CRITICAL and HIGH issues

### Subcommand: `debug <container>`

1. **Inspect Container**
   - Run `docker logs <container> --tail 100`
   - Run `docker inspect <container>` for configuration details
2. **Network Diagnostics**
   - Check port bindings and network connectivity
   - Verify DNS resolution between containers
3. **Resource Check**
   - Show CPU/memory usage with `docker stats <container> --no-stream`

## Arguments

$ARGUMENTS can be:
- `init` - Generate new Dockerfile and docker-compose.yml
- `optimize` - Analyze and optimize existing Docker configuration
- `scan` - Run security vulnerability scan
- `debug <container>` - Debug a running or failed container
- `--no-compose` - Skip docker-compose.yml generation (with `init`)

## Output

```
DOCKER: [GENERATED/OPTIMIZED/SCANNED/DEBUGGED]

Project:    <language> / <framework>
Dockerfile: [CREATED/UPDATED/ANALYZED]
Compose:    [CREATED/SKIPPED/N/A]
Security:   [CLEAN/X vulnerabilities found]
```
