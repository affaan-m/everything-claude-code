# Execution Log Schema

## Log Entry Format

```json
{
  "timestamp": "2026-04-01T12:00:00Z",
  "skill_name": "flyai-search-cheap-flights",
  "skill_version": "2.0.0",
  "platforms_requested": ["clawhub", "anthropic", "ecc", "skills-sh"],
  "qualityGate": {
    "level1": "pass",
    "level2": {
      "warnings": [
        "description length is 14 characters (recommended >= 20)",
        "missing ## Prerequisites section"
      ]
    },
    "level3": {
      "score": 7,
      "checks": {
        "frontmatter": 1,
        "identityLock": 1,
        "prerequisites": 0,
        "step0": 1,
        "parameters": 1,
        "examples": 1,
        "validation": 0,
        "knowledgeDisclaimer": 0,
        "selfContained": 1,
        "outputFormat": 1
      }
    }
  },
  "platformAdaptation": [
    {
      "platform": "clawhub",
      "adaptedFiles": ["SKILL.md", "references/templates.md", "references/playbooks.md", "references/fallbacks.md", "references/runbook.md"],
      "adaptations": {
        "slug": "cs-flyai-search-cheap-flights",
        "displayName": "Flyai Search Cheap Flights",
        "tags": ["latest", "travel", "flights", "search"]
      }
    },
    {
      "platform": "anthropic",
      "adaptedFiles": ["SKILL.md", "references/templates.md", "references/playbooks.md", "references/fallbacks.md", "references/runbook.md"],
      "adaptations": {
        "frontmatterPatched": {
          "license": "MIT",
          "author": "xiaozhang"
        },
        "filePaths": "skills/flyai-search-cheap-flights/"
      }
    },
    {
      "platform": "ecc",
      "adaptedFiles": ["SKILL.md", "references/templates.md", "references/playbooks.md", "references/fallbacks.md", "references/runbook.md"],
      "adaptations": {
        "filePaths": "skills/flyai-search-cheap-flights/",
        "prBodyTemplate": "ecc-community"
      }
    },
    {
      "platform": "skills-sh",
      "adaptedFiles": ["SKILL.md", "references/templates.md", "references/playbooks.md", "references/fallbacks.md", "references/runbook.md"],
      "adaptations": {
        "filePaths": "flyai-search-cheap-flights/",
        "readmeIncluded": false
      }
    }
  ],
  "results": [
    {
      "platform": "clawhub",
      "status": "success",
      "duration_ms": 2340,
      "details": {
        "slug": "cs-flyai-search-cheap-flights",
        "version": "2.0.0",
        "version_id": "abc123"
      }
    },
    {
      "platform": "anthropic",
      "status": "success",
      "duration_ms": 8920,
      "details": {
        "pr_url": "https://github.com/anthropics/skills/pull/123",
        "pr_number": 123,
        "branch": "add-skill-flyai-search-cheap-flights-1711929600",
        "files_uploaded": 5
      }
    },
    {
      "platform": "ecc",
      "status": "success",
      "duration_ms": 7650,
      "details": {
        "pr_url": "https://github.com/affaan-m/everything-claude-code/pull/456",
        "pr_number": 456,
        "branch": "add-skill-flyai-search-cheap-flights-1711929600",
        "files_uploaded": 5
      }
    },
    {
      "platform": "skills-sh",
      "status": "failed",
      "duration_ms": 1200,
      "error": "Repository not found or no access",
      "http_status": 404
    }
  ],
  "partialSuccess": true,
  "batchInfo": null,
  "total_duration_ms": 20110,
  "success_count": 3,
  "failure_count": 1,
  "followUpActions": [
    "Retry skills-sh: verify repo access or check if skills-sh/registry exists",
    "Check Anthropic PR status in 24h: https://github.com/anthropics/skills/pull/123"
  ]
}
```

## Batch Log Entry Example

When publishing multiple skills in a batch, each publish gets its own log entry, but they share a `batchInfo` object for coordination:

```json
{
  "timestamp": "2026-04-01T12:05:00Z",
  "skill_name": "code-reviewer",
  "skill_version": "1.0.0",
  "qualityGate": {
    "level1": "pass",
    "level2": {
      "warnings": []
    },
    "level3": {
      "score": 9
    }
  },
  "platformAdaptation": [
    {
      "platform": "clawhub",
      "adaptedFiles": ["SKILL.md"],
      "adaptations": {
        "slug": "code-reviewer",
        "displayName": "Code Reviewer",
        "tags": ["latest", "review", "quality"]
      }
    }
  ],
  "results": [
    {
      "platform": "clawhub",
      "status": "success",
      "duration_ms": 1890,
      "details": {
        "slug": "code-reviewer",
        "version": "1.0.0",
        "version_id": "def456"
      }
    }
  ],
  "partialSuccess": false,
  "batchInfo": {
    "batchId": "batch-20260401-120000",
    "totalSkills": 12,
    "currentIndex": 2,
    "currentBatch": 1,
    "totalBatches": 3,
    "completedSkills": ["api-design", "code-reviewer"],
    "pendingSkills": ["e2e-testing", "frontend-patterns", "golang-testing", "python-patterns", "react-ui", "security-review", "tailwind-css", "tdd-workflow", "web-accessibility", "web-performance"],
    "failedSkills": []
  },
  "total_duration_ms": 1890,
  "success_count": 1,
  "failure_count": 0,
  "followUpActions": []
}
```

## Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `timestamp` | ISO 8601 | When publish started |
| `skill_name` | string | From SKILL.md frontmatter `name` |
| `skill_version` | string | From SKILL.md frontmatter `version` |
| `qualityGate` | object | Results of pre-publish quality checks |
| `qualityGate.level1` | "pass" / "fail" | Frontmatter validation result |
| `qualityGate.level2` | object | Warning-level checks |
| `qualityGate.level2.warnings` | string[] | List of non-blocking warnings |
| `qualityGate.level3` | object | 10-point quick scan |
| `qualityGate.level3.score` | number (0-10) | Aggregate quality score |
| `qualityGate.level3.checks` | object | Individual check results (0 or 1 each) |
| `platformAdaptation` | array | Per-platform file and metadata transformations |
| `platformAdaptation[].platform` | string | Platform identifier |
| `platformAdaptation[].adaptedFiles` | string[] | Files included in this platform's upload |
| `platformAdaptation[].adaptations` | object | Platform-specific transformations applied |
| `platforms_requested` | string[] | User-selected platforms |
| `results[]` | array | Per-platform publish outcomes |
| `results[].platform` | string | Platform identifier |
| `results[].status` | "success" / "failed" / "skipped" | Outcome |
| `results[].duration_ms` | number | Time taken for this platform |
| `results[].details` | object | Platform-specific success data |
| `results[].error` | string | Error message on failure |
| `results[].http_status` | number | HTTP status on failure |
| `partialSuccess` | boolean | True if at least one platform succeeded and at least one failed |
| `batchInfo` | object / null | Null for single-skill publishes; populated for batch operations |
| `batchInfo.batchId` | string | Unique identifier for the batch run |
| `batchInfo.totalSkills` | number | Total skills in the batch |
| `batchInfo.currentIndex` | number | 1-based index of this skill in the batch |
| `batchInfo.currentBatch` | number | Which batch group (1-based, groups of 5) |
| `batchInfo.totalBatches` | number | Total batch groups |
| `batchInfo.completedSkills` | string[] | Skills that have finished publishing |
| `batchInfo.pendingSkills` | string[] | Skills not yet started |
| `batchInfo.failedSkills` | string[] | Skills that failed all platforms |
| `total_duration_ms` | number | Total time for all platforms |
| `success_count` | number | Platforms that succeeded |
| `failure_count` | number | Platforms that failed |
| `followUpActions` | string[] | Recommended next steps for the user |

## Background Logging

This schema is for structured logging only. The agent should:
1. Track timing for each platform publish
2. Run Quality Gate and record all three levels before publishing
3. Record platform adaptations applied to each target
4. Collect all results
5. Set `partialSuccess` flag based on mixed outcomes
6. Populate `batchInfo` when operating in batch mode
7. Generate `followUpActions` based on failures and partial successes
8. Output the summary table (see templates.md)
9. Optionally output the full JSON log if user requests debugging info
