---
description: Audit dependency health across security, freshness, licensing, and bundle impact. Generate A-F graded report with prioritized action items.
---

# Dependency Audit

Analyze project dependencies for security, freshness, and overall health:

1. Security vulnerability scan:
   - Run: npm audit (or pnpm audit / yarn audit)
   - Count CRITICAL, HIGH, MEDIUM, LOW vulnerabilities
   - Identify direct vs transitive dependency vulnerabilities
   - Flag any with known exploits (CISA KEV)

2. Unused dependency detection:
   - Run: npx depcheck or npx knip
   - List packages in package.json not imported anywhere
   - Identify devDependencies used in production code
   - Flag duplicate packages serving the same purpose

3. Outdated package analysis:
   - Run: npm outdated
   - Categorize: patch (safe), minor (review), major (breaking)
   - Flag packages more than 2 major versions behind
   - Identify unmaintained packages (no release in 12+ months)

4. License compatibility check:
   - Scan all dependency licenses
   - Safe: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC
   - Warning: GPL, LGPL, AGPL, SSPL (copyleft — review required)
   - Critical: Unlicensed, UNLICENSED, proprietary
   - Flag any license conflicts with project license

5. Bundle size impact analysis:
   - Identify top 10 largest dependencies by install size
   - Flag packages over 100KB gzipped
   - Suggest lighter alternatives where available
   - Check for tree-shaking compatibility (ESM vs CJS)

6. Generate report with A-F grades:
   - A: Excellent (no vulnerabilities, all current, clean licenses)
   - B: Good (patch updates only, minor license notes)
   - C: Acceptable (minor updates needed, no security issues)
   - D: Poor (outdated majors, unused deps, license warnings)
   - F: Critical (known vulnerabilities, license violations)

   Include prioritized action items:
   - CRITICAL: Security vulnerabilities with known exploits
   - HIGH: Major version gaps, license violations
   - MEDIUM: Unused dependencies, outdated minors
   - LOW: Bundle optimization opportunities

Focus on actionable fixes. Skip dependencies with no available updates.
