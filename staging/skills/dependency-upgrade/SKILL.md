---
name: dependency-upgrade
description: Manage major dependency version upgrades with compatibility analysis, staged rollout, and comprehensive testing. Use when upgrading framework versions, updating major dependencies, or managing breaking changes in libraries.
---

# Dependency Upgrade

Master major dependency version upgrades, compatibility analysis, staged upgrade strategies, and comprehensive testing approaches.

## When to Use This Skill

- Upgrading major framework versions
- Updating security-vulnerable dependencies
- Modernizing legacy dependencies
- Resolving dependency conflicts
- Planning incremental upgrade paths
- Testing compatibility matrices
- Automating dependency updates

## Semantic Versioning Review

```
MAJOR.MINOR.PATCH (e.g., 2.3.1)

MAJOR: Breaking changes
MINOR: New features, backward compatible
PATCH: Bug fixes, backward compatible

^2.3.1 = >=2.3.1 <3.0.0 (minor updates)
~2.3.1 = >=2.3.1 <2.4.0 (patch updates)
2.3.1 = exact version
```

## Dependency Analysis

### Audit Dependencies

```bash
# npm
npm outdated
npm audit
npm audit fix

# yarn
yarn outdated
yarn audit

# Check for major updates
npx npm-check-updates
npx npm-check-updates -u  # Update package.json
```

### Analyze Dependency Tree

```bash
# See why a package is installed
npm ls package-name
yarn why package-name

# Find duplicate packages
npm dedupe
yarn dedupe

# Visualize dependencies
npx madge --image graph.png src/
```

## Compatibility Matrix

```javascript
// compatibility-matrix.js
const compatibilityMatrix = {
  react: {
    "16.x": {
      "react-dom": "^16.0.0",
      "react-router-dom": "^5.0.0",
      "@testing-library/react": "^11.0.0",
    },
    "17.x": {
      "react-dom": "^17.0.0",
      "react-router-dom": "^5.0.0 || ^6.0.0",
      "@testing-library/react": "^12.0.0",
    },
    "18.x": {
      "react-dom": "^18.0.0",
      "react-router-dom": "^6.0.0",
      "@testing-library/react": "^13.0.0",
    },
  },
};

function checkCompatibility(packages) {
  // Validate package versions against matrix
}
```

## Staged Upgrade Strategy

### Phase 1: Planning

```bash
# 1. Identify current versions
npm list --depth=0

# 2. Check for breaking changes
# Read CHANGELOG.md and MIGRATION.md

# 3. Create upgrade plan
echo "Upgrade order:
1. TypeScript
2. React
3. React Router
4. Testing libraries
5. Build tools" > UPGRADE_PLAN.md
```

### Phase 2: Incremental Updates

```bash
# Don't upgrade everything at once!

# Step 1: Update TypeScript
npm install typescript@latest

# Test
npm run test
npm run build

# Step 2: Update React (one major version at a time)
npm install react@17 react-dom@17

# Test again
npm run test

# Step 3: Continue with other packages
npm install react-router-dom@6

# And so on...
```

### Phase 3: Validation

```javascript
// tests/compatibility.test.js
describe("Dependency Compatibility", () => {
  it("should have compatible React versions", () => {
    const reactVersion = require("react/package.json").version;
    const reactDomVersion = require("react-dom/package.json").version;

    expect(reactVersion).toBe(reactDomVersion);
  });

  it("should not have peer dependency warnings", () => {
    // Run npm ls and check for warnings
  });
});
```

## Breaking Change Handling

### Identifying Breaking Changes

```bash
# Check the changelog directly
curl https://raw.githubusercontent.com/facebook/react/master/CHANGELOG.md
```

### Codemod for Automated Fixes

```bash
# Run jscodeshift with transform URL
npx jscodeshift -t <transform-url> <path>

# Example: Rename unsafe lifecycle methods
npx jscodeshift -t https://raw.githubusercontent.com/reactjs/react-codemod/master/transforms/rename-unsafe-lifecycles.js src/

# For TypeScript files
npx jscodeshift -t https://raw.githubusercontent.com/reactjs/react-codemod/master/transforms/rename-unsafe-lifecycles.js --parser=tsx src/

# Dry run to preview changes
npx jscodeshift -t https://raw.githubusercontent.com/reactjs/react-codemod/master/transforms/rename-unsafe-lifecycles.js --dry src/
```

### Custom Migration Script

```javascript
// migration-script.js
const fs = require("fs");
const glob = require("glob");

glob("src/**/*.tsx", (err, files) => {
  files.forEach((file) => {
    let content = fs.readFileSync(file, "utf8");

    // Replace old API with new API
    content = content.replace(
      /componentWillMount/g,
      "UNSAFE_componentWillMount",
    );

    // Update imports
    content = content.replace(
      /import { Component } from 'react'/g,
      "import React, { Component } from 'react'",
    );

    fs.writeFileSync(file, content);
  });
});
```

## Testing Strategy

### Unit Tests

```javascript
// Ensure tests pass before and after upgrade
npm run test

// Update test utilities if needed
npm install @testing-library/react@latest
```

### Integration Tests

```javascript
// tests/integration/app.test.js
describe("App Integration", () => {
  it("should render without crashing", () => {
    render(<App />);
  });

  it("should handle navigation", () => {
    const { getByText } = render(<App />);
    fireEvent.click(getByText("Navigate"));
    expect(screen.getByText("New Page")).toBeInTheDocument();
  });
});
```

### Visual Regression Tests

```javascript
// visual-regression.test.js
describe("Visual Regression", () => {
  it("should match snapshot", () => {
    const { container } = render(<App />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
```

### E2E Tests

```javascript
// cypress/e2e/app.cy.js
describe("E2E Tests", () => {
  it("should complete user flow", () => {
    cy.visit("/");
    cy.get('[data-testid="login"]').click();
    cy.get('input[name="email"]').type("user@example.com");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard");
  });
});
```

## Automated Dependency Updates

### Renovate Configuration

```json
// renovate.json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    },
    {
      "matchUpdateTypes": ["major"],
      "automerge": false,
      "labels": ["major-update"]
    }
  ],
  "schedule": ["before 3am on Monday"],
  "timezone": "America/New_York"
}
```

### Dependabot Configuration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    reviewers:
      - "team-leads"
    commit-message:
      prefix: "chore"
      include: "scope"
```

## Rollback Plan

```javascript
// rollback.sh
#!/bin/bash

# Save current state
git stash
git checkout -b upgrade-branch

# Attempt upgrade
npm install package@latest

# Run tests
if npm run test; then
  echo "Upgrade successful"
  git add package.json package-lock.json
  git commit -m "chore: upgrade package"
else
  echo "Upgrade failed, rolling back"
  git checkout main
  git branch -D upgrade-branch
  npm install  # Restore from package-lock.json
fi
```

## Common Upgrade Patterns

### Lock File Management

```bash
# npm
npm install --package-lock-only  # Update lock file only
npm ci  # Clean install from lock file

# yarn
yarn install --frozen-lockfile  # CI mode
yarn upgrade-interactive  # Interactive upgrades
```

### Peer Dependency Resolution

```bash
# npm 7+: strict peer dependencies
npm install --legacy-peer-deps  # Ignore peer deps

# npm 8+: override peer dependencies
npm install --force
```

### Workspace Upgrades

```bash
# Update all workspace packages
npm install --workspaces

# Update specific workspace
npm install package@latest --workspace=packages/app
```

## Resources

- **references/semver.md**: Semantic versioning guide
- **references/compatibility-matrix.md**: Common compatibility issues
- **references/staged-upgrades.md**: Incremental upgrade strategies
- **references/testing-strategy.md**: Comprehensive testing approaches
- **assets/upgrade-checklist.md**: Step-by-step checklist
- **assets/compatibility-matrix.csv**: Version compatibility table
- **scripts/audit-dependencies.sh**: Dependency audit script

## Best Practices

1. **Read Changelogs**: Understand what changed
2. **Upgrade Incrementally**: One major version at a time
3. **Test Thoroughly**: Unit, integration, E2E tests
4. **Check Peer Dependencies**: Resolve conflicts early
5. **Use Lock Files**: Ensure reproducible installs
6. **Automate Updates**: Use Renovate or Dependabot
7. **Monitor**: Watch for runtime errors post-upgrade
8. **Document**: Keep upgrade notes

## Upgrade Checklist

```markdown
Pre-Upgrade:

- [ ] Review current dependency versions
- [ ] Read changelogs for breaking changes
- [ ] Create feature branch
- [ ] Backup current state (git tag)
- [ ] Run full test suite (baseline)

During Upgrade:

- [ ] Upgrade one dependency at a time
- [ ] Update peer dependencies
- [ ] Fix TypeScript errors
- [ ] Update tests if needed
- [ ] Run test suite after each upgrade
- [ ] Check bundle size impact

Post-Upgrade:

- [ ] Full regression testing
- [ ] Performance testing
- [ ] Update documentation
- [ ] Deploy to staging
- [ ] Monitor for errors
- [ ] Deploy to production
```

## Common Pitfalls

- Upgrading all dependencies at once
- Not testing after each upgrade
- Ignoring peer dependency warnings
- Forgetting to update lock file
- Not reading breaking change notes
- Skipping major versions
- Not having rollback plan
