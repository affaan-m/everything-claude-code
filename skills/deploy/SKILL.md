---
name: deploy
description: Deploy application to production with pre-flight checks
allowed-tools: Bash(npm:*), Bash(yarn:*), Bash(git:*), Bash(vercel:*)
---

# Deployment Workflow

Execute the following deployment workflow:

## 1. Pre-deploy Checks

Run these checks and stop if any fail:

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check || npx tsc --noEmit

# Run tests
npm test

# Run build
npm run build
```

## 2. Git Status Check

Verify git status:
- All changes are committed
- Branch is up to date with remote
- No uncommitted changes

## 3. Deploy

Based on project type:

### Vercel (Web)
```bash
vercel --prod
```

### Expo (Mobile)
```bash
eas build --platform all --profile production
eas submit --platform all
```

### Docker
```bash
docker build -t app:latest .
docker push app:latest
```

## 4. Post-deploy Verification

After deployment:
- Check deployment URL is accessible
- Verify critical functionality works
- Monitor for errors in logs
- Report deployment URL to user

## Error Handling

If any step fails:
- Stop deployment immediately
- Report the error with details
- Suggest fixes for common issues
